/**
 * SQLite 快速初始化脚本
 * 不依赖 Docker/MySQL，使用 SQLite 做内嵌数据库
 * 执行: node scripts/init-sqlite.js
 */

const Database = require('better-sqlite3');
const path = require('path');
const bcrypt = require('bcryptjs');
const fs = require('fs');

const DB_PATH = path.join(__dirname, '..', 'data', 'training.db');

// 确保目录存在
const dir = path.dirname(DB_PATH);
if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });

console.log('📂 数据库路径:', DB_PATH);

const db = new Database(DB_PATH);

// 启用 WAL 模式和外键
db.pragma('journal_mode = WAL');
db.pragma('foreign_keys = ON');

console.log('🔄 开始建表...');

// ===== 建表 =====
db.exec(`
  CREATE TABLE IF NOT EXISTS roles (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL UNIQUE,
    display_name TEXT NOT NULL,
    description TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
  );

  CREATE TABLE IF NOT EXISTS permissions (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL UNIQUE,
    display_name TEXT NOT NULL,
    resource TEXT,
    action TEXT,
    description TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
  );

  CREATE TABLE IF NOT EXISTS role_permissions (
    role_id INTEGER NOT NULL,
    permission_id INTEGER NOT NULL,
    PRIMARY KEY (role_id, permission_id)
  );

  CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    username TEXT NOT NULL UNIQUE,
    password_hash TEXT NOT NULL,
    real_name TEXT,
    email TEXT,
    phone TEXT,
    avatar_url TEXT,
    gender INTEGER DEFAULT 0,
    status INTEGER DEFAULT 1,
    last_login_at DATETIME,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
  );

  CREATE TABLE IF NOT EXISTS user_roles (
    user_id INTEGER NOT NULL,
    role_id INTEGER NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (user_id, role_id)
  );

  CREATE TABLE IF NOT EXISTS majors (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    code TEXT NOT NULL UNIQUE,
    name TEXT NOT NULL,
    department TEXT,
    description TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
  );

  CREATE TABLE IF NOT EXISTS classes (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    major_id INTEGER NOT NULL,
    grade INTEGER NOT NULL,
    class_no INTEGER NOT NULL,
    name TEXT NOT NULL,
    counselor_id INTEGER,
    student_count INTEGER DEFAULT 0,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (major_id) REFERENCES majors(id)
  );

  CREATE TABLE IF NOT EXISTS student_classes (
    student_id INTEGER NOT NULL,
    class_id INTEGER NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (student_id, class_id)
  );

  CREATE TABLE IF NOT EXISTS topics (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    title TEXT NOT NULL,
    description TEXT,
    requirements TEXT,
    difficulty INTEGER DEFAULT 1,
    estimated_days INTEGER DEFAULT 30,
    tech_stack TEXT,
    max_group_size INTEGER DEFAULT 5,
    min_group_size INTEGER DEFAULT 1,
    creator_id INTEGER,
    status INTEGER DEFAULT 1,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
  );

  CREATE TABLE IF NOT EXISTS projects (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    topic_id INTEGER,
    name TEXT NOT NULL,
    description TEXT,
    class_id INTEGER,
    teacher_id INTEGER NOT NULL,
    start_date DATE,
    end_date DATE,
    status INTEGER DEFAULT 1,
    config TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (topic_id) REFERENCES topics(id),
    FOREIGN KEY (teacher_id) REFERENCES users(id)
  );

  CREATE TABLE IF NOT EXISTS project_phases (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    project_id INTEGER NOT NULL,
    name TEXT NOT NULL,
    description TEXT,
    start_date DATE,
    end_date DATE,
    weight REAL DEFAULT 0,
    sort_order INTEGER DEFAULT 0,
    status INTEGER DEFAULT 1,
    FOREIGN KEY (project_id) REFERENCES projects(id) ON DELETE CASCADE
  );

  CREATE TABLE IF NOT EXISTS groups (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    project_id INTEGER NOT NULL,
    name TEXT NOT NULL,
    description TEXT,
    leader_id INTEGER NOT NULL,
    max_members INTEGER DEFAULT 6,
    status INTEGER DEFAULT 1,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (project_id) REFERENCES projects(id) ON DELETE CASCADE,
    FOREIGN KEY (leader_id) REFERENCES users(id)
  );

  CREATE TABLE IF NOT EXISTS group_members (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    group_id INTEGER NOT NULL,
    student_id INTEGER NOT NULL,
    role INTEGER DEFAULT 0,
    joined_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    status INTEGER DEFAULT 1,
    FOREIGN KEY (group_id) REFERENCES groups(id) ON DELETE CASCADE,
    FOREIGN KEY (student_id) REFERENCES users(id)
  );

  CREATE TABLE IF NOT EXISTS progress (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    project_id INTEGER NOT NULL,
    group_id INTEGER NOT NULL,
    phase_id INTEGER,
    title TEXT NOT NULL,
    content TEXT,
    completion_rate INTEGER DEFAULT 0,
    reporter_id INTEGER NOT NULL,
    report_date DATE,
    status INTEGER DEFAULT 0,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (project_id) REFERENCES projects(id),
    FOREIGN KEY (group_id) REFERENCES groups(id)
  );

  CREATE TABLE IF NOT EXISTS documents (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    project_id INTEGER NOT NULL,
    group_id INTEGER,
    uploader_id INTEGER NOT NULL,
    name TEXT NOT NULL,
    type TEXT DEFAULT 'file',
    file_url TEXT,
    file_size INTEGER DEFAULT 0,
    file_hash TEXT,
    description TEXT,
    category TEXT,
    status INTEGER DEFAULT 1,
    download_count INTEGER DEFAULT 0,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
  );

  CREATE TABLE IF NOT EXISTS score_dimensions (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    description TEXT,
    default_weight REAL DEFAULT 0,
    is_default INTEGER DEFAULT 1,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
  );

  CREATE TABLE IF NOT EXISTS scores (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    project_id INTEGER NOT NULL,
    group_id INTEGER NOT NULL,
    dimension_id INTEGER NOT NULL,
    score REAL NOT NULL,
    comment TEXT,
    scorer_id INTEGER NOT NULL,
    scored_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (dimension_id) REFERENCES score_dimensions(id)
  );

  CREATE TABLE IF NOT EXISTS defenses (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    project_id INTEGER NOT NULL,
    group_id INTEGER NOT NULL,
    title TEXT,
    defense_date DATE,
    start_time TIME,
    end_time TIME,
    location TEXT,
    panel_teacher_ids TEXT,
    secretary_id INTEGER,
    status INTEGER DEFAULT 0,
    max_duration INTEGER DEFAULT 30,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
  );

  CREATE TABLE IF NOT EXISTS workloads (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    project_id INTEGER NOT NULL,
    group_id INTEGER,
    student_id INTEGER NOT NULL,
    task_name TEXT NOT NULL,
    task_description TEXT,
    task_type TEXT DEFAULT 'development',
    estimated_hours REAL DEFAULT 0,
    actual_hours REAL DEFAULT 0,
    completion_rate INTEGER DEFAULT 0,
    contribution_ratio REAL DEFAULT 0,
    status INTEGER DEFAULT 0,
    report_date DATE,
    verified_by INTEGER,
    verified_at DATETIME,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
  );

  CREATE TABLE IF NOT EXISTS announcements (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    project_id INTEGER,
    title TEXT NOT NULL,
    content TEXT NOT NULL,
    type TEXT DEFAULT 'notice',
    priority INTEGER DEFAULT 0,
    publisher_id INTEGER NOT NULL,
    target_roles TEXT,
    status INTEGER DEFAULT 1,
    published_at DATETIME,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
  );
`);

