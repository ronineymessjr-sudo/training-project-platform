-- =====================================================
-- 用户种子数据脚本
-- 先在 Supabase Dashboard → Authentication → Users 中创建以下用户：
--
-- 1. admin@training.com / password123 (管理员)
-- 2. teacher1@training.com / password123 (教师 - 张老师)
-- 3. teacher2@training.com / password123 (教师 - 李老师)
-- 4. student1@training.com / password123 (学生 - 李同学)
-- 5. student2@training.com / password123 (学生 - 王同学)
-- 6. student3@training.com / password123 (学生 - 赵同学)
-- 7. student4@training.com / password123 (学生 - 刘同学)
-- 8. student5@training.com / password123 (学生 - 陈同学)
-- 9. student6@training.com / password123 (学生 - 杨同学)
-- 10. student7@training.com / password123 (学生 - 黄同学)
-- 11. student8@training.com / password123 (学生 - 周同学)
--
-- 创建完成后，在 SQL Editor 中执行下面的脚本
-- 请将 'USER_UUID_HERE' 替换为实际的用户 UUID
-- =====================================================

-- 更新 profiles 表中的用户信息
-- 管理员
UPDATE profiles SET username = 'admin', real_name = '系统管理员', gender = 0 WHERE id = 'USER_UUID_ADMIN';

-- 教师
UPDATE profiles SET username = 'teacher001', real_name = '张老师', gender = 1 WHERE id = 'USER_UUID_TEACHER1';
UPDATE profiles SET username = 'teacher002', real_name = '李老师', gender = 1 WHERE id = 'USER_UUID_TEACHER2';

-- 学生
UPDATE profiles SET username = 'student001', real_name = '李同学', gender = 1 WHERE id = 'USER_UUID_STUDENT1';
UPDATE profiles SET username = 'student002', real_name = '王同学', gender = 1 WHERE id = 'USER_UUID_STUDENT2';
UPDATE profiles SET username = 'student003', real_name = '赵同学', gender = 2 WHERE id = 'USER_UUID_STUDENT3';
UPDATE profiles SET username = 'student004', real_name = '刘同学', gender = 1 WHERE id = 'USER_UUID_STUDENT4';
UPDATE profiles SET username = 'student005', real_name = '陈同学', gender = 2 WHERE id = 'USER_UUID_STUDENT5';
UPDATE profiles SET username = 'student006', real_name = '杨同学', gender = 1 WHERE id = 'USER_UUID_STUDENT6';
UPDATE profiles SET username = 'student007', real_name = '黄同学', gender = 2 WHERE id = 'USER_UUID_STUDENT7';
UPDATE profiles SET username = 'student008', real_name = '周同学', gender = 1 WHERE id = 'USER_UUID_STUDENT8';

-- 分配角色
-- 管理员
INSERT INTO user_roles (user_id, role_id) VALUES ('USER_UUID_ADMIN', 1);

-- 教师
INSERT INTO user_roles (user_id, role_id) VALUES ('USER_UUID_TEACHER1', 2);
INSERT INTO user_roles (user_id, role_id) VALUES ('USER_UUID_TEACHER2', 2);

-- 学生
INSERT INTO user_roles (user_id, role_id) VALUES ('USER_UUID_STUDENT1', 3);
INSERT INTO user_roles (user_id, role_id) VALUES ('USER_UUID_STUDENT2', 3);
INSERT INTO user_roles (user_id, role_id) VALUES ('USER_UUID_STUDENT3', 3);
INSERT INTO user_roles (user_id, role_id) VALUES ('USER_UUID_STUDENT4', 3);
INSERT INTO user_roles (user_id, role_id) VALUES ('USER_UUID_STUDENT5', 3);
INSERT INTO user_roles (user_id, role_id) VALUES ('USER_UUID_STUDENT6', 3);
INSERT INTO user_roles (user_id, role_id) VALUES ('USER_UUID_STUDENT7', 3);
INSERT INTO user_roles (user_id, role_id) VALUES ('USER_UUID_STUDENT8', 3);

-- 学生-班级关联
INSERT INTO student_classes (student_id, class_id) VALUES
('USER_UUID_STUDENT1', 1),
('USER_UUID_STUDENT2', 1),
('USER_UUID_STUDENT3', 1),
('USER_UUID_STUDENT4', 2),
('USER_UUID_STUDENT5', 2),
('USER_UUID_STUDENT6', 2),
('USER_UUID_STUDENT7', 3),
('USER_UUID_STUDENT8', 3);

-- 更新班级辅导员
UPDATE classes SET counselor_id = 'USER_UUID_TEACHER1' WHERE id IN (1, 2, 5);
UPDATE classes SET counselor_id = 'USER_UUID_TEACHER2' WHERE id IN (3, 4);

-- 更新题目的创建人
UPDATE topics SET creator_id = 'USER_UUID_TEACHER1' WHERE id IN (1, 2, 6);
UPDATE topics SET creator_id = 'USER_UUID_TEACHER2' WHERE id IN (3, 4, 5);

