import { Navigate, type RouteObject, Outlet } from 'react-router-dom'
import AuthGuard from '../components/common/AuthGuard'
import MainLayout from '../components/layout/MainLayout'
import Login from '../pages/Login'
import Dashboard from '../pages/Dashboard'
import ProjectList from '../pages/Project/List'
import ProjectDetail from '../pages/Project/Detail'
import GroupList from '../pages/Group/List'
import GroupDetail from '../pages/Group/Detail'
import ProgressList from '../pages/Progress/List'
import DocumentList from '../pages/Document/List'
import ScoreList from '../pages/Score/List'
import DefenseList from '../pages/Defense/List'
import WorkloadList from '../pages/Workload/List'
import Profile from '../pages/Profile'
import ClassManagement from '../pages/Admin/ClassManagement'
import AnnouncementManagement from '../pages/Admin/AnnouncementManagement'

const routes: RouteObject[] = [
  {
    path: '/login',
    element: <Login />,
  },
  {
    path: '/',
    element: (
      <AuthGuard>
        <Outlet />
      </AuthGuard>
    ),
    children: [
      {
        path: '',
        element: <MainLayout />,
        children: [
          {
            index: true,
            element: <Navigate to="/dashboard" replace />,
          },
          {
            path: 'dashboard',
            element: <Dashboard />,
          },
          {
            path: 'projects',
            children: [
              {
                index: true,
                element: <ProjectList />,
              },
              {
                path: ':id',
                element: <ProjectDetail />,
              },
            ],
          },
          {
            path: 'groups',
            children: [
              {
                index: true,
                element: <GroupList />,
              },
              {
                path: ':id',
                element: <GroupDetail />,
              },
            ],
          },
          {
            path: 'progress',
            element: <ProgressList />,
          },
          {
            path: 'documents',
            element: <DocumentList />,
          },
          {
            path: 'scores',
            element: <ScoreList />,
          },
          {
            path: 'defense',
            element: <DefenseList />,
          },
          {
            path: 'workload',
            element: <WorkloadList />,
          },
          {
            path: 'profile',
            element: <Profile />,
          },
          // 管理员页面
          {
            path: 'admin',
            children: [
              {
                path: 'classes',
                element: <ClassManagement />,
              },
              {
                path: 'announcements',
                element: <AnnouncementManagement />,
              },
            ],
          },
        ],
      },
    ],
  },
]

export default routes
