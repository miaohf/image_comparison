import os
import json
import time
from typing import List, Dict, Any, Optional, Tuple
from datetime import datetime
from sqlalchemy.orm import Session
from app.models.database import AnalysisRecord, AlertRule, get_db
from app.models.schemas import AnalysisResult, Difference, AlertDetail
from app.services.ollama_service import ollama_service
from app.core.config import settings


class AnalysisService:
    """图片分析服务类 - 多阶段分析workflow"""
    
    def __init__(self):
        self.ollama_service = ollama_service
    
    def save_uploaded_file(self, file, filename: str) -> str:
        """保存上传的文件"""
        print(f"开始保存文件: {filename}")
        
        # 确保文件名安全
        safe_filename = self._get_safe_filename(filename)
        file_path = os.path.join(settings.upload_dir, safe_filename)
        
        print(f"安全文件名: {safe_filename}")
        print(f"完整路径: {file_path}")
        
        # 保存文件
        with open(file_path, "wb") as buffer:
            content = file.file.read()
            buffer.write(content)
        
        print(f"文件保存完成，大小: {len(content)} 字节")
        return file_path
    
    def _get_safe_filename(self, filename: str) -> str:
        """生成安全的文件名"""
        import uuid
        name, ext = os.path.splitext(filename)
        timestamp = int(time.time())
        return f"{timestamp}_{uuid.uuid4().hex[:8]}{ext}"
    
    def analyze_images(self, image1_path: str, image2_path: str, threshold: float = 0.8) -> AnalysisResult:
        """多阶段图片分析workflow"""
        start_time = time.time()
        
        try:
            # 验证图片文件
            if not os.path.exists(image1_path):
                raise Exception(f"图片1文件不存在: {image1_path}")
            if not os.path.exists(image2_path):
                raise Exception(f"图片2文件不存在: {image2_path}")
            
            print("=== 开始多阶段图片分析 ===")
            
            # 阶段1: 基础相似度计算
            print("阶段1: 计算基础相似度...")
            base_similarity = self._calculate_base_similarity(image1_path, image2_path)
            print(f"基础相似度: {base_similarity:.4f}")
            
            # 阶段2: 特征提取和比较
            print("阶段2: 特征提取和比较...")
            feature_analysis = self._analyze_image_features(image1_path, image2_path)
            feature_similarity = feature_analysis.get('similarity', 0.5)
            print(f"特征相似度: {feature_similarity:.4f}")
            
            # 阶段3: 内容差异检测
            print("阶段3: 内容差异检测...")
            content_analysis = self._analyze_content_differences(image1_path, image2_path)
            content_similarity = content_analysis.get('similarity_score', 0.5)
            print(f"内容相似度: {content_similarity:.4f}")
            print(f"内容分析差异数量: {len(content_analysis.get('differences', []))}")
            
            # 阶段4: 结果整合和验证
            print("阶段4: 结果整合和验证...")
            final_result = self._integrate_results(base_similarity, feature_analysis, content_analysis, threshold)
            print(f"最终相似度: {final_result['similarity_score']:.4f}")
            print(f"最终差异数量: {len(final_result['differences'])}")
            print(f"告警级别: {final_result['alert_level']}")
            
            # 阶段5: 生成告警详情
            print("阶段5: 生成告警详情...")
            alert_details = self._generate_alert_details(
                final_result['alert_level'], 
                final_result['differences'], 
                final_result['similarity_score']
            )
            
            # 阶段6: 生成分析摘要
            analysis_summary = self._generate_analysis_summary(
                final_result['differences'], 
                final_result['similarity_score'], 
                final_result['alert_level']
            )
            
            processing_time = time.time() - start_time
            print(f"分析完成，总耗时: {processing_time:.2f}秒")
            
            return AnalysisResult(
                similarity_score=final_result['similarity_score'],
                differences=final_result['differences'],
                alert_level=final_result['alert_level'],
                alert_details=alert_details,
                analysis_summary=analysis_summary,
                analysis_time=datetime.utcnow(),
                processing_time=processing_time
            )
            
        except Exception as e:
            print(f"分析过程中出现错误: {str(e)}")
            import traceback
            traceback.print_exc()
            raise Exception(f"图片分析失败: {str(e)}")
    
    def _calculate_base_similarity(self, image1_path: str, image2_path: str) -> float:
        """计算基础相似度（像素级比较）"""
        try:
            from PIL import Image
            import numpy as np
            
            # 加载图片
            img1 = Image.open(image1_path).convert('RGB')
            img2 = Image.open(image2_path).convert('RGB')
            
            # 统一尺寸
            size = (224, 224)
            img1 = img1.resize(size)
            img2 = img2.resize(size)
            
            # 转换为numpy数组
            arr1 = np.array(img1)
            arr2 = np.array(img2)
            
            # 计算均方误差
            mse = np.mean((arr1 - arr2) ** 2)
            
            # 转换为相似度分数 (0-1)
            max_mse = 255 ** 2
            similarity = 1 - (mse / max_mse)
            
            return max(0, min(1, similarity))
        except Exception as e:
            print(f"基础相似度计算失败: {str(e)}")
            return 0.5
    
    def _analyze_image_features(self, image1_path: str, image2_path: str) -> Dict[str, Any]:
        """分析图片特征（颜色、亮度、对比度等）"""
        try:
            from PIL import Image
            import numpy as np
            
            def extract_features(img_path: str) -> Dict[str, float]:
                img = Image.open(img_path).convert('RGB')
                arr = np.array(img)
                
                # 计算颜色特征
                r_mean, g_mean, b_mean = np.mean(arr, axis=(0, 1))
                r_std, g_std, b_std = np.std(arr, axis=(0, 1))
                
                # 计算亮度
                gray = np.dot(arr[..., :3], [0.299, 0.587, 0.114])
                brightness = np.mean(gray)
                contrast = np.std(gray)
                
                return {
                    'r_mean': r_mean, 'g_mean': g_mean, 'b_mean': b_mean,
                    'r_std': r_std, 'g_std': g_std, 'b_std': b_std,
                    'brightness': brightness, 'contrast': contrast
                }
            
            # 提取两张图片的特征
            features1 = extract_features(image1_path)
            features2 = extract_features(image2_path)
            
            # 计算特征差异
            feature_diffs = {}
            for key in features1.keys():
                diff = abs(features1[key] - features2[key])
                feature_diffs[key] = diff
            
            # 计算总体特征相似度
            total_diff = sum(feature_diffs.values())
            max_possible_diff = 255 * len(feature_diffs)  # 最大可能差异
            feature_similarity = 1 - (total_diff / max_possible_diff)
            
            return {
                'similarity': feature_similarity,
                'differences': feature_diffs,
                'features1': features1,
                'features2': features2
            }
            
        except Exception as e:
            print(f"特征分析失败: {str(e)}")
            return {'similarity': 0.5, 'differences': {}}
    
    def _analyze_content_differences(self, image1_path: str, image2_path: str) -> Dict[str, Any]:
        """使用AI分析内容差异"""
        try:
            # 调用Ollama服务进行内容分析
            result = self.ollama_service.analyze_image_differences(image1_path, image2_path)
            
            # 如果AI返回的相似度与基础相似度差异很大，进行二次验证
            if 'similarity_score' in result:
                ai_similarity = result['similarity_score']
                
                # 如果AI认为相似度很高但基础相似度不高，进行详细分析
                if ai_similarity > 0.9:
                    # 进行更详细的分析
                    detailed_result = self._detailed_content_analysis(image1_path, image2_path)
                    if detailed_result:
                        return detailed_result
            
            return result
            
        except Exception as e:
            print(f"内容差异分析失败: {str(e)}")
            return {'differences': [], 'similarity_score': 0.5}
    
    def _detailed_content_analysis(self, image1_path: str, image2_path: str) -> Dict[str, Any]:
        """详细内容分析（当基础分析可能不准确时）"""
        try:
            # 使用更详细的提示词进行二次分析
            detailed_prompt = """
请非常仔细地分析这两张图片的差异。请特别注意：

1. 人物：是否有人的出现、消失、移动或姿势变化
2. 物体：是否有物体的增加、减少、移动或状态变化
3. 环境：光线、阴影、背景的明显变化
4. 细节：任何可见的细节差异

请以JSON格式返回详细分析：
{
    "similarity_score": 0.8,
    "differences": [
        {
            "type": "person_detected",
            "description": "检测到人物出现",
            "confidence": 0.95,
            "bbox": [x1, y1, x2, y2],
            "severity": "high"
        }
    ],
    "summary": "详细分析摘要"
}

请确保分析准确，不要遗漏明显的差异。
"""
            
            # 调用AI进行详细分析
            result = self.ollama_service._call_ollama_api(
                detailed_prompt, 
                [self.ollama_service._encode_image_to_base64(image1_path),
                 self.ollama_service._encode_image_to_base64(image2_path)]
            )
            
            if 'response' in result:
                try:
                    return json.loads(result['response'])
                except json.JSONDecodeError:
                    pass
            
            return None
            
        except Exception as e:
            print(f"详细内容分析失败: {str(e)}")
            return None
    
    def _integrate_results(self, base_similarity: float, feature_analysis: Dict, 
                          content_analysis: Dict, threshold: float) -> Dict[str, Any]:
        """整合多个分析结果"""
        
        # 获取各个阶段的相似度
        feature_similarity = feature_analysis.get('similarity', 0.5)
        content_similarity = content_analysis.get('similarity_score', 0.5)
        
        print(f"整合结果 - 基础相似度: {base_similarity:.4f}, 特征相似度: {feature_similarity:.4f}, 内容相似度: {content_similarity:.4f}")
        
        # 加权计算最终相似度
        # 基础相似度权重30%，特征相似度权重20%，内容相似度权重50%
        final_similarity = (
            base_similarity * 0.3 + 
            feature_similarity * 0.2 + 
            content_similarity * 0.5
        )
        
        # 获取差异信息
        differences = content_analysis.get('differences', [])
        
        # 更敏感地检测特征差异
        if feature_similarity < 0.95 and len(differences) == 0:  # 降低阈值
            feature_diffs = feature_analysis.get('differences', {})
            if any(diff > 30 for diff in feature_diffs.values()):  # 降低特征差异阈值
                differences.append({
                    "type": "feature_change",
                    "description": "检测到图像特征变化",
                    "confidence": 0.8,
                    "severity": "medium"
                })
                print(f"添加特征差异: 特征相似度 {feature_similarity:.4f} < 0.95")
        
        # 确保differences是Difference对象的列表
        processed_differences = []
        for diff in differences:
            if isinstance(diff, dict):
                processed_differences.append(Difference(
                    type=diff.get("type", "unknown"),
                    description=diff.get("description", ""),
                    confidence=diff.get("confidence", 0.0),
                    bbox=diff.get("bbox")
                ))
            elif isinstance(diff, Difference):
                processed_differences.append(diff)
            
            # 确定告警级别
        alert_level = self._determine_alert_level(final_similarity, processed_differences, threshold)
        
        print(f"最终结果 - 相似度: {final_similarity:.4f}, 差异数量: {len(processed_differences)}, 告警级别: {alert_level}")
        
        return {
            'similarity_score': final_similarity,
            'differences': processed_differences,
            'alert_level': alert_level
        }
    
    def _determine_alert_level(self, similarity_score: float, differences: List[Difference], threshold: float) -> str:
        """确定告警级别"""
        # 更敏感地检测差异
        if similarity_score < threshold:
            return "error"
        
        # 检查差异的严重程度
        for diff in differences:
            if diff.confidence > 0.8:  # 降低置信度阈值
                if diff.type in ["error", "failure", "danger", "person_detected"]:
                    return "error"
                elif diff.type in ["warning", "change", "feature_change"]:
                    return "warning"
        
        # 如果相似度很高但没有检测到差异，可能是误判
        if similarity_score > 0.99 and len(differences) == 0:
            return "info"
        
        # 如果有任何差异，即使是轻微的，也给出警告
        if len(differences) > 0:
            return "warning"
        
        return "info"
    
    def _generate_alert_details(self, alert_level: str, differences: List[Difference], similarity_score: float) -> Optional[AlertDetail]:
        """生成详细的告警信息"""
        if alert_level == "info":
            return None
        
        # 根据告警级别和差异类型生成详细信息
        if alert_level == "error":
            # 根据相似度调整严重程度
            if similarity_score > 0.95:
                severity = "medium"  # 高相似度时降低严重程度
                risk_level = "medium"
                estimated_resolution_time = "1-2小时"
            elif similarity_score < 0.5:
                severity = "critical"
                risk_level = "critical"
                estimated_resolution_time = "立即处理"
            else:
                severity = "high"
                risk_level = "high"
                estimated_resolution_time = "2-4小时"
                
            category = self._determine_alert_category(differences)
            description = self._generate_error_description(differences, similarity_score)
            impact = self._assess_impact(differences, similarity_score)
            recommendations = self._generate_recommendations(alert_level, differences, similarity_score)
        elif alert_level == "warning":
            severity = "medium"
            category = self._determine_alert_category(differences)
            description = self._generate_warning_description(differences, similarity_score)
            impact = self._assess_impact(differences, similarity_score)
            recommendations = self._generate_recommendations(alert_level, differences, similarity_score)
            risk_level = "medium"
            estimated_resolution_time = "4-8小时"
        else:
            return None
        
        return AlertDetail(
            severity=severity,
            category=category,
            description=description,
            impact=impact,
            recommendations=recommendations,
            risk_level=risk_level,
            estimated_resolution_time=estimated_resolution_time
        )
    
    def _determine_alert_category(self, differences: List[Difference]) -> str:
        """确定告警类别"""
        categories = {
            "equipment": ["device", "machine", "equipment", "hardware", "component"],
            "safety": ["safety", "danger", "hazard", "fire", "smoke", "leak"],
            "environment": ["environment", "lighting", "temperature", "humidity", "noise"],
            "system": ["system", "software", "network", "connection", "status"],
            "security": ["person", "intruder", "motion", "movement"]
        }
        
        for diff in differences:
            diff_type = diff.type.lower()
            for category, keywords in categories.items():
                if any(keyword in diff_type for keyword in keywords):
                    return category
        
        return "system"  # 默认类别
    
    def _generate_error_description(self, differences: List[Difference], similarity_score: float) -> str:
        """生成错误级别的详细描述"""
        if similarity_score < 0.3:
            return f"检测到重大异常变化，相似度仅为{(similarity_score * 100):.1f}%。可能存在严重的设备故障、安全问题或系统异常。"
        elif similarity_score < 0.5:
            return f"检测到显著异常变化，相似度为{(similarity_score * 100):.1f}%。存在明显的设备状态变化或潜在风险。"
        else:
            diff_descriptions = [diff.description for diff in differences if diff.confidence > 0.8]
            if diff_descriptions:
                # 高相似度时的描述
                if similarity_score > 0.95:
                    return f"检测到轻微变化，相似度为{(similarity_score * 100):.1f}%。主要变化包括：{', '.join(diff_descriptions[:3])}"
                else:
                    return f"检测到异常变化，相似度为{(similarity_score * 100):.1f}%。主要变化包括：{', '.join(diff_descriptions[:3])}"
            else:
                return f"检测到异常变化，相似度为{(similarity_score * 100):.1f}%。需要进一步检查确认具体问题。"
    
    def _generate_warning_description(self, differences: List[Difference], similarity_score: float) -> str:
        """生成警告级别的详细描述"""
        diff_descriptions = [diff.description for diff in differences if diff.confidence > 0.7]
        if diff_descriptions:
            return f"检测到潜在问题，相似度为{(similarity_score * 100):.1f}%。主要变化包括：{', '.join(diff_descriptions[:2])}"
        else:
            return f"检测到轻微变化，相似度为{(similarity_score * 100):.1f}%。建议关注并监控后续变化。"
    
    def _assess_impact(self, differences: List[Difference], similarity_score: float) -> str:
        """评估影响范围"""
        if similarity_score < 0.3:
            return "严重影响：可能影响整个系统运行，存在安全风险"
        elif similarity_score < 0.5:
            return "重大影响：可能影响关键设备功能，需要立即处理"
        elif similarity_score < 0.7:
            return "中等影响：可能影响部分功能，需要关注"
        elif similarity_score > 0.95:
            return "轻微影响：检测到微小变化，对系统运行影响很小，建议监控"
        else:
            return "轻微影响：对系统运行影响较小，建议监控"
    
    def _generate_recommendations(self, alert_level: str, differences: List[Difference], similarity_score: float = None) -> List[str]:
        """生成建议措施"""
        recommendations = []
        
        # 检查是否有高相似度的情况
        high_similarity = similarity_score and similarity_score > 0.95 and len(differences) <= 2
        
        if alert_level == "error":
            # 根据相似度和差异类型调整建议的严重程度
            if high_similarity:
                # 高相似度时的温和建议
                recommendations.extend([
                    "检查监控区域是否有人员进入",
                    "确认设备运行状态正常",
                    "记录检测到的人员活动",
                    "如需要，联系相关人员确认"
                ])
            else:
                # 低相似度时的紧急建议
                recommendations.extend([
                    "立即停止相关设备运行",
                    "检查设备状态和连接",
                    "联系技术支持人员",
                    "准备应急处理方案"
                ])
        elif alert_level == "warning":
            recommendations.extend([
                "检查设备运行状态",
                "监控相关参数变化",
                "准备维护计划",
                "记录异常情况"
            ])
        
        # 根据差异类型添加特定建议
        for diff in differences:
            if "person" in diff.type.lower():
                if high_similarity:
                    recommendations.append("检查安全监控系统是否正常工作")
                else:
                    recommendations.append("检查安全监控系统")
            elif "temperature" in diff.type.lower():
                recommendations.append("检查温度控制系统")
            elif "pressure" in diff.type.lower():
                recommendations.append("检查压力传感器和管道")
            elif "light" in diff.type.lower():
                recommendations.append("检查照明系统和电源")
            elif "motion" in diff.type.lower():
                recommendations.append("检查设备运行状态")
        
        return list(set(recommendations))  # 去重
    
    def _generate_analysis_summary(self, differences: List[Difference], similarity_score: float, alert_level: str) -> str:
        """生成分析摘要"""
        if alert_level == "error":
            return f"检测到严重异常，相似度{(similarity_score * 100):.1f}%，发现{len(differences)}个显著差异，需要立即处理。"
        elif alert_level == "warning":
            return f"检测到潜在问题，相似度{(similarity_score * 100):.1f}%，发现{len(differences)}个变化，建议关注。"
        else:
            return f"图片差异在正常范围内，相似度{(similarity_score * 100):.1f}%，系统运行正常。"
    
    def save_analysis_record(self, db: Session, image1_path: str, image2_path: str, 
                           result: AnalysisResult) -> AnalysisRecord:
        """保存分析记录到数据库"""
        record = AnalysisRecord(
            image1_path=image1_path,
            image2_path=image2_path,
            similarity_score=result.similarity_score,
            differences=json.dumps([diff.dict() for diff in result.differences]),
            alert_level=result.alert_level,
            analysis_time=result.analysis_time,
            processing_time=result.processing_time,
            status="completed"
        )
        
        db.add(record)
        db.commit()
        db.refresh(record)
        return record
    
    def get_analysis_history(self, db: Session, page: int = 1, limit: int = 20) -> Dict[str, Any]:
        """获取分析历史记录"""
        offset = (page - 1) * limit
        
        # 查询记录
        records = db.query(AnalysisRecord).order_by(
            AnalysisRecord.analysis_time.desc()
        ).offset(offset).limit(limit).all()
        
        # 查询总数
        total = db.query(AnalysisRecord).count()
        
        return {
            "items": records,
            "total": total,
            "page": page,
            "limit": limit,
            "pages": (total + limit - 1) // limit
        }
    
    def batch_analyze(self, image_pairs: List[Dict[str, str]], options: Dict[str, Any]) -> List[Dict[str, Any]]:
        """批量分析图片对"""
        results = []
        
        for pair in image_pairs:
            try:
                result = self.analyze_images(
                    pair["image1_path"],
                    pair["image2_path"],
                    options.get("threshold", 0.8)
                )
                
                results.append({
                    "id": pair.get("id", "unknown"),
                    "status": "success",
                    "result": result.dict()
                })
                
            except Exception as e:
                results.append({
                    "id": pair.get("id", "unknown"),
                    "status": "error",
                    "error": str(e)
                })
        
        return results
    
    def get_alert_rules(self, db: Session) -> List[AlertRule]:
        """获取告警规则"""
        return db.query(AlertRule).filter(AlertRule.is_active == True).all()
    
    def create_alert_rule(self, db: Session, rule_data: Dict[str, Any]) -> AlertRule:
        """创建告警规则"""
        rule = AlertRule(**rule_data)
        db.add(rule)
        db.commit()
        db.refresh(rule)
        return rule
    
    def test_ollama_connection(self) -> bool:
        """测试Ollama连接"""
        return self.ollama_service.test_connection()


# 创建全局服务实例
analysis_service = AnalysisService() 