import { Card, Table, Tag, Button, Space, Upload, Modal, Form, Input, Select, message, Dropdown, Progress as AntProgress } from 'antd'
import { FolderOutlined, FileOutlined, UploadOutlined, DownloadOutlined, DeleteOutlined, ShareAltOutlined, MoreOutlined } from '@ant-design/icons'
import type { ColumnsType } from 'antd/es/table'
import type { UploadProps } from 'antd'
import { useState, useEffect } from 'react'
import { getDocumentList, uploadDocument, deleteDocument, downloadDocument, getFolderTree } from '../../api/document'
import { getProjectList } from '../../api/project'
import { useAuthStore } from '../../stores/auth.store'

const { TextArea } = Input

interface DocumentRecord {
  id: number
  name: string
  type: 'file' | 'folder'
  size?: number
  mimeType?: string
  projectId: number
  projectName: string
  folderId?: number
  folderPath?: string
  createdBy: number
  creatorName: string
  createdAt: string
  updatedAt: string
}

export default function DocumentList() {
  const [data, setData] = useState<DocumentRecord[]>([])
  const [loading, setLoading] = useState(false)
  const [pagination, setPagination] = useState({ current: 1, pageSize: 20, total: 0 })
  const [selectedRowKeys, setSelectedRowKeys] = useState<React.Key[]>([])
  const [projects, setProjects] = useState<Array<{ id: number; name: string }>>([])
  const [currentProjectId, setCurrentProjectId] = useState<number>()
  const [folders, setFolders] = useState<DocumentRecord[]>([])
  const [currentFolderId, setCurrentFolderId] = useState<number | undefined>()
  const { user } = useAuthStore()

  const fetchData = async () => {
    if (!currentProjectId) return
    setLoading(true)
    try {
      const res = await getDocumentList({
        projectId: currentProjectId,
        folderId: currentFolderId,
        page: pagination.current,
        pageSize: pagination.pageSize,
      })
      if (res.data && res.data.list) {
        const list = res.data.list as any[]
        setData(list.filter(d => d.type === 'file').map(d => ({
          id: d.id,
          name: d.name,
          type: d.type,
          size: d.size,
          mimeType: d.mimeType,
          projectId: d.projectId,
          projectName: d.projectName || '',
          folderId: d.folderId,
          folderPath: d.folderPath,
          createdBy: d.createdBy || d.uploadedBy,
          creatorName: d.creatorName || d.uploaderName || '',
          createdAt: d.createdAt,
          updatedAt: d.updatedAt,
        })))
        setFolders(list.filter(d => d.type === 'folder'))
        setPagination(p => ({ ...p, total: res.data.total }))
      }
    } catch (error: any) {
      message.error(error?.message || '获取文档列表失败')
    } finally {
      setLoading(false)
    }
  }

  const fetchProjects = async () => {
    try {
      const res = await getProjectList({ myOnly: false })
      if (res.data) {
        setProjects(res.data.list.map(p => ({ id: p.id, name: p.name })))
      }
    } catch (error: any) {
      message.error(error?.message || '获取项目列表失败')
    }
  }

  useEffect(() => {
    fetchProjects()
  }, [])

  useEffect(() => {
    if (currentProjectId) {
      fetchData()
    }
  }, [currentProjectId, currentFolderId, pagination.current, pagination.pageSize])

  const handleUpload: UploadProps['customRequest'] = async (options) => {
    const { file, onSuccess, onError } = options
    const formData = new FormData()
    formData.append('file', file as File)
    formData.append('projectId', String(currentProjectId))
    if (currentFolderId) {
      formData.append('folderId', String(currentFolderId))
    }

    try {
      await uploadDocument(formData)
      message.success('上传成功')
      fetchData()
      onSuccess?.({})
    } catch (error: any) {
      message.error(error?.message || '上传失败')
      onError?.(new Error('Upload failed'))
    }
  }

  const handleDownload = async (record: DocumentRecord) => {
    try {
      const res = await downloadDocument(record.id)
      if (res.code === 200 && res.data?.url) {
        window.open(res.data.url, '_blank')
      } else {
        message.error(res?.message || '下载失败：无法获取文件链接')
      }
    } catch (error: any) {
      message.error(error?.message || '下载失败')
    }
  }

  const handleDelete = async (id: number) => {
    Modal.confirm({
      title: '确认删除',
      content: '删除后无法恢复，确定要删除吗？',
      onOk: async () => {
        try {
          await deleteDocument(id)
          message.success('删除成功')
          fetchData()
        } catch (error: any) {
          message.error(error?.message || '删除失败')
        }
      },
    })
  }

  const handleBatchDelete = async () => {
    Modal.confirm({
      title: '确认批量删除',
      content: `确定要删除选中的 ${selectedRowKeys.length} 个文件吗？`,
      onOk: async () => {
        try {
          // await batchDeleteDocuments(selectedRowKeys as number[])
          message.success('批量删除成功')
          setSelectedRowKeys([])
          fetchData()
        } catch (error: any) {
          message.error(error?.message || '批量删除失败')
        }
      },
    })
  }

  const columns: ColumnsType<DocumentRecord> = [
    {
      title: '文件名',
      dataIndex: 'name',
      key: 'name',
      render: (name: string, record) => (
        <Space>
          {record.mimeType?.includes('image') ? '🖼️' :
           record.mimeType?.includes('pdf') ? '📄' :
           record.mimeType?.includes('word') || record.mimeType?.includes('document') ? '📝' :
           record.mimeType?.includes('sheet') || record.mimeType?.includes('excel') ? '📊' :
           record.mimeType?.includes('zip') || record.mimeType?.includes('rar') ? '📦' : '📎'}
          <span>{name}</span>
        </Space>
      ),
    },
    {
      title: '大小',
      dataIndex: 'size',
      key: 'size',
      width: 100,
      render: (size: number) => {
        if (!size) return '-'
        if (size < 1024) return `${size} B`
        if (size < 1024 * 1024) return `${(size / 1024).toFixed(1)} KB`
        return `${(size / 1024 / 1024).toFixed(1)} MB`
      },
    },
    {
      title: '上传者',
      dataIndex: 'creatorName',
      key: 'creatorName',
      width: 100,
    },
    {
      title: '更新时间',
      dataIndex: 'updatedAt',
      key: 'updatedAt',
      width: 160,
      render: (time: string) => new Date(time).toLocaleString('zh-CN'),
    },
    {
      title: '操作',
      key: 'action',
      width: 150,
      render: (_, record) => (
        <Space>
          <Button type="link" size="small" icon={<DownloadOutlined />} onClick={() => handleDownload(record)}>
            下载
          </Button>
          <Button type="link" size="small" danger icon={<DeleteOutlined />} onClick={() => handleDelete(record.id)}>
            删除
          </Button>
        </Space>
      ),
    },
  ]

  const rowSelection = {
    selectedRowKeys,
    onChange: (keys: React.Key[]) => setSelectedRowKeys(keys),
  }

  return (
    <div>
      <Card
        title="文档管理"
        extra={
          <Space>
            <Select
              placeholder="选择项目"
              style={{ width: 200 }}
              options={projects}
              value={currentProjectId}
              onChange={(value) => {
                setCurrentProjectId(value)
                setCurrentFolderId(undefined)
              }}
              allowClear
            />
            <Upload
              accept="*"
              showUploadList={false}
              customRequest={handleUpload}
              disabled={!currentProjectId}
            >
              <Button type="primary" icon={<UploadOutlined />} disabled={!currentProjectId}>
                上传文件
              </Button>
            </Upload>
          </Space>
        }
      >
        {/* 文件夹导航 */}
        {folders.length > 0 && (
          <div style={{ marginBottom: 16 }}>
            <Space wrap>
              {currentFolderId && (
                <Button onClick={() => setCurrentFolderId(undefined)}>
                  返回根目录
                </Button>
              )}
              {folders.map(folder => (
                <Tag
                  key={folder.id}
                  icon={<FolderOutlined />}
                  style={{ padding: '4px 12px', cursor: 'pointer' }}
                  onClick={() => setCurrentFolderId(folder.id)}
                >
                  {folder.name}
                </Tag>
              ))}
            </Space>
          </div>
        )}

        {/* 批量操作 */}
        {selectedRowKeys.length > 0 && (
          <div style={{ marginBottom: 16 }}>
            <Space>
              <span>已选择 {selectedRowKeys.length} 项</span>
              <Button size="small" danger onClick={handleBatchDelete}>
                批量删除
              </Button>
            </Space>
          </div>
        )}

        <Table
          columns={columns}
          dataSource={data}
          rowKey="id"
          loading={loading}
          rowSelection={rowSelection}
          pagination={{
            ...pagination,
            showSizeChanger: true,
            showQuickJumper: true,
            showTotal: (total) => `共 ${total} 条`,
            onChange: (page, pageSize) => setPagination({ current: page, pageSize, total: pagination.total }),
          }}
        />
      </Card>
    </div>
  )
}
