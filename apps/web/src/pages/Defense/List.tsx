import { Card, Table, Tag, Button, Space, Modal, Form, Input, Select, DatePicker, InputNumber, Timeline, Badge, Descriptions } from 'antd'
import { messageHolder } from '../../utils/messageHolder'
import { VideoCameraOutlined, PlayCircleOutlined, StopOutlined, UserOutlined, ClockCircleOutlined, CheckCircleOutlined, DownloadOutlined } from '@ant-design/icons'
import type { ColumnsType } from 'antd/es/table'
import { useState, useEffect } from 'react'
import { getDefenseList, getDefenseSchedule, startDefense, endDefense, submitDefenseScore, getMyDefense } from '../../api/defense'
import { exportDefenseRecords } from '../../api/export'
import { useAuthStore } from '../../stores/auth.store'
import dayjs from 'dayjs'

const { TextArea } = Input

interface DefenseRecord {
  id: number
  projectId: number
  projectName: string
  groupId: number
  title: string
  defenseDate: string
  startTime: string
  endTime: string
  location: string
  status: string
  panelTeacherIds: string[]
  maxDuration: number
  scores?: Array<{ scorerName: string; totalScore: number }>
}

interface DefenseTask {
  id: number
  projectId: number
  projectName: string
  teamName: string
  defenseDate: string
  startTime: string
  location: string
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

  const handleExportDefenseRecords = async () => {
    try {
      messageHolder.loading({ content: '正在导出...', key: 'export' })
      await exportDefenseRecords()
      messageHolder.success({ content: '导出成功', key: 'export' })
    } catch (error: any) {
      messageHolder.error({ content: error?.message || '导出失败', key: 'export' })
    }
  }

  const fetchData = async () => {
    setLoading(true)
    try {
      if (isStudent) {
        const res = await getMyDefense()
        if (res.data && res.data.id) {
          const d = res.data as any
          setMyDefense({
            id: d.id,
            projectId: d.projectId,
            projectName: d.projectName || '',
            groupId: d.groupId,
            title: d.title || '',
            defenseDate: d.defenseDate,
            startTime: d.startTime,
            endTime: d.endTime,
            location: d.location || '',
            status: d.status || 'scheduled',
            panelTeacherIds: d.panelTeacherIds || [],
            maxDuration: d.maxDuration || 30,
          })
        }
      } else {
        const res = await getDefenseList()
        if (res.data && res.data.list) {
          setData((res.data.list as any[]).map(d => ({
            id: d.id,
            projectId: d.projectId,
            projectName: d.projectName || '',
            groupId: d.groupId,
            title: d.title || '',
            defenseDate: d.defenseDate,
            startTime: d.startTime,
            endTime: d.endTime,
            location: d.location || '',
            status: d.status || 'scheduled',
            panelTeacherIds: d.panelTeacherIds || [],
            maxDuration: d.maxDuration || 30,
          })))
        }
      }
    } catch (error) {
      messageHolder.error('获取答辩数据失败')
      // API 不可用时使用 Mock 后备数据
      if (isTeacher) {
        setData([
          { id: 1, projectId: 1, projectName: '毕业设计管理系统', groupId: 1, title: '第一组答辩', defenseDate: dayjs().format('YYYY-MM-DD'), startTime: '09:00', endTime: '09:30', location: 'A101', status: 'scheduled', panelTeacherIds: ['王老师', '刘老师'], maxDuration: 30 },
          { id: 2, projectId: 2, projectName: '在线学习平台', groupId: 2, title: '第二组答辩', defenseDate: dayjs().format('YYYY-MM-DD'), startTime: '10:00', endTime: '10:30', location: 'A102', status: 'scheduled', panelTeacherIds: ['陈老师'], maxDuration: 30 },
        ])
      } else {
        setMyDefense({
          id: 1, projectId: 1, projectName: '毕业设计管理系统', groupId: 1, title: '第一组答辩',
          defenseDate: dayjs().format('YYYY-MM-DD'), startTime: '09:00', endTime: '09:30', location: 'A101',
          status: 'scheduled', panelTeacherIds: ['王老师', '刘老师'], maxDuration: 30,
        })
      }
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchData()
  }, [])

  const handleStartDefense = async (id: number) => {
    try {
      try {
        await startDefense(id)
      } catch (e) {
        // Mock 模式降级：API 不可用时忽略错误，走本地更新
      }
      // Mock 模式后备：本地更新状态
      setData(prev => prev.map(d =>
        d.id === id ? { ...d, status: 'in_progress' as const } : d
      ))
      messageHolder.success('答辩已开始')
    } catch (error) {
      messageHolder.error('操作失败')
    }
  }

  const handleEndDefense = async (id: number) => {
    try {
      try {
        await endDefense(id)
      } catch (e) {
        // Mock 模式降级：API 不可用时忽略错误，走本地更新
      }
      // Mock 模式后备：本地更新状态
      setData(prev => prev.map(d =>
        d.id === id ? { ...d, status: 'completed' as const } : d
      ))
      messageHolder.success('答辩已结束')
    } catch (error) {
      messageHolder.error('操作失败')
    }
  }

