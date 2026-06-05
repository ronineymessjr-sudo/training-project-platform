import { supabase } from '../lib/supabase'
import { fromSupabase } from '../utils/supabase-helpers'

interface ApiResponse<T> {
  code: number
  data: T
  message?: string
}

interface ClassInfo {
  id: number
  name: string
  major_id: number
  major_name?: string
  grade: number
  class_no: number
  counselor_id?: string
  student_count: number
  status: number
  created_at: string
}

interface Major {
  id: number
  code: string
  name: string
  department?: string
  description?: string
  status: number
  created_at: string
}

// 获取班级列表
export const getClassList = async (params?: {
  majorId?: number
  grade?: number
  page?: number
  pageSize?: number
}): Promise<ApiResponse<{ list: any[]; total: number }>> => {
  const page = params?.page || 1
  const pageSize = params?.pageSize || 10
  const from = (page - 1) * pageSize
  const to = from + pageSize - 1

  let query = supabase
    .from('classes')
    .select('*, majors(name, code)', { count: 'exact' })
    .order('grade', { ascending: false })
    .order('class_no', { ascending: true })
    .range(from, to)

  if (params?.majorId) {
    query = query.eq('major_id', params.majorId)
  }
  if (params?.grade) {
    query = query.eq('grade', params.grade)
  }

  const result = await query
  const list = (result.data || []).map((item: any) => ({
    id: item.id,
    name: item.name,
    majorId: item.major_id,
    majorName: item.majors?.name || '',
    grade: item.grade,
    classNo: item.class_no,
    studentCount: item.student_count || 0,
    counselorId: item.counselor_id,
    status: item.status,
    createdAt: item.created_at,
  }))

  return {
    code: 200,
    message: 'success',
    data: {
      list,
      total: result.count || 0,
    },
  }
}

// 获取班级详情
export const getClassDetail = async (id: number): Promise<ApiResponse<any>> => {
  const result = await supabase
    .from('classes')
    .select('*, majors(name, code)')
    .eq('id', id)
    .single()
  if (result.data) {
    const item = result.data as any
    result.data = {
      id: item.id,
      name: item.name,
      majorId: item.major_id,
      majorName: item.majors?.name || '',
      grade: item.grade,
      classNo: item.class_no,
      studentCount: item.student_count || 0,
      counselorId: item.counselor_id,
      status: item.status,
      createdAt: item.created_at,
    }
  }
  return fromSupabase(result) as any
}

// 创建班级（自动转换 camelCase → snake_case，自动生成 class_no）
export const createClass = async (data: {
  name: string
  majorId: number
  grade: number
  classNo?: number
  counselorId?: string
}): Promise<ApiResponse<any>> => {
  // 如果没有指定 class_no，自动查询同专业同年级最大班号 + 1
  let classNo = data.classNo
  if (!classNo) {
    const { data: existing } = await supabase
      .from('classes')
      .select('class_no')
      .eq('major_id', data.majorId)
      .eq('grade', data.grade)
      .order('class_no', { ascending: false })
      .limit(1)
    const maxNo = existing && existing.length > 0 ? existing[0].class_no : 0
    classNo = maxNo + 1
  }

  const dbData = {
    name: data.name,
    major_id: data.majorId,
    grade: data.grade,
    class_no: classNo,
    counselor_id: data.counselorId || null,
    student_count: 0,
  }

  const result = await supabase
    .from('classes')
    .insert(dbData)
    .select()
    .single()
  return fromSupabase(result) as any
}

// 更新班级（自动转换 camelCase → snake_case）
export const updateClass = async (
  id: number,
  data: { name?: string; majorId?: number; grade?: number; classNo?: number; counselorId?: string }
): Promise<ApiResponse<any>> => {
  const dbData: any = {};
  if (data.name !== undefined) dbData.name = data.name;
  if (data.majorId !== undefined) dbData.major_id = data.majorId;
  if (data.grade !== undefined) dbData.grade = data.grade;
  if (data.classNo !== undefined) dbData.class_no = data.classNo;
  if (data.counselorId !== undefined) dbData.counselor_id = data.counselorId;

  const result = await supabase
    .from('classes')
    .update(dbData)
    .eq('id', id)
    .select()
    .single()
  return fromSupabase(result) as any
}

// 删除班级
export const deleteClass = async (id: number): Promise<ApiResponse<void>> => {
  const result = await supabase
    .from('classes')
    .delete()
    .eq('id', id)
  return fromSupabase(result) as any
}

// 获取班级学生
export const getClassStudents = async (classId: number): Promise<ApiResponse<any[]>> => {
  const result = await supabase
    .from('student_classes')
    .select('student_id, profiles:student_id(id, username, real_name, email)')
    .eq('class_id', classId)
  const list = (result.data || []).map((item: any) => ({
    id: item.student_id,
    username: item.profiles?.username,
    name: item.profiles?.real_name,
    email: item.profiles?.email,
  }))
  return { code: 200, message: 'success', data: list }
}

// 获取专业列表
export const getMajorList = async (): Promise<ApiResponse<Major[]>> => {
  const result = await supabase
    .from('majors')
    .select('*')
    .order('code', { ascending: true })
  return fromSupabase(result) as any
}

// 创建专业
export const createMajor = async (data: { name: string; code: string }): Promise<ApiResponse<Major>> => {
  const result = await supabase
    .from('majors')
    .insert(data)
    .select()
    .single()
  return fromSupabase(result) as any
}

// 导入学生模板下载 (生成CSV下载)
export const downloadImportTemplate = async (): Promise<Blob> => {
  const headers = '学号,姓名,邮箱,手机号\n'
  return new Blob(['\uFEFF' + headers], { type: 'text/csv;charset=utf-8' })
}

// 导入学生 (占位 - 需在真实项目中通过 API 或数据库批量导入)
export const importStudents = async (_data: FormData): Promise<ApiResponse<any>> => {
  // 实际场景需上传CSV后解析并插入到数据库，此处分步实现需要后端辅助
  return { code: 200, message: '导入成功（占位实现）', data: { total: 0, success: 0, failed: 0 } }
}

// 批量分配学生到班级
export const assignStudentsToClass = async (
  classId: number,
  studentIds: string[]
): Promise<ApiResponse<void>> => {
  const rows = studentIds.map(student_id => ({ student_id, class_id: classId }))
  const result = await supabase
    .from('student_classes')
    .upsert(rows, { onConflict: 'student_id,class_id' })
  return fromSupabase(result) as any
}

// 移除班级学生
export const removeClassStudent = async (
  classId: number,
  studentId: string
): Promise<ApiResponse<void>> => {
  const result = await supabase
    .from('student_classes')
    .delete()
    .eq('class_id', classId)
    .eq('student_id', studentId)
  return fromSupabase(result) as any
}

// 获取班级统计
export const getClassStatistics = async (): Promise<ApiResponse<any>> => {
  const { count: totalClasses } = await supabase.from('classes').select('*', { count: 'exact', head: true })
  const { count: totalStudents } = await supabase.from('student_classes').select('*', { count: 'exact', head: true })
  const { data: distribution } = await supabase
    .from('classes')
    .select('major_id, majors(name)')
    .order('major_id')

  const distMap: Record<string, number> = {}
  if (distribution) {
    for (const item of distribution) {
      const majorName = (item as any).majors?.name || '未知'
      distMap[majorName] = (distMap[majorName] || 0) + 1
    }
  }

  return {
    code: 200,
    message: 'success',
    data: {
      totalClasses: totalClasses || 0,
      totalStudents: totalStudents || 0,
      distribution: Object.entries(distMap).map(([major, count]) => ({ major, count })),
    },
  }
}