import { useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { Card, Button, Tag, List, Avatar, Space, Spin, Row, Col, Statistic, Descriptions, Modal } from 'antd'
import { ArrowLeftOutlined, CrownOutlined, UserOutlined, TeamOutlined, UserAddOutlined, LogoutOutlined } from '@ant-design/icons'
import { groupApi, Group, GroupMember } from '../../api/group'
import { useAuthStore } from '../../stores/auth.store'
import { supabase } from '../../lib/supabase'
import { messageHolder } from '../../utils/messageHolder'

export default function GroupDetail() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const { user } = useAuthStore()
  const [group, setGroup] = useState<Group | null>(null)
  const [loading, setLoading] = useState(true)
  const [amMember, setAmMember] = useState(false)

  const isStudent = user?.role === 'student'

  const fetchGroup = async () => {
    if (!id) return
    setLoading(true)
    try {
      const response: any = await groupApi.getDetail(parseInt(id))
      setGroup(response?.data)
    } catch (error) {
      console.error('获取分组详情失败', error)
    } finally {
      setLoading(false)
    }
  }

  const checkMembership = async () => {
    if (!id || !user?.id) return
    const { data } = await supabase
      .from('group_members')
      .select('id')
      .eq('group_id', parseInt(id))
      .eq('student_id', user.id)
      .limit(1)
    setAmMember(!!(data && data.length > 0))
  }

  useEffect(() => {
    fetchGroup()
    checkMembership()
  }, [id])

  const handleJoin = async () => {
    if (!id) return
    try {
      await groupApi.addMember(parseInt(id), user?.id as any)
      messageHolder.success('已成功加入该分组')
      setAmMember(true)
      fetchGroup()
    } catch (error: any) {
      messageHolder.error(error?.message || '加入失败')
    }
  }

  const handleLeave = async () => {
    if (!id || !user?.id) return
    Modal.confirm({
      title: '确认退出',
      content: '确定要退出该分组吗？',
      onOk: async () => {
        try {
          const res = await groupApi.removeMember(parseInt(id), user?.id as any)
          if (res.code !== 200) {
            messageHolder.error(res.message || '退出失败，请重试')
            return
          }
          messageHolder.success('已退出分组')
          setAmMember(false)
          fetchGroup()
        } catch (error: any) {
          messageHolder.error(error?.message || '退出失败，请重试')
        }
      },
    })
  }

  if (loading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: 400 }}>
        <Spin size="large" />
      </div>
    )
  }

  if (!group) {
    return <Card>分组不存在</Card>
  }

  return (
    <div>
      <Button icon={<ArrowLeftOutlined />} onClick={() => navigate(-1)} style={{ marginBottom: 16 }}>
        返回
      </Button>

      <Row gutter={16}>
        <Col span={16}>
          <Card title={group.name}>
            <Descriptions column={2}>
              <Descriptions.Item label="所属项目">{group.projectName}</Descriptions.Item>
              <Descriptions.Item label="组长">{group.leaderName}</Descriptions.Item>
              <Descriptions.Item label="最大成员数">{group.maxMembers}</Descriptions.Item>
              <Descriptions.Item label="状态">
                <Tag color={group.status === 1 ? 'success' : 'error'}>
                  {group.status === 1 ? '正常' : '已解散'}
                </Tag>
              </Descriptions.Item>
              <Descriptions.Item label="描述" span={2}>{group.description || '暂无描述'}</Descriptions.Item>
            </Descriptions>
          </Card>
        </Col>
        <Col span={8}>
          <Card>
            <Statistic
              title="当前成员"
              value={group.memberCount || 0}
              suffix={`/ ${group.maxMembers}`}
              prefix={<TeamOutlined />}
            />
            <div style={{ marginTop: 16 }}>
              {isStudent && group.status === 1 && !amMember && (
                <Button type="primary" icon={<UserAddOutlined />} block onClick={handleJoin}>
                  加入该分组
                </Button>
              )}
              {isStudent && amMember && (
                <Button danger icon={<LogoutOutlined />} block onClick={handleLeave}>
                  退出分组
                </Button>
              )}
            </div>
          </Card>
        </Col>
      </Row>

      <Card title="成员列表" style={{ marginTop: 16 }}>
        <List
          dataSource={group.members || []}
          renderItem={(member: GroupMember) => (
            <List.Item>
              <List.Item.Meta
                avatar={
                  <Avatar
                    icon={<UserOutlined />}
                    src={member.avatarUrl}
                    style={{ background: member.role === 1 ? '#faad14' : '#1890ff' }}
                  />
                }
                title={
                  <Space>
                    {member.realName || member.username}
                    {member.role === 1 && (
                      <Tag icon={<CrownOutlined />} color="gold">组长</Tag>
                    )}
                    {(member as any).student_id === user?.id && (
                      <Tag color="blue">我</Tag>
                    )}
                  </Space>
                }
                description={member.username}
              />
            </List.Item>
          )}
          locale={{ emptyText: '暂无成员' }}
        />
      </Card>
    </div>
  )
}
