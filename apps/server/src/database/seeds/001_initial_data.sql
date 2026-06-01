-- =====================================================
-- Seed Data: Complete Test Data for Training Platform
-- =====================================================

-- =====================================================
-- 1. Roles (角色)
-- =====================================================
INSERT INTO `roles` (`name`, `display_name`, `description`, `created_at`) VALUES
('admin', '管理员', '系统管理员，拥有所有权限', NOW()),
('teacher', '教师', '指导教师，可管理自己负责的项目', NOW()),
('student', '学生', '学生，可参与项目和提交作业', NOW());

-- =====================================================
-- 2. Score Dimensions (评分维度)
-- =====================================================
INSERT INTO `score_dimensions` (`name`, `description`, `default_weight`, `is_default`, `created_at`) VALUES
('需求分析', '对项目需求的理解和分析能力', 15.00, 1, NOW()),
('系统设计', '系统架构和详细设计能力', 20.00, 1, NOW()),
('编码实现', '代码质量和功能实现', 30.00, 1, NOW()),
('测试验证', '测试用例编写和问题发现', 10.00, 1, NOW()),
('文档编写', '技术文档和使用说明', 10.00, 1, NOW()),
('答辩表现', '项目汇报和现场答辩', 15.00, 1, NOW());

-- =====================================================
-- 3. Permissions (权限)
-- =====================================================
INSERT INTO `permissions` (`name`, `display_name`, `resource`, `action`, `description`, `created_at`) VALUES
-- User management
('user:view', '查看用户', 'user', 'view', '查看用户列表', NOW()),
('user:create', '创建用户', 'user', 'create', '创建新用户', NOW()),
('user:edit', '编辑用户', 'user', 'edit', '编辑用户信息', NOW()),
('user:delete', '删除用户', 'user', 'delete', '删除用户', NOW()),

-- Role management
('role:view', '查看角色', 'role', 'view', '查看角色列表', NOW()),
('role:create', '创建角色', 'role', 'create', '创建新角色', NOW()),
('role:edit', '编辑角色', 'role', 'edit', '编辑角色', NOW()),
('role:delete', '删除角色', 'role', 'delete', '删除角色', NOW()),
('role:assign', '分配角色', 'role', 'assign', '分配用户角色', NOW()),

-- Project management
('project:view', '查看项目', 'project', 'view', '查看项目', NOW()),
('project:create', '创建项目', 'project', 'create', '创建新项目', NOW()),
('project:edit', '编辑项目', 'project', 'edit', '编辑项目', NOW()),
('project:delete', '删除项目', 'project', 'delete', '删除项目', NOW()),
('project:manage', '管理项目', 'project', 'manage', '管理项目全流程', NOW()),

-- Topic management
('topic:view', '查看题目', 'topic', 'view', '查看题目', NOW()),
('topic:create', '创建题目', 'topic', 'create', '创建新题目', NOW()),
('topic:edit', '编辑题目', 'topic', 'edit', '编辑题目', NOW()),
('topic:delete', '删除题目', 'topic', 'delete', '删除题目', NOW()),

-- Group management
('group:view', '查看分组', 'group', 'view', '查看分组', NOW()),
('group:create', '创建分组', 'group', 'create', '创建分组', NOW()),
('group:edit', '编辑分组', 'group', 'edit', '编辑分组', NOW()),
('group:delete', '删除分组', 'group', 'delete', '删除分组', NOW()),
('group:approve', '审核分组', 'group', 'approve', '审核分组申请', NOW()),

-- Progress management
('progress:view', '查看进度', 'progress', 'view', '查看进度', NOW()),
('progress:submit', '提交进度', 'progress', 'submit', '提交进度', NOW()),
('progress:approve', '审核进度', 'progress', 'approve', '审核进度', NOW()),

-- Document management
('document:view', '查看文档', 'document', 'view', '查看文档', NOW()),
('document:upload', '上传文档', 'document', 'upload', '上传文档', NOW()),
('document:delete', '删除文档', 'document', 'delete', '删除文档', NOW()),

