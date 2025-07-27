from pydantic import BaseModel, Field, ConfigDict
from typing import List, Optional, Dict, Any
from datetime import datetime


class ImageComparisonRequest(BaseModel):
    """图片对比请求模型"""
    threshold: float = Field(default=0.8, ge=0.0, le=1.0, description="相似度阈值")
    enable_alert: bool = Field(default=True, description="是否启用告警")
    save_results: bool = Field(default=True, description="是否保存结果")


class ImagePair(BaseModel):
    """图片对模型"""
    id: str = Field(description="图片对唯一标识")
    image1_url: str = Field(description="第一张图片路径")
    image2_url: str = Field(description="第二张图片路径")


class BatchAnalysisRequest(BaseModel):
    """批量分析请求模型"""
    image_pairs: List[ImagePair] = Field(description="图片对列表")
    options: Dict[str, Any] = Field(default_factory=dict, description="分析选项")


class Difference(BaseModel):
    """差异信息模型"""
    type: str = Field(description="差异类型")
    description: str = Field(description="差异描述")
    confidence: float = Field(ge=0.0, le=1.0, description="置信度")
    bbox: Optional[List[int]] = Field(default=None, description="边界框坐标")


class AlertDetail(BaseModel):
    """告警详情模型"""
    severity: str = Field(description="严重程度: low, medium, high, critical")
    category: str = Field(description="告警类别: equipment, safety, environment, system")
    description: str = Field(description="详细告警描述")
    impact: str = Field(description="影响范围")
    recommendations: List[str] = Field(description="建议措施")
    risk_level: str = Field(description="风险等级: low, medium, high, critical")
    estimated_resolution_time: Optional[str] = Field(default=None, description="预估解决时间")


class AnalysisResult(BaseModel):
    """分析结果模型"""
    similarity_score: float = Field(ge=0.0, le=1.0, description="相似度分数")
    differences: List[Difference] = Field(default_factory=list, description="差异列表")
    alert_level: str = Field(description="告警级别")
    alert_details: Optional[AlertDetail] = Field(default=None, description="告警详情")
    analysis_summary: str = Field(description="分析摘要")
    analysis_time: datetime = Field(description="分析时间")
    processing_time: float = Field(description="处理时间（秒）")


class AnalysisResponse(BaseModel):
    """分析响应模型"""
    status: str = Field(description="响应状态")
    data: AnalysisResult = Field(description="分析结果")
    message: Optional[str] = Field(default=None, description="响应消息")


class AnalysisRecordResponse(BaseModel):
    """分析记录响应模型"""
    id: int
    image1_path: str
    image2_path: str
    similarity_score: Optional[float]
    differences: Optional[str]
    alert_level: Optional[str]
    analysis_time: datetime
    processing_time: Optional[float]
    status: str
    error_message: Optional[str]

    model_config = ConfigDict(from_attributes=True)


class AlertRuleRequest(BaseModel):
    """告警规则请求模型"""
    name: str = Field(description="规则名称")
    description: Optional[str] = Field(default=None, description="规则描述")
    threshold: float = Field(ge=0.0, le=1.0, description="阈值")
    alert_level: str = Field(description="告警级别")
    is_active: bool = Field(default=True, description="是否激活")


class AlertRuleResponse(BaseModel):
    """告警规则响应模型"""
    id: int
    name: str
    description: Optional[str]
    threshold: float
    alert_level: str
    is_active: bool
    created_at: datetime

    model_config = ConfigDict(from_attributes=True)


class PaginatedResponse(BaseModel):
    """分页响应模型"""
    items: List[Any]
    total: int
    page: int
    limit: int
    pages: int 