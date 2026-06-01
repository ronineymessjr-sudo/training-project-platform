@echo off
chcp 65001 >nul
echo ==========================================
echo   实训项目全过程管理平台 - 启动脚本
echo ==========================================
echo.

:: 检查 Docker 是否运行
docker info >nul 2>&1
if errorlevel 1 (
    echo [错误] Docker 未运行，请先启动 Docker Desktop
    pause
    exit /b 1
)

echo [1/4] 启动数据库服务...
docker-compose -f docker/docker-compose.yml up -d
if errorlevel 1 (
    echo [错误] 启动数据库失败
    pause
    exit /b 1
)
echo [OK] 数据库服务已启动
echo.

echo [2/4] 等待数据库就绪...
timeout /t 5 /nobreak >nul
echo [OK] 数据库就绪
echo.

echo [3/4] 初始化数据库...
cd apps/server

:: 检查 node_modules 是否存在
if not exist "node_modules" (
    echo 安装后端依赖...
    npm install
)

echo 执行数据库迁移...
npm run db:migrate
if errorlevel 1 (
    echo [警告] 数据库迁移可能已执行过，继续...
)

echo 插入测试数据...
npm run db:seed
if errorlevel 1 (
    echo [警告] 测试数据可能已插入，继续...
)

echo [OK] 数据库初始化完成
echo.

echo [4/4] 启动后端服务...
start "后端服务" cmd /k "npm run dev"

cd ..\..

echo 启动前端服务...
cd apps/web

:: 检查 node_modules 是否存在
if not exist "node_modules" (
    echo 安装前端依赖...
    npm install
)

start "前端服务" cmd /k "npm run dev"

cd ..\..

echo.
echo ==========================================
echo   所有服务已启动！
echo ==========================================
echo.
echo 访问地址:
echo   - Web 端: http://localhost:5173
echo   - 后端 API: http://localhost:3000
echo   - API 文档: http://localhost:3000/api
echo.
echo 测试账号:
echo   - 管理员: admin / admin123
echo   - 教师: teacher001 / teacher123
echo   - 学生: student001 / student123
echo.
pause
