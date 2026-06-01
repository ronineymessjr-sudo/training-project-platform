import { supabase } from '../lib/supabase'
import { fromSupabase } from '../utils/request'

// API 响应类型
interface ApiResponse<T> {
  code: number
  data: T
  message?: string
}

// 文档
interface Document {
  id: number
  name: string
  type: string
  size: number
  folderId?: number
  projectId: number
  uploadedBy: number
  uploaderName?: string
  version: number
  createdAt: string
  updatedAt: string
}

// 文档上传结果
interface DocumentUpload {
  id: number
  name: string
  url: string
  size: number
  type: string
}

// 文件夹树
interface FolderTree {
  id: number
  name: string
  parentId?: number
  projectId: number
  children?: FolderTree[]
  documents?: Document[]
  createdAt?: string
}

// 获取文档列表
export const getDocumentList = async (params?: {
  projectId?: number
  folderId?: number
  type?: string
  page?: number
  pageSize?: number
}): Promise<ApiResponse<{ list: Document[]; total: number }>> => {
  let query = supabase
    .from('documents')
    .select('*', { count: 'exact' })

  if (params?.projectId) {
    query = query.eq('project_id', params.projectId)
  }
  if (params?.folderId) {
    query = query.eq('folder_id', params.folderId)
  }
  if (params?.type) {
    query = query.eq('type', params.type)
  }

  const page = params?.page || 1
  const pageSize = params?.pageSize || 10
  const from = (page - 1) * pageSize
  const to = from + pageSize - 1

  query = query.range(from, to).order('created_at', { ascending: false })

  const result = await query
  const response = fromSupabase(result)

  if (response.code === 200) {
    response.data = {
      list: result.data || [],
      total: result.count || 0,
    }
  }

  return response
}

// 获取文档详情
export const getDocumentDetail = async (id: number): Promise<ApiResponse<Document>> => {
  const result = await supabase
    .from('documents')
    .select('*')
    .eq('id', id)
    .single()

  return fromSupabase(result)
}

// 上传文档
export const uploadDocument = async (data: FormData): Promise<ApiResponse<DocumentUpload>> => {
  const file = data.get('file') as File
  const projectId = data.get('project_id') as string
  const folderId = data.get('folder_id') as string

  if (!file) {
    return { code: 400, message: '请选择文件', data: null as any }
  }

  // 上传文件到 Supabase Storage
  const fileExt = file.name.split('.').pop()
  const fileName = `${Date.now()}_${Math.random().toString(36).substring(2)}.${fileExt}`
  const filePath = `projects/${projectId}/${fileName}`

  const { data: uploadData, error: uploadError } = await supabase.storage
    .from('documents')
    .upload(filePath, file)

  if (uploadError) {
    return {
      code: 500,
      message: uploadError.message,
      data: null as any,
    }
  }

  // 获取公开 URL
  const { data: urlData } = supabase.storage
    .from('documents')
    .getPublicUrl(filePath)

  // 获取当前用户
  const { data: { user } } = await supabase.auth.getUser()

  // 插入 documents 表记录
  const result = await supabase
    .from('documents')
    .insert({
      name: file.name,
      type: fileExt || '',
      size: file.size,
      folder_id: folderId ? parseInt(folderId) : null,
      project_id: projectId ? parseInt(projectId) : null,
      uploaded_by: user?.id,
      url: urlData.publicUrl,
      version: 1,
    })
    .select()
    .single()

  if (result.error) {
    return {
      code: 500,
      message: result.error.message,
      data: null as any,
    }
  }

  return {
    code: 200,
    message: 'success',
    data: {
      id: result.data.id,
      name: result.data.name,
      url: result.data.url,
      size: result.data.size,
      type: result.data.type,
    },
  }
}