console.log('✅ 建表完成（22张表）');

// ===== 插入种子数据 =====
console.log('🌱 开始插入测试数据...');

const insert = db.prepare.bind(db);

// 角色
const insertRole = insert('INSERT OR IGNORE INTO roles (name, display_name, description) VALUES (?, ?, ?)');
insertRole.run('admin', '管理员', '系统管理员');
insertRole.run('teacher', '教师', '指导教师');
insertRole.run('student', '学生', '学生');

// 评分维度
const insertDim = insert('INSERT OR IGNORE INTO score_dimensions (name, description, default_weight, is_default) VALUES (?, ?, ?, 1)');
insertDim.run('需求分析', '对项目需求的理解和分析能力', 15);
insertDim.run('系统设计', '系统架构和详细设计能力', 20);
insertDim.run('编码实现', '代码质量和功能实现', 30);
insertDim.run('测试验证', '测试用例编写和问题发现', 10);
insertDim.run('文档编写', '技术文档和使用说明', 10);
insertDim.run('答辩表现', '项目汇报和现场答辩', 15);

// 权限
const perms = [
  ['user:view','查看用户','user','view'],['user:create','创建用户','user','create'],['user:edit','编辑用户','user','edit'],['user:delete','删除用户','user','delete'],
  ['project:view','查看项目','project','view'],['project:create','创建项目','project','create'],['project:edit','编辑项目','project','edit'],['project:delete','删除项目','project','delete'],['project:manage','管理项目','project','manage'],
  ['topic:view','查看题目','topic','view'],['topic:create','创建题目','topic','create'],['topic:edit','编辑题目','topic','edit'],['topic:delete','删除题目','topic','delete'],
  ['group:view','查看分组','group','view'],['group:create','创建分组','group','create'],['group:edit','编辑分组','group','edit'],['group:delete','删除分组','group','delete'],['group:approve','审核分组','group','approve'],
  ['progress:view','查看进度','progress','view'],['progress:submit','提交进度','progress','submit'],['progress:approve','审核进度','progress','approve'],
  ['document:view','查看文档','document','view'],['document:upload','上传文档','document','upload'],['document:delete','删除文档','document','delete'],
  ['score:view','查看成绩','score','view'],['score:submit','提交评分','score','submit'],['score:config','配置评分','score','config'],
  ['defense:view','查看答辩','defense','view'],['defense:schedule','安排答辩','defense','schedule'],['defense:score','答辩评分','defense','score'],
  ['workload:view','查看工作量','workload','view'],['workload:submit','填写工作量','workload','submit'],['workload:verify','审核工作量','workload','verify'],
  ['class:view','查看班级','class','view'],['class:create','创建班级','class','create'],['class:edit','编辑班级','class','edit'],['class:import','导入学生','class','import'],
  ['menu:view','查看菜单','menu','view'],['menu:create','创建菜单','menu','create'],['menu:edit','编辑菜单','menu','edit'],['menu:delete','删除菜单','menu','delete'],
];
const insertPerm = insert('INSERT OR IGNORE INTO permissions (name, display_name, resource, action) VALUES (?, ?, ?, ?)');
perms.forEach(p => insertPerm.run(...p));

