import { useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { Card, Button, Tag, List, Avatar, Space, Spin, Row, Col, Statistic, Descriptions } from 'antd'
import { ArrowLeftOutlined, CrownOutlined, UserOutlined, TeamOutlined } from '@ant-design/icons'
import { groupApi, Group, GroupMember } from '../../api/group'

export default function GroupDetail() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const [group, setGroup] = useState<Group | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (id) {
      groupApi.getDetail(parseInt(id))
        .then((response: any) => {
          setGroup(response?.data?.data)
        })
        .catch(() => {
        })
        .finally(() => {
          setLoading(false)
        })
    }
  }, [id])

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
      <Button
        icon={<ArrowLeftOutlined />}
        onClick={() => navigate(-1)}
        style={{ marginBottom: 16 }}
      >
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
