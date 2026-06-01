import { useEffect, useState } from 'react'
import { Table, Card, Tag, Button, Input, Space, Row, Col, Modal, Form, InputNumber, message, Drawer } from 'antd'
import { PlusOutlined, TeamOutlined, UserAddOutlined } from '@ant-design/icons'
import { useNavigate } from 'react-router-dom'
import { groupApi, Group } from '../../api/group'
import { useAuthStore } from '../../stores/auth.store'

export default function GroupList() {
  const navigate = useNavigate()
  const { user } = useAuthStore()
  const [data, setData] = useState<{ list: Group[]; total: number }>({ list: [], total: 0 })
  const [loading, setLoading] = useState(false)
  const [page, setPage] = useState(1)
  const [keyword, setKeyword] = useState('')
  const [createModalVisible, setCreateModalVisible] = useState(false)
  const [projects, setProjects] = useState<any[]>([])
  const [form] = Form.useForm()

  const fetchData = async () => {
    setLoading(true)
    try {
      const response: any = await groupApi.getList({ page, keyword })
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
      await groupApi.create(values)
      message.success('分组创建成功')
      setCreateModalVisible(false)
      form.resetFields()
      fetchData()
    } catch {}
  }

  const columns = [
    {
      title: '分组名称',
      dataIndex: 'name',
      key: 'name',
      render: (name: string, record: Group) => (
        <a onClick={() => navigate(`/groups/${record.id}`)}>{name}</a>
      ),
    },
    {
      title: '所属项目',
      dataIndex: 'projectName',
      key: 'projectName',
    },
    {
      title: '组长',
      dataIndex: 'leaderName',
      key: 'leaderName',
    },
    {
      title: '成员数',
      dataIndex: 'memberCount',
      key: 'memberCount',
      render: (count: number, record: Group) => (
        <span>{count || 0} / {record.maxMembers}</span>
      ),
    },
    {
      title: '状态',
      dataIndex: 'status',
      key: 'status',
      render: (status: number) => {
        const statusMap: Record<number, { color: string; text: string }> = {
          0: { color: 'error', text: '已解散' },
          1: { color: 'success', text: '正常' },
        }
        const { color, text } = statusMap[status] || statusMap[1]
        return <Tag color={color}>{text}</Tag>
      },
    },
    {
      title: '操作',
      key: 'action',
      render: (_: any, record: Group) => (
        <Space>
          <Button
            type="link"
            size="small"
            onClick={() => navigate(`/groups/${record.id}`)}
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
                  placeholder="搜索分组名称"
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
              <Button
                type="primary"
                icon={<PlusOutlined />}
                onClick={() => setCreateModalVisible(true)}
              >
                创建分组
              </Button>
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
        title="创建分组"
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
            name="projectId"
            label="所属项目"
            rules={[{ required: true, message: '请选择项目' }]}
          >
            <Input type="number" placeholder="请输入项目ID" />
          </Form.Item>

          <Form.Item
            name="name"
            label="分组名称"
            rules={[{ required: true, message: '请输入分组名称' }]}
          >
            <Input placeholder="请输入分组名称" />
          </Form.Item>

          <Form.Item
            name="description"
            label="分组描述"
          >
            <Input.TextArea rows={3} placeholder="请输入分组描述" />
          </Form.Item>

          <Form.Item
            name="maxMembers"
            label="最大成员数"
            initialValue={4}
          >
            <InputNumber min={2} max={10} style={{ width: '100%' }} />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  )
}
