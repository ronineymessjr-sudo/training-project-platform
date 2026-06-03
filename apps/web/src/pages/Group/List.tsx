import { useEffect, useState } from 'react'
import { Table, Card, Tag, Button, Input, Space, Row, Col, Modal, Form, InputNumber, Select, Drawer } from 'antd'
import { PlusOutlined, TeamOutlined, UserAddOutlined } from '@ant-design/icons'
import { useNavigate } from 'react-router-dom'
import { groupApi, Group } from '../../api/group'
import { getProjectList } from '../../api/project'
import { useAuthStore } from '../../stores/auth.store'
import { messageHolder } from '../../utils/messageHolder'

interface ProjectOption {
  id: number
  name: string
}

export default function GroupList() {
  const navigate = useNavigate()
  const { user } = useAuthStore()
  const [data, setData] = useState<{ list: Group[]; total: number }>({ list: [], total: 0 })
  const [loading, setLoading] = useState(false)
  const [page, setPage] = useState(1)
  const [keyword, setKeyword] = useState('')
  const [createModalVisible, setCreateModalVisible] = useState(false)
  const [projectOptions, setProjectOptions] = useState<ProjectOption[]>([])
  const [projectsLoading, setProjectsLoading] = useState(false)
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
    } catch (error: any) {
      messageHolder.error(error?.message || '获取分组列表失败')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchData()
  }, [page])

  const fetchProjects = async () => {
    setProjectsLoading(true)
    try {
      const res = await getProjectList({ page: 1, pageSize: 200 })
      if (res.data?.list) {
        setProjectOptions(res.data.list.map(p => ({ id: p.id, name: p.name })))
      }
    } catch (error: any) {
      messageHolder.error(error?.message || '获取项目列表失败')
    } finally {
      setProjectsLoading(false)
    }
  }

  const openCreateModal = () => {
    setCreateModalVisible(true)
    if (projectOptions.length === 0) {
      fetchProjects()
    }
  }

  const handleCreate = async (values: any) => {
    try {
      await groupApi.create(values)
      messageHolder.success('分组创建成功')
      setCreateModalVisible(false)
      form.resetFields()
      fetchData()
    } catch (error: any) {
      if (error?.errorFields) {
        messageHolder.error('请检查表单填写')
      } else {
        messageHolder.error(error?.message || '分组创建失败')
      }
    }
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
                onClick={openCreateModal}
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
            <Select
              placeholder="请选择项目"
              loading={projectsLoading}
              showSearch
              optionFilterProp="label"
              options={projectOptions.map(p => ({ value: p.id, label: p.name }))}
            />
          </Form.Item>

          <Form.Item
            name="name"
            label="分组名称"
            rules={[
              { required: true, message: '请输入分组名称' },
              { max: 50, message: '分组名称不能超过50个字符' },
            ]}
          >
            <Input placeholder="请输入分组名称" maxLength={50} />
          </Form.Item>

          <Form.Item
            name="description"
            label="分组描述"
            rules={[{ max: 200, message: '分组描述不能超过200个字符' }]}
          >
            <Input.TextArea rows={3} placeholder="请输入分组描述" maxLength={200} showCount />
          </Form.Item>

          <Form.Item
            name="maxMembers"
            label="最大成员数"
            initialValue={4}
            rules={[
              { required: true, message: '请输入最大成员数' },
              { type: 'number', min: 2, max: 10, message: '最大成员数应在2-10人之间' },
            ]}
          >
            <InputNumber min={2} max={10} style={{ width: '100%' }} placeholder="请输入最大成员数" />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  )
}
