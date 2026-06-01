import { useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { Card, Descriptions, Tag, Button, Row, Col, Statistic, Table, List, Avatar, Space, Spin } from 'antd'
import { ArrowLeftOutlined, TeamOutlined, FileTextOutlined, CheckCircleOutlined } from '@ant-design/icons'
import { projectApi } from '../../api/project'
import dayjs from 'dayjs'

interface ProjectDetail {
  id: number
  name: string
  description: string
  className: string
  teacherName: string
  topicName: string
  startDate: string
  endDate: string
  status: number
  phases: any[]
  groups: any[]
}

interface ProgressStats {
  totalGroups: number
  avgCompletion: number
}

export default function ProjectDetail() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const [project, setProject] = useState<ProjectDetail | null>(null)
  const [stats, setStats] = useState<ProgressStats>({ totalGroups: 0, avgCompletion: 0 })
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (id) {
      Promise.all([
        projectApi.getDetail(parseInt(id)),
        projectApi.getProgress(parseInt(id)),
      ]).then((responses: any[]) => {
        const projectData = responses[0]?.data?.data
        const progressData = responses[1]?.data?.data
        
        if (projectData) {
          setProject(projectData)
        }
        if (progressData?.stats) {
          setStats({
            totalGroups: progressData.stats.total_groups || 0,
            avgCompletion: progressData.stats.overall_completion || 0,
          })
        }
      }).catch(() => {
      }).finally(() => {
        setLoading(false)
      })
    }
  }, [id])

  const getStatusTag = (status: number) => {
    const statusMap: Record<number, { color: string; text: string }> = {
      0: { color: 'default', text: '未开始' },
      1: { color: 'processing', text: '进行中' },
      2: { color: 'success', text: '已完成' },
      3: { color: 'warning', text: '已归档' },
    }
    const { color, text } = statusMap[status] || statusMap[0]
    return <Tag color={color}>{text}</Tag>
  }

  if (loading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: 400 }}>
        <Spin size="large" />
      </div>
    )
  }

  if (!project) {
    return <Card>项目不存在</Card>
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

      <Card title={project.name}>
        <Descriptions column={2}>
          <Descriptions.Item label="班级">{project.className}</Descriptions.Item>
          <Descriptions.Item label="指导教师">{project.teacherName}</Descriptions.Item>
          <Descriptions.Item label="开始日期">{dayjs(project.startDate).format('YYYY-MM-DD')}</Descriptions.Item>
          <Descriptions.Item label="结束日期">{dayjs(project.endDate).format('YYYY-MM-DD')}</Descriptions.Item>
          <Descriptions.Item label="项目状态">{getStatusTag(project.status)}</Descriptions.Item>
          <Descriptions.Item label="项目描述" span={2}>{project.description || '暂无描述'}</Descriptions.Item>
        </Descriptions>
      </Card>

      <Row gutter={16} style={{ marginTop: 16 }}>
        <Col span={8}>
          <Card>
            <Statistic
              title="分组数量"
              value={project.groups?.length || 0}
              prefix={<TeamOutlined />}
            />
          </Card>
        </Col>
        <Col span={8}>
          <Card>
            <Statistic
              title="项目阶段"
              value={project.phases?.length || 0}
              prefix={<FileTextOutlined />}
            />
          </Card>
        </Col>
        <Col span={8}>
          <Card>
            <Statistic
              title="平均完成度"
              value={stats.avgCompletion || 0}
              suffix="%"
              prefix={<CheckCircleOutlined />}
            />
          </Card>
        </Col>
      </Row>

      <Row gutter={16} style={{ marginTop: 16 }}>
        <Col span={12}>
          <Card title="项目阶段">
            <List
              dataSource={project.phases || []}
              renderItem={(phase: any, index: number) => (
                <List.Item>
                  <List.Item.Meta
                    avatar={<Avatar style={{ background: '#1890ff' }}>{index + 1}</Avatar>}
                    title={phase.name}
                    description={`${dayjs(phase.start_date || phase.startDate).format('MM-DD')} ~ ${dayjs(phase.end_date || phase.endDate).format('MM-DD')}`}
                  />
                </List.Item>
              )}
              locale={{ emptyText: '暂无阶段' }}
            />
          </Card>
        </Col>
        <Col span={12}>
          <Card title="项目分组">
            <List
              dataSource={project.groups || []}
              renderItem={(group: any) => (
                <List.Item
                  actions={[<a key="detail" onClick={() => navigate(`/groups/${group.id}`)}>查看</a>]}
                >
                  <List.Item.Meta
                    avatar={<Avatar style={{ background: '#52c41a' }}><TeamOutlined /></Avatar>}
                    title={group.name}
                    description={`组长: ${group.leader_name || group.leaderName || '未指定'}`}
                  />
                  <div>{group.member_count || group.memberCount || 0} 人</div>
                </List.Item>
              )}
              locale={{ emptyText: '暂无分组' }}
            />
          </Card>
        </Col>
      </Row>
    </div>
  )
}
