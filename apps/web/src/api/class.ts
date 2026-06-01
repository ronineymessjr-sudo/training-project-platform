import request from '../utils/request'

// API 响应类型
interface ApiResponse<T> {
  code: number
  data: T
  message?: string
}

// 班级信息
interface ClassInfo {
  id: number
  name: string
  majorId: number
  majorName?: string
  grade: number
  teacherId?: number
  teacherName?: string
  studentCount?: number
  createdAt?: string
  updatedAt?: string
}

// 专业
interface Major {
  id: number
  name: string
  code: string
  description?: string
  createdAt?: string
}

// 导入结果
interface ImportResult {
  total: number
  success: number
  failed: number
  errors?: Array<{
    row: number
    message: string
  }>
}

// 获取班级列表
export const getClassList = (params?: {
  majorId?: number
  grade?: number
  page?: number
  pageSize?: number
}): Promise<ApiResponse<{ list: ClassInfo[]; total: number }>> => {
  return request.get('/api/classes', { params })
}

// 获取班级详情
export const getClassDetail = (id: number): Promise<ApiResponse<ClassInfo>> => {
  return request.get(`/api/classes/${id}`)
}

// 创建班级
export const createClass = (data: {
  name: string
  majorId: number
  grade: number
  teacherId?: number
}): Promise<ApiResponse<ClassInfo>> => {
  return request.post('/api/classes', data)
}

// 更新班级
export const updateClass = (
  id: number,
  data: Partial<ClassInfo>
): Promise<ApiResponse<ClassInfo>> => {
  return request.put(`/api/classes/${id}`, data)
}

// 删除班级
export const deleteClass = (id: number): Promise<ApiResponse<void>> => {
  return request.delete(`/api/classes/${id}`)
}

// 获取班级学生
export const getClassStudents = (classId: number): Promise<ApiResponse<Array<{
  id: number
  username: string
  name: string
  email: string
  phone?: string
}>>> => {
  return request.get(`/api/classes/${classId}/students`)
}

// 获取专业列表
export const getMajorList = (): Promise<ApiResponse<Major[]>> => {
  return request.get('/api/majors')
}

// 创建专业
export const createMajor = (data: { name: string; code: string }): Promise<ApiResponse<Major>> => {
  return request.post('/api/majors', data)
}

// 导入学生模板下载
export const downloadImportTemplate = (): Promise<Blob> => {
  return request.get('/api/classes/import/template', { responseType: 'blob' })
}

// 导入学生
export const importStudents = (data: FormData): Promise<ApiResponse<ImportResult>> => {
  return request.post('/api/classes/import', data, {
    headers: { 'Content-Type': 'multipart/form-data' },
  })
}

// 批量分配学生到班级
export const assignStudentsToClass = (
  classId: number,
  studentIds: number[]
): Promise<ApiResponse<void>> => {
  return request.post(`/api/classes/${classId}/students`, { studentIds })
}

// 移除班级学生
export const removeClassStudent = (
  classId: number,
  studentId: number
): Promise<ApiResponse<void>> => {
  return request.delete(`/api/classes/${classId}/students/${studentId}`)
}

// 获取班级统计
export const getClassStatistics = (): Promise<ApiResponse<{
  totalClasses: number
  totalStudents: number
  distribution: Array<{ major: string; count: number }>
}>> => {
  return request.get('/api/classes/statistics')
}
