# 实训项目全过程管理平台

一个完整的实训项目全过程管理平台，支持 **学生、教师、管理员** 三种角色，覆盖组队、选题、进度提交、文档管理、答辩评分、成绩统计等全流程。

## 架构

`
┌─────────────────────────────────────────────────┐
│                  GitHub Pages                    │
│         (React 18 + Ant Design + Vite)           │
├─────────────────────────────────────────────────┤
│                Supabase Cloud                    │
│  ┌──────────┬──────────┬───────────────────┐    │
│  │  Auth    │   RLS    │  PostgreSQL 15    │    │
│  │ (GoTrue) │ Policy   │  30 张表 + 索引    │    │
│  └──────────┴──────────┴───────────────────┘    │
└─────────────────────────────────────────────────┘
`

**设计决策**: 采用 Supabase-only 架构，不再需要独立的 Express 后端。所有业务逻辑通过 RLS 策略在前端直接与数据库交互。原 pps/server 目录保留为参考但不再使用。

## 技术栈

| 层 | 技术 | 用途 |
|---|---|---|
| UI 框架 | React 18 + TypeScript | 组件化页面 |
| 组件库 | Ant Design 5 | 表格、表单、弹窗等 |
| 路由 | React Router v6 | 路由守卫 + 角色鉴权 |
| 状态管理 | Zustand | 全局状态（用户、主题） |
| 构建工具 | Vite 5 | 开发服务器 + 生产构建 |
| 测试 | Vitest + Testing Library | 单元测试 |
| 数据库 | PostgreSQL 15 + Supabase | 30 张业务表 |
| 认证 | Supabase Auth (GoTrue) | 邮箱密码登录 |
| 权限 | RLS (Row Level Security) | 26 条策略控制数据访问 |
| CI/CD | GitHub Actions | 自动构建 + 部署到 Pages |

## 功能模块

### 学生端
- 项目列表查看、进度提交
- 小组管理（创建/加入/退出/查看成员）
- 文档上传/下载
- 成绩查询、答辩安排查看

### 教师端
- 项目管理（创建/编辑/分配）
- 指导小组管理、进度审核
- 评分管理（多维度评分配置）
- 答辩安排与评分、工作量审核

### 管理员端
- 用户管理、班级/专业管理
- 公告管理、数据统计
- 数据导出（Excel/Word）

## 数据库

30 张表，涵盖 6 大模块：

**基础数据**: roles, permissions, menus, majors, classes, profiles  
**用户角色**: user_roles, role_permissions, role_menus, student_classes, operation_logs  
**项目选题**: topics, projects, project_phases, project_score_configs  
**分组管理**: groups, group_members, group_applications  
**进度文档**: progress, progress_logs, documents, document_versions  
**评分答辩**: scores, score_summaries, defenses, defense_scores, score_dimensions  
**公告统计**: workloads, announcements, announcement_reads  

## 快速开始

### 前置要求

- Node.js 18+
- npm（推荐）或 pnpm

### 本地开发

`ash
# 1. 安装依赖
cd apps/web && npm install

# 2. 配置环境变量
cp .env.example .env.local
# 编辑 .env.local，填入 Supabase URL 和 anon key

# 3. 启动开发服务器
npm run dev

# 4. 浏览器打开 http://localhost:5173
`

### 测试账号

数据库已创建以下测试用户（密码通过 Supabase Auth Admin API 生成）：

| 角色 | 邮箱 | 密码 |
|---|---|---|
| 管理员 | admin@test.com | admin123456 |
| 教师 | teacher@test.com | teacher123456 |
| 学生 | student@test.com | student123456 |

> 演示数据已预置：2 条公告 + 2 个项目 + 4 个选题 + 评分维度配置

## 项目结构

`
training-project-platform/
├── apps/
│   ├── web/                    # 前端主应用
│   │   ├── src/
│   │   │   ├── api/            # Supabase 数据访问层 (11 个 API 模块)
│   │   │   ├── components/     # 公共组件 (AuthGuard, MainLayout)
│   │   │   ├── lib/            # Supabase 客户端初始化
│   │   │   ├── pages/          # 页面 (8 个功能页面)
│   │   │   ├── router/         # 路由配置
│   │   │   ├── stores/         # Zustand 状态管理
│   │   │   └── utils/          # 工具函数 (Supabase 辅助, 下载)
│   │   ├── .env.example        # 环境变量模板
│   │   └── vitest.config.ts    # 测试配置
│   ├── server/                 # 原 Express 后端（已弃用，保留参考）
│   └── miniapp/                # 微信小程序 (uni-app，待开发)
├── supabase/
│   ├── schema.sql              # 完整建表 + RLS + 种子数据
│   └── seed.sql                # 用户种子脚本
├── packages/
│   └── shared/                 # 共享类型定义
├── .github/
│   └── workflows/
│       └── deploy.yml          # GitHub Pages CI/CD
├── README.md                   # 本文件
└── BACKLOG.md                  # 待办事项
`

## 可用脚本

`ash
cd apps/web

npm run dev          # 启动开发服务器 (localhost:5173)
npm run build        # TypeScript 检查 + 生产构建
npm run preview      # 预览构建产物
npm test             # 运行测试 (19 个用例)
npm run test:watch   # 监视模式
npm run lint         # ESLint 代码检查
`

## 部署

### GitHub Pages (已配置)

项目通过 GitHub Actions 自动部署到 GitHub Pages。

**触发方式**: 向 main 分支推送代码或手动在 Actions 页面点击 "Run workflow"

**所需 Secrets**（已配置）:
- VITE_SUPABASE_URL — Supabase 项目 URL
- VITE_SUPABASE_ANON_KEY — Supabase 匿名密钥

**线上地址**: https://ronineymessjr-sudo.github.io/training-project-platform/

### 首次部署流程

1. 在 [Supabase](https://supabase.com) 创建项目
2. 在 SQL Editor 执行 supabase/schema.sql
3. 创建测试用户（通过 Auth Admin API 或 Dashboard）
4. 在 GitHub 仓库添加 VITE_SUPABASE_URL 和 VITE_SUPABASE_ANON_KEY Secrets
5. 推送 main 分支触发 CI/CD
6. 在 Settings → Pages 中设置 Source 为 "GitHub Actions"

## 测试

`ash
cd apps/web

# 运行全部测试（4 个测试文件，19 个测试用例）
npm test

# 测试清单
# - src/utils/__tests__/supabase-helpers.test.ts  — 12 个工具函数测试
# - src/components/common/__tests__/AuthGuard.test.tsx — 3 个路由守卫测试
# - src/components/layout/__tests__/MainLayout.test.tsx — 2 个布局测试
# - src/pages/__tests__/Dashboard.test.tsx — 2 个仪表盘测试
`

## 许可

MIT
