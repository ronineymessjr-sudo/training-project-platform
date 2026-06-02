import { Card, Table, Tag, Button, Space, Modal, Form, Input, Select, Upload, message, Popconfirm } from 'antd'
import { PlusOutlined, UploadOutlined, DownloadOutlined, DeleteOutlined, TeamOutlined, UserOutlined, EditOutlined } from '@ant-design/icons'
import type { ColumnsType } from 'antd/es/table'
import type { UploadProps } from 'antd'
import { useState, useEffect } from 'react'
import { getClassList, createClass, deleteClass, importStudents, downloadImportTemplate, getMajorList, getClassStudents, assignStudentsToClass } from '../../api/class'
import { exportStudentList } from '../../api/export'


const { TextArea } = Input

interface ClassRecord {
  id: number
  name: string
  majorId: number
  majorName: string
  grade: number
  studentCount: number
  teacherId?: number
  teacherName?: string
  createdAt: string
}

export default function ClassManagement() {
  const [data, setData] = useState<ClassRecord[]>([])
  const [majors, setMajors] = useState<Array<{ id: number; name: string }>>([])
  const [loading, setLoading] = useState(false)
  const [pagination, setPagination] = useState({ current: 1, pageSize: 10, total: 0 })
  const [modalVisible, setModalVisible] = useState(false)
  const [detailVisible, setDetailVisible] = useState(false)
  const [selectedClass, setSelectedClass] = useState<ClassRecord | null>(null)
  const [classStudents, setClassStudents] = useState<Array<{ id: number; name: string; username: string }>>([])
  const [searchText, setSearchText] = useState('')
  const [form] = Form.useForm()

  const handleExportStudents = async () => {
    try {
      message.loading({ content: '正在导出...', key: 'export' })
      await exportStudentList()
      message.success({ content: '导出成功', key: 'export' })
    } catch (error: any) {
      message.error({ content: error?.message || '导出失败', key: 'export' })
    }
  }

  const fetchData = async () => {
    setLoading(true)
    try {
      const res = await getClassList({ page: pagination.current, pageSize: pagination.pageSize })
      if (res.data && res.data.list) {
        setData(res.data.list as ClassRecord[])
        setPagination(p => ({ ...p, total: res.data.total }))
      }
    } catch (error) {
      message.error('获取班级数据失败')
    } finally {
      setLoading(false)
    }
  }

  const fetchMajors = async () => {
    try {
      const res = await getMajorList()
      if (res.data) {
        setMajors(res.data.map(m => ({ id: m.id, name: m.name })))
      }
    } catch (error) {
      message.error('获取专业列表失败')
    }
  }

  useEffect(() => {
    fetchData()
    fetchMajors()
  }, [pagination.current, pagination.pageSize])

  const handleCreate = async () => {
    try {
      await form.validateFields()
      const values = form.getFieldsValue()
      await createClass(values)
      message.success('创建成功')
      setModalVisible(false)
      form.resetFields()
      fetchData()
    } catch (error) {
      message.error('创建失败')
    }
  }

  const handleDelete = async (id: number) => {
    try {
      await deleteClass(id)
      message.success('删除成功')
      fetchData()
    } catch (error) {
      message.error('删除失败')
    }
  }

  const handleImport = async (file: File) => {
    const formData = new FormData()
    formData.append('file', file)
    try {
      const res = await importStudents(formData)
      if (res.data) {
        const result = res.data as any
        message.success(`成功导入 ${result.successCount || 0} 名学生`)
        if (result.failCount > 0) {
          message.warning(`失败 ${result.failCount} 条`)
        }
        fetchData()
      }
    } catch (error) {
      message.error('导入失败')
    }
    return false // 阻止默认上传
  }

  const handleDownloadTemplate = async () => {
    try {
      const blob = await downloadImportTemplate()
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = '学生导入模板.xlsx'
      a.click()
      URL.revokeObjectURL(url)
    } catch (error) {
      message.error('下载模板失败')
    }
  }

  const handleViewStudents = async (record: ClassRecord) => {
    setSelectedClass(record)
    setDetailVisible(true)
    try {
      const res = await getClassStudents(record.id)
      if (res.data) {
        setClassStudents(res.data)
      }
    } catch (error) {
      message.error('获取学生列表失败')
    }
  }

  const columns: ColumnsType<ClassRecord> = [
    {
      title: '班级名称',
      dataIndex: 'name',
      key: 'name',
    },
    {
      title: '专业',
      dataIndex: 'majorName',
      key: 'majorName',
      width: 150,
    },
    {
      title: '年级',
      dataIndex: 'grade',
      key: 'grade',
      width: 80,
      render: (grade: number) => `${grade}级`,
    },
    {
      title: '学生人数',
      dataIndex: 'studentCount',
      key: 'studentCount',
      width: 100,
      render: (count: number) => <Tag color="blue">{count}人</Tag>,
    },
    {
      title: '班主任',
      dataIndex: 'teacherName',
      key: 'teacherName',
      width: 100,
      render: (name: string) => name || '-',
    },
    {
      title: '创建时间',
      dataIndex: 'createdAt',
      key: 'createdAt',
      width: 160,
      render: (time: string) => new Date(time).toLocaleString('zh-CN'),
    },
    {
      title: '操作',
      key: 'action',
      width: 180,
      render: (_, record) => (
        <Space>
          <Button type="link" size="small" icon={<TeamOutlined />} onClick={() => handleViewStudents(record)}>
            学生
          </Button>
          <Button type="link" size="small" icon={<EditOutlined />}>
            编辑
          </Button>
          <Popconfirm
            title="确认删除"
            description="删除后无法恢复，确定要删除吗？"
            onConfirm={() => handleDelete(record.id)}
          >
            <Button type="link" size="small" danger icon={<DeleteOutlined />}>
              删除
            </Button>
          </Popconfirm>
        </Space>
      ),
    },
  ]

  const studentColumns: ColumnsType<{ id: number; name: string; username: string }> = [
    {
      title: '学号',
      dataIndex: 'username',
      key: 'username',
    },
    {
      title: '姓名',
      dataIndex: 'name',
      key: 'name',
    },
  ]

  return (
    <div>
      <Card
        title="班级管理"
        extra={
          <Space>
            <Input.Search
              placeholder="搜索班级名称"
              allowClear
              style={{ width: 250 }}
              onSearch={(val) => setSearchText(val)}
              onChange={(e) => { if (!e.target.value) setSearchText('') }}
            />
            <Button icon={<DownloadOutlined />} onClick={handleDownloadTemplate}>
              下载模板
            </Button>
            <Upload
              accept=".xlsx,.xls"
              showUploadList={false}
              beforeUpload={handleImport}
            >
              <Button icon={<UploadOutlined />}>导入学生</Button>
            </Upload>
            <Button type="primary" icon={<PlusOutlined />} onClick={() => setModalVisible(true)}>
              新建班级
            </Button>
          </Space>
        }
      >
        <Table
          columns={columns}
          dataSource={searchText ? data.filter(d => d.name.includes(searchText)) : data}
          rowKey="id"
          loading={loading}
          scroll={{ x: 'max-content' }}
          pagination={{
            ...pagination,
            showSizeChanger: true,
            showQuickJumper: true,
            showTotal: (total) => `共 ${total} 条`,
            onChange: (page, pageSize) => setPagination({ current: page, pageSize, total: pagination.total }),
          }}
        />
      </Card>

      {/* 创建班级弹窗 */}
      <Modal
        title="新建班级"
        open={modalVisible}
        onOk={handleCreate}
        onCancel={() => {
          setModalVisible(false)
          form.resetFields()
        }}
      >
        <Form form={form} layout="vertical">
          <Form.Item name="name" label="班级名称" rules={[{ required: true, message: '请输入班级名称' }]}>
            <Input placeholder="如：软件2021级1班" />
          </Form.Item>
          <Form.Item name="majorId" label="所属专业" rules={[{ required: true, message: '请选择专业' }]}>
            <Select placeholder="请选择专业" options={majors} />
          </Form.Item>
          <Form.Item name="grade" label="年级" rules={[{ required: true, message: '请输入年级' }]}>
            <Select placeholder="请选择年级">
              {[2020, 2021, 2022, 2023, 2024].map(y => (
                <Select.Option key={y} value={y}>{y}级</Select.Option>
              ))}
            </Select>
          </Form.Item>
        </Form>
      </Modal>

      {/* 班级详情抽屉 */}
      <Modal
        title={`${selectedClass?.name} - 学生列表`}
        open={detailVisible}
        onCancel={() => setDetailVisible(false)}
        footer={null}
        width={600}
      >
        <Table
          columns={studentColumns}
          dataSource={classStudents}
          rowKey="id"
          pagination={{ pageSize: 10 }}
        />
      </Modal>
    </div>
  )
}
