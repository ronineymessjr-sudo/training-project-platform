# 实训项目全过程管理平台

一个完整的实训项目全过程管理平台，支持学生、教师、管理员三种角色，实现组队、选题、进度提交、文档管理、答辩评分、成绩统计等功能。

## 技术栈

- **前端**: React 18 + TypeScript + Ant Design + Vite
- **后端**: Node.js + Express + TypeScript
- **数据库**: MySQL 8.0
- **缓存**: Redis
- **文件存储**: MinIO
- **部署**: Docker + Docker Compose

## 项目结构

```
training-project-platform/
├── apps/
│   ├── web/              # Web 前端 (React + Ant Design)
│   ├── server/           # 后端 API (Express)
│   └── miniapp/          # 微信小程序 (uni-app)
├── packages/
│   └── shared/           # 共享类型定义
├── docker/
│   └── docker-compose.yml
└── package.json
```

## 快速开始

### 1. 环境要求

- Node.js 18+
- Docker & Docker Compose
- pnpm (推荐)

### 2. 安装依赖

```bash
# 在项目根目录执行
pnpm install
```

### 3. 启动数据库

```bash
# 启动 MySQL、Redis、MinIO
docker-compose -f docker/docker-compose.yml up -d
```

### 4. 初始化数据库

```bash
# 进入后端目录
cd apps/server

# 执行数据库迁移
npm run db:migrate

# 插入测试数据
npm run db:seed
```

### 5. 启动服务

```bash
# 启动后端 (在 apps/server 目录)
npm run dev

# 启动前端 (在 apps/web 目录)
npm run dev
```

### 6. 访问系统

- Web 端: http://localhost:5173
- 后端 API: http://localhost:3000
- API 文档: http://localhost:3000/api

## 测试账号

| 角色 | 账号 | 密码 |
|------|------|------|
| 管理员 | admin | admin123 |
| 教师 | teacher001 | teacher123 |
| 学生 | student001 | student123 |

## 功能模块

### 学生端
- 📋 项目列表查看
- 👥 小组管理（创建/加入/退出）
- 📝 进度提交
- 📄 文档上传/下载
- 🏆 成绩查看
- 📅 答辩安排查看

### 教师端
- 📊 项目管理
- 👨‍🏫 指导小组管理
- ✅ 进度审核
- 📝 评分管理
- 📅 答辩安排
- 📈 工作量审核

### 管理员端
- 👤 用户管理
- 🏫 班级/专业管理
- 📢 公告管理
- 📊 数据统计
- 📥 数据导出 (Excel/PDF/Word)

## 数据库迁移

```bash
# 执行所有迁移
npm run db:migrate

# 插入测试数据
npm run db:seed

# 重置数据库（删除所有表并重新迁移）
npm run db:reset
```

## API 接口

### 认证
- `POST /api/v1/auth/login` - 登录
- `POST /api/v1/auth/register` - 注册
- `GET /api/v1/auth/me` - 获取当前用户
- `POST /api/v1/auth/logout` - 退出登录

### 项目
- `GET /api/v1/projects` - 项目列表
- `GET /api/v1/projects/:id` - 项目详情
- `POST /api/v1/projects` - 创建项目
- `PUT /api/v1/projects/:id` - 更新项目
- `DELETE /api/v1/projects/:id` - 删除项目

### 分组
- `GET /api/v1/groups` - 分组列表
- `GET /api/v1/groups/:id` - 分组详情
- `POST /api/v1/groups` - 创建分组
- `PUT /api/v1/groups/:id` - 更新分组
- `POST /api/v1/groups/:id/members` - 添加成员

### 进度
- `GET /api/v1/progress` - 进度列表
- `POST /api/v1/progress` - 提交进度
- `PUT /api/v1/progress/:id/review` - 审核进度

### 文档
- `GET /api/v1/documents` - 文档列表
- `POST /api/v1/documents` - 上传文档
- `GET /api/v1/documents/:id/download` - 下载文档

### 评分
- `GET /api/v1/scores` - 成绩列表
- `POST /api/v1/scores` - 提交评分
- `GET /api/v1/scores/statistics` - 成绩统计

### 答辩
- `GET /api/v1/defenses` - 答辩列表
- `POST /api/v1/defenses` - 安排答辩
- `POST /api/v1/defenses/:id/score` - 答辩评分

## 部署

### Docker 部署

```bash
# 构建并启动所有服务
docker-compose up -d

# 查看日志
docker-compose logs -f

# 停止服务
docker-compose down
```

### 生产环境配置

1. 修改 `.env` 文件中的配置
2. 设置强密码
3. 配置 HTTPS
4. 配置反向代理 (Nginx)

## 开发指南

### 添加新功能

1. 后端：在 `apps/server/src/routes/` 添加路由
2. 后端：在 `apps/server/src/database/migrations/` 添加迁移
3. 前端：在 `apps/web/src/pages/` 添加页面
4. 前端：在 `apps/web/src/api/` 添加 API 调用

### 代码规范

- 使用 ESLint 进行代码检查
- 使用 TypeScript 严格模式
- 遵循 RESTful API 设计规范

## 许可证

MIT

## 贡献

欢迎提交 Issue 和 Pull Request！
