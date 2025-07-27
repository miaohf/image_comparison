from fastapi import APIRouter, Depends, HTTPException, UploadFile, File, Form
from sqlalchemy.orm import Session
from typing import List, Optional
import os

from app.models.database import get_db
from app.models.schemas import (
    AnalysisResponse, AnalysisResult, BatchAnalysisRequest, 
    PaginatedResponse, AnalysisRecordResponse
)
from app.services.analysis_service import analysis_service

router = APIRouter(prefix="/api/v1", tags=["图片分析"])


@router.post("/compare-images", response_model=AnalysisResponse)
async def compare_images(
    image1: UploadFile = File(..., description="第一张图片"),
    image2: UploadFile = File(..., description="第二张图片"),
    threshold: float = Form(0.8, ge=0.0, le=1.0, description="相似度阈值"),
    enable_alert: bool = Form(True, description="是否启用告警"),
    save_results: bool = Form(True, description="是否保存结果"),
    db: Session = Depends(get_db)
):
    """对比两张图片的差异"""
    
    # 验证文件类型
    allowed_types = ["image/jpeg", "image/png", "image/webp"]
    if image1.content_type not in allowed_types or image2.content_type not in allowed_types:
        raise HTTPException(status_code=400, detail="只支持JPEG、PNG和WebP格式的图片")
    
    # 验证文件大小
    max_size = 10 * 1024 * 1024  # 10MB
    if image1.size > max_size or image2.size > max_size:
        raise HTTPException(status_code=400, detail="图片文件大小不能超过10MB")
    
    try:
        print(f"接收到文件上传请求")
        print(f"图片1: {image1.filename}, 大小: {image1.size}, 类型: {image1.content_type}")
        print(f"图片2: {image2.filename}, 大小: {image2.size}, 类型: {image2.content_type}")
        
        # 保存上传的文件
        image1_path = analysis_service.save_uploaded_file(image1, image1.filename)
        image2_path = analysis_service.save_uploaded_file(image2, image2.filename)
        
        print(f"文件保存成功:")
        print(f"图片1路径: {image1_path}")
        print(f"图片2路径: {image2_path}")
        
        # 分析图片差异
        result = analysis_service.analyze_images(image1_path, image2_path, threshold)
        
        # 保存分析记录
        if save_results:
            analysis_service.save_analysis_record(db, image1_path, image2_path, result)
        
        print(f"分析完成，结果: {result}")
        
        return AnalysisResponse(
            status="success",
            data=result,
            message="图片分析完成"
        )
        
    except Exception as e:
        print(f"分析过程中出现错误: {str(e)}")
        raise HTTPException(status_code=500, detail=f"分析失败: {str(e)}")


@router.post("/batch-analyze")
async def batch_analyze(
    request: BatchAnalysisRequest,
    db: Session = Depends(get_db)
):
    """批量分析图片对"""
    
    try:
        # 验证图片文件是否存在
        for pair in request.image_pairs:
            if not os.path.exists(pair.image1_url):
                raise HTTPException(status_code=400, detail=f"图片文件不存在: {pair.image1_url}")
            if not os.path.exists(pair.image2_url):
                raise HTTPException(status_code=400, detail=f"图片文件不存在: {pair.image2_url}")
        
        # 执行批量分析
        results = analysis_service.batch_analyze(
            [{"id": pair.id, "image1_path": pair.image1_url, "image2_path": pair.image2_url} 
             for pair in request.image_pairs],
            request.options
        )
        
        return {
            "status": "success",
            "data": results,
            "message": f"批量分析完成，共处理 {len(results)} 对图片"
        }
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"批量分析失败: {str(e)}")


@router.get("/analysis-history", response_model=PaginatedResponse)
async def get_analysis_history(
    page: int = 1,
    limit: int = 20,
    db: Session = Depends(get_db)
):
    """获取分析历史记录"""
    
    if page < 1 or limit < 1 or limit > 100:
        raise HTTPException(status_code=400, detail="分页参数无效")
    
    try:
        result = analysis_service.get_analysis_history(db, page, limit)
        
        return PaginatedResponse(
            items=result["items"],
            total=result["total"],
            page=result["page"],
            limit=result["limit"],
            pages=result["pages"]
        )
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"获取历史记录失败: {str(e)}")


@router.get("/analysis/{record_id}", response_model=AnalysisRecordResponse)
async def get_analysis_record(
    record_id: int,
    db: Session = Depends(get_db)
):
    """获取单个分析记录"""
    
    from app.models.database import AnalysisRecord
    
    record = db.query(AnalysisRecord).filter(AnalysisRecord.id == record_id).first()
    if not record:
        raise HTTPException(status_code=404, detail="分析记录不存在")
    
    return record


@router.delete("/analysis/{record_id}")
async def delete_analysis_record(
    record_id: int,
    db: Session = Depends(get_db)
):
    """删除分析记录"""
    
    from app.models.database import AnalysisRecord
    
    record = db.query(AnalysisRecord).filter(AnalysisRecord.id == record_id).first()
    if not record:
        raise HTTPException(status_code=404, detail="分析记录不存在")
    
    try:
        # 删除关联的图片文件
        if os.path.exists(record.image1_path):
            os.remove(record.image1_path)
        if os.path.exists(record.image2_path):
            os.remove(record.image2_path)
        
        # 删除数据库记录
        db.delete(record)
        db.commit()
        
        return {"status": "success", "message": "记录删除成功"}
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"删除失败: {str(e)}")


@router.get("/health")
async def health_check():
    """健康检查"""
    
    try:
        # 测试Ollama连接
        ollama_connected = analysis_service.test_ollama_connection()
        
        return {
            "status": "healthy",
            "ollama_connected": ollama_connected,
            "timestamp": "2024-01-15T10:30:00Z"
        }
        
    except Exception as e:
        return {
            "status": "unhealthy",
            "error": str(e),
            "timestamp": "2024-01-15T10:30:00Z"
        } 