-- 创建项目
INSERT INTO projects (topic_id, name, description, class_id, teacher_id, start_date, end_date, status, config) VALUES
(1, '2024春季-电商平台开发', '2024年春季学期电商平台实训项目', 1, 'USER_UUID_TEACHER1', '2026-03-01', '2026-06-30', 1, '{"maxMembers":4,"phases":4}'),
(2, '2024春季-图书管理系统', '2024年春季学期图书管理实训项目', 2, 'USER_UUID_TEACHER1', '2026-03-01', '2026-06-30', 1, '{"maxMembers":3,"phases":4}'),
(3, '2024春季-在线考试系统', '2024年春季学期在线考试实训项目', 3, 'USER_UUID_TEACHER2', '2026-03-01', '2026-06-30', 1, '{"maxMembers":4,"phases":4}'),
(4, '2024春季-智能问答机器人', '2024年春季学期AI实训项目', 5, 'USER_UUID_TEACHER1', '2026-03-01', '2026-06-30', 1, '{"maxMembers":3,"phases":5}');

-- 创建项目阶段
INSERT INTO project_phases (project_id, name, description, start_date, end_date, weight, sort_order, status) VALUES
(1, '需求分析', '完成需求调研和分析文档', '2026-03-01', '2026-03-15', 15, 1, 1),
(1, '系统设计', '完成系统架构和详细设计', '2026-03-16', '2026-03-31', 20, 2, 1),
(1, '编码实现', '完成核心功能开发', '2026-04-01', '2026-05-15', 40, 3, 1),
(1, '测试答辩', '完成测试和答辩准备', '2026-05-16', '2026-06-30', 25, 4, 1),
(2, '需求分析', '完成需求调研和分析文档', '2026-03-01', '2026-03-15', 15, 1, 1),
(2, '系统设计', '完成系统架构和详细设计', '2026-03-16', '2026-03-31', 20, 2, 1),
(2, '编码实现', '完成核心功能开发', '2026-04-01', '2026-05-15', 40, 3, 1),
(2, '测试答辩', '完成测试和答辩准备', '2026-05-16', '2026-06-30', 25, 4, 1),
(3, '需求分析', '完成需求调研和分析文档', '2026-03-01', '2026-03-15', 15, 1, 1),
(3, '系统设计', '完成系统架构和详细设计', '2026-03-16', '2026-03-31', 20, 2, 1),
(3, '编码实现', '完成核心功能开发', '2026-04-01', '2026-05-15', 40, 3, 1),
(3, '测试答辩', '完成测试和答辩准备', '2026-05-16', '2026-06-30', 25, 4, 1),
(4, '需求分析', '完成需求调研和分析文档', '2026-03-01', '2026-03-15', 10, 1, 1),
(4, '系统设计', '完成系统架构和详细设计', '2026-03-16', '2026-03-31', 15, 2, 1),
(4, '编码实现', '完成核心功能开发', '2026-04-01', '2026-05-15', 30, 3, 1),
(4, '模型训练', '完成AI模型训练和优化', '2026-04-15', '2026-05-20', 25, 4, 1),
(4, '测试答辩', '完成测试和答辩准备', '2026-05-21', '2026-06-30', 20, 5, 1);

-- 创建分组
INSERT INTO groups (project_id, name, description, leader_id, max_members, status) VALUES
(1, '第一组-电商先锋', '电商平台开发第一组', 'USER_UUID_STUDENT1', 4, 1),
(1, '第二组-购物达人', '电商平台开发第二组', 'USER_UUID_STUDENT4', 4, 1),
(2, '第一组-书香阁', '图书管理系统第一组', 'USER_UUID_STUDENT6', 3, 1),
(3, '第一组-考试通', '在线考试系统第一组', 'USER_UUID_STUDENT7', 4, 1),
(4, '第一组-AI智囊团', '智能问答机器人第一组', 'USER_UUID_STUDENT8', 3, 1);

-- 分组成员
INSERT INTO group_members (group_id, student_id, role, status) VALUES
(1, 'USER_UUID_STUDENT1', 1, 1),
(1, 'USER_UUID_STUDENT2', 0, 1),
(1, 'USER_UUID_STUDENT3', 0, 1),
(2, 'USER_UUID_STUDENT4', 1, 1),
(2, 'USER_UUID_STUDENT5', 0, 1),
(3, 'USER_UUID_STUDENT6', 1, 1),
(3, 'USER_UUID_STUDENT7', 0, 1),
(4, 'USER_UUID_STUDENT1', 1, 1),
(4, 'USER_UUID_STUDENT2', 0, 1),
(5, 'USER_UUID_STUDENT3', 1, 1),
(5, 'USER_UUID_STUDENT4', 0, 1),
(5, 'USER_UUID_STUDENT5', 0, 1);

