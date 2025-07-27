#!/usr/bin/env python3
"""
测试告警逻辑修改
验证高相似度时的告警详情是否更合理
"""

import sys
import os
sys.path.append(os.path.join(os.path.dirname(__file__), 'backend'))

from app.models.schemas import Difference, AlertDetail
from app.services.analysis_service import AnalysisService

def test_high_similarity_alert():
    """测试高相似度时的告警逻辑"""
    print("=== 测试高相似度告警逻辑 ===")
    
    # 创建分析服务实例
    service = AnalysisService()
    
    # 模拟高相似度（99.1%）但检测到人物的情况
    similarity_score = 0.991
    differences = [
        Difference(
            type="person_detected",
            description="检测到人物出现",
            confidence=0.95,
            bbox=[100, 150, 200, 250]
        )
    ]
    
    print(f"相似度: {similarity_score:.1%}")
    print(f"检测到的差异: {differences[0].description}")
    print(f"差异置信度: {differences[0].confidence}")
    
    # 测试告警级别判断
    alert_level = service._determine_alert_level(similarity_score, differences, threshold=0.8)
    print(f"\n告警级别: {alert_level}")
    
    # 测试告警详情生成
    alert_details = service._generate_alert_details(alert_level, differences, similarity_score)
    
    if alert_details:
        print(f"\n=== 告警详情 ===")
        print(f"严重程度: {alert_details.severity}")
        print(f"风险等级: {alert_details.risk_level}")
        print(f"预估解决时间: {alert_details.estimated_resolution_time}")
        print(f"描述: {alert_details.description}")
        print(f"影响: {alert_details.impact}")
        print(f"建议措施:")
        for i, rec in enumerate(alert_details.recommendations, 1):
            print(f"  {i}. {rec}")
    else:
        print("未生成告警详情")
    
    print("\n=== 测试完成 ===")

def test_low_similarity_alert():
    """测试低相似度时的告警逻辑（对比）"""
    print("\n=== 测试低相似度告警逻辑（对比） ===")
    
    service = AnalysisService()
    
    # 模拟低相似度（30%）的情况
    similarity_score = 0.30
    differences = [
        Difference(
            type="person_detected",
            description="检测到人物出现",
            confidence=0.95,
            bbox=[100, 150, 200, 250]
        )
    ]
    
    print(f"相似度: {similarity_score:.1%}")
    print(f"检测到的差异: {differences[0].description}")
    
    # 测试告警级别判断
    alert_level = service._determine_alert_level(similarity_score, differences, threshold=0.8)
    print(f"\n告警级别: {alert_level}")
    
    # 测试告警详情生成
    alert_details = service._generate_alert_details(alert_level, differences, similarity_score)
    
    if alert_details:
        print(f"\n=== 告警详情 ===")
        print(f"严重程度: {alert_details.severity}")
        print(f"风险等级: {alert_details.risk_level}")
        print(f"预估解决时间: {alert_details.estimated_resolution_time}")
        print(f"描述: {alert_details.description}")
        print(f"影响: {alert_details.impact}")
        print(f"建议措施:")
        for i, rec in enumerate(alert_details.recommendations, 1):
            print(f"  {i}. {rec}")
    else:
        print("未生成告警详情")
    
    print("\n=== 测试完成 ===")

def test_critical_similarity_alert():
    """测试极低相似度时的告警逻辑"""
    print("\n=== 测试极低相似度告警逻辑 ===")
    
    service = AnalysisService()
    
    # 模拟极低相似度（20%）的情况
    similarity_score = 0.20
    differences = [
        Difference(
            type="danger_detected",
            description="检测到危险情况",
            confidence=0.95,
            bbox=[0, 0, 300, 300]
        )
    ]
    
    print(f"相似度: {similarity_score:.1%}")
    print(f"检测到的差异: {differences[0].description}")
    
    # 测试告警级别判断
    alert_level = service._determine_alert_level(similarity_score, differences, threshold=0.8)
    print(f"\n告警级别: {alert_level}")
    
    # 测试告警详情生成
    alert_details = service._generate_alert_details(alert_level, differences, similarity_score)
    
    if alert_details:
        print(f"\n=== 告警详情 ===")
        print(f"严重程度: {alert_details.severity}")
        print(f"风险等级: {alert_details.risk_level}")
        print(f"预估解决时间: {alert_details.estimated_resolution_time}")
        print(f"描述: {alert_details.description}")
        print(f"影响: {alert_details.impact}")
        print(f"建议措施:")
        for i, rec in enumerate(alert_details.recommendations, 1):
            print(f"  {i}. {rec}")
    else:
        print("未生成告警详情")
    
    print("\n=== 测试完成 ===")

if __name__ == "__main__":
    test_high_similarity_alert()
    test_low_similarity_alert()
    test_critical_similarity_alert() 