// 角色权限
const { adminId, teacherId, studentId } = { adminId: 1, teacherId: 2, studentId: 3 };
const insertRP = insert('INSERT OR IGNORE INTO role_permissions (role_id, permission_id) VALUES (?, ?)');
for (let i = 1; i <= perms.length; i++) insertRP.run(adminId, i);
// 教师权限
for (let i = 5; i <= perms.length; i++) insertRP.run(teacherId, i);
// 学生权限
const studentPerms = [1,5,9,13,14,18,21,24,27,30,33,36,39,42,45,48];
studentPerms.forEach(i => insertRP.run(studentId, i));

// 用户
const hash = bcrypt.hashSync('password123', 10);
const insertUser = insert('INSERT OR IGNORE INTO users (id, username, password_hash, real_name, email, phone, gender) VALUES (?, ?, ?, ?, ?, ?, ?)');
insertUser.run(1, 'admin', hash, '系统管理员', 'admin@example.com', '13800000001', 1);
insertUser.run(2, 'teacher001', hash, '张老师', 'teacher1@example.com', '13800138001', 1);
insertUser.run(3, 'teacher002', hash, '李老师', 'teacher2@example.com', '13800138002', 2);
insertUser.run(4, 'student001', hash, '李同学', 'student1@example.com', '13900139001', 1);
insertUser.run(5, 'student002', hash, '王同学', 'student2@example.com', '13900139002', 2);
insertUser.run(6, 'student003', hash, '赵同学', 'student3@example.com', '13900139003', 1);
insertUser.run(7, 'student004', hash, '刘同学', 'student4@example.com', '13900139004', 2);
insertUser.run(8, 'student005', hash, '陈同学', 'student5@example.com', '13900139005', 1);
insertUser.run(9, 'student006', hash, '杨同学', 'student6@example.com', '13900139006', 2);
insertUser.run(10, 'student007', hash, '黄同学', 'student7@example.com', '13900139007', 1);
insertUser.run(11, 'student008', hash, '周同学', 'student8@example.com', '13900139008', 2);