-- Score management
('score:view', '查看成绩', 'score', 'view', '查看成绩', NOW()),
('score:submit', '提交评分', 'score', 'submit', '提交评分', NOW()),
('score:config', '配置评分', 'score', 'config', '配置评分规则', NOW()),

-- Defense management
('defense:view', '查看答辩', 'defense', 'view', '查看答辩安排', NOW()),
('defense:schedule', '安排答辩', 'defense', 'schedule', '安排答辩', NOW()),
('defense:score', '答辩评分', 'defense', 'score', '答辩评分', NOW()),

-- Workload management
('workload:view', '查看工作量', 'workload', 'view', '查看工作量', NOW()),
('workload:submit', '填写工作量', 'workload', 'submit', '填写工作量', NOW()),
('workload:verify', '审核工作量', 'workload', 'verify', '审核工作量', NOW()),

-- Export management
('export:project', '导出项目', 'export', 'project', '导出项目清单', NOW()),
('export:group', '导出分组', 'export', 'group', '导出分组表', NOW()),
('export:score', '导出成绩', 'export', 'score', '导出成绩表', NOW()),

-- Class management
('class:view', '查看班级', 'class', 'view', '查看班级', NOW()),
('class:create', '创建班级', 'class', 'create', '创建班级', NOW()),
('class:edit', '编辑班级', 'class', 'edit', '编辑班级', NOW()),
('class:import', '导入学生', 'class', 'import', '导入学生', NOW()),

-- Menu management
('menu:view', '查看菜单', 'menu', 'view', '查看菜单', NOW()),
('menu:create', '创建菜单', 'menu', 'create', '创建菜单', NOW()),
('menu:edit', '编辑菜单', 'menu', 'edit', '编辑菜单', NOW()),
('menu:delete', '删除菜单', 'menu', 'delete', '删除菜单', NOW());

-- =====================================================
-- 4. Role Permissions (角色权限) - 使用子查询
-- =====================================================

-- Admin: 全部权限
INSERT INTO `role_permissions` (`role_id`, `permission_id`)
SELECT 1, id FROM `permissions`;

-- Teacher: 项目/题目/分组/进度/文档/评分/答辩/工作量/导出 相关权限
INSERT INTO `role_permissions` (`role_id`, `permission_id`)
SELECT 2, id FROM `permissions` WHERE `name` LIKE 'project:%'
OR `name` LIKE 'topic:%'
OR `name` LIKE 'group:%'
OR `name` LIKE 'progress:%'
OR `name` LIKE 'document:%'
OR `name` LIKE 'score:%'
OR `name` LIKE 'defense:%'
OR `name` LIKE 'workload:%'
OR `name` LIKE 'export:%';

-- Student: 查看类权限 + 提交/创建/编辑类权限
INSERT INTO `role_permissions` (`role_id`, `permission_id`)
SELECT 3, id FROM `permissions` WHERE `name` LIKE '%:view'
OR `name` = 'group:create'
OR `name` = 'group:edit'
OR `name` = 'progress:submit'
OR `name` = 'document:upload'
OR `name` = 'workload:submit';

-- =====================================================
-- 5. Users (用户)
-- =====================================================

-- Admin (password: password123)
INSERT INTO `users` (`username`, `password_hash`, `real_name`, `email`, `phone`, `avatar_url`, `gender`, `status`, `last_login_at`, `created_at`, `updated_at`) VALUES
('admin', '$2b$10$EixZaYVK1fsbw1ZfbX3OXePaWxn96p36Kz2G41kVfB3TqN7TmZfGO', '系统管理员', 'admin@example.com', '13800000000', NULL, 0, 1, NULL, NOW(), NOW());