-- 进度记录
INSERT INTO progress (project_id, group_id, phase_id, title, content, completion_rate, reporter_id, report_date, status) VALUES
(1, 1, 1, '电商平台需求分析文档', '完成了用户调研和竞品分析，撰写了详细的需求规格说明书', 100, 'USER_UUID_STUDENT1', '2026-03-14', 2),
(1, 1, 2, '电商平台系统设计文档', '完成了系统架构设计、数据库设计和接口设计', 100, 'USER_UUID_STUDENT1', '2026-03-30', 2),
(1, 1, 3, '电商平台开发进度', '已完成用户模块和商品模块开发', 60, 'USER_UUID_STUDENT1', '2026-04-20', 1),
(2, 3, 1, '图书管理系统需求分析', '完成了需求调研和功能规划', 100, 'USER_UUID_STUDENT6', '2026-03-12', 2),
(2, 3, 2, '图书管理系统设计文档', '完成了数据库设计和API设计', 90, 'USER_UUID_STUDENT6', '2026-03-28', 1);

-- 评分
INSERT INTO scores (project_id, group_id, dimension_id, score, comment, scorer_id) VALUES
(1, 1, 1, 85, '需求分析较为全面', 'USER_UUID_TEACHER1'),
(1, 1, 2, 88, '架构设计合理', 'USER_UUID_TEACHER1'),
(1, 1, 3, 82, '代码质量良好', 'USER_UUID_TEACHER1'),
(2, 3, 1, 90, '需求分析非常详细', 'USER_UUID_TEACHER1'),
(2, 3, 2, 85, '设计文档规范', 'USER_UUID_TEACHER1');

-- 答辩安排
INSERT INTO defenses (project_id, group_id, title, defense_date, start_time, end_time, location, panel_teacher_ids, secretary_id, status, max_duration) VALUES
(1, 1, '电商平台开发-第一组答辩', '2026-06-25', '09:00:00', '10:00:00', '信息楼301', '["USER_UUID_TEACHER1","USER_UUID_TEACHER2"]', 'USER_UUID_TEACHER2', 0, 60),
(1, 2, '电商平台开发-第二组答辩', '2026-06-25', '10:00:00', '11:00:00', '信息楼301', '["USER_UUID_TEACHER1","USER_UUID_TEACHER2"]', 'USER_UUID_TEACHER2', 0, 60),
(2, 3, '图书管理系统-第一组答辩', '2026-06-25', '14:00:00', '15:00:00', '信息楼302', '["USER_UUID_TEACHER1","USER_UUID_TEACHER2"]', 'USER_UUID_TEACHER1', 0, 60),
(3, 4, '在线考试系统-第一组答辩', '2026-06-26', '09:00:00', '10:00:00', '信息楼301', '["USER_UUID_TEACHER1","USER_UUID_TEACHER2"]', 'USER_UUID_TEACHER1', 0, 60),
(4, 5, '智能问答机器人-第一组答辩', '2026-06-26', '10:00:00', '11:00:00', '信息楼302', '["USER_UUID_TEACHER1","USER_UUID_TEACHER2"]', 'USER_UUID_TEACHER2', 0, 60);

-- 工作量
INSERT INTO workloads (project_id, group_id, student_id, task_name, task_description, task_type, estimated_hours, actual_hours, completion_rate, contribution_ratio, status, report_date, verified_by, verified_at) VALUES
(1, 1, 'USER_UUID_STUDENT1', '需求调研与用户访谈', '负责需求调研和用户访谈', 1, 20, 22, 100, 0.30, 2, '2026-03-14', 'USER_UUID_TEACHER1', '2026-03-15'),
(1, 1, 'USER_UUID_STUDENT2', '需求文档编写', '参与需求文档编写', 1, 15, 16, 100, 0.20, 2, '2026-03-14', 'USER_UUID_TEACHER1', '2026-03-15'),
(1, 1, 'USER_UUID_STUDENT3', '会议记录整理', '整理需求分析会议记录', 1, 10, 12, 100, 0.15, 2, '2026-03-14', 'USER_UUID_TEACHER1', '2026-03-15'),
(1, 1, 'USER_UUID_STUDENT1', '系统架构设计', '负责系统架构设计', 2, 25, 28, 100, 0.35, 2, '2026-03-30', 'USER_UUID_TEACHER1', '2026-04-01'),
(1, 1, 'USER_UUID_STUDENT2', '数据库设计', '负责数据库设计', 2, 20, 22, 100, 0.25, 2, '2026-03-30', 'USER_UUID_TEACHER1', '2026-04-01'),
(2, 3, 'USER_UUID_STUDENT6', '需求分析', '独立完成需求分析', 1, 30, 32, 100, 0.40, 2, '2026-03-12', 'USER_UUID_TEACHER1', '2026-03-13'),
(2, 3, 'USER_UUID_STUDENT7', '需求调研协助', '协助需求调研', 1, 12, 14, 100, 0.20, 2, '2026-03-12', 'USER_UUID_TEACHER1', '2026-03-13');

-- 更新公告的发布人
UPDATE announcements SET publisher_id = 'USER_UUID_ADMIN' WHERE title = '实训项目启动通知';
UPDATE announcements SET publisher_id = 'USER_UUID_TEACHER1' WHERE title IN ('项目进度提交截止日期提醒', '答辩安排通知');
UPDATE announcements SET publisher_id = 'USER_UUID_ADMIN' WHERE title = '关于规范文档格式的通知';
