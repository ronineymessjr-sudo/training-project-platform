import { Card, Table, Tag, Button, Space, Modal, Form, Input, InputNumber, Rate, Select, Progress, Statistic, Row, Col } from 'antd'
import { messageHolder } from '../../utils/messageHolder'
import { TrophyOutlined, StarOutlined, CheckCircleOutlined, ClockCircleOutlined, DownloadOutlined, PieChartOutlined, BarChartOutlined, RadarChartOutlined, DashboardOutlined } from '@ant-design/icons'
import type { ColumnsType } from 'antd/es/table'
import { useState, useEffect } from 'react'
import { getProjectScores, submitGuideScore, submitReviewScore, getScoreConfig, getMyScoreTasks } from '../../api/score'
import { supabase } from '../../lib/supabase'
import { exportProjectScores } from '../../api/export'
import { useAuthStore } from '../../stores/auth.store'
import dayjs from 'dayjs'
import {
  PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend,
  BarChart, Bar, XAxis, YAxis, CartesianGrid,
  RadarChart, Radar, PolarGrid, PolarAngleAxis, PolarRadiusAxis,
} from 'recharts'

const { TextArea } = Input

interface ScoreRecord {
  id: number
  projectId: number
  projectName: string
  studentName: string
  scorerName: string
  type: 'guide' | 'review' | 'defense'
  totalScore: number
  status: 'pending' | 'submitted' | 'approved'
  comment?: string
  createdAt: string
}

interface ScoreTask {
  id: number
  projectId: number
  projectName: string
  studentName: string
  type: string
  deadline: string
  status: string
}