-- Teachers (password: password123)
INSERT INTO `users` (`username`, `password_hash`, `real_name`, `email`, `phone`, `avatar_url`, `gender`, `status`, `last_login_at`, `created_at`, `updated_at`) VALUES
('teacher001', '$2b$10$EixZaYVK1fsbw1ZfbX3OXePaWxn96p36Kz2G41kVfB3TqN7TmZfGO', '张老师', 'teacher1@example.com', '13800138001', NULL, 1, 1, NULL, NOW(), NOW()),
('teacher002', '$2b$10$EixZaYVK1fsbw1ZfbX3OXePaWxn96p36Kz2G41kVfB3TqN7TmZfGO', '李老师', 'teacher2@example.com', '13800138002', NULL, 1, 1, NULL, NOW(), NOW());

-- Students (password: password123)
INSERT INTO `users` (`username`, `password_hash`, `real_name`, `email`, `phone`, `avatar_url`, `gender`, `status`, `last_login_at`, `created_at`, `updated_at`) VALUES
('student001', '$2b$10$EixZaYVK1fsbw1ZfbX3OXePaWxn96p36Kz2G41kVfB3TqN7TmZfGO', '李同学', 'student1@example.com', '13900139001', NULL, 1, 1, NULL, NOW(), NOW()),
('student002', '$2b$10$EixZaYVK1fsbw1ZfbX3OXePaWxn96p36Kz2G41kVfB3TqN7TmZfGO', '王同学', 'student2@example.com', '13900139002', NULL, 1, 1, NULL, NOW(), NOW()),
('student003', '$2b$10$EixZaYVK1fsbw1ZfbX3OXePaWxn96p36Kz2G41kVfB3TqN7TmZfGO', '赵同学', 'student3@example.com', '13900139003', NULL, 2, 1, NULL, NOW(), NOW()),
('student004', '$2b$10$EixZaYVK1fsbw1ZfbX3OXePaWxn96p36Kz2G41kVfB3TqN7TmZfGO', '刘同学', 'student4@example.com', '13900139004', NULL, 1, 1, NULL, NOW(), NOW()),
('student005', '$2b$10$EixZaYVK1fsbw1ZfbX3OXePaWxn96p36Kz2G41kVfB3TqN7TmZfGO', '陈同学', 'student5@example.com', '13900139005', NULL, 2, 1, NULL, NOW(), NOW()),
('student006', '$2b$10$EixZaYVK1fsbw1ZfbX3OXePaWxn96p36Kz2G41kVfB3TqN7TmZfGO', '杨同学', 'student6@example.com', '13900139006', NULL, 1, 1, NULL, NOW(), NOW()),
('student007', '$2b$10$EixZaYVK1fsbw1ZfbX3OXePaWxn96p36Kz2G41kVfB3TqN7TmZfGO', '黄同学', 'student7@example.com', '13900139007', NULL, 2, 1, NULL, NOW(), NOW()),
('student008', '$2b$10$EixZaYVK1fsbw1ZfbX3OXePaWxn96p36Kz2G41kVfB3TqN7TmZfGO', '周同学', 'student8@example.com', '13900139008', NULL, 1, 1, NULL, NOW(), NOW());

-- =====================================================
-- 6. User Roles (用户角色关联)
-- =====================================================
INSERT INTO `user_roles` (`user_id`, `role_id`, `created_at`) VALUES
(1, 1, NOW()),
(2, 2, NOW()),
(3, 2, NOW()),
(4, 3, NOW()),
(5, 3, NOW()),
(6, 3, NOW()),
(7, 3, NOW()),
(8, 3, NOW()),
(9, 3, NOW()),
(10, 3, NOW()),
(11, 3, NOW());

-- =====================================================
-- 7. Majors (专业)
-- =====================================================
INSERT INTO `majors` (`code`, `name`, `department`, `description`, `created_at`) VALUES
('CS', '计算机科学与技术', '信息学院', '计算机科学与技术专业', NOW()),
('SE', '软件工程', '信息学院', '软件工程专业', NOW()),
('AI', '人工智能', '信息学院', '人工智能专业', NOW()),
('DS', '数据科学', '信息学院', '数据科学与大数据技术专业', NOW());

