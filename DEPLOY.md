# 实训项目全过程管理平台 - 部署指南

## 架构

- **前端**: React + TypeScript + Ant Design，部署到 GitHub Pages
- **后端/数据库**: Supabase（PostgreSQL + Auth + Storage + RLS）

## 部署步骤

### 1. 在 Supabase 创建项目

1. 访问 https://supabase.com/dashboard
2. 点击 "New Project"
3. 选择区域（推荐 Southeast Asia）
4. 设置数据库密码，创建项目
5. 创建后记录项目 URL 和 anon public key（Settings → API）

### 2. 执行建表 SQL

1. 进入 Supabase Dashboard → SQL Editor
2. 复制 `supabase/schema.sql` 的全部内容
3. 粘贴到 SQL Editor 中，点击 "Run"
4. 等待执行完成（约 22 张表 + 种子数据 + RLS 策略 + Storage bucket）

### 3. 创建测试用户（11 个）

进入 Supabase Dashboard → Authentication → Users，点击 "Add User" → "Create New User"，
为每个用户手动创建（密码统一设为 `password123`）：

| Email | 姓名 | 角色 |
|-------|------|------|
| admin@training.com | 系统管理员 | admin |
| teacher1@training.com | 张老师 | teacher |
| teacher2@training.com | 李老师 | teacher |
| student1@training.com | 李同学 | student |
| student2@training.com | 王同学 | student |
| student3@training.com | 赵同学 | student |
| student4@training.com | 刘同学 | student |
| student5@training.com | 陈同学 | student |
| student6@training.com | 杨同学 | student |
| student7@training.com | 黄同学 | student |
| student8@training.com | 周同学 | student |

### 4. 执行用户种子数据

1. 替换 `supabase/seed-users.sql` 中所有的 `USER_UUID_XXX` 占位符为步骤 3 中创建的用户 UUID
2. 在 SQL Editor 中执行该 SQL，完成角色关联和班级分配

### 5. 配置 GitHub Secrets

进入仓库 Settings → Secrets and variables → Actions，添加：

| Secret Name | 值 |
|-------------|---|
| `VITE_SUPABASE_URL` | Supabase 项目的 URL（如 https://xxxxx.supabase.co）|
| `VITE_SUPABASE_ANON_KEY` | Supabase 项目的 anon public key |

### 6. 推 main 分支触发 Pages

1. 将代码推送到 GitHub
2. 进入仓库 Settings → Pages → Source 选择 "GitHub Actions"
3. 推送到 main 分支后，GitHub Actions 自动执行：
   install → typecheck → lint → test → build → deploy
4. 部署完成后访问 `https://your-username.github.io/training-project-platform/`

## 测试账号

| 角色 | 邮箱 | 密码 |
|------|------|------|
| 管理员 | admin@training.com | password123 |
| 教师 | teacher1@training.com | password123 |
| 学生 | student1@training.com | password123 |

## 本地开发

1. 复制环境变量文件：`cp apps/web/.env.example apps/web/.env`
2. 填写你的 Supabase 连接信息
3. 启动开发服务器：`cd apps/web && npm run dev`
4. 访问 http://localhost:5173

## 文件结构

```
supabase/
  schema.sql          # 建表 + RLS + Storage（在 Supabase SQL Editor 中执行）
  seed-users.sql      # 用户数据 SQL（创建用户后执行）
  schema-fixed.sql    # 备用修复脚本
apps/web/
  .env.example        # 环境变量模板
  src/
    lib/supabase.ts   # Supabase 客户端配置
    api/              # API 层（已改造为 Supabase 直接调用）
    stores/           # 状态管理（已改造为 Supabase Auth）
    components/       # 通用组件（AuthGuard + MainLayout）
    pages/            # 页面组件
.github/workflows/
  deploy.yml          # GitHub Actions CI/CD（install→typecheck→lint→test→build→deploy）
```