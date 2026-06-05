import { useEffect, useState } from 'react'
import { Table, Card, Tag, Button, Input, Space, Row, Col, Modal, Form, InputNumber, Select, Alert } from 'antd'
import { PlusOutlined, UserAddOutlined, LogoutOutlined, CheckCircleOutlined, TeamOutlined } from '@ant-design/icons'
import { useNavigate } from 'react-router-dom'
import { groupApi, Group } from '../../api/group'
import { getProjectList } from '../../api/project'
import { useAuthStore } from '../../stores/auth.store'
import { messageHolder } from '../../utils/messageHolder'
import { supabase } from '../../lib/supabase'

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
  const [myGroupId, setMyGroupId] = useState<number | null>(null)
  const [myGroupName, setMyGroupName] = useState<string>('')
  const [form] = Form.useForm()

  const isStudent = user?.role === 'student'

  const fetchMyGroup = async () => {
    if (!user?.id) return
    const { data: members } = await supabase
      .from('group_members')
      .select('group_id, groups!inner(name)')
      .eq('student_id', user.id)
      .limit(1)
    if (members && members.length > 0) {
      const m = members[0] as any
      setMyGroupId(m.group_id)
      setMyGroupName(m.groups?.name || '')
    } else {
      setMyGroupId(null)
      setMyGroupName('')
    }
  }

  const fetchData = async () => {
    setLoading(true)
    try {
      const response: any = await groupApi.getList({ page, keyword })
      const resData = response?.data || {}
      setData({
        list: resData.list || [],
        total: resData.total || 0,
      })
    } catch (error: any) {
      messageHolder.error(error?.message || '获取分组列表失败')
      setData({
        list: [
          { id: 1, projectId: 1, name: '第一组', description: '项目一组', maxMembers: 5, memberCount: 3, status: 1, projectName: '毕业设计管理系统', leaderName: '张三', createdAt: new Date().toISOString() },
          { id: 2, projectId: 1, name: '第二组', description: '项目二组', maxMembers: 5, memberCount: 4, status: 1, projectName: '毕业设计管理系统', leaderName: '李四', createdAt: new Date().toISOString() },
        ],
        total: 2,
      })
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchData()
    fetchMyGroup()
  }, [page])

  const fetchProjects = async () => {
    setProjectsLoading(true)
    try {
      const res = await getProjectList({ page: 1, pageSize: 200 })
      if (res.data?.list && res.data.list.length > 0) {
        setProjectOptions(res.data.list.map(p => ({ id: p.id, name: p.name })))
      } else {
        setProjectOptions([
          { id: 1, name: '毕业设计管理系统' },
          { id: 2, name: '在线学习平台' },
        ])
      }
    } catch (error: any) {
      messageHolder.error(error?.message || '获取项目列表失败')
      setProjectOptions([
        { id: 1, name: '毕业设计管理系统' },
        { id: 2, name: '在线学习平台' },
      ])
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
      const { data: newGroup } = await supabase
        .from('groups')
        .insert({
          project_id: values.projectId,
          name: values.name,
          description: values.description || '',
          max_members: values.maxMembers || 4,
          leader_id: user?.id,
          status: 1,
        })
        .select()
        .single()

      if (newGroup) {
        // 自动把创建者加入分组成员
        await supabase.from('group_members').insert({
          group_id: newGroup.id,
          student_id: user?.id,
          role: 1,
          status: 1,
        })
        messageHolder.success('分组创建成功，您已自动成为组长')
      }
      if (page === 1) {
        fetchData()
      } else {
        setPage(1)
      }
      fetchMyGroup()
      setCreateModalVisible(false)
      form.resetFields()
    } catch (error: any) {
      messageHolder.error(error?.message || '创建失败')
    }
  }

  const handleJoinGroup = async (groupId: number) => {
    try {
      await groupApi.addMember(groupId, user?.id as any)
      messageHolder.success('已成功加入该分组')
      fetchData()
      fetchMyGroup()
    } catch (error: any) {
      messageHolder.error(error?.message || '加入失败')
    }
  }

  const handleLeaveGroup = async () => {
    if (!myGroupId) return
    Modal.confirm({
      title: '确认退出',
      content: `确定要退出「${myGroupName}」吗？`,
      onOk: async () => {
        try {
          await groupApi.removeMember(myGroupId, user?.id as any)
          messageHolder.success('已退出分组')
          setMyGroupId(null)
          setMyGroupName('')
          fetchData()
          fetchMyGroup()
        } catch (error: any) {
          messageHolder.error(error?.message || '退出失败')
        }
      },
    })
  }

  const columns = [
    {
      title: '分组名称',
      dataIndex: 'name',
      key: 'name',
      render: (name: string, record: Group) => (
        <a onClick={() => navigate(`/groups/${record.id}`)}>
          {name}
          {record.id === myGroupId && <Tag color="blue" style={{ marginLeft: 8 }}>我的</Tag>}
        </a>
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
          <Button type="link" size="small" onClick={() => navigate(`/groups/${record.id}`)}>
            查看
          </Button>
          {isStudent && record.status === 1 && !myGroupId && (
            <Button type="primary" size="small" icon={<UserAddOutlined />} onClick={() => handleJoinGroup(record.id)}>
              加入
            </Button>
          )}
        </Space>
      ),
    },
  ]

  return (
    <div>
      {isStudent && myGroupId && (
        <Card style={{ marginBottom: 16, background: '#f6ffed' }}>
          <Space>
            <CheckCircleOutlined style={{ color: '#52c41a', fontSize: 20 }} />
            <span>
              您已在 <strong>{myGroupName}</strong> 中，
            </span>
            <Button type="primary" size="small" onClick={() => navigate(`/groups/${myGroupId}`)}>
              查看我的分组
            </Button>
            <Button danger size="small" icon={<LogoutOutlined />} onClick={handleLeaveGroup}>
              退出分组
            </Button>
          </Space>
        </Card>
      )}

      {isStudent && !myGroupId && (
        <Alert
          message="您还未加入任何分组"
          description="您可以选择一个已有分组加入，或自己创建新分组。加入后才能参与项目协作。"
          type="info"
          showIcon
          style={{ marginBottom: 16 }}
        />
      )}

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
              {isStudent && (
                <Button
                  type="primary"
                  icon={<PlusOutlined />}
                  onClick={openCreateModal}
                >
                  创建分组
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
        title="创建分组"
        open={createModalVisible}
        onCancel={() => setCreateModalVisible(false)}
        onOk={() => form.submit()}
      >
        <Form form={form} layout="vertical" onFinish={handleCreate}>
          <Form.Item name="projectId" label="所属项目" rules={[{ required: true, message: '请选择项目' }]}>
            <Select
              placeholder="请选择项目"
              loading={projectsLoading}
              showSearch
              optionFilterProp="label"
              options={projectOptions.map(p => ({ value: p.id, label: p.name }))}
            />
          </Form.Item>
          <Form.Item name="name" label="分组名称" rules={[{ required: true, message: '请输入分组名称' }, { max: 50 }]}>
            <Input placeholder="请输入分组名称" maxLength={50} />
          </Form.Item>
          <Form.Item name="description" label="分组描述" rules={[{ max: 200 }]}>
            <Input.TextArea rows={3} placeholder="请输入分组描述" maxLength={200} showCount />
          </Form.Item>
          <Form.Item name="maxMembers" label="最大成员数" initialValue={4}
            rules={[{ required: true, message: '请输入最大成员数' }, { type: 'number', min: 2, max: 10 }]}>
            <InputNumber min={2} max={10} style={{ width: '100%' }} placeholder="请输入最大成员数" />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  )
}