// 用户角色
const insertUR = insert('INSERT OR IGNORE INTO user_roles (user_id, role_id) VALUES (?, ?)');
insertUR.run(1, adminId);
insertUR.run(2, teacherId);
insertUR.run(3, teacherId);
for (let i = 4; i <= 11; i++) insertUR.run(i, studentId);

// 专业
const insertMajor = insert('INSERT OR IGNORE INTO majors (id, code, name, department, description) VALUES (?, ?, ?, ?, ?)');
insertMajor.run(1, 'CS', '计算机科学与技术', '信息学院', '计算机科学与技术专业');
insertMajor.run(2, 'SE', '软件工程', '信息学院', '软件工程专业');
insertMajor.run(3, 'AI', '人工智能', '信息学院', '人工智能专业');
insertMajor.run(4, 'DS', '数据科学', '信息学院', '数据科学与大数据技术专业');

// 班级
const insertClass = insert('INSERT OR IGNORE INTO classes (id, major_id, grade, class_no, name, counselor_id, student_count) VALUES (?, ?, ?, ?, ?, ?, ?)');
insertClass.run(1, 1, 2024, 1, '计算机24-1班', 2, 20);
insertClass.run(2, 1, 2024, 2, '计算机24-2班', 2, 22);
insertClass.run(3, 2, 2024, 1, '软工24-1班', 3, 25);
insertClass.run(4, 2, 2024, 2, '软工24-2班', 3, 23);
insertClass.run(5, 3, 2024, 1, '人工智能24-1班', 2, 18);

// 学生-班级
const insertSC = insert('INSERT OR IGNORE INTO student_classes (student_id, class_id) VALUES (?, ?)');
insertSC.run(4, 1); insertSC.run(5, 1); insertSC.run(6, 1);
insertSC.run(7, 2); insertSC.run(8, 2); insertSC.run(9, 2);
insertSC.run(10, 3); insertSC.run(11, 3);

// 题目
const insertTopic = insert(`INSERT OR IGNORE INTO topics (id, title, description, requirements, difficulty, tech_stack, max_group_size, min_group_size, creator_id) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`);
insertTopic.run(1, '电商平台开发', '基于Spring Boot + Vue的电商平台', '包含商品管理、订单系统、支付功能', 3, '["Java","Spring Boot","Vue","MySQL"]', 5, 3, 2);
insertTopic.run(2, '图书管理系统', '基于Node.js的图书借阅管理系统', '支持图书检索、借阅、归还', 2, '["Node.js","Express","React","MongoDB"]', 4, 2, 2);
insertTopic.run(3, '在线考试系统', '支持多题型、自动评分的在线考试平台', 3, '["Python","Django","Vue","PostgreSQL"]', 3, 2, 3);
insertTopic.run(4, '智能问答机器人', '基于NLP的智能问答系统', '支持知识库管理和多轮对话', 4, '["Python","PyTorch","NLP","FastAPI"]', 3, 2, 3);
insertTopic.run(5, '校园二手交易平台', '面向校园的二手物品交易平台', '支持商品发布、私信沟通', 2, '["Flutter","Dart","Firebase"]', 4, 2, 3);
insertTopic.run(6, '实验室预约系统', '实验室设备和场地预约管理系统', '支持时间段预约、冲突检测', 2, '["Java","Spring Boot","React","MySQL"]', 5, 3, 2);

