#!/bin/bash

echo "========================================"
echo "   实训项目全过程管理平台 - 快速启动"
echo "========================================"
echo ""

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
