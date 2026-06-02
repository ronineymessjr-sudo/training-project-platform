#!/bin/bash

# ============================================================
# ⚠️ 已弃用 — 本脚本为旧版本地启动方式
# ============================================================
# 原用于启动 MySQL + Redis + MinIO + Express 后端 + Web 前端。
# 自 2026-06 起，项目已迁移到 Supabase-only 架构，apps/server 不再构建。
# 请改用以下现代启动方式：
#
#   1. 在 https://supabase.com 创建项目
#   2. 在 Supabase SQL Editor 执行 supabase/schema.sql
#   3. cp apps/web/.env.example apps/web/.env.local，填入 Supabase URL/Key
#   4. cd apps/web && npm install && npm run dev
#   5. 浏览器打开 http://localhost:5173
#
# 测试账号：admin@test.com / admin123456（详见 README.md）
# ============================================================

echo "========================================"
echo "   实训项目全过程管理平台 - 快速启动"
echo "========================================"
echo ""
echo "⚠️  本脚本已弃用，请改用 Supabase + apps/web 启动流程"
echo "    详见 start.sh 文件头注释或 README.md"
echo ""
exit 1

# 以下为旧版启动逻辑（保留为参考，不会执行）

# 检查 pnpm
if ! command -v pnpm &> /dev/null; then
    echo "[安装] pnpm..."
    npm install -g pnpm
fi

# 安装依赖
echo ""
echo "[1/4] 安装项目依赖..."
pnpm install
if [ $? -ne 0 ]; then
    echo "[错误] 依赖安装失败"
    exit 1
fi

# 启动 Docker 服务
echo ""
echo "[2/4] 启动 Docker 服务 (MySQL, Redis, MinIO)..."
docker-compose -f docker/docker-compose.yml up -d
if [ $? -ne 0 ]; then
    echo "[警告] Docker 服务启动失败，请手动启动"
fi

# 等待数据库就绪
echo ""
echo "[3/4] 等待数据库就绪..."
sleep 10

# 初始化数据库
echo ""
echo "[4/4] 初始化数据库..."
cd apps/server
pnpm run db:migrate
pnpm run db:seed
cd ../..

echo ""
echo "========================================"
echo "   启动完成！"
echo "========================================"
echo ""
echo "正在启动开发服务器..."
echo "  - 后端: http://localhost:3000"
echo "  - 前端: http://localhost:5173"
echo ""
echo "默认账号:"
echo "  管理员: admin / admin123"
echo "  教师:   teacher / teacher123"
echo "  学生:   student / student123"
echo ""

# 启动开发服务
pnpm dev
