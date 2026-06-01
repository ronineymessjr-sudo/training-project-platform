import { Card, Table, Tag, Button, Space, Modal, Form, Input, Select, message, Drawer, Timeline, Empty } from 'antd'
import { PlusOutlined, CheckCircleOutlined, CloseCircleOutlined, ClockCircleOutlined } from '@ant-design/icons'
import type { ColumnsType } from 'antd/es/table'
import { useState, useEffect } from 'react'
import { getProgressList, createProgress, submitProgress, reviewProgress } from '../../api/progress'
import { getProjectList } from '../../api/project'
import { useAuthStore } from '../../stores/auth.store'
import dayjs from 'dayjs'

const { TextArea } = Input

interface ProgressRecord {
  id: number
  projectId: number
  projectName: string
  phaseId: number
  phaseName: string
  title: string
  content: string
  status: 'draft' | 'submitted' | 'approved' | 'rejected'
  submittedAt?: string
  reviewedAt?: string
  reviewerComment?: string
  createdAt: string
  createdBy: number
  creatorName: string
}

export default function ProgressList() {
  const [data, setData] = useState<ProgressRecord[]>([])
  const [loading, setLoading] = useState(false)
  const [pagination, setPagination] = useState({ current: 1, pageSize: 10, total: 0 })
  const [modalVisible, setModalVisible] = useState(false)
  const [detailVisible, setDetailVisible] = useState(false)
  const [selectedRecord, setSelectedRecord] = useState<ProgressRecord | null>(null)
  const [projects, setProjects] = useState<Array<{ id: number; name: string }>>([])
  const [form] = Form.useForm()
  const { user } = useAuthStore()

  const isTeacher = user?.role === 'teacher' || user?.role === 'admin'

  const fetchData = async () => {
    setLoading(true)
    try {
      const res = await getProgressList({ page: pagination.current, pageSize: pagination.pageSize })
      if (res.data && res.data.list) {
        setData((res.data.list as any[]).map(d => ({
          id: d.id,
          projectId: d.projectId,
          projectName: d.projectName || '',
          phaseId: d.phaseId,
          phaseName: d.phaseName || '',
          title: d.title,
          content: d.content,
          status: d.status,
          submittedAt: d.submittedAt,
          reviewedAt: d.reviewedAt,
          reviewerComment: d.reviewerComment,
          createdAt: d.createdAt,
          createdBy: d.createdBy || d.submittedBy,
          creatorName: d.creatorName || d.submitterName || '',
        })))
        setPagination(p => ({ ...p, total: res.data.total }))
      }
    } catch (error) {
      message.error('获取进度数据失败')
    } finally {
      setLoading(false)
    }
  }

  const fetchProjects = async () => {
    try {
      const res = await getProjectList({ myOnly: !isTeacher })
      if (res.data) {
        setProjects(res.data.list.map(p => ({ id: p.id, name: p.name })))
      }
    } catch (error) {
      console.error('获取项目列表失败', error)
    }
  }

  useEffect(() => {
    fetchData()
    fetchProjects()
  }, [pagination.current, pagination.pageSize])

  const handleSubmit = async () => {
    try {
      await form.validateFields()
      const values = form.getFieldsValue()
      await createProgress(values)
      message.success('提交成功')
      setModalVisible(false)
      form.resetFields()
      fetchData()
    } catch (error) {
      message.error('提交失败')
    }
  }

  const handleReview = async (id: number, approved: boolean) => {
    Modal.confirm({
      title: approved ? '通过审核' : '驳回进度',
      content: (
        <TextArea
          id="reviewComment"
          placeholder="请输入审核意见"
          rows={4}
        />
      ),
      onOk: async () => {
        const comment = (document.getElementById('reviewComment') as HTMLTextAreaElement)?.value
        try {
          await reviewProgress(id, { status: approved ? 'approved' : 'rejected', comment })
          message.success(approved ? '已通过' : '已驳回')
          fetchData()
        } catch (error) {
          message.error('操作失败')
        }
      },
    })
  }

  const columns: ColumnsType<ProgressRecord> = [
    {
      title: '项目名称',
      dataIndex: 'projectName',
      key: 'projectName',
      width: 180,
      ellipsis: true,
    },
    {
      title: '阶段',
      dataIndex: 'phaseName',
      key: 'phaseName',
      width: 100,
    },
    {
      title: '标题',
      dataIndex: 'title',
      key: 'title',
      ellipsis: true,
    },
    {
      title: '提交人',
      dataIndex: 'creatorName',
      key: 'creatorName',
      width: 100,
    },
    {
      title: '状态',
      dataIndex: 'status',
      key: 'status',
      width: 100,
      render: (status: string) => {
        const map: Record<string, { color: string; text: string; icon: React.ReactNode }> = {
          draft: { color: 'default', text: '草稿', icon: <ClockCircleOutlined /> },
          submitted: { color: 'processing', text: '待审核', icon: <ClockCircleOutlined /> },
          approved: { color: 'success', text: '已通过', icon: <CheckCircleOutlined /> },
          rejected: { color: 'error', text: '已驳回', icon: <CloseCircleOutlined /> },
        }
        const item = map[status] || map.draft
        return (
          <Tag color={item.color} icon={item.icon}>
            {item.text}
          </Tag>
        )
      },
    },
    {
      title: '提交时间',
      dataIndex: 'submittedAt',
      key: 'submittedAt',
      width: 160,
      render: (time: string) => time ? dayjs(time).format('YYYY-MM-DD HH:mm') : '-',
    },
    {
      title: '操作',
      key: 'action',
      width: 200,
      render: (_, record) => (
        <Space>
          <Button type="link" size="small" onClick={() => {
            setSelectedRecord(record)
            setDetailVisible(true)
          }}>
            查看
          </Button>
          {!isTeacher && record.status === 'draft' && (
            <Button type="link" size="small" onClick={() => submitProgress(record.id)}>
              提交
            </Button>
          )}
          {isTeacher && record.status === 'submitted' && (
            <>
              <Button type="link" size="small" onClick={() => handleReview(record.id, true)}>
                通过
              </Button>
              <Button type="link" size="small" danger onClick={() => handleReview(record.id, false)}>
                驳回
              </Button>
            </>
          )}
        </Space>
      ),
    },
  ]

  return (
    <div>
      <Card
        title="进度跟踪"
        extra={
          !isTeacher && (
            <Button type="primary" icon={<PlusOutlined />} onClick={() => setModalVisible(true)}>
              提交进度
            </Button>
          )
        }
      >
        <Table
          columns={columns}
          dataSource={data}
          rowKey="id"
          loading={loading}
          pagination={{
            ...pagination,
            showSizeChanger: true,
            showQuickJumper: true,
            showTotal: (total) => `共 ${total} 条`,
            onChange: (page, pageSize) => setPagination({ current: page, pageSize, total: pagination.total }),
          }}
        />
      </Card>

      {/* 创建进度弹窗 */}
      <Modal
        title="提交进度"
        open={modalVisible}
        onOk={handleSubmit}
        onCancel={() => {
          setModalVisible(false)
          form.resetFields()
        }}
        width={600}
      >
        <Form form={form} layout="vertical">
          <Form.Item name="projectId" label="选择项目" rules={[{ required: true }]}>
            <Select placeholder="请选择项目" options={projects} />
          </Form.Item>
          <Form.Item name="phaseId" label="选择阶段" rules={[{ required: true }]}>
            <Select placeholder="请选择阶段">
              <Select.Option value={1}>需求分析</Select.Option>
              <Select.Option value={2}>系统设计</Select.Option>
              <Select.Option value={3}>编码实现</Select.Option>
              <Select.Option value={4}>测试部署</Select.Option>
            </Select>
          </Form.Item>
          <Form.Item name="title" label="进度标题" rules={[{ required: true }]}>
            <Input placeholder="如：完成数据库设计文档" />
          </Form.Item>
          <Form.Item name="content" label="进度说明" rules={[{ required: true }]}>
            <TextArea rows={6} placeholder="详细描述本次进度的完成情况..." />
          </Form.Item>
        </Form>
      </Modal>

      {/* 详情抽屉 */}
      <Drawer
        title="进度详情"
        open={detailVisible}
        onClose={() => setDetailVisible(false)}
        width={500}
      >
        {selectedRecord && (
          <div>
            <h3>{selectedRecord.title}</h3>
            <p><strong>项目：</strong>{selectedRecord.projectName}</p>
            <p><strong>阶段：</strong>{selectedRecord.phaseName}</p>
            <p><strong>提交人：</strong>{selectedRecord.creatorName}</p>
            <p><strong>提交时间：</strong>{selectedRecord.submittedAt ? dayjs(selectedRecord.submittedAt).format('YYYY-MM-DD HH:mm') : '-'}</p>
            <div style={{ marginTop: 16 }}>
              <strong>进度内容：</strong>
              <div style={{ marginTop: 8, padding: 16, background: '#f5f5f5', borderRadius: 4 }}>
                {selectedRecord.content}
              </div>
            </div>
            {selectedRecord.reviewerComment && (
              <div style={{ marginTop: 16 }}>
                <strong>审核意见：</strong>
                <div style={{ marginTop: 8, padding: 16, background: '#fffbe6', borderRadius: 4 }}>
                  {selectedRecord.reviewerComment}
                </div>
              </div>
            )}
          </div>
        )}
      </Drawer>
    </div>
  )
}
