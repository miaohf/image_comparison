# 图片对比分析系统

通过对比机房监控录像不同时间段的前后两张截图，分析不同点，判断是否存在告警点。

## 项目概述

本系统是一个基于AI的智能监控分析平台，能够自动检测机房监控画面中的异常变化，及时发现潜在的安全隐患和设备故障。

### 主要功能
- 🔍 **智能图片对比**：使用Qwen2.5 VL多模态模型进行精确的图像差异分析
- 🚨 **自动告警检测**：识别异常变化并生成告警信息
- 📊 **可视化界面**：直观的Web界面展示对比结果
- 🔄 **实时监控**：支持定时任务和实时监控模式
- 📈 **历史记录**：保存分析历史和告警记录

## 技术架构

### 前端技术栈
- **框架**：Next.js 15 (App Router)
- **UI组件库**：shadcn/ui
- **样式**：Tailwind CSS
- **状态管理**：React Context / Zustand
- **图表**：Recharts / Chart.js

### 后端技术栈
- **框架**：FastAPI
- **数据验证**：Pydantic
- **AI模型**：Qwen2.5 VL (通过Ollama API访问)
- **数据库**：SQLite / PostgreSQL
- **任务队列**：Celery / Background Tasks

## 项目结构

```
image_comparison/
├── frontend/                 # Next.js 前端应用
│   ├── app/                 # App Router 页面
│   ├── components/          # UI 组件
│   ├── lib/                 # 工具函数
│   ├── types/               # TypeScript 类型定义
│   └── public/              # 静态资源
├── backend/                 # FastAPI 后端应用
│   ├── app/                 # 主应用目录
│   │   ├── api/            # API 路由
│   │   ├── core/           # 核心配置
│   │   ├── models/         # 数据模型
│   │   ├── services/       # 业务逻辑
│   │   └── utils/          # 工具函数
│   ├── requirements.txt    # Python 依赖
│   └── main.py            # 应用入口
├── data/                   # 图片数据存储
├── docs/                   # 文档
└── README.md              # 项目说明
```

## 快速开始

### 环境要求

- **Python**: 3.12+
- **Node.js**: 18+
- **Ollama服务**: 已部署Qwen2.5 VL模型并运行在192.168.31.80:11434

### 安装步骤

1. **克隆项目**
```bash
git clone <repository-url>
cd image_comparison
```

2. **后端设置**
```bash
cd backend
python -m venv venv
source venv/bin/activate  # Windows: venv\Scripts\activate
pip install -r requirements.txt
```

3. **前端设置**
```bash
cd frontend
npm install
```

4. **环境配置**
```bash
# 复制环境变量模板
cp .env.example .env
# 编辑环境变量
nano .env
```

### 启动应用

1. **启动后端服务**
```bash
cd backend
uvicorn main:app --reload --host 0.0.0.0 --port 8000
```

2. **启动前端服务**
```bash
cd frontend
npm run dev
```

3. **访问应用**
- 前端界面：http://localhost:3000
- API文档：http://localhost:8000/docs

## API 文档

### 核心接口

#### 1. 图片对比分析
```http
POST /api/v1/compare-images
Content-Type: multipart/form-data

{
  "image1": "file",
  "image2": "file",
  "threshold": 0.8
}
```

**响应示例**：
```json
{
  "status": "success",
  "data": {
    "similarity_score": 0.85,
    "differences": [
      {
        "type": "object_detected",
        "description": "检测到新物体",
        "confidence": 0.92,
        "bbox": [100, 150, 200, 250]
      }
    ],
    "alert_level": "warning",
    "analysis_time": "2024-01-15T10:30:00Z"
  }
}
```

#### 2. 批量分析
```http
POST /api/v1/batch-analyze
Content-Type: application/json

{
  "image_pairs": [
    {
      "id": "pair_001",
      "image1_url": "path/to/image1.jpg",
      "image2_url": "path/to/image2.jpg"
    }
  ],
  "options": {
    "enable_alert": true,
    "save_results": true
  }
}
```

