import { supabase } from '../lib/supabase'
import { ApiResponse } from '../utils/supabase-helpers'
import { downloadBlob, toJsonBlob, toCsvBlob } from '../utils/download'

// All export functions return a Blob the caller can hand to downloadBlob().
// They fetch rows from Supabase directly and serialize in the browser.
// PDF / Excel binary generation needs a Supabase Edge Function and is left as future work.

export type ExportFormat = 'json' | 'csv'

function timestamp() {
  const d = new Date()
  const pad = (n: number) => String(n).padStart(2, '0')
  return `${d.getFullYear()}${pad(d.getMonth() + 1)}${pad(d.getDate())}_${pad(d.getHours())}${pad(d.getMinutes())}`
}

function selectFormat(format?: ExportFormat): 'json' | 'csv' {
  return format === 'csv' ? 'csv' : 'json'
}

function buildBlob(rows: Record<string, unknown>[], format: 'json' | 'csv'): Blob {
  return format === 'csv' ? toCsvBlob(rows) : toJsonBlob(rows)
}

export const exportProjectScores = async (params?: {
  projectIds?: number[]
  classId?: number
  format?: ExportFormat
}): Promise<Blob> => {
  let query = supabase
    .from('score_summaries')
    .select('project_id, group_id, total_score, grade, summary, created_at, projects(name), groups(name)')
  if (params?.projectIds?.length) query = query.in('project_id', params.projectIds)
  const { data, error } = await query
  if (error) throw error
  const rows = ((data as any[]) ?? []).map((r) => ({
    project_id: r.project_id,
    project_name: r.projects?.name,
    group_id: r.group_id,
    group_name: r.groups?.name,
    total_score: r.total_score,
    grade: r.grade,
    summary: r.summary,
    created_at: r.created_at,
  }))
  const format = selectFormat(params?.format)
  const blob = buildBlob(rows as any, format)
  downloadBlob(blob, `项目成绩单_${timestamp()}.${format}`)
  return blob
}

export const exportDefenseRecords = async (params?: {
  defenseIds?: number[]
  format?: ExportFormat
}): Promise<Blob> => {
  let query = supabase
    .from('defenses')
    .select('id, project_id, scheduled_at, location, status, projects(name), classes(name)')
  if (params?.defenseIds?.length) query = query.in('id', params.defenseIds)
  const { data, error } = await query
  if (error) throw error
  const rows = ((data as any[]) ?? []).map((r) => ({
    defense_id: r.id,
    project_name: r.projects?.name,
    class_name: r.classes?.name,
    scheduled_at: r.scheduled_at,
    location: r.location,
    status: r.status,
  }))
  const format = selectFormat(params?.format)
  const blob = buildBlob(rows as any, format)
  downloadBlob(blob, `答辩记录_${timestamp()}.${format}`)
  return blob
}

export const exportWorkloadStatistics = async (params: { projectId: number; format?: ExportFormat }): Promise<Blob> => {
  const { data, error } = await supabase
    .from('workloads')
    .select('student_id, date, hours, content, status, profile:profiles:student_id(real_name, username)')
    .eq('project_id', params.projectId)
  if (error) throw error
  const rows = ((data as any[]) ?? []).map((r) => ({
    student_id: r.student_id,
    name: r.profile?.real_name ?? r.profile?.username,
    date: r.date,
    hours: r.hours,
    content: r.content,
    status: r.status,
  }))
  const format = selectFormat(params.format)
  const blob = buildBlob(rows as any, format)
  downloadBlob(blob, `工作量统计_${params.projectId}_${timestamp()}.${format}`)
  return blob
}

export const exportStudentList = async (params?: { classId?: number; majorId?: number; format?: ExportFormat }): Promise<Blob> => {
  let query = supabase
    .from('student_classes')
    .select('student_id, class_id, classes(name, major_id, majors(name)), profile:profiles:student_id(username, real_name, email)')
    .eq('is_current', 1)
  if (params?.classId) query = query.eq('class_id', params.classId)
  const { data, error } = await query
  if (error) throw error
  let rows = ((data as any[]) ?? []).map((r) => ({
    student_id: r.student_id,
    username: r.profile?.username,
    real_name: r.profile?.real_name,
    email: r.profile?.email,
    class_name: r.classes?.name,
    major_name: r.classes?.majors?.name,
  }))
  if (params?.majorId) rows = rows.filter((r) => r.major_name && r.major_name === (params as any).majorName)
  const format = selectFormat(params?.format)
  const blob = buildBlob(rows as any, format)
  downloadBlob(blob, `学生名单_${timestamp()}.${format}`)
  return blob
}

export const exportProjectSummary = async (params?: { status?: string; format?: ExportFormat }): Promise<Blob> => {
  let query = supabase
    .from('projects')
    .select('id, name, start_date, end_date, status, classes(name), profiles:teacher_id(real_name)')
  if (params?.status !== undefined) query = query.eq('status', Number(params.status))
  const { data, error } = await query
  if (error) throw error
  const rows = ((data as any[]) ?? []).map((r) => ({
    project_id: r.id,
    name: r.name,
    class_name: r.classes?.name,
    teacher: r.profiles?.real_name,
    start_date: r.start_date,
    end_date: r.end_date,
    status: r.status,
  }))
  const format = selectFormat(params?.format)
  const blob = buildBlob(rows as any, format)
  downloadBlob(blob, `项目汇总_${timestamp()}.${format}`)
  return blob
}

export const exportReviewComments = async (params?: { projectIds?: number[]; format?: ExportFormat }): Promise<Blob> => {
  let query = supabase
    .from('scores')
    .select('project_id, group_id, reviewer_id, review_comment, scores(->review_comment), projects(name), profile:profiles:reviewer_id(real_name)')
  if (params?.projectIds?.length) query = query.in('project_id', params.projectIds)
  const { data, error } = await query
  if (error) throw error
  const rows = ((data as any[]) ?? []).map((r: any) => ({
    project_id: r.project_id,
    project_name: r.projects?.name,
    group_id: r.group_id,
    reviewer: r.profile?.real_name,
    review_comment: r.review_comment ?? r.scores?.review_comment,
  }))
  const format = selectFormat(params?.format)
  const blob = buildBlob(rows as any, format)
  downloadBlob(blob, `评阅意见_${timestamp()}.${format}`)
  return blob
}

export const exportDocuments = async (params: { projectId: number; folderId?: number; format?: ExportFormat }): Promise<Blob> => {
  let query = supabase
    .from('documents')
    .select('id, name, type, size, url, folder_id, uploaded_by, created_at, uploader:profiles:uploaded_by(real_name, username)')
    .eq('project_id', params.projectId)
  if (params.folderId) query = query.eq('folder_id', params.folderId)
  const { data, error } = await query
  if (error) throw error
  const rows = ((data as any[]) ?? []).map((r) => ({
    id: r.id,
    name: r.name,
    type: r.type,
    size: r.size,
    url: r.url,
    folder_id: r.folder_id,
    uploader: r.uploader?.real_name ?? r.uploader?.username,
    created_at: r.created_at,
  }))
  const format = selectFormat(params.format)
  const blob = buildBlob(rows as any, format)
  downloadBlob(blob, `文档清单_${params.projectId}_${timestamp()}.${format}`)
  return blob
}

// Re-export so call sites that previously imported `ApiResponse` still compile if they imported from this file.
export type { ApiResponse }