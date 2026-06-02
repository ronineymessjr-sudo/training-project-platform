# 实训项目全过程管理平台 — 待办清单

## ✅ 已完成

### 项目初始化
- 前端项目搭建：React 18 + TypeScript + Vite 5 + Ant Design 5
- 路由配置 + 角色路由守卫 (AuthGuard)
- Zustand 状态管理（认证、主题、应用）
- 布局组件 (MainLayout) + 按角色动态侧边栏菜单
- 登录页面 + Supabase Auth 集成

### API 数据层
- 11 个 API 模块从 axios 迁移到 @supabase/supabase-js
- 删除 equest.ts 工具类
- 统一错误处理工具函数

### 功能页面
- **登录**: 邮箱密码登录，登录后跳转至来源页面
- **仪表盘**: 角色统计卡片 + 快速入口
- **项目列表**: 表格展示 + 搜索 + 创建（管理员/教师）
- **小组列表**: 表格展示 + 创建
- **文档列表**: 文件列表 + 上传
- **成绩列表**: 评分展示
- **个人信息**: 编辑头像、用户名、真实姓名
- **公告管理** (Admin): 公告 CRUD

### 数据库
- 30 张业务表 (PostgreSQL)
- 26 条 RLS 策略
- 种子数据：角色(3)、评分维度(6)、菜单权限、专业(4)、班级(5)、选题(4)
- handle_new_user 触发器（自动创建 profiles）

### 测试
- 4 个测试文件，19 个测试用例全部通过
- 工具函数测试 (12)、AuthGuard (3)、MainLayout (2)、Dashboard (2)
- Vitest 配置 + React Testing Library

### 构建与部署
- TypeScript + Vite 构建零错误
- GitHub Actions CI/CD (lint → test → build → Pages)
- GitHub Pages 部署配置
- 包管理器统一为 npm（移除 pnpm）

### 已创建的测试数据
- 3 个测试用户（admin/teacher/student）
- 2 条公告
- 2 个演示项目
- 4 个选题

### 运维与部署 (2026-06-02 完成)
- 修复 Project/List.tsx 和 Group/List.tsx 中文编码损坏
- 激活 GitHub Pages 部署（Source 改为 GitHub Actions，线上站点可访问）
- 推送本地 commit 953f5b0（错误处理改动）

### 中优先级 (2026-06-02 完成)
- **#4 API 错误处理**: 替换 5 个页面的静默 catch 块（Profile / Dashboard / Document / Score / Admin/Announcement / Group / Project），统一改为 `message.error(error?.message || '...')`
- **#5 骨架屏**: Dashboard 的「最近项目」「我的小组」在 loading 时显示 `<Skeleton active paragraph={{ rows: 4 }} />`
- **#6 表单验证 + classId Select**:
  - Project/List: classId 改 `<Select>` 拉取班级列表（带专业名），加 maxLength / endDate≥startDate 校验
  - Group/List: projectId 改 `<Select>` 拉取项目列表，加 maxLength / maxMembers 范围校验
- **#7 miniapp 目录说明**: 新建 `apps/miniapp/README.md` 描述 uni-app 脚手架状态与启动方式
- **#8 移除 server 旧引用**: `docker-compose.yml` 和 `start.sh` 添加弃用提示并指向 Supabase 流程

---

## 🔧 高优先级

（无 — 2026-06-02 已清空 1, 2, 3）

---

## 📋 中优先级

（无 — 2026-06-02 已清空 4, 5, 6, 7, 8）

---

## 🐛 已知问题

### B1. 登录页显示错误的默认账号信息

**文件**: pps/web/src/pages/Login.tsx

**问题**: 页面底部写死 默认账号: admin@training.com / password123，与实际创建的测试账号（dmin@test.com / dmin123456）不一致。

**修复**: 更新文案为实际测试账号，或动态从环境变量读取。

### B2. Vite 构建产物过大

**文件**: pps/web/vite.config.ts

**问题**: dist/assets/index-*.js 约 1.5MB（gzip 后 473KB），主要是 Ant Design 全量引入。

**建议**: 
- 使用动态 import() 实现页面级代码分割
- 配置 uild.rollupOptions.output.manualChunks 拆分 vendor 包
- 按需引入 Ant Design 组件（而非全量）

### B3. TypeScript 依赖版本兼容性

**问题**: sconfig.json 中未显式指定 moduleResolution，在 Node 18+ 环境下可能出现模块解析警告。

---

## 🚀 长期规划

### F1. 微信小程序端 (apps/miniapp)

- 使用 uni-app 实现学生端核心功能
- 支持扫码签到、消息推送

### F2. 数据导出优化

- 当前导出依赖原 pps/server 的 Express + exceljs/docx
- 迁移到 Supabase Edge Functions 或前端侧导出

### F3. 国际化 (i18n)

- 添加 react-i18next 支持
- 提供中英文切换

### F4. WebSocket 实时通知

- 利用 Supabase Realtime 实现公告推送、进度通知
- 答辩倒计时提醒

### F5. 性能优化

- 列表页虚拟滚动（react-window）
- 图片懒加载 + CDN 加速
- API 响应缓存（SWR / TanStack Query）

---

*最后更新: 2026-06-02 (中优先级 4-8 全部完成)*
