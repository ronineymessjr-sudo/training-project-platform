# 实训项目全过程管理平台 — 完整代办事项

> 维护日期：2026-06-02
> 状态：✅ 中优先级 4-8 全部代码完成；⏳ 等浏览器 agent 验证；📋 已知问题 B1-B3 + 长期规划 F1-F5 待办

---

## 📐 项目概览

| 维度 | 技术 |
|---|---|
| **项目类型** | 高校实训项目全过程管理（学生/教师/管理员三角色） |
| **前端主框架** | React 18 + TypeScript 5.9 + Vite 5 |
| **UI 组件库** | Ant Design 5 (`antd`) + `@ant-design/icons` |
| **状态管理** | Zustand 4（`auth.store.ts`） |
| **路由** | React Router v6 + `AuthGuard` 角色守卫 |
| **日期处理** | dayjs |
| **HTTP/数据层** | `@supabase/supabase-js`（11 个 API 模块已从 axios 迁移） |
| **后端** | **Supabase Cloud**（PostgreSQL 15 + GoTrue Auth + RLS 策略） |
| **辅助工具** | lodash-es, jsPDF（PDF 导出） |
| **测试** | Vitest + React Testing Library + jsdom |
| **构建部署** | Vite + GitHub Actions → GitHub Pages |
| **包管理** | npm（已统一，移除 pnpm） |
| **Monorepo 工具** | Turbo 2 |
| **Node 版本** | >= 18.0.0 |

### 仓库地址
- GitHub: `github.com/ronineymessjr-sudo/training-project-platform`
- 线上: `https://ronineymessjr-sudo.github.io/training-project-platform/`

---

## 🗂️ 项目文件结构

```
C:\Users\user\Documents\trae-soio\training-project-platform\
├── apps/
│   ├── web/                    # React Web 主应用（✅ 主战场）
│   │   ├── src/
│   │   │   ├── api/            # 11 个数据访问模块
│   │   │   │   ├── auth.ts
│   │   │   │   ├── project.ts
│   │   │   │   ├── group.ts
│   │   │   │   ├── document.ts
│   │   │   │   ├── score.ts
│   │   │   │   ├── announcement.ts
│   │   │   │   ├── progress.ts
│   │   │   │   ├── defense.ts
│   │   │   │   ├── workload.ts
│   │   │   │   ├── class.ts
│   │   │   │   └── export.ts
│   │   │   ├── components/
│   │   │   │   ├── common/AuthGuard.tsx       # 路由守卫
│   │   │   │   └── layout/MainLayout.tsx      # 主布局
│   │   │   ├── lib/supabase.ts                # Supabase 客户端
│   │   │   ├── pages/                         # 14 个页面
│   │   │   │   ├── Login.tsx                  # 🔧 B1 待修
│   │   │   │   ├── Profile.tsx                # ✅ #4 已修
│   │   │   │   ├── Dashboard.tsx              # ✅ #4+#5 已修
│   │   │   │   ├── Project/
│   │   │   │   │   ├── List.tsx               # ✅ #4+#6 已修
│   │   │   │   │   └── Detail.tsx             # ⚠️ 未审
│   │   │   │   ├── Group/
│   │   │   │   │   ├── List.tsx               # ✅ #4+#6 已修
│   │   │   │   │   └── Detail.tsx             # ⚠️ 未审
│   │   │   │   ├── Document/List.tsx          # ✅ #4 已修
│   │   │   │   ├── Score/List.tsx             # ✅ #4 已修
│   │   │   │   ├── Progress/List.tsx          # ⚠️ 未审
│   │   │   │   ├── Defense/List.tsx           # ⚠️ 未审
│   │   │   │   ├── Workload/List.tsx          # ⚠️ 未审
│   │   │   │   └── Admin/
│   │   │   │       ├── AnnouncementManagement.tsx  # ✅ #4 已修
│   │   │   │       └── ClassManagement.tsx        # ⚠️ 未审
│   │   │   ├── router/                        # 路由配置
│   │   │   ├── stores/auth.store.ts           # Zustand
│   │   │   ├── utils/
│   │   │   │   ├── supabase-helpers.ts        # fromSupabase / handleAuthError
│   │   │   │   ├── download.ts
│   │   │   │   └── storage.ts
│   │   │   └── test-setup.ts
│   │   ├── .env.example                       # VITE_SUPABASE_URL / ANON_KEY
│   │   ├── vite.config.ts                     # 🔧 B2 待修
│   │   ├── tsconfig.json                      # 🔧 B3 待修
│   │   ├── eslint.config.js
│   │   └── vitest.config.ts
│   ├── server/                # ⚠️ 已弃用 Express 后端（保留参考，不构建）
│   └── miniapp/               # 🟡 uni-app 微信小程序脚手架（业务待实现）
│       ├── README.md          # ✅ #7 已新建
│       ├── manifest.json
│       ├── pages.json
│       └── src/pages/         # 9 个空页面骨架
├── packages/shared/           # 共享类型定义（空）
├── supabase/                  # ✅ Supabase 真实后端
│   ├── schema.sql             # 30 张表 + 26 条 RLS
│   ├── schema-final.sql
│   └── seed.sql
├── docker/                    # ⚠️ 已弃用 docker-compose
│   └── docker-compose.yml     # ✅ #8 加了弃用提示
├── .github/workflows/
│   └── deploy.yml             # CI/CD: lint → test → build → Pages
├── start.sh                   # ✅ #8 加了弃用提示 + exit 1
├── package.json               # Turbo 编排
├── BACKLOG.md                 # 旧版待办
├── BROWSER_VERIFICATION.md    # ✅ 浏览器验证手册
└── README.md
```

