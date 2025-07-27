#!/bin/bash

echo "🚀 启动图片对比分析系统前端..."

cd frontend

# 检查环境变量文件
if [ ! -f ".env" ]; then
    echo "📝 创建环境变量文件..."
    cp env.example .env
fi

# 安装依赖
echo "📦 安装Node.js依赖..."
npm install

# 启动前端服务
echo "🚀 启动Next.js前端服务..."
echo "📊 前端界面: http://localhost:3000"
echo "按 Ctrl+C 停止服务"

npm run dev 