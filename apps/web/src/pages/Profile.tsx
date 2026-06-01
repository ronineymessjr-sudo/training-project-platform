import { useState } from 'react'
import { Card, Descriptions, Avatar, Button, Form, Input, message, Row, Col, Space } from 'antd'
import { UserOutlined, EditOutlined } from '@ant-design/icons'
import { useAuthStore } from '../stores/auth.store'
import { authApi } from '../api/auth'

export default function Profile() {
  const { user, updateUser } = useAuthStore()
  const [editing, setEditing] = useState(false)
  const [form] = Form.useForm()

  const handleSave = async (values: any) => {
    try {
      // In production, call API to update user
      updateUser(values)
      message.success('个人信息更新成功')
      setEditing(false)
    } catch {}
  }

  return (
    <div>
      <Card
        title="个人信息"
        extra={
          !editing && (
            <Button
              type="primary"
              icon={<EditOutlined />}
              onClick={() => {
                setEditing(true)
                form.setFieldsValue(user)
              }}
            >
              编辑
            </Button>
          )
        }
      >
        {editing ? (
          <Form
            form={form}
            layout="vertical"
            onFinish={handleSave}
            initialValues={user || {}}
          >
            <Row gutter={16}>
              <Col span={12}>
                <Form.Item name="realName" label="真实姓名">
                  <Input />
                </Form.Item>
              </Col>
              <Col span={12}>
                <Form.Item name="email" label="邮箱">
                  <Input />
                </Form.Item>
              </Col>
            </Row>
            <Row gutter={16}>
              <Col span={12}>
                <Form.Item name="phone" label="手机号">
                  <Input />
                </Form.Item>
              </Col>
            </Row>
            <Form.Item>
              <Space>
                <Button type="primary" htmlType="submit">保存</Button>
                <Button onClick={() => setEditing(false)}>取消</Button>
              </Space>
            </Form.Item>
          </Form>
        ) : (
          <Descriptions column={2}>
            <Descriptions.Item label="用户名">{user?.username}</Descriptions.Item>
            <Descriptions.Item label="真实姓名">{user?.realName}</Descriptions.Item>
            <Descriptions.Item label="邮箱">{user?.email || '未设置'}</Descriptions.Item>
            <Descriptions.Item label="头像">
              <Avatar size="large" icon={<UserOutlined />} src={user?.avatarUrl} />
            </Descriptions.Item>
            <Descriptions.Item label="角色">
              {user?.roles?.join(', ')}
            </Descriptions.Item>
          </Descriptions>
        )}
      </Card>

      <Card title="修改密码" style={{ marginTop: 16 }}>
        <Form
          layout="vertical"
          onFinish={async (values) => {
            try {
              await authApi.changePassword(values.oldPassword, values.newPassword)
              message.success('密码修改成功')
            } catch {}
          }}
        >
          <Row gutter={16}>
            <Col span={8}>
              <Form.Item
                name="oldPassword"
                label="旧密码"
                rules={[{ required: true, message: '请输入旧密码' }]}
              >
                <Input.Password />
              </Form.Item>
            </Col>
            <Col span={8}>
              <Form.Item
                name="newPassword"
                label="新密码"
                rules={[
                  { required: true, message: '请输入新密码' },
                  { min: 6, message: '密码长度不能少于6位' },
                ]}
              >
                <Input.Password />
              </Form.Item>
            </Col>
            <Col span={8}>
              <Form.Item
                name="confirmPassword"
                label="确认密码"
                dependencies={['newPassword']}
                rules={[
                  { required: true, message: '请确认密码' },
                  ({ getFieldValue }) => ({
                    validator(_, value) {
                      if (!value || getFieldValue('newPassword') === value) {
                        return Promise.resolve()
                      }
                      return Promise.reject(new Error('两次密码不一致'))
                    },
                  }),
                ]}
              >
                <Input.Password />
              </Form.Item>
            </Col>
          </Row>
          <Form.Item>
            <Button type="primary" htmlType="submit">修改密码</Button>
          </Form.Item>
        </Form>
      </Card>
    </div>
  )
}
