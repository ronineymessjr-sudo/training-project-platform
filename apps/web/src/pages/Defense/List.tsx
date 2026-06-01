import { Card, Table, Tag, Button, Space, Modal, Form, Input, Select, DatePicker, InputNumber, message, Timeline, Badge, Descriptions } from 'antd'
import { VideoCameraOutlined, PlayCircleOutlined, StopOutlined, UserOutlined, ClockCircleOutlined, CheckCircleOutlined } from '@ant-design/icons'
import type { ColumnsType } from 'antd/es/table'
import { useState, useEffect } from 'react'
import { getDefenseList, getDefenseSchedule, startDefense, endDefense, submitDefenseScore, getMyDefense } from '../../api/defense'
import { useAuthStore } from '../../stores/auth.store'
import dayjs from 'dayjs'

const { TextArea } = Input

interface DefenseRecord {
  id: number
  projectId: number
  projectName: string
  studentName: string
  scheduledAt: string
  duration: number
  classroom: string
  status: 'scheduled' | 'in_progress' | 'completed' | 'cancelled'
  committeeMembers: string[]
  scores?: Array<{ scorerName: string; totalScore: number }>
}

interface DefenseTask {
  id: number
  projectId: number
  projectName: string
  teamName: string
  scheduledAt: string
  duration: number
  classroom: string
  status: string
  myRole: 'committee' | 'chairman'
}

