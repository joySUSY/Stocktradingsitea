@echo off
chcp 65001 >nul
title 股票数据API服务器

echo.
echo ========================================
echo    股票盯盘系统 - 后端服务启动器
echo ========================================
echo.

echo [1/3] 检查Python环境...
python --version >nul 2>&1
if errorlevel 1 (
    echo ❌ 错误: 未找到Python，请先安装Python 3.8或更高版本
    echo.
    echo 下载地址: https://www.python.org/downloads/
    echo.
    pause
    exit /b 1
)
python --version
echo ✅ Python环境正常
echo.

echo [2/3] 检查依赖包...
python -c "import flask" >nul 2>&1
if errorlevel 1 (
    echo ⚠️  首次运行，正在安装依赖包...
    echo 这可能需要2-3分钟，请耐心等待...
    echo.
    pip install -r requirements.txt
    if errorlevel 1 (
        echo ❌ 安装失败，请检查网络连接
        pause
        exit /b 1
    )
    echo ✅ 依赖包安装完成
) else (
    echo ✅ 依赖包已安装
)
echo.

echo [3/3] 启动API服务器...
echo.
echo ========================================
echo  🚀 正在启动股票数据API服务...
echo ========================================
echo.
echo  📊 数据源: Tushare Pro
echo  🌐 服务地址: http://localhost:3001
echo  📝 API文档: http://localhost:3001
echo.
echo ========================================
echo  按 Ctrl+C 可停止服务
echo ========================================
echo.

python stock_api_server.py

if errorlevel 1 (
    echo.
    echo ❌ 服务启动失败，请检查错误信息
    pause
    exit /b 1
)