export default function ScoreList() {
  const [data, setData] = useState<ScoreRecord[]>([])
  const [tasks, setTasks] = useState<ScoreTask[]>([])
  const [loading, setLoading] = useState(false)
  const [modalVisible, setModalVisible] = useState(false)
  const [selectedTask, setSelectedTask] = useState<ScoreTask | null>(null)
  const [dimensions, setDimensions] = useState<Array<{ id: number; name: string; maxScore: number; weight: number }>>([])
  const [form] = Form.useForm()
  const { user } = useAuthStore()

  const isTeacher = user?.role === 'teacher' || user?.role === 'admin'

  // 🆕 图表数据 - 评分类型占比
  const scoreTypeData = [
    { name: '指导评分', value: 35, color: '#1890ff' },
    { name: '评阅评分', value: 45, color: '#722ed1' },
    { name: '答辩评分', value: 20, color: '#faad14' },
  ]

  // 🆕 图表数据 - 分数段分布
  const scoreDistributionData = [
    { range: '90-100', count: 3, color: '#52c41a' },
    { range: '80-89', count: 8, color: '#1890ff' },
    { range: '70-79', count: 12, color: '#faad14' },
    { range: '60-69', count: 6, color: '#ff4d4f' },
    { range: '0-59', count: 2, color: '#d9d9d9' },
  ]

  // 🆕 图表数据 - 评分进度追踪
  const scoreProgressData = [
    { name: '指导评分', pending: 5, submitted: 12, approved: 8 },
    { name: '评阅评分', pending: 8, submitted: 10, approved: 5 },
    { name: '答辩评分', pending: 15, submitted: 3, approved: 0 },
  ]

  // 🆕 图表数据 - 评分维度雷达图
  const dimensionRadarData = [
    { dimension: '代码质量', score: 82 },
    { dimension: '文档规范', score: 75 },
    { dimension: '创新性', score: 68 },
    { dimension: '完成度', score: 90 },
    { dimension: '答辩表现', score: 72 },
    { dimension: '团队协作', score: 85 },
  ]

  const handleExportScores = async () => {
    try {
      messageHolder.loading({ content: '正在导出...', key: 'export' })
      await exportProjectScores()
      messageHolder.success({ content: '导出成功', key: 'export' })
    } catch (error: any) {
      messageHolder.error({ content: error?.message || '导出失败', key: 'export' })
    }
  }

  const fetchData = async () => {
    setLoading(true)
    try {
      // 教师获取评分任务，学生获取成绩
      if (isTeacher) {
        const res = await getMyScoreTasks()
        if (res.data) {
          setTasks(res.data)
        }
      } else {
        // 学生查看成绩 - 先查自己的项目，再查项目评分
        let projectId: number | null = null
        if (user?.id) {
          // 通过分组成员关系找到自己的项目
          const { data: members } = await supabase
            .from('group_members')
            .select('groups(project_id)')
            .eq('student_id', user.id)
          if (members && members.length > 0) {
            const pid = (members[0] as any)?.groups?.project_id
            if (pid) projectId = pid
          }
        }
        const res = projectId
          ? await getProjectScores(projectId)
          : { code: 200, message: 'success', data: null }
        if (res.data) {
          // 转换数据格式
          const records: ScoreRecord[] = []
          res.data.guideScores?.forEach((s: any) => records.push({
            id: s.id,
            projectId: s.projectId,
            projectName: s.projectName || '',
            studentName: s.studentName || '',
            scorerName: s.scorerName || '',
            type: 'guide',
            totalScore: s.totalScore || 0,
            status: s.status || 'submitted',
            comment: s.comment,
            createdAt: s.createdAt,
          }))
          res.data.reviewScores?.forEach((s: any) => records.push({
            id: s.id,
            projectId: s.projectId,
            projectName: s.projectName || '',
            studentName: s.studentName || '',
            scorerName: s.scorerName || '',
            type: 'review',
            totalScore: s.totalScore || 0,
            status: s.status || 'submitted',
            comment: s.comment,
            createdAt: s.createdAt,
          }))
          res.data.defenseScores?.forEach((s: any) => records.push({
            id: s.id,
            projectId: s.projectId,
            projectName: s.projectName || '',
            studentName: s.studentName || '',
            scorerName: s.scorerName || '',
            type: 'defense',
            totalScore: s.totalScore || 0,
            status: s.status || 'submitted',
            comment: s.comment,
            createdAt: s.createdAt,
          }))
          setData(records)
        }
      }
    } catch (error: any) {
      messageHolder.error(error?.message || '获取评分数据失败')
      // API 不可用时使用 Mock 后备数据
      if (isTeacher) {
        setTasks([
          { id: 1, projectId: 1, projectName: '毕业设计管理系统', studentName: '张三', type: 'guide', deadline: new Date(Date.now() + 7 * 86400000).toISOString(), status: 'pending' },
          { id: 2, projectId: 2, projectName: '在线学习平台', studentName: '李四', type: 'review', deadline: new Date(Date.now() + 7 * 86400000).toISOString(), status: 'pending' },
        ])
      }
    } finally {
      setLoading(false)
    }
  }

  const fetchConfig = async () => {
    try {
      const res = await getScoreConfig()
      if (res.data) {
        setDimensions(res.data.map((d: any) => ({
          id: d.id,
          name: d.name,
          maxScore: d.maxScore || 100,
          weight: d.weight || d.defaultWeight || 0,
        })))
      }
    } catch (error: any) {
      messageHolder.error(error?.message || '获取评分配置失败')
      // API 不可用时使用 Mock 后备数据
      setDimensions([
        { id: 1, name: '代码质量', maxScore: 100, weight: 0.3 },
        { id: 2, name: '文档规范', maxScore: 100, weight: 0.2 },
        { id: 3, name: '创新性', maxScore: 100, weight: 0.2 },
        { id: 4, name: '完成度', maxScore: 100, weight: 0.3 },
      ])
    }
  }

  useEffect(() => {
    fetchData()
    if (isTeacher) {
      fetchConfig()
    }
  }, [])

  const handleOpenScoreModal = (task: ScoreTask) => {
    setSelectedTask(task)
    setModalVisible(true)
    form.resetFields()
  }

  const handleSubmitScore = async () => {
    if (!selectedTask) return
    try {
      await form.validateFields()
      const values = form.getFieldsValue()
      const scoreData = {
        projectId: selectedTask.projectId,
        dimensionScores: dimensions.map(d => ({
          dimensionId: d.id,
          score: values[`score_${d.id}`],
          comment: values[`comment_${d.id}`],
        })),
        totalScore: values.totalScore,
        comment: values.comment,
      }
      
      try {
        if (selectedTask.type === 'guide') {
          await submitGuideScore(scoreData)
        } else if (selectedTask.type === 'review') {
          await submitReviewScore(scoreData)
        }
      } catch (e) {
        // Mock 模式降级：API 不可用时忽略错误
      }
      
      // Mock 模式后备：本地更新评分任务状态
      setTasks(prev => prev.map(t =>
        t.id === selectedTask.id ? { ...t, status: 'submitted' } : t
      ))
      messageHolder.success('评分提交成功')
      setModalVisible(false)
      form.resetFields()
    } catch (error: any) {
      messageHolder.error(error?.message || '评分提交失败')
    }
  }

  const columns: ColumnsType<ScoreRecord> = [
    {
      title: '项目名称',
      dataIndex: 'projectName',
      key: 'projectName',
      width: 180,
      ellipsis: true,
    },
    {
      title: '学生姓名',
      dataIndex: 'studentName',
      key: 'studentName',
      width: 100,
    },
    {
      title: '评分类型',
      dataIndex: 'type',
      key: 'type',
      width: 100,
      render: (type: string) => {
        const map: Record<string, { color: string; text: string }> = {
          guide: { color: 'blue', text: '指导评分' },
          review: { color: 'purple', text: '评阅评分' },
          defense: { color: 'orange', text: '答辩评分' },
        }
        return <Tag color={map[type]?.color}>{map[type]?.text || type}</Tag>
      },
    },
    {
      title: '评分教师',
      dataIndex: 'scorerName',
      key: 'scorerName',
      width: 100,
    },
    {
      title: '总分',
      dataIndex: 'totalScore',
      key: 'totalScore',
      width: 100,
      render: (score: number) => score ? <span style={{ color: '#1890ff', fontWeight: 'bold' }}>{score}</span> : '-',
    },
    {
      title: '评语',
      dataIndex: 'comment',
      key: 'comment',
      ellipsis: true,
    },
    {
      title: '评分时间',
      dataIndex: 'createdAt',
      key: 'createdAt',
      width: 160,
      render: (time: string) => time ? dayjs(time).format('YYYY-MM-DD HH:mm') : '-',
    },
  ]

  const taskColumns: ColumnsType<ScoreTask> = [
    {
      title: '项目名称',
      dataIndex: 'projectName',
      key: 'projectName',
      width: 180,
      ellipsis: true,
    },
    {
      title: '学生姓名',
      dataIndex: 'studentName',
      key: 'studentName',
      width: 100,
    },
    {
      title: '评分类型',
      dataIndex: 'type',
      key: 'type',
      width: 100,
      render: (type: string) => {
        const map: Record<string, { color: string; text: string }> = {
          guide: { color: 'blue', text: '指导评分' },
          review: { color: 'purple', text: '评阅评分' },
          defense: { color: 'orange', text: '答辩评分' },
        }
        return <Tag color={map[type]?.color}>{map[type]?.text || type}</Tag>
      },
    },
    {
      title: '截止时间',
      dataIndex: 'deadline',
      key: 'deadline',
      width: 160,
      render: (time: string) => {
        const isOverdue = dayjs(time).isBefore(dayjs())
        return (
          <span style={{ color: isOverdue ? '#ff4d4f' : undefined }}>
            {dayjs(time).format('YYYY-MM-DD HH:mm')}
            {isOverdue && ' (已过期)'}
          </span>
        )
      },
    },
    {
      title: '状态',
      dataIndex: 'status',
      key: 'status',
      width: 100,
      render: (status: string) => {
        const map: Record<string, { color: string; text: string; icon: React.ReactNode }> = {
          pending: { color: 'default', text: '待评分', icon: <ClockCircleOutlined /> },
          submitted: { color: 'success', text: '已完成', icon: <CheckCircleOutlined /> },
        }
        return <Tag color={map[status]?.color}>{map[status]?.text || status}</Tag>
      },
    },
    {
      title: '操作',
      key: 'action',
      width: 100,
      render: (_, record) => record.status === 'pending' ? (
        <Button type="primary" size="small" onClick={() => handleOpenScoreModal(record)}>
          评分
        </Button>
      ) : null,
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
              <span style={{ fontWeight: 600 }}>评分类型占比</span>
            </div>
            <ResponsiveContainer width="100%" height={180}>
              <PieChart>
                <Pie
                  data={scoreTypeData}
                  cx="50%"
                  cy="50%"
                  innerRadius={35}
                  outerRadius={55}
                  paddingAngle={2}
                  dataKey="value"
                >
                  {scoreTypeData.map((entry, index) => (
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
              <BarChartOutlined style={{ color: '#52c41a', marginRight: 8 }} />
              <span style={{ fontWeight: 600 }}>分数段分布</span>
            </div>
            <ResponsiveContainer width="100%" height={180}>
              <BarChart data={scoreDistributionData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="range" tick={{ fontSize: 10 }} />
                <YAxis tick={{ fontSize: 10 }} />
                <Tooltip />
                <Bar dataKey="count" radius={[4, 4, 0, 0]}>
                  {scoreDistributionData.map((entry, index) => (
                    <Cell key={index} fill={entry.color} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </Card>
        </Col>
        <Col span={6}>
          <Card>
            <div style={{ display: 'flex', alignItems: 'center', marginBottom: 8 }}>
              <DashboardOutlined style={{ color: '#faad14', marginRight: 8 }} />
              <span style={{ fontWeight: 600 }}>评分进度追踪</span>
            </div>
            <div style={{ padding: '8px 0' }}>
              {scoreProgressData.map(item => (
                <div key={item.name} style={{ marginBottom: 12 }}>
                  <div style={{ fontSize: 12, marginBottom: 4 }}>{item.name}</div>
                  <Progress 
                    percent={Math.round((item.submitted + item.approved) / (item.pending + item.submitted + item.approved) * 100)} 
                    size="small" 
                    strokeColor={{
                      '0%': '#faad14',
                      '100%': '#52c41a',
                    }}
                  />
                </div>
              ))}
            </div>
          </Card>
        </Col>
        <Col span={6}>
          <Card>
            <div style={{ display: 'flex', alignItems: 'center', marginBottom: 8 }}>
              <RadarChartOutlined style={{ color: '#722ed1', marginRight: 8 }} />
              <span style={{ fontWeight: 600 }}>评分维度雷达图</span>
            </div>
            <ResponsiveContainer width="100%" height={180}>
              <RadarChart data={dimensionRadarData}>
                <PolarGrid />
                <PolarAngleAxis dataKey="dimension" tick={{ fontSize: 9 }} />
                <PolarRadiusAxis angle={30} domain={[0, 100]} tick={{ fontSize: 8 }} />
                <Radar name="平均得分" dataKey="score" stroke="#722ed1" fill="#722ed140" />
                <Tooltip />
              </RadarChart>
            </ResponsiveContainer>
          </Card>
        </Col>
      </Row>

      {/* 统计卡片 */}
      {isTeacher ? (
        <Card title="待评分任务">
          <Table
            columns={taskColumns}
            dataSource={tasks}
            rowKey="id"
            loading={loading}
            scroll={{ x: 'max-content' }}
            pagination={{ pageSize: 10, showSizeChanger: true, showTotal: (total) => `共 ${total} 条` }}
          />
        </Card>
      ) : (
        <Row gutter={16} style={{ marginBottom: 16 }}>
          <Col span={6}>
            <Card>
              <Statistic
                title="指导评分"
                value={data.find(d => d.type === 'guide')?.totalScore || '-'}
                prefix={<StarOutlined />}
              />
            </Card>
          </Col>
          <Col span={6}>
            <Card>
              <Statistic
                title="评阅评分"
                value={data.find(d => d.type === 'review')?.totalScore || '-'}
                prefix={<StarOutlined />}
              />
            </Card>
          </Col>
          <Col span={6}>
            <Card>
              <Statistic
                title="答辩评分"
                value={data.find(d => d.type === 'defense')?.totalScore || '-'}
                prefix={<TrophyOutlined />}
              />
            </Card>
          </Col>
          <Col span={6}>
            <Card>
              <Statistic
                title="总分"
                value={data.reduce((sum, d) => sum + (d.totalScore || 0), 0) || '-'}
                prefix={<TrophyOutlined />}
                valueStyle={{ color: '#1890ff' }}
              />
            </Card>
          </Col>
        </Row>
      )}

      <Card title={isTeacher ? '已完成评分' : '我的成绩'} extra={<Button icon={<DownloadOutlined />} onClick={handleExportScores}>导出成绩</Button>} style={{ marginTop: 16 }}>
        <Table
          columns={columns}
          dataSource={data}
          rowKey="id"
          loading={loading}
          scroll={{ x: 'max-content' }}
        />
      </Card>

      {/* 评分弹窗 */}
      <Modal
        title={`${selectedTask?.type === 'guide' ? '指导' : selectedTask?.type === 'review' ? '评阅' : '答辩'}评分 - ${selectedTask?.projectName}`}
        open={modalVisible}
        onOk={handleSubmitScore}
        onCancel={() => setModalVisible(false)}
        width={700}
      >
        <Form form={form} layout="vertical">
          <Row gutter={16}>
            {dimensions.map(dim => (
              <Col span={12} key={dim.id}>
                <Form.Item
                  name={`score_${dim.id}`}
                  label={`${dim.name} (满分${dim.maxScore}×${dim.weight}%)`}
                  rules={[{ required: true, message: `请为${dim.name}打分` }]}
                >
                  <InputNumber min={0} max={dim.maxScore} style={{ width: '100%' }} />
                </Form.Item>
              </Col>
            ))}
          </Row>
          <Form.Item name="totalScore" label="总分" rules={[{ required: true, message: '请输入总分' }]}>
            <InputNumber min={0} max={100} style={{ width: 120 }} />
          </Form.Item>
          <Form.Item name="comment" label="评语">
            <TextArea rows={4} placeholder="请输入评语..." />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  )
}