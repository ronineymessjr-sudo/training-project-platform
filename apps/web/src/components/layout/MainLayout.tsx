import { Outlet } from 'react-router-dom'
import { Layout, Menu, Avatar, Dropdown, Space, Badge } from 'antd'
import {
  DashboardOutlined,
  ProjectOutlined,
  TeamOutlined,
  FileTextOutlined,
  CheckCircleOutlined,
  TrophyOutlined,
  ClockCircleOutlined,
  UserOutlined,
  LogoutOutlined,
  SettingOutlined,
  BookOutlined,
  BellOutlined,
  PieChartOutlined,
} from '@ant-design/icons'
import { useNavigate, useLocation } from 'react-router-dom'
import { useAuthStore } from '../../stores/auth.store'
import type { MenuProps } from 'antd'

const { Header, Sider, Content } = Layout

// 角色菜单配置
const roleMenus: Record<string, MenuProps['items']> = {
  student: [
    { key: '/dashboard', icon: <DashboardOutlined />, label: '仪表盘' },
    { key: '/projects', icon: <ProjectOutlined />, label: '项目管理' },
    { key: '/groups', icon: <TeamOutlined />, label: '我的分组' },
    { key: '/progress', icon: <CheckCircleOutlined />, label: '进度管理' },
    { key: '/documents', icon: <FileTextOutlined />, label: '文档管理' },
    { key: '/scores', icon: <TrophyOutlined />, label: '成绩查询' },
    { key: '/workload', icon: <ClockCircleOutlined />, label: '工作量' },
  ],
  teacher: [
    { key: '/dashboard', icon: <DashboardOutlined />, label: '仪表盘' },
    { key: '/projects', icon: <ProjectOutlined />, label: '项目管理' },
    { key: '/groups', icon: <TeamOutlined />, label: '分组管理' },
    { key: '/scores', icon: <TrophyOutlined />, label: '评分管理' },
    { key: '/defense', icon: <CheckCircleOutlined />, label: '答辩管理' },
    { key: '/workload', icon: <ClockCircleOutlined />, label: '工作量管理' },
    { key: '/documents', icon: <FileTextOutlined />, label: '文档管理' },
  ],
  admin: [
    { key: '/dashboard', icon: <DashboardOutlined />, label: '仪表盘' },
    { key: '/admin/classes', icon: <BookOutlined />, label: '班级管理' },
    { key: '/admin/announcements', icon: <BellOutlined />, label: '公告管理' },
    { key: '/projects', icon: <ProjectOutlined />, label: '项目管理' },
    { key: '/groups', icon: <TeamOutlined />, label: '分组管理' },
    { key: '/scores', icon: <TrophyOutlined />, label: '评分管理' },
    { key: '/defense', icon: <CheckCircleOutlined />, label: '答辩管理' },
    { key: '/workload', icon: <ClockCircleOutlined />, label: '工作量管理' },
    { key: '/documents', icon: <FileTextOutlined />, label: '文档管理' },
  ],
}

// 扁平化所有子路径用于选中高亮
const parentKey = (path: string): string => {
  if (path.startsWith('/admin/')) return '/admin/' + path.split('/')[2]
  const parts = path.split('/').filter(Boolean)
  return '/' + (parts.length > 0 ? parts[0] : 'dashboard')
}

export default function MainLayout() {
  const navigate = useNavigate()
  const location = useLocation()
  const { user, logout } = useAuthStore()

  const role = user?.roles?.[0] || 'student'
  const menuItems = roleMenus[role] || roleMenus.student

  const userMenuItems: MenuProps['items'] = [
    {
      key: 'profile',
      icon: <UserOutlined />,
      label: '个人中心',
      onClick: () => navigate('/profile'),
    },
    {
      key: 'settings',
      icon: <SettingOutlined />,
      label: '设置',
    },
    {
      type: 'divider',
    },
    {
      key: 'logout',
      icon: <LogoutOutlined />,
      label: '退出登录',
      onClick: logout,
    },
  ]

  return (
    <Layout style={{ minHeight: '100vh' }}>
      <Sider
        breakpoint="lg"
        collapsedWidth="0"
        style={{
          background: '#fff',
          borderRight: '1px solid #f0f0f0',
        }}
      >
        <div
          style={{
            height: 64,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            borderBottom: '1px solid #f0f0f0',
          }}
        >
          <h2 style={{ margin: 0, color: '#1890ff' }}>实训管理平台</h2>
        </div>
        <Menu
          mode="inline"
          selectedKeys={[parentKey(location.pathname)]}
          items={menuItems}
          onClick={({ key }) => navigate(key)}
          style={{ borderRight: 0, marginTop: 8 }}
        />
      </Sider>
      <Layout>
        <Header
          style={{
            background: '#fff',
            padding: '0 24px',
            display: 'flex',
            justifyContent: 'flex-end',
            alignItems: 'center',
            borderBottom: '1px solid #f0f0f0',
          }}
        >
          <Space size="large">
            <Dropdown menu={{ items: userMenuItems }} placement="bottomRight">
              <Space style={{ cursor: 'pointer' }}>
                <Avatar icon={<UserOutlined />} src={user?.avatarUrl} />
                <span>{user?.realName || user?.username}</span>
                <span style={{ fontSize: 12, color: '#999' }}>({role === 'admin' ? '管理员' : role === 'teacher' ? '教师' : '学生'})</span>
              </Space>
            </Dropdown>
          </Space>
        </Header>
        <Content style={{ padding: 24, background: '#f5f5f5', minHeight: 'calc(100vh - 64px)' }}>
          <Outlet />
        </Content>
      </Layout>
    </Layout>
  )
}