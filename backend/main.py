from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
import os

from app.core.config import settings
from app.models.database import create_tables
from app.api.analysis import router as analysis_router

# 创建FastAPI应用
app = FastAPI(
    title=settings.app_name,
    description="基于Qwen2.5 VL的智能图片对比分析系统",
    version="1.0.0",
    docs_url="/docs",
    redoc_url="/redoc",
    openapi_url="/openapi.json"
)

# 配置CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # 生产环境中应该指定具体的前端域名
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# 挂载静态文件
if os.path.exists(settings.upload_dir):
    app.mount("/uploads", StaticFiles(directory=settings.upload_dir), name="uploads")

# 注册路由
app.include_router(analysis_router)

# 启动时创建数据库表
@app.on_event("startup")
async def startup_event():
    create_tables()
    print(f"🚀 {settings.app_name} 启动成功")
    print(f"📊 API文档: http://localhost:8000/docs")
    print(f"🔗 Ollama服务: {settings.ollama_base_url}")


@app.get("/")
async def root():
    """根路径"""
    return {
        "message": f"欢迎使用 {settings.app_name}",
        "version": "1.0.0",
        "docs": "/docs",
        "health": "/api/v1/health"
    }


@app.get("/api/health")
async def health():
    """健康检查"""
    return {
        "status": "healthy",
        "service": settings.app_name,
        "version": "1.0.0"
    }


if __name__ == "__main__":
    import uvicorn
    uvicorn.run(
        "main:app",
        host="0.0.0.0",
        port=2001,
        reload=settings.debug
    ) 