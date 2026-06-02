import { useState } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { Form, Input, Button, message } from 'antd'
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
        background: 'linear-gradient(135deg, #1a1a2e 0%, #16213e 50%, #0f3460 100%)',
        position: 'relative',
        overflow: 'hidden',
      }}
    >
      {/* 装饰光斑 */}
      <div
        style={{
          position: 'absolute',
          top: '-10%',
          left: '-5%',
          width: 400,
          height: 400,
          borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(79, 172, 254, 0.15) 0%, transparent 70%)',
          pointerEvents: 'none',
        }}
      />
      <div
        style={{
          position: 'absolute',
          bottom: '-15%',
          right: '-10%',
          width: 500,
          height: 500,
          borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(0, 242, 254, 0.12) 0%, transparent 70%)',
          pointerEvents: 'none',
        }}
      />
      <div
        style={{
          position: 'absolute',
          top: '40%',
          right: '20%',
          width: 250,
          height: 250,
          borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(79, 172, 254, 0.08) 0%, transparent 70%)',
          pointerEvents: 'none',
        }}
      />
      <div
        style={{
          position: 'absolute',
          bottom: '20%',
          left: '15%',
          width: 300,
          height: 300,
          borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(0, 242, 254, 0.06) 0%, transparent 70%)',
          pointerEvents: 'none',
        }}
      />

      {/* 毛玻璃登录卡片 */}
      <div
        style={{
          width: 420,
          borderRadius: 16,
          background: 'rgba(255, 255, 255, 0.08)',
          backdropFilter: 'blur(20px)',
          WebkitBackdropFilter: 'blur(20px)',
          border: '1px solid rgba(255, 255, 255, 0.12)',
          boxShadow: '0 8px 32px rgba(0, 0, 0, 0.3)',
          padding: 40,
          position: 'relative',
          zIndex: 1,
        }}
      >
        {/* 标题区域 */}
        <div style={{ textAlign: 'center', marginBottom: 36 }}>
          <h1
            style={{
              fontSize: 28,
              fontWeight: 700,
              color: '#ffffff',
              marginBottom: 8,
              letterSpacing: 1,
            }}
          >
            实训项目全过程管理平台
          </h1>
          <p style={{ fontSize: 14, color: 'rgba(255, 255, 255, 0.5)', margin: 0 }}>
            Training Project Management Platform
          </p>
        </div>

        {/* 登录表单 */}
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
              prefix={<MailOutlined style={{ color: 'rgba(255, 255, 255, 0.4)' }} />}
              placeholder="邮箱地址"
              style={{
                borderRadius: 8,
                background: 'rgba(255, 255, 255, 0.06)',
                borderColor: 'rgba(255, 255, 255, 0.15)',
                color: '#fff',
              }}
            />
          </Form.Item>

          <Form.Item
            name="password"
            rules={[{ required: true, message: '请输入密码' }]}
          >
            <Input.Password
              prefix={<LockOutlined style={{ color: 'rgba(255, 255, 255, 0.4)' }} />}
              placeholder="密码"
              style={{
                borderRadius: 8,
                background: 'rgba(255, 255, 255, 0.06)',
                borderColor: 'rgba(255, 255, 255, 0.15)',
                color: '#fff',
              }}
            />
          </Form.Item>

          <Form.Item style={{ marginBottom: 16 }}>
            <Button
              type="primary"
              htmlType="submit"
              block
              loading={loading}
              style={{
                height: 44,
                borderRadius: 8,
                background: 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)',
                border: 'none',
                fontWeight: 600,
                fontSize: 16,
                color: '#fff',
                cursor: 'pointer',
                transition: 'transform 0.2s ease, box-shadow 0.2s ease',
                boxShadow: '0 4px 15px rgba(79, 172, 254, 0.3)',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = 'scale(1.02)'
                e.currentTarget.style.boxShadow = '0 6px 20px rgba(79, 172, 254, 0.45)'
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = 'scale(1)'
                e.currentTarget.style.boxShadow = '0 4px 15px rgba(79, 172, 254, 0.3)'
              }}
            >
              登 录
            </Button>
          </Form.Item>
        </Form>

        {/* 测试账号提示 */}
        <div
          style={{
            textAlign: 'center',
            fontSize: 12,
            lineHeight: 1.8,
            color: 'rgba(255, 255, 255, 0.5)',
          }}
        >
          <div
            style={{
              display: 'inline-block',
              background: 'rgba(255, 255, 255, 0.08)',
              borderRadius: 8,
              padding: '8px 16px',
            }}
          >
            <p style={{ margin: '0 0 2px 0', color: 'rgba(255, 255, 255, 0.6)' }}>
              测试账号
            </p>
            <p style={{ margin: 0 }}>
              管理员 admin@test.com / admin123456
            </p>
            <p style={{ margin: 0 }}>
              教师 teacher@test.com / teacher123456
            </p>
            <p style={{ margin: 0 }}>
              学生 student@test.com / student123456
            </p>
          </div>
        </div>
      </div>

      {/* 全局样式覆盖：让 antd 输入框在深色背景下适配 */}
      <style>{`
        .ant-input-affix-wrapper {
          border-radius: 8px !important;
          border: 1px solid rgba(255, 255, 255, 0.15) !important;
          background: rgba(255, 255, 255, 0.06) !important;
          transition: all 0.3s ease !important;
        }
        .ant-input-affix-wrapper:hover {
          border-color: rgba(79, 172, 254, 0.5) !important;
        }
        .ant-input-affix-wrapper-focused,
        .ant-input-affix-wrapper:focus {
          border-color: #4facfe !important;
          box-shadow: 0 0 0 3px rgba(79, 172, 254, 0.15) !important;
        }
        .ant-input-affix-wrapper .ant-input {
          background: transparent !important;
          color: #fff !important;
        }
        .ant-input-affix-wrapper .ant-input::placeholder {
          color: rgba(255, 255, 255, 0.35) !important;
        }
        .ant-input-suffix .anticon,
        .ant-input-prefix .anticon {
          color: rgba(255, 255, 255, 0.4) !important;
        }
        .ant-form-item-explain-error {
          color: #ff6b6b !important;
        }
        .ant-input-password .ant-input-suffix {
          color: rgba(255, 255, 255, 0.4) !important;
        }
        .ant-input-password .ant-input-suffix .anticon {
          color: rgba(255, 255, 255, 0.4) !important;
        }
      `}</style>
    </div>
  )
}
