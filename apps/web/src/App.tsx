import { useRoutes } from 'react-router-dom'
import { useEffect } from 'react'
import { Spin } from 'antd'
import { useAuthStore } from './stores/auth.store'
import routes from './router'
import './App.css'

function App() {
  const { checkAuth, isLoading } = useAuthStore()
  const element = useRoutes(routes)

  useEffect(() => {
    checkAuth()
  }, [checkAuth])

  if (isLoading) {
    return (
      <div style={{ 
        display: 'flex', 
        justifyContent: 'center', 
        alignItems: 'center', 
        height: '100vh' 
      }}>
        <Spin size="large" tip="加载中..." />
      </div>
    )
  }

  return element
}

export default App