#!/bin/bash

# 股票数据API服务器启动脚本（Mac/Linux）

clear

echo "========================================"
echo "   股票盯盘系统 - 后端服务启动器"
echo "========================================"
echo ""

# 检查Python环境
echo "[1/3] 检查Python环境..."
if command -v python3 &> /dev/null; then
    PYTHON_CMD=python3
elif command -v python &> /dev/null; then
    PYTHON_CMD=python
else
    echo "❌ 错误: 未找到Python，请先安装Python 3.8或更高版本"
    echo ""
    echo "Mac安装: brew install python3"
    echo "Ubuntu安装: sudo apt install python3 python3-pip"
    echo ""
    exit 1
fi

$PYTHON_CMD --version
echo "✅ Python环境正常"
echo ""

# 检查pip
if command -v pip3 &> /dev/null; then
    PIP_CMD=pip3
elif command -v pip &> /dev/null; then
    PIP_CMD=pip
else
    echo "❌ 错误: 未找到pip"
    exit 1
fi

# 检查并安装依赖
echo "[2/3] 检查依赖包..."
$PYTHON_CMD -c "import flask" 2>/dev/null
if [ $? -ne 0 ]; then
    echo "⚠️  首次运行，正在安装依赖包..."
    echo "这可能需要2-3分钟，请耐心等待..."
    echo ""
    $PIP_CMD install -r requirements.txt
    if [ $? -ne 0 ]; then
        echo "❌ 安装失败，请检查网络连接"
        exit 1
    fi
    echo "✅ 依赖包安装完成"
else
    echo "✅ 依赖包已安装"
fi
echo ""

# 启动服务
echo "[3/3] 启动API服务器..."
echo ""
echo "========================================"
echo " 🚀 正在启动股票数据API服务..."
echo "========================================"
echo ""
echo " 📊 数据源: Tushare Pro"
echo " 🌐 服务地址: http://localhost:3001"
echo " 📝 API文档: http://localhost:3001"
echo ""
echo "========================================"
echo " 按 Ctrl+C 可停止服务"
echo "========================================"
echo ""

$PYTHON_CMD stock_api_server.py

if [ $? -ne 0 ]; then
    echo ""
    echo "❌ 服务启动失败，请检查错误信息"
    exit 1
fi
