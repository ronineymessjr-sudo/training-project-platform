# 实训项目全过程管理平台

一个完整的实训项目全过程管理平台，支持学生、教师、管理员三种角色，实现组队、选题、进度提交、文档管理、答辩评分、成绩统计等功能。

## 技术栈

- **前端**: React 18 + TypeScript + Ant Design + Vite + Zustand
- **后端/数据库**: Supabase（PostgreSQL + Auth + Storage + RLS）
- **CI/CD**: GitHub Actions → GitHub Pages

## 项目结构

```
training-project-platform/
├── apps/
│   ├── web/              # Web 前端 (React + Ant Design)
│   ├── server/           # 原 Express 后端（保留参考，不再使用）
│   └── miniapp/          # 微信小程序 (uni-app)
├── supabase/
│   ├── schema.sql        # 建表 + RLS + Storage
│   └── seed-users.sql    # 用户种子数据
├── packages/
│   └── shared/           # 共享类型定义
└── package.json
```

## 快速开始

### 1. 环境要求

- Node.js 18+
- pnpm（推荐）或 npm

### 2. 安装依赖

```bash
# 在项目根目录执行
pnpm install

# 或进入 web 目录单独安装
cd apps/web && npm install
```

### 3. 配置 Supabase

1. 在 [Supabase](https://supabase.com/dashboard) 创建项目
2. 在 SQL Editor 中执行 `supabase/schema.sql`
3. 创建 11 个测试用户（详见 DEPLOY.md）
4. 执行 `supabase/seed-users.sql` 关联角色

### 4. 配置环境变量

```bash
cp apps/web/.env.example apps/web/.env
```

编辑 `apps/web/.env`，填入 Supabase 连接信息：
```
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key
```

### 5. 启动开发服务器

```bash
cd apps/web && npm run dev
```

访问 http://localhost:5173

## 测试账号

| 角色 | 邮箱 | 密码 |
|------|------|------|
| 管理员 | admin@training.com | password123 |
| 教师 | teacher1@training.com | password123 |
| 学生 | student1@training.com | password123 |

## 功能模块

### 学生端
- 项目列表查看
- 小组管理（创建/加入/退出）
- 进度提交
- 文档上传/下载
- 成绩查询
- 答辩安排查看

### 教师端
- 项目管理
- 指导小组管理
- 进度审核
- 评分管理
- 答辩安排
- 工作量审核

### 管理员端
- 用户管理
- 班级/专业管理
- 公告管理
- 数据统计
- 数据导出

## 部署

参考 [DEPLOY.md](DEPLOY.md) 完成以下步骤：

1. 在 Supabase 创建项目
2. 执行 schema.sql 建表
3. 创建 11 个测试用户
4. 执行 seed-users.sql 关联数据
5. 配置 GitHub Secrets
6. 推 main 分支触发 Pages

## 测试

```bash
cd apps/web
npm test        # 运行测试
npm run test:watch  # 监视模式
```

## 代码规范

- 使用 ESLint 进行代码检查
- 使用 TypeScript 严格模式

## 许可协议

MIT