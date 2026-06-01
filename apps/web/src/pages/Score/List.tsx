import { Card, Table, Tag, Button, Space, Modal, Form, Input, InputNumber, Rate, Select, message, Progress, Statistic, Row, Col } from 'antd'
import { TrophyOutlined, StarOutlined, CheckCircleOutlined, ClockCircleOutlined } from '@ant-design/icons'
import type { ColumnsType } from 'antd/es/table'
import { useState, useEffect } from 'react'
import { getProjectScores, submitGuideScore, submitReviewScore, getScoreConfig, getMyScoreTasks } from '../../api/score'
import { useAuthStore } from '../../stores/auth.store'
import dayjs from 'dayjs'

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
        // 学生查看成绩
        const res = await getProjectScores(user?.id || 0)
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
    } catch (error) {
      message.error('获取评分数据失败')
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
    } catch (error) {
      console.error('获取评分配置失败', error)
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
      const data = {
        projectId: selectedTask.projectId,
        dimensionScores: dimensions.map(d => ({
          dimensionId: d.id,
          score: values[`score_${d.id}`],
          comment: values[`comment_${d.id}`],
        })),
        totalScore: values.totalScore,
        comment: values.comment,
      }
      
      if (selectedTask.type === 'guide') {
        await submitGuideScore(data)
      } else if (selectedTask.type === 'review') {
        await submitReviewScore(data)
      }
      
      message.success('评分提交成功')
      setModalVisible(false)
      fetchData()
    } catch (error) {
      message.error('评分提交失败')
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
      {isTeacher ? (
        <Card title="待评分任务">
          <Table
            columns={taskColumns}
            dataSource={tasks}
            rowKey="id"
            loading={loading}
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

      <Card title={isTeacher ? '已完成评分' : '我的成绩'} style={{ marginTop: 16 }}>
        <Table
          columns={columns}
          dataSource={data}
          rowKey="id"
          loading={loading}
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
          <Form.Item name="totalScore" label="总分" rules={[{ required: true }]}>
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