---

## ✅ 已完成（历史记录）

### 2026-06-02 — 运维与部署
- 修复 Project/List.tsx 和 Group/List.tsx 中文编码损坏
- 激活 GitHub Pages 部署
- 推送本地 commit 953f5b0

### 2026-06-02 — 中优先级 4-8
| # | 任务 | 改动文件 |
|---|---|---|
| 4 | API 错误处理 | `Profile.tsx`, `Dashboard.tsx`, `Document/List.tsx`, `Score/List.tsx`, `Admin/AnnouncementManagement.tsx`, `Group/List.tsx`, `Project/List.tsx` |
| 5 | 骨架屏 | `Dashboard.tsx`（仅「最近项目」「我的小组」两个 Card） |
| 6 | classId/projectId 改 Select + 表单验证 | `Project/List.tsx`, `Group/List.tsx` |
| 7 | miniapp 目录说明 | `apps/miniapp/README.md`（新建） |
| 8 | 移除 server 旧引用 | `docker/docker-compose.yml`, `start.sh` |
| B1 | 登录页默认账号文案 | `apps/web/src/pages/Login.tsx`（列出全部 3 个测试账号） |

> ✅ B3 已确认无需修：当前 `apps/web/tsconfig.json` 第 9 行已有 `"moduleResolution": "bundler"`，BACKLOG 描述与现状不符。

### 2026-05 — 早期工作
- 项目初始化（React + TS + Vite + AntD + Supabase）
- 11 个 API 模块从 axios 迁移到 supabase-js
- 30 张业务表 + 26 条 RLS 策略
- 4 个测试文件，19 个用例通过
- 3 个测试账号 + 演示数据

---

## ⏳ 当前待办（按优先级）

### 🔴 优先级 1：立即可做（30 分钟内）

#### T1. 浏览器端验证（已有清单：BROWSER_VERIFICATION.md）
- **负责人**：交给具备浏览器控制能力的 agent
- **执行**：照 `BROWSER_VERIFICATION.md` 的 §3 §4 跑完
- **交付**：✅/❌ 报告
- **依赖**：无

#### ~~T2. 修复 B1 — 登录页默认账号文案错误~~ ✅ 已修
- ✅ 2026-06-02：Login.tsx 底部文案改为列出 3 个测试账号

#### ~~T3. 修复 B3 — tsconfig 显式 moduleResolution~~ ✅ 已确认无需修
- ✅ 当前 `tsconfig.json` 第 9 行 `"moduleResolution": "bundler"` 已就位