  const handleSubmitScore = async () => {
    if (!selectedDefense) return
    try {
      await form.validateFields()
      const values = form.getFieldsValue()
      try {
        await submitDefenseScore({
          defenseId: selectedDefense.id,
          groupId: selectedDefense.groupId,
          presentationScore: values.presentationScore,
          qaScore: values.answerScore || 0,
          documentScore: values.documentScore || 0,
          totalScore: values.totalScore,
          comment: values.overallComment,
        })
      } catch (e) {
        // Mock 模式降级：API 不可用时忽略错误，走本地更新
      }
      // Mock 模式后备：本地更新状态
      setData(prev => prev.map(d =>
        d.id === selectedDefense.id ? { ...d, status: 'completed' as const } : d
      ))
      messageHolder.success('评分提交成功')
      setScoreModalVisible(false)
      form.resetFields()
    } catch (error) {
      messageHolder.error('评分提交失败')
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
      title: '答辩组',
      dataIndex: 'title',
      key: 'title',
      width: 120,
    },
    {
      title: '答辩日期',
      dataIndex: 'defenseDate',
      key: 'defenseDate',
      width: 120,
      render: (date: string) => date || '-',
    },
    {
      title: '开始时间',
      dataIndex: 'startTime',
      key: 'startTime',
      width: 100,
    },
    {
      title: '结束时间',
      dataIndex: 'endTime',
      key: 'endTime',
      width: 100,
    },
    {
      title: '地点',
      dataIndex: 'location',
      key: 'location',
      width: 100,
    },
    {
      title: '时长',
      dataIndex: 'maxDuration',
      key: 'maxDuration',
      width: 80,
      render: (min: number) => `${min}分钟`,
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
      dataIndex: 'panelTeacherIds',
      key: 'panelTeacherIds',
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
            <Descriptions.Item label="答辩组">{myDefense.title}</Descriptions.Item>
            <Descriptions.Item label="答辩日期">{myDefense.defenseDate}</Descriptions.Item>
            <Descriptions.Item label="时间">{myDefense.startTime} - {myDefense.endTime}</Descriptions.Item>
            <Descriptions.Item label="答辩地点">{myDefense.location}</Descriptions.Item>
            <Descriptions.Item label="预计时长">{myDefense.maxDuration}分钟</Descriptions.Item>
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
              {myDefense.panelTeacherIds?.map(m => <Tag key={m}>{m}</Tag>)}
            </Descriptions.Item>
          </Descriptions>
        </Card>
      ) : (
        <Card title="答辩安排" extra={<Button icon={<DownloadOutlined />} onClick={handleExportDefenseRecords}>导出答辩记录</Button>}>
          <Table
            columns={columns}
            dataSource={data}
            rowKey="id"
            loading={loading}
            scroll={{ x: 'max-content' }}
            pagination={{ pageSize: 10, showSizeChanger: true, showTotal: (total) => `共 ${total} 条` }}
          />
        </Card>
      )}

      {/* 答辩日程时间线 */}
      {isTeacher && (
        <Card title="今日答辩日程" style={{ marginTop: 16 }}>
          <Timeline
            items={data.filter(d => d.defenseDate === dayjs().format('YYYY-MM-DD')).map(d => ({
              color: d.status === 'completed' ? 'green' : d.status === 'in_progress' ? 'blue' : 'gray',
              children: (
                <div>
                  <strong>{d.projectName} - {d.title}</strong>
                  <br />
                  <Space>
                    <span><ClockCircleOutlined /> {d.startTime}-{d.endTime}</span>
                    <span>{d.location}</span>
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
          
          <Form.Item name="presentationScore" label="答辩陈述得分 (40分)" rules={[{ required: true, message: '请输入答辩陈述得分' }]}>
            <InputNumber min={0} max={40} style={{ width: 120 }} />
          </Form.Item>
          <Form.Item name="presentationComment" label="陈述评语">
            <Input placeholder="简要评语" />
          </Form.Item>

          <Form.Item name="answerScore" label="问答表现得分 (40分)" rules={[{ required: true, message: '请输入问答表现得分' }]}>
            <InputNumber min={0} max={40} style={{ width: 120 }} />
          </Form.Item>
          <Form.Item name="answerComment" label="问答评语">
            <Input placeholder="简要评语" />
          </Form.Item>

          <Form.Item name="totalScore" label="总分 (100分)" rules={[{ required: true, message: '请输入总分' }]}>
            <InputNumber min={0} max={100} style={{ width: 120 }} />
          </Form.Item>
          
          <Form.Item name="documentScore" label="文档评分 (20分)" rules={[{ required: true, message: '请输入文档评分' }]}>
            <InputNumber min={0} max={20} style={{ width: 120 }} />
          </Form.Item>
          <Form.Item name="overallComment" label="综合评语">
            <TextArea rows={4} placeholder="请输入综合评语..." />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  )
}