// 项目
const insertProject = insert(`INSERT OR IGNORE INTO projects (id, topic_id, name, description, class_id, teacher_id, start_date, end_date, status, config) VALUES (?, ?, ?, ?, ?, ?, ?, ?, 1, ?)`);
insertProject.run(1, 1, '2024春季-电商平台开发', '2024年春季学期电商平台实训项目', 1, 2, '2026-03-01', '2026-06-30', '{"maxMembers":4,"phases":4}');
insertProject.run(2, 2, '2024春季-图书管理系统', '2024年春季学期图书管理实训项目', 2, 2, '2026-03-01', '2026-06-30', '{"maxMembers":3,"phases":4}');
insertProject.run(3, 3, '2024春季-在线考试系统', '2024年春季学期在线考试实训项目', 3, 3, '2026-03-01', '2026-06-30', '{"maxMembers":4,"phases":4}');
insertProject.run(4, 4, '2024春季-智能问答机器人', '2024年春季学期AI实训项目', 5, 2, '2026-03-01', '2026-06-30', '{"maxMembers":3,"phases":5}');

// 项目阶段
const insertPhase = insert('INSERT OR IGNORE INTO project_phases (project_id, name, description, start_date, end_date, sort_order, status) VALUES (?, ?, ?, ?, ?, ?, 1)');
const phases = [
  [1,'需求分析','完成需求调研和分析文档','2026-03-01','2026-03-15',1],
  [1,'系统设计','完成系统架构和详细设计','2026-03-16','2026-03-31',2],
  [1,'编码实现','完成核心功能开发','2026-04-01','2026-05-15',3],
  [1,'测试答辩','完成测试和答辩准备','2026-05-16','2026-06-30',4],
  [2,'需求分析','完成需求调研和分析文档','2026-03-01','2026-03-15',1],
  [2,'系统设计','完成系统架构和详细设计','2026-03-16','2026-03-31',2],
  [2,'编码实现','完成核心功能开发','2026-04-01','2026-05-15',3],
  [2,'测试答辩','完成测试和答辩准备','2026-05-16','2026-06-30',4],
  [3,'需求分析','完成需求调研和分析文档','2026-03-01','2026-03-15',1],
  [3,'系统设计','完成系统架构和详细设计','2026-03-16','2026-03-31',2],
  [3,'编码实现','完成核心功能开发','2026-04-01','2026-05-15',3],
  [3,'测试答辩','完成测试和答辩准备','2026-05-16','2026-06-30',4],
  [4,'需求分析','完成需求调研和分析文档','2026-03-01','2026-03-15',1],
  [4,'系统设计','完成系统架构和详细设计','2026-03-16','2026-03-31',2],
  [4,'编码实现','完成核心功能开发','2026-04-01','2026-05-15',3],
  [4,'模型训练','完成AI模型训练和优化','2026-04-15','2026-05-20',4],
  [4,'测试答辩','完成测试和答辩准备','2026-05-21','2026-06-30',5],
];
phases.forEach(p => insertPhase.run(...p));

// 分组
const insertGroup = insert('INSERT OR IGNORE INTO groups (id, project_id, name, description, leader_id, max_members, status) VALUES (?, ?, ?, ?, ?, 6, 1)');
insertGroup.run(1, 1, '第一组-电商先锋', '电商平台开发第一组', 4);
insertGroup.run(2, 1, '第二组-购物达人', '电商平台开发第二组', 5);
insertGroup.run(3, 2, '第一组-书香阁', '图书管理系统第一组', 6);
insertGroup.run(4, 3, '第一组-考试通', '在线考试系统第一组', 7);
insertGroup.run(5, 4, '第一组-AI智囊团', '智能问答机器人第一组', 8);