export default function DefenseList() {
  const [data, setData] = useState<DefenseRecord[]>([])
  const [myDefense, setMyDefense] = useState<DefenseRecord | null>(null)
  const [schedule, setSchedule] = useState<DefenseRecord[]>([])
  const [loading, setLoading] = useState(false)
  const [scoreModalVisible, setScoreModalVisible] = useState(false)
  const [selectedDefense, setSelectedDefense] = useState<DefenseRecord | null>(null)
  const [form] = Form.useForm()
  const { user } = useAuthStore()

  const isStudent = user?.role === 'student'
  const isTeacher = user?.role === 'teacher' || user?.role === 'admin'

  const fetchData = async () => {
    setLoading(true)
    try {
      if (isStudent) {
        const res = await getMyDefense()
        if (res.data) {
          const d = res.data as any
          setMyDefense({
            id: d.id,
            projectId: d.projectId,
            projectName: d.projectName || '',
            studentName: d.studentName || '',
            scheduledAt: d.scheduledAt || d.defenseTime,
            duration: d.duration || 30,
            classroom: d.classroom || d.location || '',
            status: d.status || 'scheduled',
            committeeMembers: d.committeeMembers || [],
          })
        }
      } else {
        const res = await getDefenseList()
        if (res.data && res.data.list) {
          setData((res.data.list as any[]).map(d => ({
            id: d.id,
            projectId: d.projectId,
            projectName: d.projectName || '',
            studentName: d.studentName || '',
            scheduledAt: d.scheduledAt || d.defenseTime,
            duration: d.duration || 30,
            classroom: d.classroom || d.location || '',
            status: d.status || 'scheduled',
            committeeMembers: d.committeeMembers || [],
          })))
        }
      }
    } catch (error) {
      message.error('获取答辩数据失败')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchData()
  }, [])

  const handleStartDefense = async (id: number) => {
    try {
      await startDefense(id)
      message.success('答辩已开始')
      fetchData()
    } catch (error) {
      message.error('操作失败')
    }
  }

  const handleEndDefense = async (id: number) => {
    try {
      await endDefense(id)
      message.success('答辩已结束')
      fetchData()
    } catch (error) {
      message.error('操作失败')
    }
  }

  const handleSubmitScore = async () => {
    if (!selectedDefense) return
    try {
      await form.validateFields()
      const values = form.getFieldsValue()
      await submitDefenseScore({
        defenseId: selectedDefense.id,
        projectId: selectedDefense.projectId,
        dimensionScores: [
          { dimensionId: 1, score: values.presentationScore, comment: values.presentationComment },
          { dimensionId: 2, score: values.answerScore, comment: values.answerComment },
        ],
        totalScore: values.totalScore,
        presentationScore: values.presentationScore,
        answerScore: values.answerScore,
        overallComment: values.overallComment,
      })
      message.success('评分提交成功')
      setScoreModalVisible(false)
      form.resetFields()
      fetchData()
    } catch (error) {
      message.error('评分提交失败')
    }
  }

  const columns: ColumnsType<DefenseRecord> = [
    {
      title: '项目名称',
      dataIndex: 'projectName',
      key: 'projectName',
      width: 180,
      ellipsis: true,
    },
    {
      title: '答辩学生',
      dataIndex: 'studentName',
      key: 'studentName',
      width: 100,
    },
    {
      title: '答辩时间',
      dataIndex: 'scheduledAt',
      key: 'scheduledAt',
      width: 160,
      render: (time: string) => dayjs(time).format('YYYY-MM-DD HH:mm'),
    },
    {
      title: '时长',
      dataIndex: 'duration',
      key: 'duration',
      width: 80,
      render: (min: number) => `${min}分钟`,
    },
    {
      title: '地点',
      dataIndex: 'classroom',
      key: 'classroom',
      width: 100,
    },
    {
      title: '状态',
      dataIndex: 'status',
      key: 'status',
      width: 100,
      render: (status: string) => {
        const map: Record<string, { color: string; text: string; status: 'success' | 'processing' | 'default' | 'error' }> = {
          scheduled: { color: 'blue', text: '待答辩', status: 'default' },
          in_progress: { color: 'green', text: '进行中', status: 'processing' },
          completed: { color: 'success', text: '已完成', status: 'success' },
          cancelled: { color: 'red', text: '已取消', status: 'error' },
        }
        const item = map[status] || map.scheduled
        return <Badge status={item.status} text={item.text} />
      },
    },
    {
      title: '评委',
      dataIndex: 'committeeMembers',
      key: 'committeeMembers',
      width: 150,
      render: (members: string[]) => members?.map(m => <Tag key={m}>{m}</Tag>) || '-',
    },
    {
      title: '操作',
      key: 'action',
      width: 200,
      render: (_, record) => (
        <Space>
          {isTeacher && record.status === 'scheduled' && (
            <Button type="primary" size="small" icon={<PlayCircleOutlined />} onClick={() => handleStartDefense(record.id)}>
              开始
            </Button>
          )}
          {isTeacher && record.status === 'in_progress' && (
            <Button size="small" icon={<StopOutlined />} onClick={() => handleEndDefense(record.id)}>
              结束
            </Button>
          )}
          {isTeacher && record.status !== 'completed' && record.status !== 'cancelled' && (
            <Button type="link" size="small" onClick={() => {
              setSelectedDefense(record)
              setScoreModalVisible(true)
            }}>
              评分
            </Button>
          )}
        </Space>
      ),
    },
  ]

  return (
    <div>
      {isStudent && myDefense ? (
        <Card title="我的答辩">
          <Descriptions bordered column={2}>
            <Descriptions.Item label="项目名称">{myDefense.projectName}</Descriptions.Item>
            <Descriptions.Item label="答辩时间">
              {dayjs(myDefense.scheduledAt).format('YYYY-MM-DD HH:mm')}
            </Descriptions.Item>
            <Descriptions.Item label="答辩地点">{myDefense.classroom}</Descriptions.Item>
            <Descriptions.Item label="预计时长">{myDefense.duration}分钟</Descriptions.Item>
            <Descriptions.Item label="状态">
              <Tag color={
                myDefense.status === 'completed' ? 'success' :
                myDefense.status === 'in_progress' ? 'processing' : 'default'
              }>
                {myDefense.status === 'scheduled' ? '待答辩' :
                 myDefense.status === 'in_progress' ? '进行中' :
                 myDefense.status === 'completed' ? '已完成' : '已取消'}
              </Tag>
            </Descriptions.Item>
            <Descriptions.Item label="评委">
              {myDefense.committeeMembers?.map(m => <Tag key={m}>{m}</Tag>)}
            </Descriptions.Item>
          </Descriptions>
        </Card>
      ) : (
        <Card title="答辩安排">
          <Table
            columns={columns}
            dataSource={data}
            rowKey="id"
            loading={loading}
          />
        </Card>
      )}

      {/* 答辩日程时间线 */}
      {isTeacher && (
        <Card title="今日答辩日程" style={{ marginTop: 16 }}>
          <Timeline
            items={data.filter(d => dayjs(d.scheduledAt).isSame(dayjs(), 'day')).map(d => ({
              color: d.status === 'completed' ? 'green' : d.status === 'in_progress' ? 'blue' : 'gray',
              children: (
                <div>
                  <strong>{d.projectName}</strong>
                  <br />
                  <Space>
                    <span><ClockCircleOutlined /> {dayjs(d.scheduledAt).format('HH:mm')}</span>
                    <span>{d.classroom}</span>
                    <Tag>{d.studentName}</Tag>
                  </Space>
                </div>
              ),
            }))}
          />
        </Card>
      )}

      {/* 评分弹窗 */}
      <Modal
        title="答辩评分"
        open={scoreModalVisible}
        onOk={handleSubmitScore}
        onCancel={() => setScoreModalVisible(false)}
        width={600}
      >
        <Form form={form} layout="vertical">
          <Descriptions column={2}>
            <Descriptions.Item label="项目">{selectedDefense?.projectName}</Descriptions.Item>
            <Descriptions.Item label="学生">{selectedDefense?.studentName}</Descriptions.Item>
          </Descriptions>
          
          <Form.Item name="presentationScore" label="答辩陈述得分 (40分)" rules={[{ required: true }]}>
            <InputNumber min={0} max={40} style={{ width: 120 }} />
          </Form.Item>
          <Form.Item name="presentationComment" label="陈述评语">
            <Input placeholder="简要评语" />
          </Form.Item>
          
          <Form.Item name="answerScore" label="问答表现得分 (40分)" rules={[{ required: true }]}>
            <InputNumber min={0} max={40} style={{ width: 120 }} />
          </Form.Item>
          <Form.Item name="answerComment" label="问答评语">
            <Input placeholder="简要评语" />
          </Form.Item>
          
          <Form.Item name="totalScore" label="总分 (100分)" rules={[{ required: true }]}>
            <InputNumber min={0} max={100} style={{ width: 120 }} />
          </Form.Item>
          
          <Form.Item name="overallComment" label="综合评语">
            <TextArea rows={4} placeholder="请输入综合评语..." />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  )
}
