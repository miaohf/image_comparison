# 图片对比分析系统 - 安装指南

## 环境要求

- **Python**: 3.12+
- **Node.js**: 18+
- **Ollama服务**: 已部署Qwen2.5 VL模型并运行在192.168.31.80:11434

## 快速安装

### 1. 克隆项目
```bash
git clone <repository-url>
cd image_comparison
```

### 2. 启动后端服务

#### 方法一：使用启动脚本
```bash
chmod +x start-backend.sh
./start-backend.sh
```

#### 方法二：手动启动
```bash
cd backend

# 创建虚拟环境
python3 -m venv venv

# 激活虚拟环境
source venv/bin/activate  # Linux/Mac
# 或
venv\Scripts\activate     # Windows

# 安装依赖
pip install -r requirements.txt

# 配置环境变量
cp env.example .env
# 编辑 .env 文件，确保Ollama服务地址正确

# 启动服务
uvicorn main:app --reload --host 0.0.0.0 --port 8000
```

### 3. 启动前端服务

#### 方法一：使用启动脚本
```bash
chmod +x start-frontend.sh
./start-frontend.sh
```

#### 方法二：手动启动
```bash
cd frontend

# 配置环境变量
cp env.example .env

# 安装依赖
npm install

# 启动服务
npm run dev
```

## 访问应用

- **前端界面**: http://localhost:3000
- **API文档**: http://localhost:8000/docs
- **后端服务**: http://localhost:8000

## 配置说明

### 后端配置 (backend/.env)
```bash
# 应用配置
APP_NAME=图片对比分析系统
DEBUG=True
SECRET_KEY=your-secret-key-change-in-production

# 数据库配置
DATABASE_URL=sqlite:///./image_comparison.db

# Ollama API配置
OLLAMA_BASE_URL=http://192.168.31.80:11434
OLLAMA_MODEL_NAME=qwen2.5-vl

# 文件上传配置
UPLOAD_DIR=./uploads
MAX_FILE_SIZE=10485760
ALLOWED_HOSTS=localhost,127.0.0.1,192.158.31.80
```

### 前端配置 (frontend/.env)
```bash
# 前端配置
NEXT_PUBLIC_API_URL=http://localhost:8000
NEXT_PUBLIC_APP_NAME=图片对比分析系统

# 开发环境配置
NODE_ENV=development
```

## 故障排除

### 1. Python虚拟环境问题
如果遇到"externally-managed-environment"错误：
```bash
# 确保使用虚拟环境
python3 -m venv venv
source venv/bin/activate
pip install -r requirements.txt
```

### 2. Ollama连接问题
确保Ollama服务正在运行：
```bash
# 检查Ollama服务状态
curl http://192.168.31.80:11434/api/tags

# 检查模型是否可用
ollama list
```

### 3. 端口占用问题
如果端口被占用，可以修改端口：
```bash
# 后端
uvicorn main:app --reload --host 0.0.0.0 --port 8001

# 前端
npm run dev -- -p 3001
```

## 开发模式

### 后端开发
```bash
cd backend
source venv/bin/activate
uvicorn main:app --reload --host 0.0.0.0 --port 8000
```

### 前端开发
```bash
cd frontend
npm run dev
```

## 生产部署

### Docker部署
```bash
# 构建镜像
docker build -t image-comparison .

# 运行容器
docker run -d -p 8000:8000 -p 3000:3000 image-comparison
```

### 手动部署
1. 构建前端
```bash
cd frontend
npm run build
npm start
```

2. 启动后端
```bash
cd backend
uvicorn main:app --host 0.0.0.0 --port 8000
```

## 技术支持

如果遇到问题，请检查：
1. Python和Node.js版本是否符合要求
2. Ollama服务是否正常运行
3. 网络连接是否正常
4. 环境变量配置是否正确 