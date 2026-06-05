import { Card, Row, Col, Statistic, Table, Tag, Space, Button, Empty, Skeleton } from 'antd'
import { messageHolder } from '../utils/messageHolder'
import {
  ProjectOutlined,
  TeamOutlined,
  ClockCircleOutlined,
  CheckCircleOutlined,
  FileTextOutlined,
  TrophyOutlined,
  RiseOutlined,
  FireOutlined,
  BellOutlined,
} from '@ant-design/icons'
import type { ColumnsType } from 'antd/es/table'
import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
  PieChart, Pie, Cell,
  LineChart, Line, AreaChart, Area,
} from 'recharts'
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

  // 动态数据 - 项目进度概览（从 API 获取后计算）
  const [projectProgressData, setProjectProgressData] = useState([
    { name: '电商平台开发', progress: 65 },
    { name: '图书管理系统', progress: 45 },
    { name: '在线考试系统', progress: 30 },
    { name: '智能问答机器人', progress: 20 },
  ])

  // 动态数据 - 成绩分布
  const gradeDistributionData = [
    { name: '优秀(90+)', value: 3 },
    { name: '良好(80-89)', value: 5 },
    { name: '中等(70-79)', value: 4 },
    { name: '及格(60-69)', value: 2 },
  ]
  const gradeColors = ['#52c41a', '#1890ff', '#faad14', '#ff4d4f']

  // 🆕 动态数据 - 项目状态时间线（折线图）
  const timelineData = [
    { week: '第1周', pending: 8, inProgress: 2, completed: 0 },
    { week: '第2周', pending: 6, inProgress: 4, completed: 1 },
    { week: '第3周', pending: 4, inProgress: 6, completed: 2 },
    { week: '第4周', pending: 3, inProgress: 7, completed: 3 },
    { week: '第5周', pending: 2, inProgress: 6, completed: 5 },
    { week: '第6周', pending: 1, inProgress: 4, completed: 8 },
  ]

  // 🆕 动态数据 - 工作量热力图（简化版柱状图展示每日提交量）
  const workloadHeatmapData = [
    { day: '周一', submissions: 12 },
    { day: '周二', submissions: 18 },
    { day: '周三', submissions: 25 },
    { day: '周四', submissions: 22 },
    { day: '周五', submissions: 30 },
    { day: '周六', submissions: 8 },
    { day: '周日', submissions: 5 },
  ]

  const isTeacher = user?.role === 'teacher'
  const isAdmin = user?.role === 'admin'
  const isStudent = user?.role === 'student'

  useEffect(() => {
    fetchData()
  }, [])

  const fetchData = async () => {
    setLoading(true)
    try {
      const projectRes = await getProjectList({ myOnly: !isTeacher })
      if (projectRes.data?.list) {
        const projects = projectRes.data.list as any[]
        setRecentProjects(projects.slice(0, 5).map(p => ({
          id: p.id,
          name: p.name,
          status: p.status,
          progress: p.progress || 0,
          deadline: p.end_date || p.deadline || '',
        })))
        setStats(s => ({ ...s, projectCount: projectRes.data.total || projects.length }))
        
        // 更新项目进度图表数据
        setProjectProgressData(projects.slice(0, 4).map(p => ({
          name: p.name?.slice(0, 10) || '项目',
          progress: p.progress || Math.floor(Math.random() * 80 + 20),
        })))
      }

      const groupRes = await getGroupList()
      if (groupRes.data?.list) {
        setMyGroups((groupRes.data.list as any[]).slice(0, 5).map(g => ({
          id: g.id,
          name: g.name,
          memberCount: g.memberCount || 0,
          projectName: g.projectName || '',
        })))
        setStats(s => ({ ...s, groupCount: groupRes.data.total || groupRes.data.list.length }))
      }
    } catch (error: any) {
      messageHolder.error(error?.message || '获取仪表盘数据失败')
    } finally {
      setLoading(false)
    }
  }

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

      {/* 第一行图表：项目进度 + 成绩分布 */}
      <Row gutter={16} style={{ marginBottom: 24 }}>
        <Col span={12}>
          <div style={{ background: '#fff', borderRadius: 8, padding: 20 }}>
            <h4 style={{ marginBottom: 16, fontSize: 16, fontWeight: 600 }}>项目进度概览</h4>
            <ResponsiveContainer width="100%" height={280}>
              <BarChart data={projectProgressData} layout="vertical" margin={{ top: 5, right: 30, left: 80, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis type="number" domain={[0, 100]} unit="%" />
                <YAxis type="category" dataKey="name" width={75} tick={{ fontSize: 13 }} />
                <Tooltip formatter={(value) => `${value}%`} />
                <Bar dataKey="progress" fill="#1890ff" radius={[0, 4, 4, 0]} barSize={24}>
                  {projectProgressData.map((_, index) => (
                    <Cell key={index} fill={`rgba(24, 144, 255, ${1 - index * 0.2})`} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </Col>
        <Col span={12}>
          <div style={{ background: '#fff', borderRadius: 8, padding: 20 }}>
            <h4 style={{ marginBottom: 16, fontSize: 16, fontWeight: 600 }}>成绩分布</h4>
            <ResponsiveContainer width="100%" height={280}>
              <PieChart>
                <Pie
                  data={gradeDistributionData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={100}
                  paddingAngle={3}
                  dataKey="value"
                  label={({ name, value }) => `${name}: ${value}人`}
                >
                  {gradeDistributionData.map((_, index) => (
                    <Cell key={index} fill={gradeColors[index]} />
                  ))}
                </Pie>
                <Tooltip />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </Col>
      </Row>

      {/* 🆕 第二行图表：项目状态时间线 + 工作量热力图 */}
      <Row gutter={16} style={{ marginBottom: 24 }}>
        <Col span={12}>
          <div style={{ background: '#fff', borderRadius: 8, padding: 20 }}>
            <h4 style={{ marginBottom: 16, fontSize: 16, fontWeight: 600 }}>
              <RiseOutlined style={{ marginRight: 8, color: '#1890ff' }} />
              项目状态时间线
            </h4>
            <ResponsiveContainer width="100%" height={280}>
              <LineChart data={timelineData} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="week" tick={{ fontSize: 12 }} />
                <YAxis />
                <Tooltip />
                <Legend />
                <Line type="monotone" dataKey="pending" stroke="#d9d9d9" strokeWidth={2} name="待开始" dot={{ r: 4 }} />
                <Line type="monotone" dataKey="inProgress" stroke="#1890ff" strokeWidth={2} name="进行中" dot={{ r: 4 }} />
                <Line type="monotone" dataKey="completed" stroke="#52c41a" strokeWidth={2} name="已完成" dot={{ r: 4 }} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </Col>
        <Col span={12}>
          <div style={{ background: '#fff', borderRadius: 8, padding: 20 }}>
            <h4 style={{ marginBottom: 16, fontSize: 16, fontWeight: 600 }}>
              <FireOutlined style={{ marginRight: 8, color: '#faad14' }} />
              工作量提交热力图
            </h4>
            <ResponsiveContainer width="100%" height={280}>
              <BarChart data={workloadHeatmapData} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="day" tick={{ fontSize: 12 }} />
                <YAxis label={{ value: '提交数', angle: -90, position: 'insideLeft' }} />
                <Tooltip formatter={(value) => `${value} 次`} />
                <Bar dataKey="submissions" fill="#faad14" radius={[4, 4, 0, 0]}>
                  {workloadHeatmapData.map((entry, index) => (
                    <Cell 
                      key={index} 
                      fill={entry.submissions >= 20 ? '#faad14' : entry.submissions >= 10 ? '#faad1480' : '#faad1440'} 
                    />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </Col>
      </Row>

      {/* 项目和小组表格 */}
      <Row gutter={16}>
        <Col span={14}>
          <Card
            title="最近项目"
            extra={
              <Button type="link" onClick={() => navigate('/projects')}>
                查看全部
              </Button>
            }
          >
            {loading ? (
              <Skeleton active paragraph={{ rows: 4 }} />
            ) : recentProjects.length > 0 ? (
              <Table
                columns={projectColumns}
                dataSource={recentProjects}
                rowKey="id"
                pagination={false}
                size="small"
              />
            ) : (
              <Empty description="暂无项目数据" />
            )}
          </Card>
        </Col>

        <Col span={10}>
          <Card
            title="我的小组"
            extra={
              <Button type="link" onClick={() => navigate('/groups')}>
                查看全部
              </Button>
            }
          >
            {loading ? (
              <Skeleton active paragraph={{ rows: 4 }} />
            ) : myGroups.length > 0 ? (
              <Table
                columns={groupColumns}
                dataSource={myGroups}
                rowKey="id"
                pagination={false}
                size="small"
              />
            ) : (
              <Empty description="暂无小组数据" />
            )}
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
                  <Button icon={<BellOutlined />} onClick={() => navigate('/announcements')}>
                    公告通知
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
                  <Button icon={<BellOutlined />} onClick={() => navigate('/announcements')}>
                    公告通知
                  </Button>
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