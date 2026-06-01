import { useEffect, useState } from 'react'
import { Table, Card, Tag, Button, Input, Space, Row, Col, Modal, Form, DatePicker, message } from 'antd'
import { PlusOutlined, SearchOutlined, EyeOutlined } from '@ant-design/icons'
import { useNavigate } from 'react-router-dom'
import { projectApi, Project } from '../../api/project'
import { useAuthStore } from '../../stores/auth.store'
import dayjs from 'dayjs'

export default function ProjectList() {
  const navigate = useNavigate()
  const { user } = useAuthStore()
  const [data, setData] = useState<{ list: Project[]; total: number }>({ list: [], total: 0 })
  const [loading, setLoading] = useState(false)
  const [page, setPage] = useState(1)
  const [keyword, setKeyword] = useState('')
  const [createModalVisible, setCreateModalVisible] = useState(false)
  const [form] = Form.useForm()

  const isAdmin = user?.roles.includes('admin')
  const isTeacher = user?.roles.includes('teacher')

  const fetchData = async () => {
    setLoading(true)
    try {
      const response: any = await projectApi.getList({ page, keyword })
      const resData = response?.data?.data || {}
      setData({
        list: resData.list || [],
        total: resData.total || 0,
      })
    } catch {
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchData()
  }, [page])

  const handleCreate = async (values: any) => {
    try {
      await projectApi.create({
        ...values,
        startDate: values.startDate?.format('YYYY-MM-DD'),
        endDate: values.endDate?.format('YYYY-MM-DD'),
      })
      message.success('项目创建成功')
      setCreateModalVisible(false)
      form.resetFields()
      fetchData()
    } catch {}
  }

  const columns = [
    {
      title: '项目名称',
      dataIndex: 'name',
      key: 'name',
      render: (name: string, record: Project) => (
        <a onClick={() => navigate(`/projects/${record.id}`)}>{name}</a>
      ),
    },
    {
      title: '班级',
      dataIndex: 'className',
      key: 'className',
    },
    {
      title: '指导教师',
      dataIndex: 'teacherName',
      key: 'teacherName',
    },
    {
      title: '时间',
      key: 'date',
      render: (_: any, record: Project) => (
        <span>
          {dayjs(record.startDate).format('YYYY-MM-DD')} ~ {dayjs(record.endDate).format('YYYY-MM-DD')}
        </span>
      ),
    },
    {
      title: '分组数',
      dataIndex: 'groupCount',
      key: 'groupCount',
    },
    {
      title: '状态',
      dataIndex: 'status',
      key: 'status',
      render: (status: number) => {
        const statusMap: Record<number, { color: string; text: string }> = {
          0: { color: 'default', text: '未开始' },
          1: { color: 'processing', text: '进行中' },
          2: { color: 'success', text: '已完成' },
          3: { color: 'warning', text: '已归档' },
        }
        const { color, text } = statusMap[status] || statusMap[0]
        return <Tag color={color}>{text}</Tag>
      },
    },
    {
      title: '操作',
      key: 'action',
      render: (_: any, record: Project) => (
        <Space>
          <Button
            type="link"
            size="small"
            icon={<EyeOutlined />}
            onClick={() => navigate(`/projects/${record.id}`)}
          >
            查看
          </Button>
        </Space>
      ),
    },
  ]

  return (
    <div>
      <Card>
        <div style={{ marginBottom: 16 }}>
          <Row justify="space-between">
            <Col>
              <Space>
                <Input.Search
                  placeholder="搜索项目名称"
                  allowClear
                  style={{ width: 200 }}
                  onSearch={(value) => {
                    setKeyword(value)
                    setPage(1)
                  }}
                />
              </Space>
            </Col>
            <Col>
              {(isAdmin || isTeacher) && (
                <Button
                  type="primary"
                  icon={<PlusOutlined />}
                  onClick={() => setCreateModalVisible(true)}
                >
                  创建项目
                </Button>
              )}
            </Col>
          </Row>
        </div>

        <Table
          columns={columns}
          dataSource={data.list}
          rowKey="id"
          loading={loading}
          pagination={{
            current: page,
            pageSize: 10,
            total: data.total,
            onChange: setPage,
            showTotal: (total) => `共 ${total} 条`,
          }}
        />
      </Card>

      <Modal
        title="创建项目"
        open={createModalVisible}
        onCancel={() => setCreateModalVisible(false)}
        onOk={() => form.submit()}
      >
        <Form
          form={form}
          layout="vertical"
          onFinish={handleCreate}
        >
          <Form.Item
            name="name"
            label="项目名称"
            rules={[{ required: true, message: '请输入项目名称' }]}
          >
            <Input placeholder="请输入项目名称" />
          </Form.Item>

          <Form.Item
            name="description"
            label="项目描述"
          >
            <Input.TextArea rows={3} placeholder="请输入项目描述" />
          </Form.Item>

          <Form.Item
            name="classId"
            label="所属班级"
            rules={[{ required: true, message: '请选择班级' }]}
          >
            <Input type="number" placeholder="请输入班级ID" />
          </Form.Item>

          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                name="startDate"
                label="开始日期"
                rules={[{ required: true, message: '请选择开始日期' }]}
              >
                <DatePicker style={{ width: '100%' }} />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                name="endDate"
                label="结束日期"
                rules={[{ required: true, message: '请选择结束日期' }]}
              >
                <DatePicker style={{ width: '100%' }} />
              </Form.Item>
            </Col>
          </Row>
        </Form>
      </Modal>
    </div>
  )
}