#### 3. 获取分析历史
```http
GET /api/v1/analysis-history?page=1&limit=20
```

## 配置说明

### 环境变量

```bash
# 数据库配置
DATABASE_URL=sqlite:///./image_comparison.db

# AI模型配置
OLLAMA_BASE_URL=http://192.168.31.80:11434
OLLAMA_MODEL_NAME=qwen2.5-vl

# 应用配置
SECRET_KEY=your-secret-key
DEBUG=True
ALLOWED_HOSTS=localhost,127.0.0.1

# 文件存储
UPLOAD_DIR=./uploads
MAX_FILE_SIZE=10485760  # 10MB
```

### 模型配置

确保Ollama服务已正确部署Qwen2.5 VL模型：

```python
# Ollama API调用示例
import requests
import json

def call_qwen_vl_api(prompt, images):
    url = "http://192.168.31.80:11434/api/generate"
    
    payload = {
        "model": "qwen2.5-vl",
        "prompt": prompt,
        "images": images,
        "stream": False
    }
    
    response = requests.post(url, json=payload)
    return response.json()

# 使用示例
result = call_qwen_vl_api(
    "请分析这两张图片的差异",
    ["base64_encoded_image1", "base64_encoded_image2"]
)
```

**Ollama服务配置**：
```bash
# 拉取Qwen2.5 VL模型
ollama pull qwen2.5-vl

# 启动Ollama服务
ollama serve

# 验证模型可用性
curl -X POST http://192.168.31.80:11434/api/generate \
  -H "Content-Type: application/json" \
  -d '{"model": "qwen2.5-vl", "prompt": "Hello"}'
```

## 使用指南

### 1. 单张图片对比

1. 打开Web界面
2. 上传两张需要对比的图片
3. 设置相似度阈值
4. 点击"开始分析"
5. 查看分析结果和告警信息

### 2. 批量监控

1. 配置监控目录
2. 设置定时任务
3. 系统自动检测变化
4. 接收告警通知

### 3. 历史记录查看

1. 访问历史记录页面
2. 筛选时间范围和告警级别
3. 查看详细分析报告
4. 导出分析数据

## 开发指南

### 添加新的分析算法

1. 在 `backend/app/services/` 创建新的分析器
2. 实现 `BaseAnalyzer` 接口
3. 注册到分析器工厂
4. 更新API接口

### 自定义告警规则

1. 编辑 `backend/app/core/alert_rules.py`
2. 定义新的告警条件
3. 配置告警级别和通知方式

### 前端组件开发

1. 使用shadcn/ui组件库
2. 遵循TypeScript类型定义
3. 实现响应式设计

## 部署说明

### Docker部署

```bash
# 构建镜像
docker build -t image-comparison .

# 运行容器
docker run -d -p 8000:8000 -p 3000:3000 image-comparison
```

### 生产环境配置

1. 使用Nginx反向代理
2. 配置SSL证书
3. 设置数据库备份
4. 监控系统资源

## 故障排除

### 常见问题

1. **Ollama服务连接失败**
   - 检查Ollama服务是否运行在192.168.31.80:11434
   - 确认网络连接是否正常
   - 验证qwen2.5-vl模型是否已安装

2. **图片上传失败**
   - 检查文件大小限制
   - 确认文件格式支持
   - 验证存储权限

3. **分析结果不准确**
   - 调整相似度阈值
   - 检查图片质量
   - 优化Ollama API调用参数
   - 检查模型响应时间

## 贡献指南

1. Fork 项目
2. 创建功能分支
3. 提交代码变更
4. 创建Pull Request

## 许可证

MIT License

## 联系方式

- 项目维护者：[您的姓名]
- 邮箱：[您的邮箱]
- 项目地址：[GitHub地址]

---

**注意**：使用本系统前请确保已获得相关监控数据的授权，并遵守当地法律法规。

