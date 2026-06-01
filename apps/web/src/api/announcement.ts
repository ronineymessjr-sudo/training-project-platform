import request from '../utils/request'

export interface Announcement {
  id: number
  title: string
  content: string
  type: 'system' | 'activity' | 'notice'
  targetScope: 'all' | 'students' | 'teachers' | 'class' | 'major'
  pinned: boolean
  status: 'draft' | 'published' | 'withdrawn'
  createdBy: number
  creatorName: string
  publishedAt?: string
  readCount: number
  createdAt: string
}

export interface ApiResponse<T> {
  code: number
  message: string
  data: T
}

// 获取公告列表
export const getAnnouncementList = (params?: {
  type?: string
  page?: number
  pageSize?: number
}): Promise<ApiResponse<{ list: Announcement[]; total: number }>> => {
  return request.get('/api/announcements', { params })
}

// 获取公告详情
export const getAnnouncementDetail = (id: number): Promise<ApiResponse<Announcement>> => {
  return request.get(`/api/announcements/${id}`)
}

// 创建公告
export const createAnnouncement = (data: {
  title: string
  content: string
  type: 'system' | 'activity' | 'notice'
  targetScope: 'all' | 'students' | 'teachers' | 'class' | 'major'
  targetIds?: number[]
  pinned?: boolean
}): Promise<ApiResponse<Announcement>> => {
  return request.post('/api/announcements', data)
}

// 更新公告
export const updateAnnouncement = (
  id: number,
  data: Partial<Announcement>
): Promise<ApiResponse<Announcement>> => {
  return request.put(`/api/announcements/${id}`, data)
}

// 删除公告
export const deleteAnnouncement = (id: number): Promise<ApiResponse<void>> => {
  return request.delete(`/api/announcements/${id}`)
}

// 发布公告
export const publishAnnouncement = (id: number): Promise<ApiResponse<void>> => {
  return request.post(`/api/announcements/${id}/publish`)
}

// 撤回公告
export const withdrawAnnouncement = (id: number): Promise<ApiResponse<void>> => {
  return request.post(`/api/announcements/${id}/withdraw`)
}

// 获取阅读记录
export const getAnnouncementReads = (
  id: number
): Promise<ApiResponse<Array<{ userId: number; name: string; readAt: string }>>> => {
  return request.get(`/api/announcements/${id}/reads`)
}

// 获取未读公告数量
export const getUnreadCount = (): Promise<ApiResponse<{ count: number }>> => {
  return request.get('/api/announcements/unread-count')
}

// 标记已读
export const markAsRead = (id: number): Promise<ApiResponse<void>> => {
  return request.post(`/api/announcements/${id}/read`)
}
