import { useRoutes } from 'react-router-dom'
import { useEffect } from 'react'
import { Spin } from 'antd'
import { useAuthStore } from './stores/auth.store'
import routes from './router'
import MessageHolderInit from './components/common/MessageHolderInit'
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
        <Spin size="large">
          <div style={{ padding: 50 }} />
        </Spin>
      </div>
    )
  }

  return (
    <>
      <MessageHolderInit />
      {element}
    </>
  )
}

export default App