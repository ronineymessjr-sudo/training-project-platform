import { useEffect, useState } from 'react'
import { Table, Card, Tag, Button, Input, Space, Row, Col, Modal, Form, DatePicker, Select } from 'antd'
import { PlusOutlined, SearchOutlined, EyeOutlined, PieChartOutlined, LineChartOutlined, BarChartOutlined, RadarChartOutlined } from '@ant-design/icons'
import { useNavigate } from 'react-router-dom'
import { projectApi, Project } from '../../api/project'
import { getClassList } from '../../api/class'
import { useAuthStore } from '../../stores/auth.store'
import dayjs from 'dayjs'
import { messageHolder } from '../../utils/messageHolder'
import {
  PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend,
  AreaChart, Area, CartesianGrid, XAxis, YAxis,
  BarChart, Bar,
  RadarChart, Radar, PolarGrid, PolarAngleAxis, PolarRadiusAxis,
} from 'recharts'

interface ClassOption {
  id: number
  name: string
  major_name?: string
}

export default function ProjectList() {
  const navigate = useNavigate()
  const { user } = useAuthStore()
  const [data, setData] = useState<{ list: Project[]; total: number }>({ list: [], total: 0 })
  const [loading, setLoading] = useState(false)
  const [page, setPage] = useState(1)
  const [keyword, setKeyword] = useState('')
  const [createModalVisible, setCreateModalVisible] = useState(false)
  const [classOptions, setClassOptions] = useState<ClassOption[]>([])
  const [classesLoading, setClassesLoading] = useState(false)
  const [form] = Form.useForm()

  const isAdmin = user?.roles.includes('admin')
  const isTeacher = user?.roles.includes('teacher')

  // 🆕 图表数据 - 项目状态分布
  const statusDistributionData = [
    { name: '未开始', value: 5, color: '#d9d9d9' },
    { name: '进行中', value: 12, color: '#1890ff' },
    { name: '已完成', value: 8, color: '#52c41a' },
    { name: '已归档', value: 3, color: '#faad14' },
  ]

  // 🆕 图表数据 - 项目进度趋势（面积图）
  const progressTrendData = [
    { week: 'W1', progress: 15 },
    { week: 'W2', progress: 28 },
    { week: 'W3', progress: 42 },
    { week: 'W4', progress: 55 },
    { week: 'W5', progress: 68 },
    { week: 'W6', progress: 78 },
  ]

  // 🆕 图表数据 - 班级项目对比（分组柱状图）
  const classCompareData = [
    { class: '计算机2201', total: 8, completed: 5 },
    { class: '计算机2202', total: 6, completed: 4 },
    { class: '软件工程2201', total: 7, completed: 3 },
    { class: '数据科学2201', total: 5, completed: 4 },
  ]

  // 🆕 图表数据 - 项目活跃度雷达图
  const activityRadarData = [
    { dimension: '文档提交', score: 85 },
    { dimension: '进度更新', score: 72 },
    { dimension: '小组协作', score: 68 },
    { dimension: '答辩准备', score: 55 },
    { dimension: '代码质量', score: 78 },
  ]

  const fetchData = async () => {
    setLoading(true)
    try {
      const response: any = await projectApi.getList({ page, keyword })
      const resData = response?.data?.data || {}
      setData({
        list: resData.list || [],
        total: resData.total || 0,
      })
    } catch (error: any) {
      messageHolder.error(error?.message || '获取项目列表失败')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchData()
  }, [page])

  const fetchClasses = async () => {
    setClassesLoading(true)
    try {
      const res = await getClassList({ page: 1, pageSize: 200 })
      if (res.data?.list) {
        setClassOptions(res.data.list.map((c: any) => ({
          id: c.id,
          name: c.name,
          major_name: c.major_name,
        })))
      }
    } catch (error: any) {
      messageHolder.error(error?.message || '获取班级列表失败')
    } finally {
      setClassesLoading(false)
    }
  }

  const openCreateModal = () => {
    setCreateModalVisible(true)
    if (classOptions.length === 0) {
      fetchClasses()
    }
  }

  const handleCreate = async (values: any) => {
    try {
      await projectApi.create({
        ...values,
        startDate: values.startDate?.format('YYYY-MM-DD'),
        endDate: values.endDate?.format('YYYY-MM-DD'),
      })
      messageHolder.success('项目创建成功')
      setCreateModalVisible(false)
      form.resetFields()
      fetchData()
    } catch (error: any) {
      if (error?.errorFields) {
        messageHolder.error('请检查表单填写')
      } else {
        messageHolder.error(error?.message || '项目创建失败')
      }
    }
  }

  const columns = [
    {
      title: '项目名称',
      dataIndex: 'name',
      key: 'name',
      render: (name: string, record: Project) => (
        <a onClick={() => navigate(`/projects/${record.id}`)}>{name}</a>
      ),
    },
    {
      title: '班级',
      dataIndex: 'className',
      key: 'className',
    },
    {
      title: '指导教师',
      dataIndex: 'teacherName',
      key: 'teacherName',
    },
    {
      title: '时间',
      key: 'date',
      render: (_: any, record: Project) => (
        <span>
          {dayjs(record.startDate).format('YYYY-MM-DD')} ~ {dayjs(record.endDate).format('YYYY-MM-DD')}
        </span>
      ),
    },
    {
      title: '分组数',
      dataIndex: 'groupCount',
      key: 'groupCount',
    },
    {
      title: '状态',
      dataIndex: 'status',
      key: 'status',
      render: (status: number) => {
        const statusMap: Record<number, { color: string; text: string }> = {
          0: { color: 'default', text: '未开始' },
          1: { color: 'processing', text: '进行中' },
          2: { color: 'success', text: '已完成' },
          3: { color: 'warning', text: '已归档' },
        }
        const { color, text } = statusMap[status] || statusMap[0]
        return <Tag color={color}>{text}</Tag>
      },
    },
    {
      title: '操作',
      key: 'action',
      render: (_: any, record: Project) => (
        <Space>
          <Button
            type="link"
            size="small"
            icon={<EyeOutlined />}
            onClick={() => navigate(`/projects/${record.id}`)}
          >
            查看
          </Button>
        </Space>
      ),
    },
  ]

  return (
    <div>
      {/* 🆕 数据看板区域 */}
      <Row gutter={16} style={{ marginBottom: 24 }}>
        <Col span={6}>
          <Card>
            <div style={{ display: 'flex', alignItems: 'center', marginBottom: 8 }}>
              <PieChartOutlined style={{ color: '#1890ff', marginRight: 8 }} />
              <span style={{ fontWeight: 600 }}>项目状态分布</span>
            </div>
            <ResponsiveContainer width="100%" height={180}>
              <PieChart>
                <Pie
                  data={statusDistributionData}
                  cx="50%"
                  cy="50%"
                  innerRadius={35}
                  outerRadius={55}
                  paddingAngle={2}
                  dataKey="value"
                >
                  {statusDistributionData.map((entry, index) => (
                    <Cell key={index} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip />
                <Legend layout="horizontal" align="center" verticalAlign="bottom" iconSize={8} />
              </PieChart>
            </ResponsiveContainer>
          </Card>
        </Col>
        <Col span={6}>
          <Card>
            <div style={{ display: 'flex', alignItems: 'center', marginBottom: 8 }}>
              <LineChartOutlined style={{ color: '#52c41a', marginRight: 8 }} />
              <span style={{ fontWeight: 600 }}>进度趋势</span>
            </div>
            <ResponsiveContainer width="100%" height={180}>
              <AreaChart data={progressTrendData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="week" tick={{ fontSize: 10 }} />
                <YAxis domain={[0, 100]} tick={{ fontSize: 10 }} />
                <Tooltip formatter={(v) => `${v}%`} />
                <Area type="monotone" dataKey="progress" stroke="#52c41a" fill="#52c41a40" />
              </AreaChart>
            </ResponsiveContainer>
          </Card>
        </Col>
        <Col span={6}>
          <Card>
            <div style={{ display: 'flex', alignItems: 'center', marginBottom: 8 }}>
              <BarChartOutlined style={{ color: '#faad14', marginRight: 8 }} />
              <span style={{ fontWeight: 600 }}>班级项目对比</span>
            </div>
            <ResponsiveContainer width="100%" height={180}>
              <BarChart data={classCompareData} layout="vertical" barSize={12}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis type="number" tick={{ fontSize: 10 }} />
                <YAxis type="category" dataKey="class" tick={{ fontSize: 9 }} width={70} />
                <Tooltip />
                <Bar dataKey="total" fill="#faad14" name="总数" />
                <Bar dataKey="completed" fill="#52c41a" name="已完成" />
              </BarChart>
            </ResponsiveContainer>
          </Card>
        </Col>
        <Col span={6}>
          <Card>
            <div style={{ display: 'flex', alignItems: 'center', marginBottom: 8 }}>
              <RadarChartOutlined style={{ color: '#722ed1', marginRight: 8 }} />
              <span style={{ fontWeight: 600 }}>活跃度雷达图</span>
            </div>
            <ResponsiveContainer width="100%" height={180}>
              <RadarChart data={activityRadarData}>
                <PolarGrid />
                <PolarAngleAxis dataKey="dimension" tick={{ fontSize: 9 }} />
                <PolarRadiusAxis angle={30} domain={[0, 100]} tick={{ fontSize: 8 }} />
                <Radar name="活跃度" dataKey="score" stroke="#722ed1" fill="#722ed140" />
                <Tooltip />
              </RadarChart>
            </ResponsiveContainer>
          </Card>
        </Col>
      </Row>

      {/* 项目列表 */}
      <Card>
        <div style={{ marginBottom: 16 }}>
          <Row justify="space-between">
            <Col>
              <Space>
                <Input.Search
                  placeholder="搜索项目名称"
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
                  onClick={openCreateModal}
                >
                  创建项目
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
            showTotal: (total) => `共 ${total} 条`,
          }}
        />
      </Card>

      <Modal
        title="创建项目"
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
            label="项目名称"
            rules={[
              { required: true, message: '请输入项目名称' },
              { max: 100, message: '项目名称不能超过100个字符' },
            ]}
          >
            <Input placeholder="请输入项目名称" maxLength={100} />
          </Form.Item>

          <Form.Item
            name="description"
            label="项目描述"
            rules={[{ max: 500, message: '项目描述不能超过500个字符' }]}
          >
            <Input.TextArea rows={3} placeholder="请输入项目描述" maxLength={500} showCount />
          </Form.Item>

          <Form.Item
            name="classId"
            label="所属班级"
            rules={[{ required: true, message: '请选择班级' }]}
          >
            <Select
              placeholder="请选择班级"
              loading={classesLoading}
              showSearch
              optionFilterProp="label"
              options={classOptions.map(c => ({
                value: c.id,
                label: c.major_name ? `${c.name} (${c.major_name})` : c.name,
              }))}
            />
          </Form.Item>

          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                name="startDate"
                label="开始日期"
                rules={[{ required: true, message: '请选择开始日期' }]}
              >
                <DatePicker style={{ width: '100%' }} placeholder="请选择开始日期" />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                name="endDate"
                label="结束日期"
                dependencies={['startDate']}
                rules={[
                  { required: true, message: '请选择结束日期' },
                  ({ getFieldValue }) => ({
                    validator(_, value) {
                      const start = getFieldValue('startDate')
                      if (!value || !start) return Promise.resolve()
                      if (value.isBefore(start)) {
                        return Promise.reject(new Error('结束日期不能早于开始日期'))
                      }
                      return Promise.resolve()
                    },
                  }),
                ]}
              >
                <DatePicker style={{ width: '100%' }} placeholder="请选择结束日期" />
              </Form.Item>
            </Col>
          </Row>
        </Form>
      </Modal>
    </div>
  )
}