-- =====================================================
-- 8. Classes (班级)
-- =====================================================
INSERT INTO `classes` (`major_id`, `grade`, `class_no`, `name`, `counselor_id`, `student_count`, `created_at`) VALUES
(1, 2024, 1, '计算机24-1班', 2, 20, NOW()),
(1, 2024, 2, '计算机24-2班', 2, 22, NOW()),
(2, 2024, 1, '软工24-1班', 3, 25, NOW()),
(2, 2024, 2, '软工24-2班', 3, 23, NOW()),
(3, 2024, 1, '人工智能24-1班', 2, 18, NOW());

-- =====================================================
-- 9. Student Classes (学生-班级关联)
-- =====================================================
INSERT INTO `student_classes` (`student_id`, `class_id`, `created_at`) VALUES
(4, 1, NOW()),
(5, 1, NOW()),
(6, 1, NOW()),
(7, 2, NOW()),
(8, 2, NOW()),
(9, 2, NOW()),
(10, 3, NOW()),
(11, 3, NOW());

-- =====================================================
-- 10. Topics (题目)
-- =====================================================
INSERT INTO `topics` (`title`, `description`, `requirements`, `difficulty`, `estimated_days`, `tech_stack`, `max_group_size`, `min_group_size`, `creator_id`, `status`, `created_at`, `updated_at`) VALUES
('电商平台开发', '基于Spring Boot + Vue的电商平台，包含商品管理、订单系统、支付功能等', '完成商品管理、订单系统、支付功能、用户权限模块', 3, 90, '["Java","Spring Boot","Vue","MySQL"]', 4, 2, 2, 1, NOW(), NOW()),
('图书管理系统', '基于Node.js的图书借阅管理系统，支持图书检索、借阅、归还等功能', '完成图书CRUD、借阅归还流程、检索功能', 2, 60, '["Node.js","Express","React","MongoDB"]', 3, 2, 2, 1, NOW(), NOW()),
('在线考试系统', '支持多题型、自动评分、防作弊功能的在线考试平台', '完成题库管理、在线考试、自动评分、防作弊', 3, 75, '["Python","Django","Vue","PostgreSQL"]', 4, 2, 2, 1, NOW(), NOW()),
('智能问答机器人', '基于NLP的智能问答系统，支持知识库管理和多轮对话', '完成知识库管理、NLP模型、多轮对话', 4, 100, '["Python","PyTorch","NLP","FastAPI"]', 3, 2, 3, 1, NOW(), NOW()),
('校园二手交易平台', '面向校园的二手物品交易平台，支持商品发布、私信沟通', '完成商品发布、搜索、私信、交易流程', 2, 60, '["Flutter","Dart","Firebase"]', 4, 2, 3, 1, NOW(), NOW()),
('实验室预约系统', '实验室设备和场地预约管理系统', '完成设备预约、场地预约、审批流程', 2, 60, '["Java","Spring Boot","React","MySQL"]', 5, 2, 2, 1, NOW(), NOW());

-- =====================================================
-- 11. Projects (项目)
-- =====================================================
INSERT INTO `projects` (`topic_id`, `name`, `description`, `class_id`, `teacher_id`, `start_date`, `end_date`, `status`, `config`, `created_at`, `updated_at`) VALUES
(1, '2024春季-电商平台开发', '2024年春季学期电商平台实训项目', 1, 2, '2026-03-01', '2026-06-30', 1, '{"maxMembers":4,"phases":4}', NOW(), NOW()),
(2, '2024春季-图书管理系统', '2024年春季学期图书管理实训项目', 2, 2, '2026-03-01', '2026-06-30', 1, '{"maxMembers":3,"phases":4}', NOW(), NOW()),
(3, '2024春季-在线考试系统', '2024年春季学期在线考试实训项目', 3, 3, '2026-03-01', '2026-06-30', 1, '{"maxMembers":4,"phases":4}', NOW(), NOW()),
(4, '2024春季-智能问答机器人', '2024年春季学期AI实训项目', 5, 2, '2026-03-01', '2026-06-30', 1, '{"maxMembers":3,"phases":5}', NOW(), NOW());

