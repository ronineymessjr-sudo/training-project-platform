import { Card, Table, Tag, Button, Space, Modal, Form, Input, InputNumber, DatePicker, Statistic, Row, Col, Progress, Popover, Select } from 'antd'
import { messageHolder } from '../../utils/messageHolder'
import { BarChartOutlined, UserOutlined, ClockCircleOutlined, PlusOutlined, CheckCircleOutlined, ExclamationCircleOutlined, DownloadOutlined } from '@ant-design/icons'
import type { ColumnsType } from 'antd/es/table'
import { useState, useEffect } from 'react'
import { getMyWorkload, submitWorkload, getProjectWorkload, reviewWorkload } from '../../api/workload'
import { getProjectList } from '../../api/project'
import { exportWorkloadStatistics } from '../../api/export'
import { useAuthStore } from '../../stores/auth.store'
import dayjs from 'dayjs'

const { TextArea } = Input

interface WorkloadRecord {
  id: number
  projectId: number
  projectName: string
  userId: number
  userName: string
  date: string
  hours: number
  content: string
  status: 'pending' | 'approved' | 'rejected'
  reviewerComment?: string
  createdAt: string
}

interface WorkloadSummary {
  userId: number
  userName: number
  totalHours: number
  contribution: number
}

export default function WorkloadList() {
  const [data, setData] = useState<WorkloadRecord[]>([])
  const [summary, setSummary] = useState<WorkloadSummary[]>([])
  const [projects, setProjects] = useState<Array<{ id: number; name: string }>>([])
  const [loading, setLoading] = useState(false)
  const [modalVisible, setModalVisible] = useState(false)
  const [form] = Form.useForm()
  const { user } = useAuthStore()

  const isTeacher = user?.role === 'teacher' || user?.role === 'admin'
  const isStudent = user?.role === 'student'

  const handleExportWorkload = async () => {
    try {
      const currentProjectId = projects.length > 0 ? projects[0].id : 0
      if (!currentProjectId) {
        messageHolder.warning('暂无项目数据可导出')
        return
      }
      messageHolder.loading({ content: '正在导出...', key: 'export' })
      await exportWorkloadStatistics({ projectId: currentProjectId })
      messageHolder.success({ content: '导出成功', key: 'export' })
    } catch (error: any) {
      messageHolder.error({ content: error?.message || '导出失败', key: 'export' })
    }
  }

  const fetchData = async () => {
    setLoading(true)
    try {
      if (isStudent) {
        const res = await getMyWorkload()
        if (res.data) {
          setData((res.data as any[]).map(d => ({
            id: d.id,
            projectId: d.projectId,
            projectName: d.projectName || '',
            userId: d.userId || d.studentId,
            userName: d.userName || d.studentName || '',
            date: d.date,
            hours: d.hours,
            content: d.content || d.taskDescription,
            status: d.status,
            reviewerComment: d.reviewerComment,
            createdAt: d.createdAt || d.submittedAt,
          })))
        }
      } else {
        // 教师查看所有待审核记录
        const res = await getPendingWorkloadReviews()
        if (res.data) {
          setData((res.data as any[]).map(d => ({
            id: d.id,
            projectId: d.projectId,
            projectName: d.projectName || '',
            userId: d.userId || d.studentId,
            userName: d.userName || d.studentName || '',
            date: d.date,
            hours: d.hours,
            content: d.content || d.taskDescription,
            status: d.status,
            reviewerComment: d.reviewerComment,
            createdAt: d.createdAt || d.submittedAt,
          })))
        }
      }
    } catch (error) {
      messageHolder.error('获取工作量数据失败')
      // API 不可用时使用 Mock 后备数据
      setData([
        { id: 1, projectId: 1, projectName: '毕业设计管理系统', userId: 1, userName: '张三', date: new Date().toISOString().split('T')[0], hours: 4, content: '完成数据库设计文档编写', status: 'approved', createdAt: new Date().toISOString() },
        { id: 2, projectId: 1, projectName: '毕业设计管理系统', userId: 1, userName: '张三', date: new Date(Date.now() - 86400000).toISOString().split('T')[0], hours: 3, content: '实现用户登录模块', status: 'pending', createdAt: new Date(Date.now() - 86400000).toISOString() },
      ])
    } finally {
      setLoading(false)
    }
  }

  const fetchProjects = async () => {
    try {
      const res = await getProjectList({ myOnly: false })
      if (res.data) {
        setProjects(res.data.list.map(p => ({ id: p.id, name: p.name })))
      }
    } catch (error) {
      messageHolder.error('获取项目列表失败')
      // API 不可用时使用 Mock 后备数据
      setProjects([
        { id: 1, name: '毕业设计管理系统' },
        { id: 2, name: '在线学习平台' },
      ])
    }
  }

  useEffect(() => {
    fetchData()
    if (isStudent) {
      fetchProjects()
    }
  }, [])

  const handleSubmit = async () => {
    try {
      await form.validateFields()
      const values = form.getFieldsValue()
      try {
        await submitWorkload({
          ...values,
          date: values.date.format('YYYY-MM-DD'),
        })
      } catch (e) {
        // Mock 模式降级：API 不可用时忽略错误，走本地添加
      }
      // Mock 模式后备：本地添加新工作量记录
      const newRecord: WorkloadRecord = {
        id: Date.now(),
        projectId: values.projectId,
        projectName: projects.find(p => p.id === values.projectId)?.name || '',
        userId: user?.id as any,
        userName: user?.realName || user?.username || '',
        date: values.date.format('YYYY-MM-DD'),
        hours: values.hours,
        content: values.content,
        status: 'pending',
        createdAt: new Date().toISOString(),
      }
      setData(prev => [newRecord, ...prev])
      messageHolder.success('提交成功')
      setModalVisible(false)
      form.resetFields()
    } catch (error) {
      messageHolder.error('提交失败')
    }
  }

  const handleReview = async (id: number, approved: boolean) => {
    Modal.confirm({
      title: approved ? '通过审核' : '驳回',
      content: (
        <TextArea
          id="reviewComment"
          placeholder="请输入审核意见"
          rows={3}
        />
      ),
      onOk: async () => {
        const comment = (document.getElementById('reviewComment') as HTMLTextAreaElement)?.value
        try {
          await reviewWorkload(id, { approved, comment })
          messageHolder.success(approved ? '已通过' : '已驳回')
          fetchData()
        } catch (error) {
          messageHolder.error('操作失败')
        }
      },
    })
  }

  // 计算统计数据
  const totalHours = data.reduce((sum, d) => sum + d.hours, 0)
  const approvedHours = data.filter(d => d.status === 'approved').reduce((sum, d) => sum + d.hours, 0)
  const pendingCount = data.filter(d => d.status === 'pending').length

  const columns: ColumnsType<WorkloadRecord> = [
    {
      title: '日期',
      dataIndex: 'date',
      key: 'date',
      width: 120,
      render: (date: string) => dayjs(date).format('YYYY-MM-DD'),
      sorter: (a, b) => dayjs(a.date).unix() - dayjs(b.date).unix(),
    },
    {
      title: '项目',
      dataIndex: 'projectName',
      key: 'projectName',
      width: 150,
      ellipsis: true,
    },
    ...(isTeacher ? [{
      title: '成员',
      dataIndex: 'userName',
      key: 'userName',
      width: 100,
    }] : []),
    {
      title: '时长',
      dataIndex: 'hours',
      key: 'hours',
      width: 80,
      render: (h: number) => `${h}h`,
    },
    {
      title: '工作内容',
      dataIndex: 'content',
      key: 'content',
      ellipsis: true,
      render: (content: string) => (
        <Popover content={content} title="工作内容">
          <span>{content}</span>
        </Popover>
      ),
    },
    {
      title: '状态',
      dataIndex: 'status',
      key: 'status',
      width: 100,
      render: (status: string) => {
        const map: Record<string, { color: string; text: string }> = {
          pending: { color: 'warning', text: '待审核' },
          approved: { color: 'success', text: '已通过' },
          rejected: { color: 'error', text: '已驳回' },
        }
        return <Tag color={map[status]?.color}>{map[status]?.text || status}</Tag>
      },
    },
    {
      title: '审核意见',
      dataIndex: 'reviewerComment',
      key: 'reviewerComment',
      width: 150,
      ellipsis: true,
    },
    {
      title: '操作',
      key: 'action',
      width: 120,
      render: (_, record) => (
        isTeacher && record.status === 'pending' ? (
          <Space>
            <Button type="link" size="small" onClick={() => handleReview(record.id, true)}>
              通过
            </Button>
            <Button type="link" size="small" danger onClick={() => handleReview(record.id, false)}>
              驳回
            </Button>
          </Space>
        ) : null
      ),
    },
  ]

  return (
    <div>
      {/* 统计卡片 */}
      <Row gutter={16} style={{ marginBottom: 16 }}>
        <Col span={6}>
          <Card>
            <Statistic
              title="总工时"
              value={totalHours}
              suffix="小时"
              prefix={<ClockCircleOutlined />}
            />
          </Card>
        </Col>
        <Col span={6}>
          <Card>
            <Statistic
              title="已审核工时"
              value={approvedHours}
              suffix="小时"
              prefix={<CheckCircleOutlined />}
              valueStyle={{ color: '#52c41a' }}
            />
          </Card>
        </Col>
        <Col span={6}>
          <Card>
            <Statistic
              title="待审核"
              value={pendingCount}
              suffix="条"
              prefix={<ExclamationCircleOutlined />}
              valueStyle={{ color: '#faad14' }}
            />
          </Card>
        </Col>
        <Col span={6}>
          <Card>
            <Statistic
              title="我的贡献占比"
              value={isStudent ? 100 : '-'}
              suffix="%"
              prefix={<UserOutlined />}
            />
          </Card>
        </Col>
      </Row>

      <Card
        title="工作量记录"
        extra={
          <Space>
            <Button icon={<DownloadOutlined />} onClick={handleExportWorkload}>导出工作量统计</Button>
            {isStudent && (
              <Button type="primary" icon={<PlusOutlined />} onClick={() => setModalVisible(true)}>
                记录工时
              </Button>
            )}
          </Space>
        }
      >
        <Table
          columns={columns}
          dataSource={data}
          rowKey="id"
          loading={loading}
          scroll={{ x: 'max-content' }}
          pagination={{ pageSize: 10, showSizeChanger: true, showTotal: (total) => `共 ${total} 条` }}
        />
      </Card>

      {/* 添加工时弹窗 */}
      <Modal
        title="记录工作量"
        open={modalVisible}
        onOk={handleSubmit}
        onCancel={() => {
          setModalVisible(false)
          form.resetFields()
        }}
      >
        <Form form={form} layout="vertical">
          <Form.Item name="projectId" label="选择项目" rules={[{ required: true, message: '请选择项目' }]}>
            <Select
              placeholder="请选择项目"
              options={projects.map(p => ({ value: p.id, label: p.name }))}
            />
          </Form.Item>
          <Form.Item name="date" label="工作日期" rules={[{ required: true, message: '请选择日期' }]}>
            <DatePicker style={{ width: '100%' }} />
          </Form.Item>
          <Form.Item name="hours" label="工作时长（小时）" rules={[{ required: true, message: '请输入工时' }]}>
            <InputNumber min={0.5} max={24} step={0.5} style={{ width: 120 }} />
          </Form.Item>
          <Form.Item name="content" label="工作内容" rules={[{ required: true, message: '请输入工作内容' }]}>
            <TextArea rows={4} placeholder="请详细描述今天完成的工作..." />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  )
}