// 分组成员 (role: 1=组长, 0=成员)
const insertGM = insert('INSERT OR IGNORE INTO group_members (group_id, student_id, role, status) VALUES (?, ?, ?, 1)');
insertGM.run(1, 4, 1); insertGM.run(1, 5, 0); insertGM.run(1, 6, 0);
insertGM.run(2, 7, 1); insertGM.run(2, 8, 0);
insertGM.run(3, 9, 1); insertGM.run(3, 10, 0);
insertGM.run(4, 4, 1); insertGM.run(4, 5, 0);
insertGM.run(5, 6, 1); insertGM.run(5, 7, 0); insertGM.run(5, 8, 0);

// 进度
const insertProgress = insert('INSERT OR IGNORE INTO progress (id, project_id, group_id, phase_id, title, content, completion_rate, reporter_id, report_date, status) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)');
insertProgress.run(1, 1, 1, 1, '电商平台需求分析文档', '完成了用户调研和竞品分析，撰写了详细的需求规格说明书', 100, 4, '2026-03-14', 2);
insertProgress.run(2, 1, 1, 2, '电商平台系统设计文档', '完成了系统架构设计、数据库设计和接口设计', 100, 4, '2026-03-30', 2);
insertProgress.run(3, 1, 1, 3, '电商平台开发进度', '已完成用户模块和商品模块开发', 60, 4, '2026-04-20', 1);
insertProgress.run(4, 2, 3, 1, '图书管理系统需求分析', '完成了需求调研和功能规划', 100, 9, '2026-03-12', 2);
insertProgress.run(5, 2, 3, 2, '图书管理系统设计文档', '完成了数据库设计和API设计', 90, 9, '2026-03-28', 1);

// 文档
const insertDoc = insert('INSERT OR IGNORE INTO documents (id, project_id, group_id, uploader_id, name, type, file_url, file_size, description, status) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, 1)');
insertDoc.run(1, 1, 1, 4, '需求规格说明书.pdf', 'pdf', '/uploads/doc1.pdf', 2048000, '电商平台需求分析文档');
insertDoc.run(2, 1, 1, 4, '系统设计文档.pdf', 'pdf', '/uploads/doc2.pdf', 3584000, '电商平台系统设计文档');
insertDoc.run(3, 1, 1, 4, '项目进度报告.docx', 'docx', '/uploads/doc3.docx', 1024000, '第一周项目进度报告');
insertDoc.run(4, 2, 3, 9, '图书管理系统需求文档.pdf', 'pdf', '/uploads/doc4.pdf', 1843200, '图书管理系统需求分析');
insertDoc.run(5, 2, 3, 9, '数据库设计说明书.docx', 'docx', '/uploads/doc5.docx', 921600, '数据库设计详细说明');

// 评分
const insertScore = insert('INSERT OR IGNORE INTO scores (id, project_id, group_id, dimension_id, score, comment, scorer_id) VALUES (?, ?, ?, ?, ?, ?, ?)');
insertScore.run(1, 1, 1, 1, 85, '需求分析较为全面', 2);
insertScore.run(2, 1, 1, 2, 88, '架构设计合理', 2);
insertScore.run(3, 1, 1, 3, 82, '代码质量良好', 2);
insertScore.run(4, 2, 3, 1, 90, '需求分析非常详细', 2);
insertScore.run(5, 2, 3, 2, 85, '设计文档规范', 2);

