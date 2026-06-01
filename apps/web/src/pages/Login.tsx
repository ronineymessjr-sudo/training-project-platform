import { useState } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { Form, Input, Button, Card, message } from 'antd'
import { MailOutlined, LockOutlined } from '@ant-design/icons'
import { useAuthStore } from '../stores/auth.store'
import { handleAuthError } from '../utils/supabase-helpers'

export default function Login() {
  const navigate = useNavigate()
  const location = useLocation()
  const { login } = useAuthStore()
  const [loading, setLoading] = useState(false)

  const from = (location.state as any)?.from?.pathname || '/dashboard'

  const onFinish = async (values: { email: string; password: string }) => {
    setLoading(true)
    try {
      await login(values.email, values.password)
      message.success('登录成功')
      navigate(from, { replace: true })
    } catch (error: any) {
      message.error(handleAuthError(error))
    } finally {
      setLoading(false)
    }
  }

  return (
    <div
      style={{
        minHeight: '100vh',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
      }}
    >
      <Card
        style={{
          width: 400,
          borderRadius: 8,
          boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)',
        }}
        styles={{ body: { padding: 40 } }}
      >
        <div style={{ textAlign: 'center', marginBottom: 32 }}>
          <h1 style={{ fontSize: 28, marginBottom: 8, color: '#333' }}>
            实训项目全过程管理平台
          </h1>
          <p style={{ color: '#666' }}>Training Project Management Platform</p>
        </div>

        <Form
          name="login"
          onFinish={onFinish}
          autoComplete="off"
          size="large"
        >
          <Form.Item
            name="email"
            rules={[
              { required: true, message: '请输入邮箱' },
              { type: 'email', message: '请输入有效的邮箱地址' },
            ]}
          >
            <Input
              prefix={<MailOutlined style={{ color: '#999' }} />}
              placeholder="邮箱地址"
            />
          </Form.Item>

          <Form.Item
            name="password"
            rules={[{ required: true, message: '请输入密码' }]}
          >
            <Input.Password
              prefix={<LockOutlined style={{ color: '#999' }} />}
              placeholder="密码"
            />
          </Form.Item>

          <Form.Item style={{ marginBottom: 16 }}>
            <Button
              type="primary"
              htmlType="submit"
              block
              loading={loading}
            >
              登 录
            </Button>
          </Form.Item>
        </Form>

        <div style={{ textAlign: 'center', color: '#999', fontSize: 12 }}>
          <p>默认账号: admin@training.com / password123</p>
        </div>
      </Card>
    </div>
  )
}