// 创建文件夹
export const createFolder = async (data: {
  name: string
  parentId?: number
  projectId: number
}): Promise<ApiResponse<FolderTree>> => {
  const result = await supabase
    .from('folders')
    .insert({
      name: data.name,
      parent_id: data.parentId || null,
      project_id: data.projectId,
    })
    .select()
    .single()

  return fromSupabase(result)
}

// 更新文档信息
export const updateDocument = async (
  id: number,
  data: Partial<Document>
): Promise<ApiResponse<Document>> => {
  const updateData: any = {}
  if (data.name !== undefined) updateData.name = data.name
  if (data.folderId !== undefined) updateData.folder_id = data.folderId

  const result = await supabase
    .from('documents')
    .update(updateData)
    .eq('id', id)
    .select()
    .single()

  return fromSupabase(result)
}

// 移动文档
export const moveDocument = async (
  id: number,
  targetFolderId: number
): Promise<ApiResponse<void>> => {
  const result = await supabase
    .from('documents')
    .update({ folder_id: targetFolderId })
    .eq('id', id)

  return fromSupabase(result)
}

// 删除文档
export const deleteDocument = async (id: number): Promise<ApiResponse<void>> => {
  // 先获取文档信息以删除存储中的文件
  const { data: doc } = await supabase
    .from('documents')
    .select('url')
    .eq('id', id)
    .single()

  // 从存储中删除文件
  if (doc?.url) {
    try {
      const urlParts = new URL(doc.url).pathname.split('/')
      const storagePath = urlParts.slice(urlParts.indexOf('documents') + 1).join('/')
      await supabase.storage.from('documents').remove([storagePath])
    } catch {
      // 忽略存储删除错误
    }
  }

  // 从数据库中删除记录
  const result = await supabase
    .from('documents')
    .delete()
    .eq('id', id)

  return fromSupabase(result)
}

// 批量删除
export const batchDeleteDocuments = async (ids: number[]): Promise<ApiResponse<void>> => {
  const result = await supabase
    .from('documents')
    .delete()
    .in('id', ids)

  return fromSupabase(result)
}

// 下载文档（获取 URL）
export const downloadDocument = async (id: number): Promise<ApiResponse<{ url: string }>> => {
  const result = await supabase
    .from('documents')
    .select('url')
    .eq('id', id)
    .single()

  return fromSupabase(result)
}

// 获取文件夹树结构
export const getFolderTree = async (projectId: number): Promise<ApiResponse<FolderTree[]>> => {
  const result = await supabase
    .from('folders')
    .select('*')
    .eq('project_id', projectId)
    .order('name')

  return fromSupabase(result)
}

// 预览文档（获取URL）
export const previewDocument = async (id: number): Promise<ApiResponse<{ url: string }>> => {
  const result = await supabase
    .from('documents')
    .select('url')
    .eq('id', id)
    .single()

  return fromSupabase(result)
}

// 获取文档历史版本
export const getDocumentVersions = async (id: number): Promise<ApiResponse<{
  versions: Array<{
    id: number
    version: number
    size: number
    createdAt: string
    createdBy: string
  }>
}>> => {
  const result = await supabase
    .from('documents')
    .select('*')
    .eq('id', id)
    .order('version', { ascending: true })

  const response = fromSupabase(result)

  if (response.code === 200) {
    response.data = {
      versions: (response.data as any[])?.map((item: any) => ({
        id: item.id,
        version: item.version,
        size: item.size,
        createdAt: item.created_at,
        createdBy: item.uploaded_by,
      })) || [],
    }
  }

  return response
}

// 分享文档
export const shareDocument = async (
  id: number,
  data: {
    expireIn?: number
    password?: string
  }
): Promise<ApiResponse<{ shareUrl: string; password?: string }>> => {
  const { data: doc } = await supabase
    .from('documents')
    .select('url')
    .eq('id', id)
    .single()

  return {
    code: 200,
    message: 'success',
    data: {
      shareUrl: doc?.url || '',
      password: data.password,
    },
  }
}
