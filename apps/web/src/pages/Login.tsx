import { useState, useRef, useEffect } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { Form, Input, Button } from 'antd'
import { MailOutlined, LockOutlined } from '@ant-design/icons'
import { useAuthStore } from '../stores/auth.store'
import { handleAuthError } from '../utils/supabase-helpers'
import { messageHolder } from '../utils/messageHolder'

const base = import.meta.env.BASE_URL

// ── CSS particles config ──
const PARTICLES = Array.from({ length: 28 }, (_, i) => ({
  id: i,
  size: 2 + (i % 5) * 2,
  x: ((i * 17) % 100),
  y: ((i * 13 + 40) % 100),
  delay: (i * 0.4) % 8,
  duration: 12 + (i % 6) * 3,
  opacity: 0.15 + (i % 4) * 0.08,
}))

// ── Floating 3D shapes ──
const SHAPES = [
  { type: 'cube', size: 60, x: 12, y: 18, delay: 0, duration: 25 },
  { type: 'pyramid', size: 45, x: 80, y: 12, delay: -4, duration: 30 },
  { type: 'ring', size: 80, x: 68, y: 65, delay: -10, duration: 22 },
  { type: 'diamond', size: 35, x: 22, y: 72, delay: -6, duration: 28 },
  { type: 'cube', size: 50, x: 88, y: 78, delay: -14, duration: 20 },
]

