#!/bin/bash

echo "🚀 启动图片对比分析系统后端..."

cd backend

# 检查虚拟环境
if [ ! -d "venv" ]; then
    echo "📦 创建Python虚拟环境..."
    python3 -m venv venv
fi

# 激活虚拟环境
echo "🔧 激活虚拟环境..."
source venv/bin/activate

# 安装依赖
echo "📦 安装Python依赖..."
pip install -r requirements.txt

# 检查环境变量文件
if [ ! -f ".env" ]; then
    echo "📝 创建环境变量文件..."
    cp env.example .env
    echo "⚠️  请编辑 backend/.env 文件配置Ollama服务地址"
fi

# 启动后端服务
echo "🚀 启动FastAPI后端服务..."
echo "📊 API文档: http://localhost:8000/docs"
echo "🔗 后端服务: http://localhost:8000"
echo "按 Ctrl+C 停止服务"

uvicorn main:app --reload --host 0.0.0.0 --port 8000 