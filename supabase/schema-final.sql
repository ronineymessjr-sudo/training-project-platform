-- =====================================================
-- Supabase 建表 SQL - PostgreSQL 格式（最终版）
-- 实训项目全过程管理平台
-- 在 Supabase SQL Editor 中执行此文件
-- =====================================================

CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- =====================================================
-- 1. 基础表
-- =====================================================

CREATE TABLE IF NOT EXISTS roles (
    id SERIAL PRIMARY KEY,
    name VARCHAR(50) NOT NULL UNIQUE,
    display_name VARCHAR(50) NOT NULL,
    description VARCHAR(255),
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS permissions (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL UNIQUE,
    display_name VARCHAR(100) NOT NULL,
    resource VARCHAR(50) NOT NULL,
    action VARCHAR(50) NOT NULL,
    description VARCHAR(255),
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS score_dimensions (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    description TEXT,
    default_weight NUMERIC(5,2) DEFAULT 0,
    is_default SMALLINT DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS majors (
    id SERIAL PRIMARY KEY,
    code VARCHAR(20) NOT NULL UNIQUE,
    name VARCHAR(100) NOT NULL,
    department VARCHAR(100),
    description TEXT,
    status SMALLINT DEFAULT 1,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- =====================================================
-- 2. 用户相关表
-- =====================================================

CREATE TABLE IF NOT EXISTS profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    username VARCHAR(50) NOT NULL UNIQUE,
    real_name VARCHAR(50) NOT NULL,
    email VARCHAR(100),
    phone VARCHAR(20),
    avatar_url VARCHAR(500),
    gender SMALLINT DEFAULT 0,
    status SMALLINT DEFAULT 1,
    last_login_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS user_roles (
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    role_id INT NOT NULL REFERENCES roles(id) ON DELETE CASCADE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    PRIMARY KEY (user_id, role_id)
);

CREATE TABLE IF NOT EXISTS role_permissions (
    role_id INT NOT NULL REFERENCES roles(id) ON DELETE CASCADE,
    permission_id INT NOT NULL REFERENCES permissions(id) ON DELETE CASCADE,
    PRIMARY KEY (role_id, permission_id)
);

CREATE TABLE IF NOT EXISTS menus (
    id SERIAL PRIMARY KEY,
    parent_id INT REFERENCES menus(id) ON DELETE SET NULL,
    name VARCHAR(50) NOT NULL,
    path VARCHAR(200),
    component VARCHAR(200),
    icon VARCHAR(50),
    sort_order INT DEFAULT 0,
    menu_type SMALLINT DEFAULT 1,
    visible SMALLINT DEFAULT 1,
    status SMALLINT DEFAULT 1,
    permission_id INT REFERENCES permissions(id) ON DELETE SET NULL,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS role_menus (
    role_id INT NOT NULL REFERENCES roles(id) ON DELETE CASCADE,
    menu_id INT NOT NULL REFERENCES menus(id) ON DELETE CASCADE,
    PRIMARY KEY (role_id, menu_id)
);

CREATE TABLE IF NOT EXISTS operation_logs (
    id BIGSERIAL PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES auth.users(id),
    module VARCHAR(50) NOT NULL,
    action VARCHAR(50) NOT NULL,
    description VARCHAR(500),
    method VARCHAR(20),
    url VARCHAR(500),
    ip VARCHAR(50),
    user_agent VARCHAR(500),
    request_body TEXT,
    response_code INT,
    duration INT,
    status SMALLINT DEFAULT 1,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- =====================================================
-- 3. 班级
-- =====================================================

CREATE TABLE IF NOT EXISTS classes (
    id SERIAL PRIMARY KEY,
    major_id INT NOT NULL REFERENCES majors(id),
    grade INT NOT NULL,
    class_no INT NOT NULL,
    name VARCHAR(100) NOT NULL,
    counselor_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    student_count INT DEFAULT 0,
    status SMALLINT DEFAULT 1,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE (major_id, grade, class_no)
);

CREATE TABLE IF NOT EXISTS student_classes (
    student_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    class_id INT NOT NULL REFERENCES classes(id) ON DELETE CASCADE,
    is_current SMALLINT DEFAULT 1,
    joined_at TIMESTAMPTZ DEFAULT NOW(),
    PRIMARY KEY (student_id, class_id)
);

-- =====================================================
-- 4. 项目和题目
-- =====================================================

CREATE TABLE IF NOT EXISTS topics (
    id BIGSERIAL PRIMARY KEY,
    title VARCHAR(200) NOT NULL,
    description TEXT,
    requirements TEXT,
    difficulty SMALLINT DEFAULT 1,
    estimated_days INT,
    tech_stack JSONB,
    max_group_size INT DEFAULT 4,
    min_group_size INT DEFAULT 1,
    creator_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    status SMALLINT DEFAULT 1,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS projects (
    id BIGSERIAL PRIMARY KEY,
    topic_id BIGINT REFERENCES topics(id) ON DELETE SET NULL,
    name VARCHAR(200) NOT NULL,
    description TEXT,
    class_id INT NOT NULL REFERENCES classes(id),
    teacher_id UUID NOT NULL REFERENCES auth.users(id),
    start_date DATE NOT NULL,
    end_date DATE NOT NULL,
    status SMALLINT DEFAULT 0,
    config JSONB,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS project_phases (
    id BIGSERIAL PRIMARY KEY,
    project_id BIGINT NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
    name VARCHAR(100) NOT NULL,
    description TEXT,
    start_date DATE NOT NULL,
    end_date DATE NOT NULL,
    weight NUMERIC(5,2) DEFAULT 0,
    sort_order INT DEFAULT 0,
    status SMALLINT DEFAULT 1
);

-- =====================================================
-- 5. 分组
-- =====================================================

CREATE TABLE IF NOT EXISTS groups (
    id BIGSERIAL PRIMARY KEY,
    project_id BIGINT NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
    name VARCHAR(100) NOT NULL,
    description TEXT,
    leader_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    max_members INT DEFAULT 4,
    status SMALLINT DEFAULT 1,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS group_members (
    id BIGSERIAL PRIMARY KEY,
    group_id BIGINT NOT NULL REFERENCES groups(id) ON DELETE CASCADE,
    student_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    role SMALLINT DEFAULT 0,
    joined_at TIMESTAMPTZ DEFAULT NOW(),
    status SMALLINT DEFAULT 1,
    UNIQUE (group_id, student_id)
);

CREATE TABLE IF NOT EXISTS group_applications (
    id BIGSERIAL PRIMARY KEY,
    group_id BIGINT NOT NULL REFERENCES groups(id) ON DELETE CASCADE,
    student_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    type SMALLINT NOT NULL,
    status SMALLINT DEFAULT 0,
    message VARCHAR(500),
    processed_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    processed_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- =====================================================
-- 6. 进度
-- =====================================================

CREATE TABLE IF NOT EXISTS progress (
    id BIGSERIAL PRIMARY KEY,
    project_id BIGINT NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
    group_id BIGINT NOT NULL REFERENCES groups(id) ON DELETE CASCADE,
    phase_id BIGINT REFERENCES project_phases(id) ON DELETE SET NULL,
    title VARCHAR(200) NOT NULL,
    content TEXT,
    completion_rate INT DEFAULT 0,
    reporter_id UUID NOT NULL REFERENCES auth.users(id),
    report_date DATE NOT NULL,
    status SMALLINT DEFAULT 1,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS progress_logs (
    id BIGSERIAL PRIMARY KEY,
    progress_id BIGINT NOT NULL REFERENCES progress(id) ON DELETE CASCADE,
    content TEXT NOT NULL,
    created_by UUID NOT NULL REFERENCES auth.users(id),
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- =====================================================
-- 7. 文档
-- =====================================================

CREATE TABLE IF NOT EXISTS documents (
    id BIGSERIAL PRIMARY KEY,
    project_id BIGINT NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
    group_id BIGINT REFERENCES groups(id) ON DELETE SET NULL,
    uploader_id UUID NOT NULL REFERENCES auth.users(id),
    name VARCHAR(255) NOT NULL,
    type VARCHAR(50),
    file_url VARCHAR(500) NOT NULL,
    file_size BIGINT,
    file_hash VARCHAR(64),
    description TEXT,
    category SMALLINT DEFAULT 1,
    status SMALLINT DEFAULT 1,
    download_count INT DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS document_versions (
    id BIGSERIAL PRIMARY KEY,
    document_id BIGINT NOT NULL REFERENCES documents(id) ON DELETE CASCADE,
    version VARCHAR(20) NOT NULL,
    file_url VARCHAR(500) NOT NULL,
    file_size BIGINT,
    change_log TEXT,
    created_by UUID NOT NULL REFERENCES auth.users(id),
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- =====================================================
-- 8. 评分
-- =====================================================

CREATE TABLE IF NOT EXISTS project_score_configs (
    id BIGSERIAL PRIMARY KEY,
    project_id BIGINT NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
    dimension_id INT NOT NULL REFERENCES score_dimensions(id),
    weight NUMERIC(5,2) NOT NULL,
    max_score NUMERIC(5,2) DEFAULT 100,
    UNIQUE (project_id, dimension_id)
);

CREATE TABLE IF NOT EXISTS scores (
    id BIGSERIAL PRIMARY KEY,
    project_id BIGINT NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
    group_id BIGINT NOT NULL REFERENCES groups(id) ON DELETE CASCADE,
    dimension_id INT NOT NULL REFERENCES score_dimensions(id),
    score NUMERIC(5,2) NOT NULL,
    comment TEXT,
    scorer_id UUID NOT NULL REFERENCES auth.users(id),
    scored_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE (project_id, group_id, dimension_id, scorer_id)
);

CREATE TABLE IF NOT EXISTS score_summaries (
    id BIGSERIAL PRIMARY KEY,
    project_id BIGINT NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
    group_id BIGINT NOT NULL REFERENCES groups(id) ON DELETE CASCADE,
    total_score NUMERIC(6,2) NOT NULL,
    weighted_score NUMERIC(6,2),
    rank INT,
    evaluator_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    evaluated_at TIMESTAMPTZ,
    UNIQUE (project_id, group_id)
);

-- =====================================================
-- 9. 答辩
-- =====================================================

CREATE TABLE IF NOT EXISTS defenses (
    id BIGSERIAL PRIMARY KEY,
    project_id BIGINT NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
    group_id BIGINT NOT NULL REFERENCES groups(id) ON DELETE CASCADE,
    title VARCHAR(200) NOT NULL,
    defense_date DATE NOT NULL,
    start_time TIME NOT NULL,
    end_time TIME NOT NULL,
    location VARCHAR(200),
    panel_teacher_ids JSONB,
    secretary_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    status SMALLINT DEFAULT 0,
    max_duration INT DEFAULT 30,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS defense_scores (
    id BIGSERIAL PRIMARY KEY,
    defense_id BIGINT NOT NULL REFERENCES defenses(id) ON DELETE CASCADE,
    group_id BIGINT NOT NULL REFERENCES groups(id) ON DELETE CASCADE,
    scorer_id UUID NOT NULL REFERENCES auth.users(id),
    scorer_role SMALLINT NOT NULL,
    presentation_score NUMERIC(5,2),
    qa_score NUMERIC(5,2),
    document_score NUMERIC(5,2),
    total_score NUMERIC(5,2) NOT NULL,
    comment TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE (defense_id, group_id, scorer_id)
);

-- =====================================================
-- 10. 工作量
-- =====================================================

CREATE TABLE IF NOT EXISTS workloads (
    id BIGSERIAL PRIMARY KEY,
    project_id BIGINT NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
    group_id BIGINT NOT NULL REFERENCES groups(id) ON DELETE CASCADE,
    student_id UUID NOT NULL REFERENCES auth.users(id),
    task_name VARCHAR(200) NOT NULL,
    task_description TEXT,
    task_type SMALLINT DEFAULT 1,
    estimated_hours NUMERIC(6,2),
    actual_hours NUMERIC(6,2),
    completion_rate INT DEFAULT 0,
    contribution_ratio NUMERIC(5,2),
    status SMALLINT DEFAULT 0,
    report_date DATE,
    verified_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    verified_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- =====================================================
-- 11. 公告
-- =====================================================

CREATE TABLE IF NOT EXISTS announcements (
    id BIGSERIAL PRIMARY KEY,
    project_id BIGINT REFERENCES projects(id) ON DELETE CASCADE,
    title VARCHAR(200) NOT NULL,
    content TEXT NOT NULL,
    type SMALLINT DEFAULT 1,
    priority SMALLINT DEFAULT 0,
    publisher_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    target_roles JSONB,
    status SMALLINT DEFAULT 1,
    published_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS announcement_reads (
    id BIGSERIAL PRIMARY KEY,
    announcement_id BIGINT NOT NULL REFERENCES announcements(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    read_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE (announcement_id, user_id)
);

-- =====================================================
-- 12. 触发器
-- =====================================================

CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO public.profiles (id, username, real_name, email)
    VALUES (
        NEW.id,
        COALESCE(NEW.raw_user_meta_data->>'username', NEW.email),
        COALESCE(NEW.raw_user_meta_data->>'real_name', NEW.email),
        NEW.email
    );
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- =====================================================
-- 13. RLS
-- =====================================================

ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_roles ENABLE ROW LEVEL SECURITY;
ALTER TABLE role_permissions ENABLE ROW LEVEL SECURITY;
ALTER TABLE menus ENABLE ROW LEVEL SECURITY;
ALTER TABLE role_menus ENABLE ROW LEVEL SECURITY;
ALTER TABLE operation_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE classes ENABLE ROW LEVEL SECURITY;
ALTER TABLE student_classes ENABLE ROW LEVEL SECURITY;
ALTER TABLE topics ENABLE ROW LEVEL SECURITY;
ALTER TABLE projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE project_phases ENABLE ROW LEVEL SECURITY;
ALTER TABLE groups ENABLE ROW LEVEL SECURITY;
ALTER TABLE group_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE group_applications ENABLE ROW LEVEL SECURITY;
ALTER TABLE progress ENABLE ROW LEVEL SECURITY;
ALTER TABLE progress_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE documents ENABLE ROW LEVEL SECURITY;
ALTER TABLE document_versions ENABLE ROW LEVEL SECURITY;
ALTER TABLE project_score_configs ENABLE ROW LEVEL SECURITY;
ALTER TABLE scores ENABLE ROW LEVEL SECURITY;
ALTER TABLE score_summaries ENABLE ROW LEVEL SECURITY;
ALTER TABLE defenses ENABLE ROW LEVEL SECURITY;
ALTER TABLE defense_scores ENABLE ROW LEVEL SECURITY;
ALTER TABLE workloads ENABLE ROW LEVEL SECURITY;
ALTER TABLE announcements ENABLE ROW LEVEL SECURITY;
ALTER TABLE announcement_reads ENABLE ROW LEVEL SECURITY;

-- profiles
CREATE POLICY "Users can view own profile" ON profiles FOR SELECT USING (auth.uid() = id);
CREATE POLICY "Users can update own profile" ON profiles FOR UPDATE USING (auth.uid() = id);
CREATE POLICY "Admins can view all profiles" ON profiles FOR SELECT USING (
    EXISTS (SELECT 1 FROM user_roles WHERE user_id = auth.uid() AND role_id = 1)
);

-- roles, permissions, menus
CREATE POLICY "Authenticated users can view roles" ON roles FOR SELECT USING (auth.uid() IS NOT NULL);
CREATE POLICY "Authenticated users can view permissions" ON permissions FOR SELECT USING (auth.uid() IS NOT NULL);
CREATE POLICY "Authenticated users can view role_permissions" ON role_permissions FOR SELECT USING (auth.uid() IS NOT NULL);
CREATE POLICY "Authenticated users can view menus" ON menus FOR SELECT USING (auth.uid() IS NOT NULL);
CREATE POLICY "Authenticated users can view role_menus" ON role_menus FOR SELECT USING (auth.uid() IS NOT NULL);

-- user_roles
CREATE POLICY "Users can view own roles" ON user_roles FOR SELECT USING (auth.uid() = user_id);

-- classes, majors, student_classes
CREATE POLICY "Authenticated users can view majors" ON majors FOR SELECT USING (auth.uid() IS NOT NULL);
CREATE POLICY "Authenticated users can view classes" ON classes FOR SELECT USING (auth.uid() IS NOT NULL);
CREATE POLICY "Teachers can create classes" ON classes FOR INSERT WITH CHECK (
    EXISTS (SELECT 1 FROM user_roles WHERE user_id = auth.uid() AND role_id IN (1, 2))
);
CREATE POLICY "Teachers can update classes" ON classes FOR UPDATE USING (
    EXISTS (SELECT 1 FROM user_roles WHERE user_id = auth.uid() AND role_id IN (1, 2))
);
CREATE POLICY "Teachers can delete classes" ON classes FOR DELETE USING (
    EXISTS (SELECT 1 FROM user_roles WHERE user_id = auth.uid() AND role_id IN (1, 2))
);
CREATE POLICY "Authenticated users can view student_classes" ON student_classes FOR SELECT USING (auth.uid() IS NOT NULL);
CREATE POLICY "Teachers can manage student_classes" ON student_classes FOR INSERT WITH CHECK (
    EXISTS (SELECT 1 FROM user_roles WHERE user_id = auth.uid() AND role_id IN (1, 2))
);
CREATE POLICY "Teachers can update student_classes" ON student_classes FOR UPDATE USING (
    EXISTS (SELECT 1 FROM user_roles WHERE user_id = auth.uid() AND role_id IN (1, 2))
);
CREATE POLICY "Teachers can delete student_classes" ON student_classes FOR DELETE USING (
    EXISTS (SELECT 1 FROM user_roles WHERE user_id = auth.uid() AND role_id IN (1, 2))
);

-- topics
CREATE POLICY "Authenticated users can view topics" ON topics FOR SELECT USING (auth.uid() IS NOT NULL);

-- projects
CREATE POLICY "Authenticated users can view projects" ON projects FOR SELECT USING (auth.uid() IS NOT NULL);
CREATE POLICY "Authenticated users can view project_phases" ON project_phases FOR SELECT USING (auth.uid() IS NOT NULL);
CREATE POLICY "Teachers can create projects" ON projects FOR INSERT WITH CHECK (
    EXISTS (SELECT 1 FROM user_roles WHERE user_id = auth.uid() AND role_id IN (1, 2))
);
CREATE POLICY "Teachers can update projects" ON projects FOR UPDATE USING (
    EXISTS (SELECT 1 FROM user_roles WHERE user_id = auth.uid() AND role_id IN (1, 2))
);

-- groups
CREATE POLICY "Authenticated users can view groups" ON groups FOR SELECT USING (auth.uid() IS NOT NULL);
CREATE POLICY "Authenticated users can view group_members" ON group_members FOR SELECT USING (auth.uid() IS NOT NULL);
CREATE POLICY "Students can create groups" ON groups FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);
CREATE POLICY "Students can manage group_members" ON group_members FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);
CREATE POLICY "Students can update group_members" ON group_members FOR UPDATE USING (auth.uid() IS NOT NULL);
CREATE POLICY "Students can delete own group_members" ON group_members FOR DELETE USING (auth.uid() IS NOT NULL);
CREATE POLICY "Leaders can update groups" ON groups FOR UPDATE USING (
    leader_id = auth.uid() OR EXISTS (SELECT 1 FROM user_roles WHERE user_id = auth.uid() AND role_id IN (1, 2))
);

-- group_applications
CREATE POLICY "Students can apply groups" ON group_applications FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);
CREATE POLICY "Users can view own applications" ON group_applications FOR SELECT USING (
    student_id = auth.uid() OR auth.uid() IN (SELECT leader_id FROM groups WHERE id = group_id)
);

-- progress
CREATE POLICY "Authenticated users can view progress" ON progress FOR SELECT USING (auth.uid() IS NOT NULL);
CREATE POLICY "Students can create progress" ON progress FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);
CREATE POLICY "Users can update own progress" ON progress FOR UPDATE USING (
    reporter_id = auth.uid() OR EXISTS (SELECT 1 FROM user_roles WHERE user_id = auth.uid() AND role_id IN (1, 2))
);

-- documents
CREATE POLICY "Authenticated users can view documents" ON documents FOR SELECT USING (auth.uid() IS NOT NULL);
CREATE POLICY "Users can upload documents" ON documents FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);

-- scores
CREATE POLICY "Authenticated users can view scores" ON scores FOR SELECT USING (auth.uid() IS NOT NULL);
CREATE POLICY "Teachers can submit scores" ON scores FOR INSERT WITH CHECK (
    EXISTS (SELECT 1 FROM user_roles WHERE user_id = auth.uid() AND role_id IN (1, 2))
);
CREATE POLICY "Authenticated users can view score_dimensions" ON score_dimensions FOR SELECT USING (auth.uid() IS NOT NULL);
CREATE POLICY "Authenticated users can view project_score_configs" ON project_score_configs FOR SELECT USING (auth.uid() IS NOT NULL);
CREATE POLICY "Authenticated users can view score_summaries" ON score_summaries FOR SELECT USING (auth.uid() IS NOT NULL);

-- defenses
CREATE POLICY "Authenticated users can view defenses" ON defenses FOR SELECT USING (auth.uid() IS NOT NULL);
CREATE POLICY "Teachers can manage defenses" ON defenses FOR INSERT WITH CHECK (
    EXISTS (SELECT 1 FROM user_roles WHERE user_id = auth.uid() AND role_id IN (1, 2))
);
CREATE POLICY "Authenticated users can view defense_scores" ON defense_scores FOR SELECT USING (auth.uid() IS NOT NULL);
CREATE POLICY "Teachers can submit defense_scores" ON defense_scores FOR INSERT WITH CHECK (
    EXISTS (SELECT 1 FROM user_roles WHERE user_id = auth.uid() AND role_id IN (1, 2))
);

-- workloads
CREATE POLICY "Authenticated users can view workloads" ON workloads FOR SELECT USING (auth.uid() IS NOT NULL);
CREATE POLICY "Students can submit workloads" ON workloads FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);
CREATE POLICY "Users can update own workloads" ON workloads FOR UPDATE USING (
    student_id = auth.uid() OR EXISTS (SELECT 1 FROM user_roles WHERE user_id = auth.uid() AND role_id IN (1, 2))
);

-- announcements
CREATE POLICY "Authenticated users can view announcements" ON announcements FOR SELECT USING (auth.uid() IS NOT NULL);
CREATE POLICY "Teachers can create announcements" ON announcements FOR INSERT WITH CHECK (
    EXISTS (SELECT 1 FROM user_roles WHERE user_id = auth.uid() AND role_id IN (1, 2))
);
CREATE POLICY "Users can view own announcement_reads" ON announcement_reads FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert announcement_reads" ON announcement_reads FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);

-- operation_logs
CREATE POLICY "Users can insert own logs" ON operation_logs FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);
CREATE POLICY "Admins can view all logs" ON operation_logs FOR SELECT USING (
    EXISTS (SELECT 1 FROM user_roles WHERE user_id = auth.uid() AND role_id = 1)
);
CREATE POLICY "Users can view own logs" ON operation_logs FOR SELECT USING (user_id = auth.uid());

-- =====================================================
-- 14. 种子数据（不依赖用户数据）
-- =====================================================

-- 角色
INSERT INTO roles (name, display_name, description) VALUES
('admin', '管理员', '系统管理员，拥有所有权限'),
('teacher', '教师', '指导教师，可管理自己负责的项目'),
('student', '学生', '学生，可参与项目和提交作业');

-- 评分维度
INSERT INTO score_dimensions (name, description, default_weight, is_default) VALUES
('需求分析', '对项目需求的理解和分析能力', 15.00, 1),
('系统设计', '系统架构和详细设计能力', 20.00, 1),
('编码实现', '代码质量和功能实现', 30.00, 1),
('测试验证', '测试用例编写和问题发现', 10.00, 1),
('文档编写', '技术文档和使用说明', 10.00, 1),
('答辩表现', '项目汇报和现场答辩', 15.00, 1);

-- 权限
INSERT INTO permissions (name, display_name, resource, action, description) VALUES
('user:view', '查看用户', 'user', 'view', '查看用户列表'),
('user:create', '创建用户', 'user', 'create', '创建新用户'),
('user:edit', '编辑用户', 'user', 'edit', '编辑用户信息'),
('project:view', '查看项目', 'project', 'view', '查看项目'),
('project:create', '创建项目', 'project', 'create', '创建新项目'),
('project:edit', '编辑项目', 'project', 'edit', '编辑项目'),
('project:delete', '删除项目', 'project', 'delete', '删除项目'),
('group:view', '查看分组', 'group', 'view', '查看分组'),
('group:create', '创建分组', 'group', 'create', '创建分组'),
('group:edit', '编辑分组', 'group', 'edit', '编辑分组'),
('progress:view', '查看进度', 'progress', 'view', '查看进度'),
('progress:submit', '提交进度', 'progress', 'submit', '提交进度'),
('progress:approve', '审核进度', 'progress', 'approve', '审核进度'),
('document:view', '查看文档', 'document', 'view', '查看文档'),
('document:upload', '上传文档', 'document', 'upload', '上传文档'),
('score:view', '查看成绩', 'score', 'view', '查看成绩'),
('score:submit', '提交评分', 'score', 'submit', '提交评分'),
('defense:view', '查看答辩', 'defense', 'view', '查看答辩安排'),
('defense:schedule', '安排答辩', 'defense', 'schedule', '安排答辩'),
('workload:view', '查看工作量', 'workload', 'view', '查看工作量'),
('workload:submit', '填写工作量', 'workload', 'submit', '填写工作量'),
('announcement:view', '查看公告', 'announcement', 'view', '查看公告'),
('announcement:create', '创建公告', 'announcement', 'create', '创建公告');

-- 角色权限关联（使用子查询避免硬编码 ID）
INSERT INTO role_permissions (role_id, permission_id)
SELECT r.id, p.id FROM roles r, permissions p WHERE r.name = 'admin';

INSERT INTO role_permissions (role_id, permission_id)
SELECT r.id, p.id FROM roles r, permissions p
WHERE r.name = 'teacher'
AND p.name IN ('project:view', 'project:create', 'project:edit', 'project:delete',
    'group:view', 'group:create', 'group:edit',
    'progress:view', 'progress:approve',
    'document:view', 'document:upload',
    'score:view', 'score:submit',
    'defense:view', 'defense:schedule',
    'workload:view', 'workload:submit',
    'announcement:view', 'announcement:create');

INSERT INTO role_permissions (role_id, permission_id)
SELECT r.id, p.id FROM roles r, permissions p
WHERE r.name = 'student'
AND p.name IN ('project:view', 'group:view', 'group:create',
    'progress:view', 'progress:submit',
    'document:view', 'document:upload',
    'score:view', 'defense:view', 'workload:view', 'workload:submit',
    'announcement:view');

-- 专业
INSERT INTO majors (code, name, department, description) VALUES
('CS', '计算机科学与技术', '信息学院', '计算机科学与技术专业'),
('SE', '软件工程', '信息学院', '软件工程专业'),
('AI', '人工智能', '信息学院', '人工智能专业'),
('DS', '数据科学', '信息学院', '数据科学与大数据技术专业');

-- 班级
INSERT INTO classes (major_id, grade, class_no, name, student_count) VALUES
(1, 2024, 1, '计算机24-1班', 20),
(1, 2024, 2, '计算机24-2班', 22),
(2, 2024, 1, '软工24-1班', 25),
(2, 2024, 2, '软工24-2班', 23),
(3, 2024, 1, '人工智能24-1班', 18);

-- 题目
INSERT INTO topics (title, description, requirements, difficulty, estimated_days, tech_stack, max_group_size, min_group_size, status) VALUES
('电商平台开发', '基于Spring Boot + Vue的电商平台，包含商品管理、订单系统、支付功能等', '完成商品管理、订单系统、支付功能、用户权限模块', 3, 90, '["Java","Spring Boot","Vue","MySQL"]', 4, 2, 1),
('图书管理系统', '基于Node.js的图书借阅管理系统，支持图书检索、借阅、归还等功能', '完成图书CRUD、借阅归还流程、检索功能', 2, 60, '["Node.js","Express","React","MongoDB"]', 3, 2, 1),
('在线考试系统', '支持多题型、自动评分、防作弊功能的在线考试平台', '完成题库管理、在线考试、自动评分、防作弊', 3, 75, '["Python","Django","Vue","PostgreSQL"]', 4, 2, 1),
('智能问答机器人', '基于NLP的智能问答系统，支持知识库管理和多轮对话', '完成知识库管理、NLP模型、多轮对话', 4, 100, '["Python","PyTorch","NLP","FastAPI"]', 3, 2, 1),
('校园二手交易平台', '面向校园的二手物品交易平台，支持商品发布、私信沟通', '完成商品发布、搜索、私信、交易流程', 2, 60, '["Flutter","Dart","Firebase"]', 4, 2, 1),
('实验室预约系统', '实验室设备和场地预约管理系统', '完成设备预约、场地预约、审批流程', 2, 60, '["Java","Spring Boot","React","MySQL"]', 5, 2, 1);
