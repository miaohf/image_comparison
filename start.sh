#!/bin/bash

echo "🚀 启动图片对比分析系统..."

# 检查Python版本
python_version=$(python3 --version 2>&1 | grep -o '3\.[0-9]\+' | head -1)
required_version="3.12"

if [ "$(printf '%s\n' "$required_version" "$python_version" | sort -V | head -n1)" != "$required_version" ]; then
    echo "❌ 错误: 需要Python 3.12或更高版本，当前版本: $python_version"
    exit 1
fi

# 检查Node.js版本
node_version=$(node --version 2>&1 | grep -o 'v[0-9]\+' | head -1 | sed 's/v//')
required_node_version="18"

if [ "$node_version" -lt "$required_node_version" ]; then
    echo "❌ 错误: 需要Node.js 18或更高版本，当前版本: $node_version"
    exit 1
fi

echo "✅ Python版本: $python_version"
echo "✅ Node.js版本: $node_version"

# 启动后端
echo "🔧 启动后端服务..."
cd backend

# 检查虚拟环境
if [ ! -d "venv" ]; then
    echo "📦 创建Python虚拟环境..."
    python3 -m venv venv
fi

# 激活虚拟环境
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
uvicorn main:app --reload --host 0.0.0.0 --port 8000 &
BACKEND_PID=$!

# 等待后端启动
sleep 3

# 启动前端
echo "🔧 启动前端服务..."
cd ../frontend

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
npm run dev &
FRONTEND_PID=$!

echo ""
echo "🎉 系统启动完成!"
echo "📊 前端界面: http://localhost:3000"
echo "📚 API文档: http://localhost:8000/docs"
echo "🔗 后端服务: http://localhost:8000"
echo ""
echo "按 Ctrl+C 停止服务"

# 等待用户中断
trap "echo '🛑 正在停止服务...'; kill $BACKEND_PID $FRONTEND_PID; exit" INT
wait 