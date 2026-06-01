import request from '../utils/request'

// 导出项目成绩单
export const exportProjectScores = (params?: {
  projectIds?: number[]
  classId?: number
  format?: 'excel' | 'pdf'
}): Promise<Blob> => {
  return request.get('/api/export/scores', { params, responseType: 'blob' })
}

// 导出答辩记录
export const exportDefenseRecords = (params?: {
  defenseIds?: number[]
}): Promise<Blob> => {
  return request.get('/api/export/defense-records', { params, responseType: 'blob' })
}

// 导出工作量统计
export const exportWorkloadStatistics = (params: {
  projectId: number
}): Promise<Blob> => {
  return request.get('/api/export/workload', { params, responseType: 'blob' })
}

// 导出学生名单
export const exportStudentList = (params?: {
  classId?: number
  majorId?: number
}): Promise<Blob> => {
  return request.get('/api/export/students', { params, responseType: 'blob' })
}

// 导出项目汇总表
export const exportProjectSummary = (params?: {
  semester?: string
  status?: string
}): Promise<Blob> => {
  return request.get('/api/export/projects', { params, responseType: 'blob' })
}

// 导出评阅意见
export const exportReviewComments = (params?: {
  projectIds?: number[]
}): Promise<Blob> => {
  return request.get('/api/export/review-comments', { params, responseType: 'blob' })
}

// 批量导出文档
export const exportDocuments = (params: {
  projectId: number
  folderId?: number
}): Promise<Blob> => {
  return request.get('/api/export/documents', { params, responseType: 'blob' })
}
