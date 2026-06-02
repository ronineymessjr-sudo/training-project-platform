import { Card, Table, Tag, Button, Space, Modal, Form, Input, Select, message, Popconfirm, Tabs, Drawer, Descriptions, Badge } from 'antd'
import { PlusOutlined, UserOutlined, LockOutlined, DeleteOutlined, EditOutlined, CheckCircleOutlined } from '@ant-design/icons'
import type { ColumnsType } from 'antd/es/table'
import { useState, useEffect } from 'react'
import { getAnnouncementList, createAnnouncement, deleteAnnouncement, publishAnnouncement, getUnreadCount } from '../../api/announcement'
import { useAuthStore } from '../../stores/auth.store'
import dayjs from 'dayjs'

const { TextArea } = Input

interface AnnouncementRecord {
  id: number
  title: string
  content: string
  type: 'system' | 'activity' | 'notice'
  targetScope: 'all' | 'students' | 'teachers' | 'class' | 'major'
  pinned: boolean
  status: 'draft' | 'published' | 'withdrawn'
  createdBy: number
  creatorName: string
  publishedAt?: string
  readCount: number
  createdAt: string
}

export default function AnnouncementManagement() {
  const [data, setData] = useState<AnnouncementRecord[]>([])
  const [loading, setLoading] = useState(false)
  const [pagination, setPagination] = useState({ current: 1, pageSize: 10, total: 0 })
  const [modalVisible, setModalVisible] = useState(false)
  const [detailVisible, setDetailVisible] = useState(false)
  const [selectedAnnouncement, setSelectedAnnouncement] = useState<AnnouncementRecord | null>(null)
  const [unreadCount, setUnreadCount] = useState(0)
  const [form] = Form.useForm()
  const { user } = useAuthStore()

  const isAdmin = user?.role === 'admin'

  const fetchData = async () => {
    setLoading(true)
    try {
      const res = await getAnnouncementList({ page: pagination.current, pageSize: pagination.pageSize })
      if (res.data) {
        setData((res.data as any)?.list || [])
        setPagination(p => ({ ...p, total: res.data.total }))
      }
    } catch (error: any) {
      message.error(error?.message || '获取公告数据失败')
    } finally {
      setLoading(false)
    }
  }

  const fetchUnreadCount = async () => {
    try {
      const res = await getUnreadCount()
      if (res.data) {
        setUnreadCount(res.data.count)
      }
    } catch (error: any) {
      message.error(error?.message || '获取未读数失败')
    }
  }

  useEffect(() => {
    fetchData()
    if (!isAdmin) {
      fetchUnreadCount()
    }
  }, [pagination.current, pagination.pageSize])

  const handleCreate = async () => {
    try {
      await form.validateFields()
      const values = form.getFieldsValue()
      await createAnnouncement(values)
      message.success('创建成功')
      setModalVisible(false)
      form.resetFields()
      fetchData()
    } catch (error: any) {
      if (error?.errorFields) {
        message.error('请检查表单填写')
      } else {
        message.error(error?.message || '创建失败')
      }
    }
  }

  const handlePublish = async (id: number) => {
    try {
      await publishAnnouncement(id)
      message.success('发布成功')
      fetchData()
    } catch (error: any) {
      message.error(error?.message || '发布失败')
    }
  }

  const handleDelete = async (id: number) => {
    try {
      await deleteAnnouncement(id)
      message.success('删除成功')
      fetchData()
    } catch (error: any) {
      message.error(error?.message || '删除失败')
    }
  }

  const columns: ColumnsType<AnnouncementRecord> = [
    {
      title: '标题',
      dataIndex: 'title',
      key: 'title',
      render: (title: string, record) => (
        <Space>
          {record.pinned && <Tag color="red">置顶</Tag>}
          <span>{title}</span>
        </Space>
      ),
    },
    {
      title: '类型',
      dataIndex: 'type',
      key: 'type',
      width: 100,
      render: (type: string) => {
        const map: Record<string, { color: string; text: string }> = {
          system: { color: 'blue', text: '系统通知' },
          activity: { color: 'green', text: '活动' },
          notice: { color: 'orange', text: '公告' },
        }
        return <Tag color={map[type]?.color}>{map[type]?.text || type}</Tag>
      },
    },
    {
      title: '发布范围',
      dataIndex: 'targetScope',
      key: 'targetScope',
      width: 100,
      render: (scope: string) => {
        const map: Record<string, string> = {
          all: '全部',
          students: '学生',
          teachers: '教师',
          class: '班级',
          major: '专业',
        }
        return map[scope] || scope
      },
    },
    {
      title: '状态',
      dataIndex: 'status',
      key: 'status',
      width: 100,
      render: (status: string) => {
        const map: Record<string, { color: string; text: string }> = {
          draft: { color: 'default', text: '草稿' },
          published: { color: 'success', text: '已发布' },
          withdrawn: { color: 'warning', text: '已撤回' },
        }
        return <Badge status={status === 'published' ? 'success' : 'default'} text={map[status]?.text} />
      },
    },
    {
      title: '阅读量',
      dataIndex: 'readCount',
      key: 'readCount',
      width: 80,
    },
    {
      title: '发布时间',
      dataIndex: 'publishedAt',
      key: 'publishedAt',
      width: 160,
      render: (time: string) => time ? dayjs(time).format('YYYY-MM-DD HH:mm') : '-',
    },
    {
      title: '操作',
      key: 'action',
      width: 180,
      render: (_, record) => (
        <Space>
          <Button type="link" size="small" onClick={() => {
            setSelectedAnnouncement(record)
            setDetailVisible(true)
          }}>
            查看
          </Button>
          {isAdmin && record.status === 'draft' && (
            <Button type="link" size="small" onClick={() => handlePublish(record.id)}>
              发布
            </Button>
          )}
          {isAdmin && (
            <Popconfirm
              title="确认删除"
              onConfirm={() => handleDelete(record.id)}
            >
              <Button type="link" size="small" danger>
                删除
              </Button>
            </Popconfirm>
          )}
        </Space>
      ),
    },
  ]

  return (
    <div>
      <Card
        title={
          <Space>
            <span>公告管理</span>
            {unreadCount > 0 && <Badge count={unreadCount} style={{ backgroundColor: '#ff4d4f' }} />}
          </Space>
        }
        extra={
          isAdmin && (
            <Button type="primary" icon={<PlusOutlined />} onClick={() => setModalVisible(true)}>
              发布公告
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

      {/* 创建公告弹窗 */}
      <Modal
        title="发布公告"
        open={modalVisible}
        onOk={handleCreate}
        onCancel={() => {
          setModalVisible(false)
          form.resetFields()
        }}
        width={700}
      >
        <Form form={form} layout="vertical">
          <Form.Item name="title" label="标题" rules={[{ required: true }]}>
            <Input placeholder="请输入公告标题" />
          </Form.Item>
          <Form.Item name="type" label="类型" rules={[{ required: true }]}>
            <Select placeholder="请选择类型">
              <Select.Option value="system">系统通知</Select.Option>
              <Select.Option value="activity">活动</Select.Option>
              <Select.Option value="notice">公告</Select.Option>
            </Select>
          </Form.Item>
          <Form.Item name="targetScope" label="发布范围" rules={[{ required: true }]}>
            <Select placeholder="请选择发布范围">
              <Select.Option value="all">全部</Select.Option>
              <Select.Option value="students">学生</Select.Option>
              <Select.Option value="teachers">教师</Select.Option>
            </Select>
          </Form.Item>
          <Form.Item name="pinned" valuePropName="checked">
            <Space>
              <Input type="checkbox" /> 置顶
            </Space>
          </Form.Item>
          <Form.Item name="content" label="内容" rules={[{ required: true }]}>
            <TextArea rows={8} placeholder="请输入公告内容..." />
          </Form.Item>
        </Form>
      </Modal>

      {/* 公告详情抽屉 */}
      <Drawer
        title={selectedAnnouncement?.title}
        open={detailVisible}
        onClose={() => setDetailVisible(false)}
        width={600}
      >
        {selectedAnnouncement && (
          <div>
            <Descriptions column={2}>
              <Descriptions.Item label="类型">
                <Tag>{selectedAnnouncement.type}</Tag>
              </Descriptions.Item>
              <Descriptions.Item label="状态">
                <Tag color={selectedAnnouncement.status === 'published' ? 'success' : 'default'}>
                  {selectedAnnouncement.status}
                </Tag>
              </Descriptions.Item>
              <Descriptions.Item label="发布人">{selectedAnnouncement.creatorName}</Descriptions.Item>
              <Descriptions.Item label="发布时间">
                {selectedAnnouncement.publishedAt ? dayjs(selectedAnnouncement.publishedAt).format('YYYY-MM-DD HH:mm') : '-'}
              </Descriptions.Item>
              <Descriptions.Item label="阅读量">{selectedAnnouncement.readCount}</Descriptions.Item>
            </Descriptions>
            <div style={{ marginTop: 16 }}>
              <strong>内容：</strong>
              <div style={{ marginTop: 8, padding: 16, background: '#f5f5f5', borderRadius: 4, whiteSpace: 'pre-wrap' }}>
                {selectedAnnouncement.content}
              </div>
            </div>
          </div>
        )}
      </Drawer>
    </div>
  )
}
