from sqlalchemy import create_engine, Column, Integer, String, DateTime, Float, Text, Boolean
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker
from datetime import datetime
from app.core.config import settings

# 创建数据库引擎
engine = create_engine(
    settings.database_url,
    connect_args={"check_same_thread": False} if "sqlite" in settings.database_url else {}
)

# 创建会话工厂
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

# 创建基础模型类
Base = declarative_base()


class AnalysisRecord(Base):
    """分析记录模型"""
    __tablename__ = "analysis_records"
    
    id = Column(Integer, primary_key=True, index=True)
    image1_path = Column(String, nullable=False)
    image2_path = Column(String, nullable=False)
    similarity_score = Column(Float, nullable=True)
    differences = Column(Text, nullable=True)  # JSON格式存储差异信息
    alert_level = Column(String, nullable=True)  # info, warning, error
    analysis_time = Column(DateTime, default=datetime.utcnow)
    processing_time = Column(Float, nullable=True)  # 处理时间（秒）
    status = Column(String, default="completed")  # pending, processing, completed, failed
    error_message = Column(Text, nullable=True)


class AlertRule(Base):
    """告警规则模型"""
    __tablename__ = "alert_rules"
    
    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, nullable=False)
    description = Column(Text, nullable=True)
    threshold = Column(Float, nullable=False)
    alert_level = Column(String, nullable=False)  # info, warning, error
    is_active = Column(Boolean, default=True)
    created_at = Column(DateTime, default=datetime.utcnow)


# 创建数据库表
def create_tables():
    Base.metadata.create_all(bind=engine)


# 获取数据库会话
def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close() 