#### T4. 修其他页面的相同错误处理 bug（一致性）
- **现状**：我修了 7 个页面，但还有 6 个页面 (`Project/Detail`, `Group/Detail`, `Progress/List`, `Defense/List`, `Workload/List`, `Admin/ClassManagement`) **没审过**
- **任务**：通读这 6 个文件，把所有 `catch { console.error }` 静默块统一改成 `message.error(error?.message || '...')`
- **优先级**：中 — 跟 #4 同类问题，不修会有"修了但没修完"的漏洞感
- **风险**：低 — 模式已经确定

#### T5. 清理死代码
- `Document/List.tsx` 第 6 行：`import { ..., getFolderTree }` 没用
- `Document/List.tsx` 第 152 行：`// await batchDeleteDocuments(...)` 注释掉的死代码
- `Group/List.tsx` 第 2 行：`TeamOutlined`, `UserAddOutlined` 等图标可能未用
- 行动：grep 各文件 unused imports，统一清

---

### 🟡 优先级 2：B2 风险项 + 一致性问题（半天内）

#### T6. B2 — Vite 构建产物过大（1.5MB → 拆 vendor）
- **文件**：`apps/web/vite.config.ts`, `apps/web/src/main.tsx`（及所有页面）
- **现状**：`antd` 全量引入，vendor bundle 1.5MB（gzip 473KB）
- **建议**：
  1. 改用 `import { Button } from 'antd'` 按需（已经是这样）
  2. 加 `build.rollupOptions.output.manualChunks` 拆 `react` / `antd` / `supabase` 三个 vendor 包
  3. 页面级 `lazy import()` 实现路由级 code splitting
- **风险**：⚠️ 中等 — 改完必须 `npm run build` 验证产物；可能影响 SSR / hydration（虽然本项目是 SPA 无此问题）
- **建议做法**：先在分支做，构建产物对比后再合 main

#### T7. 角色判断统一化
- **现状**：两种写法混用
  - `user?.role === 'admin'`（Dashboard, Profile, Score, Announcement）
  - `user?.roles.includes('admin')`（Project/List, Group/List）
- **影响**：如果 `user.role` 和 `user.roles[0]` 不一致，按钮可见性会错
- **建议**：在 `useAuthStore` 加 getter `isAdmin`, `isTeacher`, `isStudent`，统一用 getter

#### T8. 缺单元测试覆盖
- **现状**：4 个测试文件，19 个用例（只覆盖工具函数 + 2 个组件）
- **建议**：
  - 加 `supabase-helpers` 的 `handleSupabaseError` 测试（现在只测了 `fromSupabase` 和 `handleAuthError`）
  - 加页面级集成测试：Document/List 上传/删除流程（mock API）
  - 加 Project/List 表单验证测试

---

### 🚀 优先级 3：F1-F5 长期规划

#### F1. 微信小程序端（uni-app）
- **目录**：`apps/miniapp/`（脚手架已就绪，业务页面空白）
- **9 个待实现页面**：
  - `pages/index/index.vue` — 首页（公告轮播 + 快捷入口）
  - `pages/login/login.vue` — 邮箱密码登录
  - `pages/project/list.vue` — 项目列表
  - `pages/project/detail.vue` — 项目详情（含进度、文档、成员 tab）
  - `pages/group/list.vue` — 我的小组
  - `pages/progress/list.vue` — 进度提交
  - `pages/document/list.vue` — 文档上传/下载
  - `pages/score/list.vue` — 成绩查询
  - `pages/profile/profile.vue` — 个人信息
- **后端**：复用 Supabase（同一套 `profiles` / `user_roles` / `projects` 等表）
- **额外功能**：扫码签到（uni.scanCode）、消息推送（uni-Push）
- **依赖**：HBuilderX 或 `npm run dev:mp-weixin`
- **技术栈**：uni-app 3.0 + Vue 3 + Vite

#### F2. 数据导出优化
- **当前**：`apps/web/src/api/export.ts` 走 `apps/server`（已弃用）
- **建议**：
  - 方案 A：前端侧用 `exceljs` + `docx` 纯浏览器生成
  - 方案 B：Supabase Edge Function（TypeScript，部署到 Supabase）
- **影响范围**：Admin 角色的导出按钮（班级/项目/成绩导出）