-- =====================================================
-- 12. Project Phases (项目阶段)
-- =====================================================
INSERT INTO `project_phases` (`project_id`, `name`, `description`, `start_date`, `end_date`, `weight`, `sort_order`, `status`) VALUES
-- Project 1: 电商平台开发 (4 phases)
(1, '需求分析', '完成需求调研和分析文档', '2026-03-01', '2026-03-15', 15, 1, 1),
(1, '系统设计', '完成系统架构和详细设计', '2026-03-16', '2026-03-31', 20, 2, 1),
(1, '编码实现', '完成核心功能开发', '2026-04-01', '2026-05-15', 40, 3, 1),
(1, '测试答辩', '完成测试和答辩准备', '2026-05-16', '2026-06-30', 25, 4, 1),

-- Project 2: 图书管理系统 (4 phases)
(2, '需求分析', '完成需求调研和分析文档', '2026-03-01', '2026-03-15', 15, 1, 1),
(2, '系统设计', '完成系统架构和详细设计', '2026-03-16', '2026-03-31', 20, 2, 1),
(2, '编码实现', '完成核心功能开发', '2026-04-01', '2026-05-15', 40, 3, 1),
(2, '测试答辩', '完成测试和答辩准备', '2026-05-16', '2026-06-30', 25, 4, 1),

-- Project 3: 在线考试系统 (4 phases)
(3, '需求分析', '完成需求调研和分析文档', '2026-03-01', '2026-03-15', 15, 1, 1),
(3, '系统设计', '完成系统架构和详细设计', '2026-03-16', '2026-03-31', 20, 2, 1),
(3, '编码实现', '完成核心功能开发', '2026-04-01', '2026-05-15', 40, 3, 1),
(3, '测试答辩', '完成测试和答辩准备', '2026-05-16', '2026-06-30', 25, 4, 1),

-- Project 4: 智能问答机器人 (5 phases)
(4, '需求分析', '完成需求调研和分析文档', '2026-03-01', '2026-03-15', 10, 1, 1),
(4, '系统设计', '完成系统架构和详细设计', '2026-03-16', '2026-03-31', 15, 2, 1),
(4, '编码实现', '完成核心功能开发', '2026-04-01', '2026-05-15', 30, 3, 1),
(4, '模型训练', '完成AI模型训练和优化', '2026-04-15', '2026-05-20', 25, 4, 1),
(4, '测试答辩', '完成测试和答辩准备', '2026-05-21', '2026-06-30', 20, 5, 1);

-- =====================================================
-- 13. Groups (分组)
-- =====================================================
INSERT INTO `groups` (`project_id`, `name`, `description`, `leader_id`, `max_members`, `status`, `created_at`) VALUES
(1, '第一组-电商先锋', '电商平台开发第一组', 4, 4, 1, NOW()),
(1, '第二组-购物达人', '电商平台开发第二组', 5, 4, 1, NOW()),
(2, '第一组-书香阁', '图书管理系统第一组', 6, 3, 1, NOW()),
(3, '第一组-考试通', '在线考试系统第一组', 7, 4, 1, NOW()),
(4, '第一组-AI智囊团', '智能问答机器人第一组', 8, 3, 1, NOW());

-- =====================================================
-- 14. Group Members (分组成员)
-- role: TINYINT - 0=成员, 1=组长
-- =====================================================
INSERT INTO `group_members` (`group_id`, `student_id`, `role`, `joined_at`, `status`) VALUES
(1, 4, 1, NOW(), 1),
(1, 5, 0, NOW(), 1),
(1, 6, 0, NOW(), 1),
(2, 7, 1, NOW(), 1),
(2, 8, 0, NOW(), 1),
(3, 9, 1, NOW(), 1),
(3, 10, 0, NOW(), 1),
(4, 4, 1, NOW(), 1),
(4, 5, 0, NOW(), 1),
(5, 6, 1, NOW(), 1),
(5, 7, 0, NOW(), 1),
(5, 8, 0, NOW(), 1);