export default function Login() {
  const navigate = useNavigate()
  const location = useLocation()
  const { login } = useAuthStore()
  const [loading, setLoading] = useState(false)
  const formRef = useRef<HTMLDivElement>(null)
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 })
  const [ripples, setRipples] = useState<{ id: number; x: number; y: number }[]>([])
  const rippleId = useRef(0)

  const from = (location.state as any)?.from?.pathname || '/dashboard'

  useEffect(() => {
    const handleMouse = (e: MouseEvent) => {
      setMousePos({ x: e.clientX, y: e.clientY })
    }
    window.addEventListener('mousemove', handleMouse)
    return () => window.removeEventListener('mousemove', handleMouse)
  }, [])

  const onFinish = async (values: { email: string; password: string }) => {
    setLoading(true)
    try {
      await login(values.email, values.password)
      messageHolder.success('登录成功')
      navigate(from, { replace: true })
    } catch (error: any) {
      messageHolder.error(handleAuthError(error))
    } finally {
      setLoading(false)
    }
  }

  const handleRipple = (e: React.MouseEvent<HTMLElement>) => {
    const rect = e.currentTarget.getBoundingClientRect()
    const id = ++rippleId.current
    setRipples(prev => [...prev, { id, x: e.clientX - rect.left, y: e.clientY - rect.top }])
    setTimeout(() => setRipples(prev => prev.filter(r => r.id !== id)), 800)
  }

  return (
    <>
      <link
        href="https://fonts.googleapis.com/css2?family=Noto+Serif+SC:wght@600;700;900&family=Outfit:wght@300;400;500;600;700&display=swap"
        rel="stylesheet"
      />

      <div className="login-root">
        {/* ============================
               MOUSE FOLLOWER GLOW
            ============================ */}
        <div
          className="mouse-glow"
          style={{
            left: mousePos.x - 200,
            top: mousePos.y - 200,
          }}
        />

        {/* ============================
               LEFT: BRAND PANEL
            ============================ */}
        <div className="login-brand">
          {/* Background image */}
          <div
            className="brand-bg"
            style={{ backgroundImage: `url(${base}login-bg.jpg)` }}
          />

          {/* Grain overlay */}
          <div
            className="brand-grain"
            style={{ backgroundImage: `url(${base}noise-texture.jpg)` }}
          />

          {/* Animated gradient mesh overlay */}
          <div className="brand-mesh" />

          {/* 3D floating shapes */}
          {SHAPES.map((s) => (
            <div
              key={s.type + s.x}
              className={`shape-${s.type}`}
              style={{
                width: s.size,
                height: s.size,
                left: `${s.x}%`,
                top: `${s.y}%`,
                animationDuration: `${s.duration}s`,
                animationDelay: `${s.delay}s`,
              }}
            >
              <div className="shape-inner" />
            </div>
          ))}

          {/* CSS Particles */}
          {PARTICLES.map((p) => (
            <div
              key={p.id}
              className="particle"
              style={{
                width: p.size,
                height: p.size,
                left: `${p.x}%`,
                top: `${p.y}%`,
                animationDelay: `${p.delay}s`,
                animationDuration: `${p.duration}s`,
                opacity: p.opacity,
              }}
            />
          ))}

          {/* Content */}
          <div className="brand-content">
            <div className="brand-badge">
              <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
                <path d="M6 0L7.35 4.65L12 6L7.35 7.35L6 12L4.65 7.35L0 6L4.65 4.65L6 0Z" fill="currentColor" />
              </svg>
              教育管理平台
            </div>

            <h1 className="brand-title">
              <span className="title-line">
                <span className="char-char" style={{ '--i': 0 } as React.CSSProperties}>实</span>
                <span className="char-char" style={{ '--i': 1 } as React.CSSProperties}>训</span>
                <span className="char-char" style={{ '--i': 2 } as React.CSSProperties}>项</span>
                <span className="char-char" style={{ '--i': 3 } as React.CSSProperties}>目</span>
              </span>
              <span className="title-line">
                <span className="char-char" style={{ '--i': 4 } as React.CSSProperties}>全</span>
                <span className="char-char" style={{ '--i': 5 } as React.CSSProperties}>过</span>
                <span className="char-char" style={{ '--i': 6 } as React.CSSProperties}>程</span>
                <span className="char-char" style={{ '--i': 7 } as React.CSSProperties}>管</span>
                <span className="char-char" style={{ '--i': 8 } as React.CSSProperties}>理</span>
              </span>
            </h1>

            <p className="brand-desc">
              从立项到归档，全流程数字化管理，
              <br />
              让实训教学更高效、更透明。
            </p>

            <div className="brand-tags">
              <span>班级管理</span>
              <span>项目跟踪</span>
              <span>评分答辩</span>
              <span>文档归档</span>
            </div>
          </div>
        </div>

        {/* ============================
               RIGHT: FORM PANEL
            ============================ */}
        <div className="login-form-area">
          <div className="form-bg-mesh" />

          <div className="login-card" ref={formRef}>
            <div className="card-header">
              <h2>
                <span className="wlcm-char" style={{ '--i': 0 } as React.CSSProperties}>欢</span>
                <span className="wlcm-char" style={{ '--i': 1 } as React.CSSProperties}>迎</span>
                <span className="wlcm-char" style={{ '--i': 2 } as React.CSSProperties}>回</span>
                <span className="wlcm-char" style={{ '--i': 3 } as React.CSSProperties}>来</span>
              </h2>
              <p>请登录您的账号以继续</p>
            </div>

            <Form
              name="login"
              onFinish={onFinish}
              autoComplete="off"
              size="large"
              className="login-ant-form"
            >
              <Form.Item
                name="email"
                rules={[
                  { required: true, message: '请输入邮箱' },
                  { type: 'email', message: '请输入有效的邮箱地址' },
                ]}
              >
                <Input
                  prefix={<MailOutlined />}
                  placeholder="邮箱地址"
                />
              </Form.Item>

              <Form.Item
                name="password"
                rules={[{ required: true, message: '请输入密码' }]}
              >
                <Input.Password
                  prefix={<LockOutlined />}
                  placeholder="密码"
                />
              </Form.Item>

              <Form.Item style={{ marginBottom: 0 }}>
                <Button
                  type="primary"
                  htmlType="submit"
                  block
                  loading={loading}
                  className="login-btn"
                  onMouseDown={handleRipple}
                >
                  登 录
                  {ripples.map(r => (
                    <span
                      key={r.id}
                      className="btn-ripple"
                      style={{ left: r.x, top: r.y }}
                    />
                  ))}
                </Button>
              </Form.Item>
            </Form>

            <div className="test-accounts">
              <div className="ta-label">测试账号</div>
              <div className="ta-row" style={{ '--i': 0 } as React.CSSProperties}>
                <span className="ta-role admin">管理员</span>
                <span className="ta-cred">admin@test.com</span>
                <span className="ta-sep">/</span>
                <span className="ta-cred">admin123456</span>
              </div>
              <div className="ta-row" style={{ '--i': 1 } as React.CSSProperties}>
                <span className="ta-role teacher">教师</span>
                <span className="ta-cred">teacher@test.com</span>
                <span className="ta-sep">/</span>
                <span className="ta-cred">teacher123456</span>
              </div>
              <div className="ta-row" style={{ '--i': 2 } as React.CSSProperties}>
                <span className="ta-role student">学生</span>
                <span className="ta-cred">student@test.com</span>
                <span className="ta-sep">/</span>
                <span className="ta-cred">student123456</span>
              </div>
            </div>
          </div>

          <div className="login-copyright">© 2026 实训项目全过程管理平台</div>
        </div>
      </div>

      <style>{`
        @keyframes bgZoom {
          0%, 100% { transform: scale(1); }
          50% { transform: scale(1.08); }
        }
        @keyframes meshShift {
          0% { background-position: 0% 50%; }
          25% { background-position: 100% 0%; }
          50% { background-position: 50% 100%; }
          75% { background-position: 0% 0%; }
          100% { background-position: 0% 50%; }
        }
        @keyframes particleDrift {
          0%   { transform: translate(0, 0) scale(1); opacity: 0; }
          10%  { opacity: 1; }
          90%  { opacity: 0.6; }
          100% { transform: translate(var(--dx,40px), var(--dy,-60px)) scale(0); opacity: 0; }
        }
        @keyframes shapeFloat {
          0%, 100% { transform: translateY(0) rotate(0deg) scale(1); }
          25% { transform: translateY(-30px) rotate(8deg) scale(1.05); }
          50% { transform: translateY(10px) rotate(-5deg) scale(0.95); }
          75% { transform: translateY(-15px) rotate(3deg) scale(1.02); }
        }
        @keyframes shapeFloat2 {
          0%, 100% { transform: translateY(0) rotate(0deg) scale(1) translateZ(0); }
          33% { transform: translateY(-40px) rotate(12deg) scale(1.08) translateZ(30px); }
          66% { transform: translateY(20px) rotate(-8deg) scale(0.92) translateZ(-20px); }
        }
        @keyframes cubeSpin {
          0% { transform: rotateX(0) rotateY(0) rotateZ(0); }
          100% { transform: rotateX(360deg) rotateY(180deg) rotateZ(360deg); }
        }
        @keyframes ringPulse {
          0%, 100% { transform: scale(1) rotate(0deg); border-width: 1px; opacity: 0.25; }
          50% { transform: scale(1.15) rotate(30deg); border-width: 2px; opacity: 0.6; }
        }
        @keyframes diamondGlow {
          0%, 100% { transform: rotate(0deg) scale(1); filter: brightness(1); }
          50% { transform: rotate(15deg) scale(1.1); filter: brightness(1.2); }
        }
        @keyframes charReveal {
          0% { opacity: 0; transform: translateY(30px) rotateX(15deg); clip-path: inset(0 0 100% 0); }
          60% { transform: translateY(-5px) rotateX(-3deg); clip-path: inset(0 0 0 0); }
          100% { opacity: 1; transform: translateY(0) rotateX(0deg); clip-path: inset(0 0 0 0); }
        }
        @keyframes wlcmReveal {
          0% { opacity: 0; transform: translateY(24px) scale(0.9); filter: blur(6px); }
          100% { opacity: 1; transform: translateY(0) scale(1); filter: blur(0); }
        }
        @keyframes cardEntrance {
          0% { opacity: 0; transform: translateY(40px) scale(0.92); filter: blur(8px); }
          100% { opacity: 1; transform: translateY(0) scale(1); filter: blur(0); }
        }
        @keyframes formEntrance {
          0% { opacity: 0; transform: translateX(30px); }
          100% { opacity: 1; transform: translateX(0); }
        }
        @keyframes badgeShimmer {
          0% { background-position: -200% center; }
          100% { background-position: 200% center; }
        }
        @keyframes grainShift {
          0%, 100% { transform: translate(0, 0); }
          20% { transform: translate(-5%, -5%); }
          40% { transform: translate(3%, 2%); }
          60% { transform: translate(-2%, 5%); }
          80% { transform: translate(4%, -3%); }
        }
        @keyframes meshGradient {
          0% { background-position: 0% 50%; }
          50% { background-position: 100% 50%; }
          100% { background-position: 0% 50%; }
        }
        @keyframes glowPulse {
          0%, 100% { opacity: 0.3; }
          50% { opacity: 0.7; }
        }
        @keyframes tagEntrance {
          0% { opacity: 0; transform: translateY(20px) scale(0.9); }
          100% { opacity: 1; transform: translateY(0) scale(1); }
        }
        @keyframes taRowSlide {
          0% { opacity: 0; transform: translateX(-16px); }
          100% { opacity: 1; transform: translateX(0); }
        }
        @keyframes descFade {
          0% { opacity: 0; transform: translateY(16px); }
          100% { opacity: 1; transform: translateY(0); }
        }
        @keyframes btnRipple {
          0% { width: 0; height: 0; opacity: 0.6; }
          100% { width: 400px; height: 400px; opacity: 0; }
        }
        @keyframes gradientShift {
          0% { background-position: 0% 50%; }
          50% { background-position: 100% 50%; }
          100% { background-position: 0% 50%; }
        }

        .login-root * { margin: 0; padding: 0; box-sizing: border-box; }

        .login-root {
          display: flex;
          min-height: 100vh;
          font-family: 'Outfit', 'Noto Serif SC', -apple-system, BlinkMacSystemFont, sans-serif;
          position: relative;
          overflow: hidden;
        }

        /* ── MOUSE GLOW ── */
        .mouse-glow {
          position: fixed;
          width: 400px;
          height: 400px;
          border-radius: 50%;
          background: radial-gradient(circle, rgba(201, 162, 62, 0.04) 0%, transparent 70%);
          pointer-events: none;
          z-index: 999;
          transition: left 0.15s ease-out, top 0.15s ease-out;
        }

        /* ── LEFT BRAND ── */
        .login-brand {
          flex: 1.25;
          position: relative;
          display: flex;
          align-items: center;
          justify-content: center;
          overflow: hidden;
          background: #0a1322;
        }

        .brand-bg {
          position: absolute;
          inset: -20px;
          background-size: cover;
          background-position: center;
          animation: bgZoom 30s ease-in-out infinite;
          opacity: 0.55;
          filter: saturate(0.8) contrast(1.1);
        }

        /* 暗角遮罩：中心保持暗色确保文字可读，边缘透出背景图光效 */
        .brand-bg::after {
          content: '';
          position: absolute;
          inset: 0;
          background:
            radial-gradient(ellipse at 50% 50%, rgba(10, 19, 34, 0.85) 0%, rgba(10, 19, 34, 0.4) 50%, rgba(10, 19, 34, 0.15) 100%);
          pointer-events: none;
        }

        .brand-grain {
          position: absolute;
          inset: 0;
          background-size: 200px 200px;
          opacity: 0.04;
          mix-blend-mode: overlay;
          animation: grainShift 12s ease-in-out infinite;
          pointer-events: none;
        }

        .brand-mesh {
          position: absolute;
          inset: 0;
          background:
            radial-gradient(ellipse at 15% 45%, rgba(201, 162, 62, 0.08) 0%, transparent 45%),
            radial-gradient(ellipse at 85% 25%, rgba(79, 172, 254, 0.06) 0%, transparent 40%),
            radial-gradient(ellipse at 60% 85%, rgba(0, 242, 254, 0.04) 0%, transparent 40%),
            radial-gradient(ellipse at 50% 50%, rgba(10, 19, 34, 0.6) 0%, transparent 70%);
          background-size: 200% 200%;
          animation: meshShift 18s ease-in-out infinite;
          pointer-events: none;
        }

        /* ── 3D Shapes ── */
        .shape-cube,
        .shape-pyramid,
        .shape-ring,
        .shape-diamond {
          position: absolute;
          perspective: 800px;
          pointer-events: none;
          z-index: 0;
        }

        .shape-inner {
          width: 100%;
          height: 100%;
          border-radius: 8px;
          background: linear-gradient(135deg, rgba(201,162,62,0.08), rgba(201,162,62,0.02));
          border: 1px solid rgba(201,162,62,0.12);
          backdrop-filter: blur(2px);
        }

        .shape-cube {
          animation: shapeFloat 25s ease-in-out infinite;
        }
        .shape-cube .shape-inner {
          border-radius: 4px;
          animation: cubeSpin 20s linear infinite;
          transform-style: preserve-3d;
        }

        .shape-pyramid {
          animation: shapeFloat2 30s ease-in-out infinite;
        }
        .shape-pyramid .shape-inner {
          clip-path: polygon(50% 0%, 0% 100%, 100% 100%);
          border-radius: 0;
          background: linear-gradient(135deg, rgba(201,162,62,0.06), rgba(79,172,254,0.06));
        }

        .shape-ring {
          animation: ringPulse 22s ease-in-out infinite;
        }
        .shape-ring .shape-inner {
          border-radius: 50%;
          border: 1px solid rgba(201,162,62,0.15);
          background: transparent;
          backdrop-filter: none;
        }

        .shape-diamond {
          animation: diamondGlow 28s ease-in-out infinite;
        }
        .shape-diamond .shape-inner {
          clip-path: polygon(50% 0%, 100% 50%, 50% 100%, 0% 50%);
          border-radius: 0;
          background: linear-gradient(135deg, rgba(79,172,254,0.06), rgba(201,162,62,0.06));
        }

        /* ── Particles ── */
        .particle {
          position: absolute;
          border-radius: 50%;
          background: rgba(201, 162, 62, 0.6);
          pointer-events: none;
          z-index: 0;
          animation: particleDrift var(--d, 18s) ease-in-out infinite;
        }
        .particle:nth-child(5n+1) { --dx: 45px; --dy: -35px; }
        .particle:nth-child(5n+2) { --dx: -38px; --dy: 42px; }
        .particle:nth-child(5n+3) { --dx: 50px; --dy: 50px; }
        .particle:nth-child(5n+4) { --dx: -55px; --dy: -45px; }
        .particle:nth-child(5n) { --dx: 30px; --dy: -60px; }

        /* ── Brand Content ── */
        .brand-content {
          position: relative;
          z-index: 2;
          max-width: 480px;
          padding: 20px;
        }

        .brand-badge {
          display: inline-flex;
          align-items: center;
          gap: 6px;
          padding: 7px 16px;
          border-radius: 999px;
          background: rgba(201, 162, 62, 0.13);
          border: 1px solid rgba(201, 162, 62, 0.22);
          color: #d4a853;
          font-size: 12px;
          font-weight: 500;
          letter-spacing: 0.4px;
          margin-bottom: 36px;
          position: relative;
          overflow: hidden;
          animation: cardEntrance 0.8s ease-out both;
        }
        .brand-badge::after {
          content: '';
          position: absolute;
          inset: 0;
          background: linear-gradient(90deg, transparent, rgba(201,162,62,0.2), transparent);
          background-size: 200% 100%;
          animation: badgeShimmer 3s ease-in-out infinite;
        }

        .brand-title {
          font-family: 'Noto Serif SC', serif;
          font-size: 52px;
          font-weight: 900;
          line-height: 1.2;
          color: #ffffff;
          letter-spacing: 3px;
          margin-bottom: 22px;
        }
        .title-line {
          display: block;
          overflow: hidden;
          padding: 4px 0;
        }
        .char-char {
          display: inline-block;
          animation: charReveal 0.9s cubic-bezier(0.33, 1, 0.68, 1) both;
          animation-delay: calc(0.15s + var(--i, 0) * 0.07s);
          transform-origin: bottom center;
        }

        .brand-desc {
          font-size: 15px;
          line-height: 1.8;
          color: rgba(255, 255, 255, 0.5);
          margin-bottom: 42px;
          max-width: 360px;
          animation: descFade 0.8s ease-out 1.2s both;
        }

        .brand-tags {
          display: flex;
          flex-wrap: wrap;
          gap: 10px;
        }
        .brand-tags span {
          padding: 6px 18px;
          border-radius: 999px;
          background: rgba(255, 255, 255, 0.05);
          border: 1px solid rgba(255, 255, 255, 0.08);
          color: rgba(255, 255, 255, 0.65);
          font-size: 13px;
          font-weight: 400;
          transition: all 0.4s cubic-bezier(0.33, 1, 0.68, 1);
          cursor: default;
          animation: tagEntrance 0.5s ease-out both;
        }
        .brand-tags span:nth-child(1) { animation-delay: 1.4s; }
        .brand-tags span:nth-child(2) { animation-delay: 1.55s; }
        .brand-tags span:nth-child(3) { animation-delay: 1.7s; }
        .brand-tags span:nth-child(4) { animation-delay: 1.85s; }

        .brand-tags span:hover {
          background: rgba(201, 162, 62, 0.12);
          border-color: rgba(201, 162, 62, 0.28);
          color: #d4a853;
          transform: translateY(-2px) scale(1.04);
        }

        /* ── RIGHT FORM ── */
        .login-form-area {
          flex: 0.8;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          background: #f7f5f1;
          padding: 40px;
          position: relative;
          overflow: hidden;
        }

        .form-bg-mesh {
          position: absolute;
          inset: 0;
          background:
            radial-gradient(ellipse at 30% 20%, rgba(201, 162, 62, 0.04) 0%, transparent 50%),
            radial-gradient(ellipse at 70% 80%, rgba(26, 26, 46, 0.03) 0%, transparent 50%);
          background-size: 200% 200%;
          animation: gradientShift 15s ease infinite;
          pointer-events: none;
        }

        .login-card {
          width: 100%;
          max-width: 400px;
          position: relative;
          z-index: 1;
          animation: cardEntrance 1s cubic-bezier(0.33, 1, 0.68, 1) 0.25s both;
        }

        .card-header {
          margin-bottom: 38px;
        }
        .card-header h2 {
          font-family: 'Noto Serif SC', serif;
          font-size: 28px;
          font-weight: 700;
          color: #1a1a2e;
          margin-bottom: 8px;
        }
        .wlcm-char {
          display: inline-block;
          animation: wlcmReveal 0.7s cubic-bezier(0.33, 1, 0.68, 1) both;
          animation-delay: calc(0.4s + var(--i, 0) * 0.1s);
        }
        .card-header p {
          font-size: 14px;
          color: #9998a6;
          margin: 0;
          animation: descFade 0.6s ease-out 1s both;
        }

        /* ── ANT DESIGN OVERRIDES ── */
        .login-ant-form {
          animation: formEntrance 0.8s ease-out 0.7s both;
        }
        .login-ant-form .ant-form-item {
          margin-bottom: 20px;
        }

        .login-ant-form .ant-input-affix-wrapper {
          border-radius: 10px !important;
          border: 1.5px solid #e6e2dc !important;
          background: #ffffff !important;
          padding: 8px 16px !important;
          height: 48px !important;
          transition: all 0.3s cubic-bezier(0.33, 1, 0.68, 1) !important;
          box-shadow: 0 1px 3px rgba(0,0,0,0.02) !important;
          position: relative !important;
          overflow: hidden !important;
        }
        .login-ant-form .ant-input-affix-wrapper::before {
          content: '';
          position: absolute;
          bottom: 0;
          left: 50%;
          width: 0;
          height: 2px;
          background: linear-gradient(90deg, #c9a23e, #d4a853);
          transition: all 0.4s cubic-bezier(0.33, 1, 0.68, 1);
          transform: translateX(-50%);
        }
        .login-ant-form .ant-input-affix-wrapper:hover {
          border-color: #c9a23e !important;
          box-shadow: 0 0 0 2px rgba(201, 162, 62, 0.08), 0 4px 12px rgba(201, 162, 62, 0.05) !important;
          transform: translateY(-1px);
        }
        .login-ant-form .ant-input-affix-wrapper-focused,
        .login-ant-form .ant-input-affix-wrapper:focus-within {
          border-color: #c9a23e !important;
          box-shadow: 0 0 0 3px rgba(201, 162, 62, 0.12), 0 4px 16px rgba(201, 162, 62, 0.08) !important;
          transform: translateY(-1px);
        }
        .login-ant-form .ant-input-affix-wrapper-focused::before,
        .login-ant-form .ant-input-affix-wrapper:focus-within::before {
          width: 80%;
        }

        .login-ant-form .ant-input-affix-wrapper .ant-input {
          background: transparent !important;
          color: #1a1a2e !important;
          font-size: 14px !important;
        }
        .login-ant-form .ant-input-affix-wrapper .ant-input::placeholder {
          color: #b8b3ab !important;
          transition: color 0.3s ease;
        }
        .login-ant-form .ant-input-affix-wrapper-focused .ant-input::placeholder,
        .login-ant-form .ant-input-affix-wrapper:focus-within .ant-input::placeholder {
          color: #c9a23e !important;
        }

        .login-ant-form .ant-input-affix-wrapper .anticon {
          color: #c2bdb5 !important;
          font-size: 16px !important;
          transition: color 0.3s ease, transform 0.3s ease !important;
        }
        .login-ant-form .ant-input-affix-wrapper-focused .anticon,
        .login-ant-form .ant-input-affix-wrapper:focus-within .anticon {
          color: #c9a23e !important;
          transform: scale(1.1);
        }

        .login-ant-form .ant-input-password .ant-input-suffix .anticon {
          color: #bbb !important;
        }
        .login-ant-form .ant-form-item-explain-error {
          font-size: 12px !important;
          color: #e74c3c !important;
          margin-top: 2px !important;
        }

        /* ── SUBMIT BUTTON ── */
        .login-btn {
          height: 48px !important;
          border-radius: 10px !important;
          background: linear-gradient(135deg, #1a1a2e 0%, #2a2a40 100%) !important;
          border: none !important;
          font-weight: 600 !important;
          font-size: 15px !important;
          color: #fff !important;
          letter-spacing: 4px !important;
          transition: all 0.4s cubic-bezier(0.33, 1, 0.68, 1) !important;
          box-shadow: 0 4px 14px rgba(26, 26, 46, 0.18) !important;
          cursor: pointer !important;
          position: relative !important;
          overflow: hidden !important;
        }
        .login-btn:hover {
          transform: translateY(-2px) scale(1.01) !important;
          box-shadow: 0 8px 28px rgba(26, 26, 46, 0.30) !important;
          background: linear-gradient(135deg, #252542 0%, #353555 100%) !important;
        }
        .login-btn:active {
          transform: translateY(0) scale(0.98) !important;
        }
        .login-btn::after {
          content: '';
          position: absolute;
          inset: -2px;
          border-radius: 12px;
          background: linear-gradient(135deg, rgba(201,162,62,0.3), transparent, rgba(201,162,62,0.3));
          opacity: 0;
          transition: opacity 0.4s ease;
          z-index: -1;
        }
        .login-btn:hover::after {
          opacity: 1;
        }

        .btn-ripple {
          position: absolute;
          border-radius: 50%;
          background: rgba(255,255,255,0.25);
          transform: translate(-50%, -50%);
          animation: btnRipple 0.8s ease-out forwards;
          pointer-events: none;
        }

        /* ── TEST ACCOUNTS ── */
        .test-accounts {
          margin-top: 28px;
          padding: 16px 18px;
          border-radius: 10px;
          background: #eeeae4;
          border: 1px solid #e6e2dc;
          animation: cardEntrance 0.7s ease-out 1.2s both;
        }

        .ta-label {
          font-size: 10px;
          font-weight: 600;
          color: #9998a6;
          text-transform: uppercase;
          letter-spacing: 1.8px;
          margin-bottom: 10px;
        }

        .ta-row {
          display: flex;
          align-items: center;
          gap: 6px;
          padding: 4px 0;
          font-size: 12px;
          color: #555;
          animation: taRowSlide 0.5s ease-out both;
          animation-delay: calc(1.4s + var(--i, 0) * 0.12s);
        }
        .ta-row + .ta-row {
          border-top: 1px solid rgba(0,0,0,0.04);
        }

        .ta-role {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          min-width: 38px;
          padding: 1px 8px;
          border-radius: 4px;
          font-size: 10px;
          font-weight: 600;
          letter-spacing: 0.4px;
          transition: transform 0.3s ease;
        }
        .ta-role.admin:hover  { transform: scale(1.08); }
        .ta-role.teacher:hover { transform: scale(1.08); }
        .ta-role.student:hover { transform: scale(1.08); }

        .ta-role.admin  { background: #1a1a2e; color: #d4a853; }
        .ta-role.teacher { background: #d4d0ca; color: #1a1a2e; }
        .ta-role.student { background: #d4d0ca; color: #666; }

        .ta-cred {
          font-family: 'Outfit', monospace;
          font-size: 11px;
          color: #888;
        }
        .ta-sep {
          color: #ccc;
          font-size: 11px;
        }

        /* ── COPYRIGHT ── */
        .login-copyright {
          position: absolute;
          bottom: 24px;
          font-size: 11px;
          color: #c2bdb5;
          letter-spacing: 0.5px;
          animation: descFade 0.6s ease-out 2s both;
        }

        /* ── RESPONSIVE ── */
        @media (max-width: 900px) {
          .login-root { flex-direction: column; }
          .login-brand {
            flex: none;
            padding: 44px 28px;
            min-height: 38vh;
          }
          .login-form-area {
            flex: none;
            padding: 40px 24px;
          }
          .brand-title { font-size: 36px; }
          .shape-cube, .shape-pyramid, .shape-ring, .shape-diamond { display: none; }
        }
      `}</style>
    </>
  )
}
