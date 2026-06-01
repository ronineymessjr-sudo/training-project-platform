import { useEffect, useState } from 'react'
import { Table, Card, Tag, Button, Input, Space, Row, Col, Modal, Form, DatePicker, message } from 'antd'
import { PlusOutlined, SearchOutlined, EyeOutlined } from '@ant-design/icons'
import { useNavigate } from 'react-router-dom'
import { projectApi, Project } from '../../api/project'
import { useAuthStore } from '../../stores/auth.store'
import dayjs from 'dayjs'

export default function ProjectList() {
  const navigate = useNavigate()
  const { user } = useAuthStore()
  const [data, setData] = useState<{ list: Project[]; total: number }>({ list: [], total: 0 })
  const [loading, setLoading] = useState(false)
  const [page, setPage] = useState(1)
  const [keyword, setKeyword] = useState('')
  const [createModalVisible, setCreateModalVisible] = useState(false)
  const [form] = Form.useForm()

  const isAdmin = user?.roles.includes('admin')
  const isTeacher = user?.roles.includes('teacher')

  const fetchData = async () => {
    setLoading(true)
    try {
      const response: any = await projectApi.getList({ page, keyword, myOnly: !isTeacher && !isAdmin })
      const resData = response?.data?.data || {}
      setData({
        list: resData.list || [],
        total: resData.total || 0,
      })
    } catch { console.error('API call failed') } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchData()
  }, [page])

  const handleCreate = async (values: any) => {
    try {
      await projectApi.create({
        ...values,
        startDate: values.startDate?.format('YYYY-MM-DD'),
        endDate: values.endDate?.format('YYYY-MM-DD'),
      })
      message.success('��Ŀ�����ɹ�')
      setCreateModalVisible(false)
      form.resetFields()
      fetchData()
    } catch { console.error('Operation failed') }
  }

  const columns = [
    {
      title: '��Ŀ����',
      dataIndex: 'name',
      key: 'name',
      render: (name: string, record: Project) => (
        <a onClick={() => navigate(`/projects/${record.id}`)}>{name}</a>
      ),
    },
    {
      title: '�༶',
      dataIndex: 'className',
      key: 'className',
    },
    {
      title: 'ָ����ʦ',
      dataIndex: 'teacherName',
      key: 'teacherName',
    },
    {
      title: 'ʱ��',
      key: 'date',
      render: (_: any, record: Project) => (
        <span>
          {dayjs(record.startDate).format('YYYY-MM-DD')} ~ {dayjs(record.endDate).format('YYYY-MM-DD')}
        </span>
      ),
    },
    {
      title: '������',
      dataIndex: 'groupCount',
      key: 'groupCount',
    },
    {
      title: '״̬',
      dataIndex: 'status',
      key: 'status',
      render: (status: number) => {
        const statusMap: Record<number, { color: string; text: string }> = {
          0: { color: 'default', text: 'δ��ʼ' },
          1: { color: 'processing', text: '������' },
          2: { color: 'success', text: '�����' },
          3: { color: 'warning', text: '�ѹ鵵' },
        }
        const { color, text } = statusMap[status] || statusMap[0]
        return <Tag color={color}>{text}</Tag>
      },
    },
    {
      title: '����',
      key: 'action',
      render: (_: any, record: Project) => (
        <Space>
          <Button
            type="link"
            size="small"
            icon={<EyeOutlined />}
            onClick={() => navigate(`/projects/${record.id}`)}
          >
            �鿴
          </Button>
        </Space>
      ),
    },
  ]

  return (
    <div>
      <Card>
        <div style={{ marginBottom: 16 }}>
          <Row justify="space-between">
            <Col>
              <Space>
                <Input.Search
                  placeholder="������Ŀ����"
                  allowClear
                  style={{ width: 200 }}
                  onSearch={(value) => {
                    setKeyword(value)
                    setPage(1)
                  }}
                />
              </Space>
            </Col>
            <Col>
              {(isAdmin || isTeacher) && (
                <Button
                  type="primary"
                  icon={<PlusOutlined />}
                  onClick={() => setCreateModalVisible(true)}
                >
                  ������Ŀ
                </Button>
              )}
            </Col>
          </Row>
        </div>

        <Table
          columns={columns}
          dataSource={data.list}
          rowKey="id"
          loading={loading}
          pagination={{
            current: page,
            pageSize: 10,
            total: data.total,
            onChange: setPage,
            showTotal: (total) => `�� ${total} ��`,
          }}
        />
      </Card>

      <Modal
        title="������Ŀ"
        open={createModalVisible}
        onCancel={() => setCreateModalVisible(false)}
        onOk={() => form.submit()}
      >
        <Form
          form={form}
          layout="vertical"
          onFinish={handleCreate}
        >
          <Form.Item
            name="name"
            label="��Ŀ����"
            rules={[{ required: true, message: '��������Ŀ����' }]}
          >
            <Input placeholder="��������Ŀ����" />
          </Form.Item>

          <Form.Item
            name="description"
            label="��Ŀ����"
          >
            <Input.TextArea rows={3} placeholder="��������Ŀ����" />
          </Form.Item>

          <Form.Item
            name="classId"
            label="����༶"
            rules={[{ required: true, message: '��ѡ��༶' }]}
          >
            <Input type="number" placeholder="������༶ID" />
          </Form.Item>

          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                name="startDate"
                label="��ʼ����"
                rules={[{ required: true, message: '��ѡ��ʼ����' }]}
              >
                <DatePicker style={{ width: '100%' }} />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                name="endDate"
                label="��������"
                rules={[{ required: true, message: '��ѡ���������' }]}
              >
                <DatePicker style={{ width: '100%' }} />
              </Form.Item>
            </Col>
          </Row>
        </Form>
      </Modal>
    </div>
  )
}