#### F3. 国际化（i18n）
- **新增依赖**：`react-i18next`, `i18next`, `i18next-browser-languagedetector`
- **改动**：
  - 抽离所有中文字符串到 `locales/zh-CN.ts` 和 `locales/en-US.ts`
  - `<Header>` 加语言切换 dropdown
  - 持久化选择到 localStorage
- **预估工作量**：4-6 小时（130+ 处中文硬编码）

#### F4. WebSocket 实时通知
- **后端**：Supabase Realtime（已内置，无需额外服务）
- **前端**：订阅 `announcements` / `progress` / `defenses` 表的 `INSERT/UPDATE`
- **新增**：
  - `src/lib/realtime.ts` 封装订阅工具
  - 通知中心组件 `components/common/NotificationCenter.tsx`
  - 答辩倒计时（基于 `defense.start_time` + cron 触发）

#### F5. 性能优化
- **列表虚拟滚动**：`react-window` 用于 Project/List, Group/List, Document/List
- **图片懒加载**：Document/List 的预览图，IntersectionObserver
- **API 响应缓存**：替换裸 useEffect 模式为 `TanStack Query (React Query)`
- **CDN 加速**：将 `apps/web/public/static/*` 资源迁到 Cloudflare R2 或 jsDelivr

---

## 🐛 已知 Bug 汇总

| ID | 严重 | 描述 | 文件 | 修复方案 | 工作量 |
|---|---|---|---|---|---|
| ~~B1~~ | ~~低~~ | ~~登录页默认账号文案错误~~ ✅ | `apps/web/src/pages/Login.tsx` | ~~改文案或读 env~~ | ~~5 分钟~~ |
| B2 | 中 | Vite vendor bundle 1.5MB | `apps/web/vite.config.ts` | 拆 manualChunks + 路由懒加载 | 1-2 小时 |
| ~~B3~~ | ~~低~~ | ~~tsconfig 缺 moduleResolution~~ ✅ | `apps/web/tsconfig.json` | ~~补 `"bundler"`~~ | ~~2 分钟~~ |
| T4 | 中 | 6 个页面错误处理未审 | `apps/web/src/pages/{Project/Detail, Group/Detail, Progress/List, Defense/List, Workload/List, Admin/ClassManagement}.tsx` | 跟 #4 同模式 | 1 小时 |
| T5 | 低 | 死代码/未用 import | 多文件 | grep 清 | 30 分钟 |
| T7 | 中 | 角色判断双写法 | 多文件 | 抽 store getter | 1 小时 |

---

## 📋 长期功能汇总

| ID | 功能 | 估时 | 依赖 |
|---|---|---|---|
| F1 | 微信小程序端 | 2-3 周 | 单独 agent |
| F2 | 数据导出迁移 | 半天 | Supabase Edge Function 部署权限 |
| F3 | 国际化 i18n | 半天 | 无 |
| F4 | 实时通知 | 1-2 天 | 无 |
| F5 | 性能优化（虚拟滚动+缓存+CDN） | 1 周 | 视情况分批 |

---

## 🧪 测试 & 部署清单

每次改动后必跑：

```bash
cd C:\Users\user\Documents\trae-soio\training-project-platform\apps\web
npm run lint         # ESLint
npm test             # Vitest（4 文件 / 19 用例）
npm run build        # tsc + vite build
```

部署到 GitHub Pages（自动）：

```bash
cd C:\Users\user\Documents\trae-soio\training-project-platform
git add .
git commit -m "..."
git push origin main   # 触发 .github/workflows/deploy.yml
```

线上地址：`https://ronineymessjr-sudo.github.io/training-project-platform/`

---

## 📞 交接说明

- **下一个 agent**（浏览器验证）：照 `BROWSER_VERIFICATION.md` 跑完 #4-#8 + 回归测试
- **下一个 agent**（修 B1/B3 + T4/T5/T7）：按本文件优先级 1 任务清单直接做
- **下一个 agent**（F1 微信小程序）：照 `apps/miniapp/README.md` 起步，9 个页面用 uni-app 实现
- **基础设施**：Supabase 凭证在 GitHub Secrets（`VITE_SUPABASE_URL`, `VITE_SUPABASE_ANON_KEY`）