-- =====================================================
-- 15. Progress (进度报告)
-- =====================================================
INSERT INTO `progress` (`project_id`, `group_id`, `phase_id`, `title`, `content`, `completion_rate`, `reporter_id`, `report_date`, `status`, `created_at`, `updated_at`) VALUES
(1, 1, 1, '电商平台需求分析文档', '完成了用户调研和竞品分析，撰写了详细的需求规格说明书', 100, 4, '2026-03-14 10:00:00', 2, NOW(), NOW()),
(1, 1, 2, '电商平台系统设计文档', '完成了系统架构设计、数据库设计和接口设计', 100, 4, '2026-03-30 16:00:00', 2, NOW(), NOW()),
(1, 1, 3, '电商平台开发进度', '已完成用户模块和商品模块开发', 60, 4, '2026-04-20 10:00:00', 1, NOW(), NOW()),
(2, 3, 1, '图书管理系统需求分析', '完成了需求调研和功能规划', 100, 9, '2026-03-12 14:00:00', 2, NOW(), NOW()),
(2, 3, 2, '图书管理系统设计文档', '完成了数据库设计和API设计', 90, 9, '2026-03-28 16:00:00', 1, NOW(), NOW());

-- =====================================================
-- 16. Documents (文档)
-- =====================================================
INSERT INTO `documents` (`project_id`, `group_id`, `uploader_id`, `name`, `type`, `file_url`, `file_size`, `file_hash`, `description`, `category`, `status`, `download_count`, `created_at`, `updated_at`) VALUES
(1, 1, 4, '需求规格说明书.pdf', 'pdf', '/uploads/doc1.pdf', 2048000, 'abc123def456', '电商平台需求分析文档', 'requirement', 1, 5, NOW(), NOW()),
(1, 1, 4, '系统设计文档.pdf', 'pdf', '/uploads/doc2.pdf', 3584000, 'def456abc789', '电商平台系统设计文档', 'design', 1, 3, NOW(), NOW()),
(1, 1, 4, '项目进度报告.docx', 'docx', '/uploads/doc3.docx', 1024000, 'ghi789jkl012', '第一周项目进度报告', 'report', 1, 2, NOW(), NOW()),
(2, 3, 9, '图书管理系统需求文档.pdf', 'pdf', '/uploads/doc4.pdf', 1843200, 'mno345pqr678', '图书管理系统需求分析', 'requirement', 1, 4, NOW(), NOW()),
(2, 3, 9, '数据库设计说明书.docx', 'docx', '/uploads/doc5.docx', 921600, 'stu901vwx234', '数据库设计详细说明', 'design', 1, 2, NOW(), NOW());

-- =====================================================
-- 17. Scores (评分)
-- =====================================================
INSERT INTO `scores` (`project_id`, `group_id`, `dimension_id`, `score`, `comment`, `scorer_id`, `scored_at`) VALUES
(1, 1, 1, 85, '需求分析较为全面', 2, '2026-04-01 10:00:00'),
(1, 1, 2, 88, '架构设计合理', 2, '2026-04-01 10:00:00'),
(1, 1, 3, 82, '代码质量良好', 2, '2026-04-01 10:00:00'),
(2, 3, 1, 90, '需求分析非常详细', 2, '2026-04-02 09:00:00'),
(2, 3, 2, 85, '设计文档规范', 2, '2026-04-02 09:00:00');

