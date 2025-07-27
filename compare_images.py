#!/usr/bin/env python3
"""
图片比较脚本
比较uploads目录中的所有图片
"""

import os
import hashlib
from PIL import Image
import numpy as np

def get_file_hash(file_path):
    """计算文件的MD5哈希值"""
    hash_md5 = hashlib.md5()
    with open(file_path, "rb") as f:
        for chunk in iter(lambda: f.read(4096), b""):
            hash_md5.update(chunk)
    return hash_md5.hexdigest()

def compare_all_images():
    """比较uploads目录中的所有图片"""
    uploads_dir = "backend/uploads"
    
    if not os.path.exists(uploads_dir):
        print(f"上传目录不存在: {uploads_dir}")
        return
    
    # 获取所有图片文件
    image_files = []
    for file in os.listdir(uploads_dir):
        if file.lower().endswith(('.jpg', '.jpeg', '.png', '.webp')):
            file_path = os.path.join(uploads_dir, file)
            image_files.append(file_path)
    
    print(f"找到 {len(image_files)} 张图片:")
    for i, file_path in enumerate(image_files):
        file_size = os.path.getsize(file_path)
        file_hash = get_file_hash(file_path)
        print(f"  {i+1}. {os.path.basename(file_path)} ({file_size} bytes, MD5: {file_hash[:8]}...)")
    
    print("\n=== 图片比较结果 ===")
    
    # 比较所有图片对
    for i in range(len(image_files)):
        for j in range(i+1, len(image_files)):
            img1_path = image_files[i]
            img2_path = image_files[j]
            
            print(f"\n比较: {os.path.basename(img1_path)} vs {os.path.basename(img2_path)}")
            
            # 检查文件是否相同
            hash1 = get_file_hash(img1_path)
            hash2 = get_file_hash(img2_path)
            
            if hash1 == hash2:
                print("  ✅ 文件完全相同 (MD5哈希相同)")
                continue
            
            # 计算相似度
            try:
                # 加载图片
                img1 = Image.open(img1_path).convert('RGB')
                img2 = Image.open(img2_path).convert('RGB')
                
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
                
                print(f"  📊 相似度: {similarity:.4f} ({similarity*100:.1f}%)")
                
                if similarity > 0.95:
                    print("  ✅ 图片基本相同")
                elif similarity > 0.8:
                    print("  ⚠️  图片相似")
                else:
                    print("  ❌ 图片不同")
                    
            except Exception as e:
                print(f"  ❌ 比较失败: {str(e)}")

if __name__ == "__main__":
    compare_all_images() 