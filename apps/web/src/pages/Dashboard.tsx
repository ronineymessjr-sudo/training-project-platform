import { Card, Row, Col, Statistic, Table, Tag, Space, Button, Progress } from 'antd'
import {
  ProjectOutlined,
  TeamOutlined,
  ClockCircleOutlined,
  CheckCircleOutlined,
  FileTextOutlined,
  TrophyOutlined,
} from '@ant-design/icons'
import type { ColumnsType } from 'antd/es/table'
import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { getProjectList } from '../api/project'
import { getGroupList } from '../api/group'
import { useAuthStore } from '../stores/auth.store'

interface ProjectSummary {
  id: number
  name: string
  status: string
  progress: number
  deadline: string
}

interface GroupSummary {
  id: number
  name: string
  memberCount: number
  projectName: string
}

interface Stats {
  projectCount: number
  groupCount: number
  pendingTaskCount: number
  completedTaskCount: number
}

export default function Dashboard() {
  const [stats, setStats] = useState<Stats>({
    projectCount: 0,
    groupCount: 0,
    pendingTaskCount: 0,
    completedTaskCount: 0,
  })
  const [recentProjects, setRecentProjects] = useState<ProjectSummary[]>([])
  const [myGroups, setMyGroups] = useState<GroupSummary[]>([])
  const [loading, setLoading] = useState(true)
  const navigate = useNavigate()
  const { user } = useAuthStore()

  const isTeacher = user?.role === 'teacher'
  const isAdmin = user?.role === 'admin'
  const isStudent = user?.role === 'student'

  useEffect(() => {
    fetchData()
  }, [])

  const fetchData = async () => {
    setLoading(true)
    try {
      // 获取项目列表
      const projectRes = await getProjectList({ myOnly: !isTeacher })
      if (projectRes.data && projectRes.data.list && projectRes.data.list.length > 0) {
        setRecentProjects((projectRes.data.list as any[]).slice(0, 5).map(p => ({
          id: p.id,
          name: p.name,
          status: p.status,
          progress: p.progress || 0,
          deadline: p.end_date || p.deadline || '',
        })))
        setStats(s => ({ ...s, projectCount: projectRes.data.total }))
      } else {
        // 使用模拟数据
        setRecentProjects(mockProjects)
        setStats(s => ({ ...s, projectCount: mockProjects.length }))
      }

      // 获取分组列表
      const groupRes = await getGroupList()
      if (groupRes.data && groupRes.data.list && groupRes.data.list.length > 0) {
        setMyGroups((groupRes.data.list as any[]).slice(0, 5).map(g => ({
          id: g.id,
          name: g.name,
          memberCount: g.memberCount || 0,
          projectName: g.projectName || '',
        })))
        setStats(s => ({ ...s, groupCount: groupRes.data.total }))
      } else {
        // 使用模拟数据
        setMyGroups(mockGroups)
        setStats(s => ({ ...s, groupCount: mockGroups.length }))
      }

      // 模拟待办任务数
      setStats(s => ({ ...s, pendingTaskCount: 3, completedTaskCount: 8 }))
    } catch (error) {
      console.error('获取仪表盘数据失败，使用模拟数据', error)
      // 使用模拟数据
      setRecentProjects(mockProjects)
      setMyGroups(mockGroups)
      setStats({
        projectCount: mockProjects.length,
        groupCount: mockGroups.length,
        pendingTaskCount: 3,
        completedTaskCount: 8,
      })
    } finally {
      setLoading(false)
    }
  }

  // 模拟数据 - 用于演示
  const mockProjects: ProjectSummary[] = [
    { id: 1, name: '电商平台开发', status: 'in_progress', progress: 65, deadline: '2026-06-15' },
    { id: 2, name: '图书管理系统', status: 'pending', progress: 0, deadline: '2026-06-20' },
    { id: 3, name: '在线考试系统', status: 'submitted', progress: 100, deadline: '2026-05-30' },
    { id: 4, name: '智能问答机器人', status: 'in_progress', progress: 45, deadline: '2026-06-25' },
  ]

  const mockGroups: GroupSummary[] = [
    { id: 1, name: '第一组-电商先锋', memberCount: 4, projectName: '电商平台开发' },
    { id: 2, name: '第二组-购物达人', memberCount: 3, projectName: '电商平台开发' },
    { id: 3, name: '第一组-书香阁', memberCount: 3, projectName: '图书管理系统' },
    { id: 4, name: '第一组-考试通', memberCount: 4, projectName: '在线考试系统' },
  ]

  const projectColumns: ColumnsType<ProjectSummary> = [
    {
      title: '项目名称',
      dataIndex: 'name',
      key: 'name',
      render: (name: string, record) => (
        <a onClick={() => navigate(`/projects/${record.id}`)}>{name}</a>
      ),
    },
    {
      title: '状态',
      dataIndex: 'status',
      key: 'status',
      width: 100,
      render: (status: string) => {
        const map: Record<string, { color: string; text: string }> = {
          pending: { color: 'default', text: '待开始' },
          in_progress: { color: 'processing', text: '进行中' },
          submitted: { color: 'warning', text: '已提交' },
          defended: { color: 'success', text: '已答辩' },
          completed: { color: 'success', text: '已完成' },
        }
        return <Tag color={map[status]?.color}>{map[status]?.text || status}</Tag>
      },
    },
    {
      title: '进度',
      dataIndex: 'progress',
      key: 'progress',
      width: 150,
      render: (progress: number) => <Progress percent={progress} size="small" />,
    },
  ]

  const groupColumns: ColumnsType<GroupSummary> = [
    {
      title: '小组名称',
      dataIndex: 'name',
      key: 'name',
      render: (name: string, record) => (
        <a onClick={() => navigate(`/groups/${record.id}`)}>{name}</a>
      ),
    },
    {
      title: '所属项目',
      dataIndex: 'projectName',
      key: 'projectName',
      ellipsis: true,
    },
    {
      title: '成员数',
      dataIndex: 'memberCount',
      key: 'memberCount',
      width: 80,
      render: (count: number) => <Tag icon={<TeamOutlined />}>{count}</Tag>,
    },
  ]

  return (
    <div>
      {/* 统计卡片 */}
      <Row gutter={16} style={{ marginBottom: 24 }}>
        <Col span={6}>
          <Card loading={loading}>
            <Statistic
              title="我的项目"
              value={stats.projectCount}
              prefix={<ProjectOutlined />}
              valueStyle={{ color: '#1890ff' }}
            />
          </Card>
        </Col>
        <Col span={6}>
          <Card loading={loading}>
            <Statistic
              title="我的小组"
              value={stats.groupCount}
              prefix={<TeamOutlined />}
              valueStyle={{ color: '#722ed1' }}
            />
          </Card>
        </Col>
        <Col span={6}>
          <Card loading={loading}>
            <Statistic
              title="待完成任务"
              value={stats.pendingTaskCount}
              prefix={<ClockCircleOutlined />}
              valueStyle={{ color: '#faad14' }}
            />
          </Card>
        </Col>
        <Col span={6}>
          <Card loading={loading}>
            <Statistic
              title="已完成"
              value={stats.completedTaskCount}
              prefix={<CheckCircleOutlined />}
              valueStyle={{ color: '#52c41a' }}
            />
          </Card>
        </Col>
      </Row>

      <Row gutter={16}>
        {/* 最近项目 */}
        <Col span={14}>
          <Card
            title="最近项目"
            extra={
              <Button type="link" onClick={() => navigate('/projects')}>
                查看全部
              </Button>
            }
          >
            <Table
              columns={projectColumns}
              dataSource={recentProjects}
              rowKey="id"
              pagination={false}
              size="small"
            />
          </Card>
        </Col>

        {/* 我的小组 */}
        <Col span={10}>
          <Card
            title="我的小组"
            extra={
              <Button type="link" onClick={() => navigate('/groups')}>
                查看全部
              </Button>
            }
          >
            <Table
              columns={groupColumns}
              dataSource={myGroups}
              rowKey="id"
              pagination={false}
              size="small"
            />
          </Card>
        </Col>
      </Row>

      {/* 快捷入口 */}
      <Row gutter={16} style={{ marginTop: 24 }}>
        <Col span={24}>
          <Card title="快捷入口">
            <Space wrap>
              {isStudent && (
                <>
                  <Button icon={<ProjectOutlined />} onClick={() => navigate('/projects')}>
                    项目列表
                  </Button>
                  <Button icon={<TeamOutlined />} onClick={() => navigate('/groups')}>
                    小组管理
                  </Button>
                  <Button icon={<ClockCircleOutlined />} onClick={() => navigate('/progress')}>
                    进度提交
                  </Button>
                  <Button icon={<FileTextOutlined />} onClick={() => navigate('/documents')}>
                    文档管理
                  </Button>
                  <Button icon={<TrophyOutlined />} onClick={() => navigate('/defense')}>
                    我的答辩
                  </Button>
                </>
              )}
              {isTeacher && (
                <>
                  <Button icon={<FileTextOutlined />} onClick={() => navigate('/progress')}>
                    审核进度
                  </Button>
                  <Button icon={<TrophyOutlined />} onClick={() => navigate('/scores')}>
                    评分管理
                  </Button>
                  <Button icon={<ProjectOutlined />} onClick={() => navigate('/defense')}>
                    答辩安排
                  </Button>
                  <Button icon={<ClockCircleOutlined />} onClick={() => navigate('/workload')}>
                    工作量审核
                  </Button>
                </>
              )}
              {isAdmin && (
                <>
                  <Button icon={<TeamOutlined />} onClick={() => navigate('/admin/classes')}>
                    班级管理
                  </Button>
                  <Button icon={<FileTextOutlined />} onClick={() => navigate('/admin/announcements')}>
                    公告管理
                  </Button>
                  <Button icon={<ProjectOutlined />} onClick={() => navigate('/projects')}>
                    项目管理
                  </Button>
                </>
              )}
            </Space>
          </Card>
        </Col>
      </Row>
    </div>
  )
}