-- =====================================================
-- 18. Defenses (答辩)
-- panel_teacher_ids: JSON array
-- =====================================================
INSERT INTO `defenses` (`project_id`, `group_id`, `title`, `defense_date`, `start_time`, `end_time`, `location`, `panel_teacher_ids`, `secretary_id`, `status`, `max_duration`, `created_at`, `updated_at`) VALUES
(1, 1, '电商平台开发-第一组答辩', '2026-06-25', '09:00:00', '10:00:00', '信息楼301', '[2, 3]', 3, 0, 60, NOW(), NOW()),
(1, 2, '电商平台开发-第二组答辩', '2026-06-25', '10:00:00', '11:00:00', '信息楼301', '[2, 3]', 3, 0, 60, NOW(), NOW()),
(2, 3, '图书管理系统-第一组答辩', '2026-06-25', '14:00:00', '15:00:00', '信息楼302', '[2, 3]', 2, 0, 60, NOW(), NOW()),
(3, 4, '在线考试系统-第一组答辩', '2026-06-26', '09:00:00', '10:00:00', '信息楼301', '[2, 3]', 2, 0, 60, NOW(), NOW()),
(4, 5, '智能问答机器人-第一组答辩', '2026-06-26', '10:00:00', '11:00:00', '信息楼302', '[2, 3]', 3, 0, 60, NOW(), NOW());

-- =====================================================
-- 19. Workloads (工作量)
-- =====================================================
INSERT INTO `workloads` (`project_id`, `group_id`, `student_id`, `task_name`, `task_description`, `task_type`, `estimated_hours`, `actual_hours`, `completion_rate`, `contribution_ratio`, `status`, `report_date`, `verified_by`, `verified_at`, `created_at`, `updated_at`) VALUES
(1, 1, 4, '需求调研与用户访谈', '负责需求调研和用户访谈', 'analysis', 20, 22, 100, 0.30, 2, '2026-03-14 10:00:00', 2, '2026-03-15 14:00:00', NOW(), NOW()),
(1, 1, 5, '需求文档编写', '参与需求文档编写', 'analysis', 15, 16, 100, 0.20, 2, '2026-03-14 10:00:00', 2, '2026-03-15 14:00:00', NOW(), NOW()),
(1, 1, 6, '会议记录整理', '整理需求分析会议记录', 'analysis', 10, 12, 100, 0.15, 2, '2026-03-14 10:00:00', 2, '2026-03-15 14:00:00', NOW(), NOW()),
(1, 1, 4, '系统架构设计', '负责系统架构设计', 'design', 25, 28, 100, 0.35, 2, '2026-03-30 16:00:00', 2, '2026-04-01 09:00:00', NOW(), NOW()),
(1, 1, 5, '数据库设计', '负责数据库设计', 'design', 20, 22, 100, 0.25, 2, '2026-03-30 16:00:00', 2, '2026-04-01 09:00:00', NOW(), NOW()),
(2, 3, 9, '需求分析', '独立完成需求分析', 'analysis', 30, 32, 100, 0.40, 2, '2026-03-12 14:00:00', 2, '2026-03-13 10:00:00', NOW(), NOW()),
(2, 3, 10, '需求调研协助', '协助需求调研', 'analysis', 12, 14, 100, 0.20, 2, '2026-03-12 14:00:00', 2, '2026-03-13 10:00:00', NOW(), NOW());

-- =====================================================
-- 20. Announcements (公告)
-- target_roles: JSON array of role names
-- =====================================================
INSERT INTO `announcements` (`project_id`, `title`, `content`, `type`, `priority`, `publisher_id`, `target_roles`, `status`, `published_at`, `created_at`, `updated_at`) VALUES
(1, '2024春季实训项目启动通知', '各位同学，2024春季实训项目正式启动，请大家尽快完成组队和选题。', 'notice', 1, 1, '["admin","teacher","student"]', 1, '2026-03-01 09:00:00', NOW(), NOW()),
(1, '项目进度提交截止日期提醒', '请各位组长注意，第一阶段进度提交截止日期为3月15日。', 'reminder', 2, 2, '["teacher","student"]', 1, '2026-03-10 10:00:00', NOW(), NOW()),
(1, '答辩安排通知', '项目答辩将于6月25日至6月30日进行，请各组做好准备。', 'notice', 1, 2, '["teacher","student"]', 1, '2026-06-01 09:00:00', NOW(), NOW()),
(1, '关于规范文档格式的通知', '请各位同学按照模板规范编写文档，确保格式统一。', 'notice', 0, 1, '["student"]', 1, '2026-03-05 14:00:00', NOW(), NOW());
