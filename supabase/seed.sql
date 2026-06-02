-- ============================================================
-- 种子数据：创建测试用户 + 分配角色 + 演示数据
-- ============================================================

-- 1. 创建测试用户（直接写 auth.users，免邮箱确认）
INSERT INTO auth.users (id, email, encrypted_password, email_confirmed_at, confirmation_sent_at, confirmed_at, raw_user_meta_data, created_at, updated_at, instance_id, aud, role)
SELECT * FROM (VALUES
  (gen_random_uuid(), 'admin@test.com',     crypt('admin123456', gen_salt('bf')), now(), now(), now(), '{"username":"admin","real_name":"系统管理员"}', now(), now(), '00000000-0000-0000-0000-000000000000', 'authenticated', 'authenticated'),
  (gen_random_uuid(), 'teacher@test.com',   crypt('teacher123456', gen_salt('bf')), now(), now(), now(), '{"username":"teacher","real_name":"张老师"}', now(), now(), '00000000-0000-0000-0000-000000000000', 'authenticated', 'authenticated'),
  (gen_random_uuid(), 'student@test.com',   crypt('student123456', gen_salt('bf')), now(), now(), now(), '{"username":"student","real_name":"李同学"}', now(), now(), '00000000-0000-0000-0000-000000000000', 'authenticated', 'authenticated')
) AS vals
WHERE NOT EXISTS (SELECT 1 FROM auth.users WHERE email IN ('admin@test.com','teacher@test.com','student@test.com'));
-- 注意：handle_new_user 触发器会自动在 profiles 表创建对应记录

-- 2. 获取用户 ID 和角色 ID 并分配角色
DO $$
DECLARE
  admin_id UUID;
  teacher_id UUID;
  student_id UUID;
  admin_role_id INT := 1;
  teacher_role_id INT := 2;
  student_role_id INT := 3;
BEGIN
  SELECT id INTO admin_id FROM auth.users WHERE email = 'admin@test.com';
  SELECT id INTO teacher_id FROM auth.users WHERE email = 'teacher@test.com';
  SELECT id INTO student_id FROM auth.users WHERE email = 'student@test.com';

  -- 分配角色
  INSERT INTO user_roles (user_id, role_id) VALUES
    (admin_id, admin_role_id),
    (teacher_id, teacher_role_id),
    (student_id, student_role_id)
  ON CONFLICT DO NOTHING;

  -- 3. 更新 topics 表的 creator_id
  UPDATE topics SET creator_id = teacher_id WHERE creator_id IS NULL;

  -- 4. 配置评分维度权重（如果还没配置）
  INSERT INTO project_score_configs (project_id, dimension_id, weight)
  SELECT p.id, sd.id, sd.default_weight
  FROM projects p CROSS JOIN score_dimensions sd
  WHERE p.id NOT IN (SELECT project_id FROM project_score_configs)
  ON CONFLICT DO NOTHING;

  -- 5. 创建演示项目（如果还没有）
  IF NOT EXISTS (SELECT 1 FROM projects WHERE title = '校园二手交易平台') THEN
    INSERT INTO projects (id, title, description, requirements, status, creator_id, teacher_id, tech_stack, difficulty, estimated_days, max_group_size, min_group_size)
    VALUES
      (gen_random_uuid(), '校园二手交易平台', '基于 React+Node.js 的校园二手交易平台', '实现商品发布、搜索、聊天、交易功能', 1, teacher_id, teacher_id, '["React","Node.js","PostgreSQL"]', 3, 60, 4, 2),
      (gen_random_uuid(), '图书馆座位预约系统', '基于 Vue+Spring Boot 的图书馆座位预约系统', '实现座位查看、预约、签到、违规管理', 1, teacher_id, teacher_id, '["Vue","Spring Boot","MySQL"]', 3, 45, 4, 2);
  END IF;

  -- 6. 创建演示公告（如果还没有）
  IF NOT EXISTS (SELECT 1 FROM announcements WHERE title = '关于2024年实训项目启动的通知') THEN
    INSERT INTO announcements (id, title, content, priority, created_by, created_at) VALUES
      (gen_random_uuid(), '关于2024年实训项目启动的通知', '2024年实训项目正式启动，请各位教师和学生及时登录系统查看项目信息。', 1, admin_id, now()),
      (gen_random_uuid(), '项目选题截止日期提醒', '请各小组在2024年3月15日前完成项目选题，逾期系统将自动分配。', 2, admin_id, now() + interval '1 day');
  END IF;
END $$;

-- 确认结果
SELECT '✅ 种子数据创建完成' AS result;