// 答辩
const insertDefense = insert('INSERT OR IGNORE INTO defenses (id, project_id, group_id, title, defense_date, start_time, end_time, location, panel_teacher_ids, status) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, 0)');
insertDefense.run(1, 1, 1, '电商平台答辩', '2026-06-25', '09:00', '10:00', '信息楼301', '[2,3]');
insertDefense.run(2, 1, 2, '电商平台答辩', '2026-06-25', '10:00', '11:00', '信息楼301', '[2,3]');
insertDefense.run(3, 2, 3, '图书管理答辩', '2026-06-25', '14:00', '15:00', '信息楼302', '[2,3]');
insertDefense.run(4, 3, 4, '考试系统答辩', '2026-06-26', '09:00', '10:00', '信息楼301', '[3,2]');
insertDefense.run(5, 4, 5, 'AI机器人答辩', '2026-06-26', '10:00', '11:00', '信息楼302', '[2,3]');

// 工作量
const insertWorkload = insert('INSERT OR IGNORE INTO workloads (id, project_id, group_id, student_id, task_name, task_description, task_type, estimated_hours, actual_hours, completion_rate, contribution_ratio, status, report_date, verified_by) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)');
insertWorkload.run(1, 1, 1, 4, '需求调研', '负责需求调研和用户访谈', 'analysis', 20, 18, 100, 0.3, 2, '2026-03-14', 2);
insertWorkload.run(2, 1, 1, 5, '需求文档编写', '参与需求文档编写', 'documentation', 15, 14, 100, 0.2, 2, '2026-03-14', 2);
insertWorkload.run(3, 1, 1, 6, '会议记录整理', '整理需求分析会议记录', 'documentation', 10, 10, 100, 0.15, 2, '2026-03-14', 2);
insertWorkload.run(4, 1, 1, 4, '系统架构设计', '负责系统架构设计', 'design', 25, 22, 100, 0.35, 2, '2026-03-30', 2);
insertWorkload.run(5, 1, 1, 5, '数据库设计', '负责数据库设计', 'design', 20, 18, 100, 0.25, 2, '2026-03-30', 2);
insertWorkload.run(6, 2, 3, 9, '需求分析', '独立完成需求分析', 'analysis', 30, 28, 100, 0.6, 2, '2026-03-12', 2);
insertWorkload.run(7, 2, 3, 10, '协助需求调研', '协助需求调研', 'analysis', 12, 10, 100, 0.2, 2, '2026-03-12', 2);

// 公告
const insertAnn = insert('INSERT OR IGNORE INTO announcements (id, project_id, title, content, type, priority, publisher_id, status, published_at) VALUES (?, ?, ?, ?, ?, ?, ?, 1, ?)');
insertAnn.run(1, NULL, '2024春季实训项目启动通知', '各位同学，2024春季实训项目正式启动，请大家尽快完成组队和选题。', 'notice', 1, 1, '2026-03-01 09:00:00');
insertAnn.run(2, NULL, '项目进度提交截止日期提醒', '请各位组长注意，第一阶段进度提交截止日期为3月15日。', 'reminder', 2, 2, '2026-03-10 10:00:00');
insertAnn.run(3, NULL, '答辩安排通知', '项目答辩将于6月25日至6月30日进行，请各组做好准备。', 'notice', 1, 2, '2026-06-01 09:00:00');
insertAnn.run(4, NULL, '关于规范文档格式的通知', '请各位同学按照模板规范编写文档，确保格式统一。', 'notice', 0, 1, '2026-03-05 14:00:00');

db.close();

console.log('✅ 测试数据插入完成！');
console.log('');
console.log('📋 测试账号（密码统一: password123）:');
console.log('  管理员: admin');
console.log('  教师:   teacher001, teacher002');
console.log('  学生:   student001 ~ student008');
console.log('');
console.log('📊 数据统计:');
console.log('  用户: 11个 (1管理员 + 2教师 + 8学生)');
console.log('  专业: 4个, 班级: 5个');
console.log('  题目: 6个, 项目: 4个');
console.log('  分组: 5个, 成员: 12条');
console.log('  进度: 5条, 文档: 5条');
console.log('  评分: 5条, 答辩: 5条');
console.log('  工作量: 7条, 公告: 4条');
console.log('');
console.log('📂 数据库文件:', DB_PATH);
