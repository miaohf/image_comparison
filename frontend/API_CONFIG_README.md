# API配置说明

## 环境变量配置

前端使用环境变量来统一管理API地址，避免在代码中硬编码URL。

### 配置文件

- **`.env`**: 环境变量配置文件
- **`lib/api.ts`**: API工具函数，统一管理所有API调用

### 环境变量设置

在 `.env` 文件中设置：

```bash
# 前端配置
NEXT_PUBLIC_API_URL=http://192.168.31.80:2001
NEXT_PUBLIC_APP_NAME=智能图片对比分析

# 开发环境配置
NODE_ENV=development
```

### API工具函数

`lib/api.ts` 提供了统一的API调用接口：

```typescript
import { api, fetchApi } from '@/lib/api'

// 健康检查
const healthResponse = await fetchApi(api.health())

// 图片对比分析
const formData = new FormData()
formData.append('image1', file1)
formData.append('image2', file2)
const analysisResponse = await fetchApi(api.compareImages(), {
  method: 'POST',
  body: formData,
})

// 获取分析历史
const historyResponse = await fetchApi(api.analysisHistory(1, 10))

// 删除分析记录
const deleteResponse = await fetchApi(api.deleteAnalysis(id), {
  method: 'DELETE',
})
```

### 支持的API端点

- `api.health()` - 健康检查
- `api.compareImages()` - 图片对比分析
- `api.analysisHistory(page, limit)` - 分析历史
- `api.deleteAnalysis(id)` - 删除分析记录
- `api.getAnalysis(id)` - 获取分析记录详情

### 错误处理

`fetchApi` 函数提供了统一的错误处理：

- 自动解析错误响应
- 统一的错误消息格式
- 网络错误处理

### 配置说明

1. **开发环境**: 使用 `http://localhost:2001` 或 `http://127.0.0.1:2001`
2. **生产环境**: 使用实际的服务器IP地址，如 `http://192.168.31.80:2001`
3. **Next.js Rewrite**: 自动将 `/api/*` 请求转发到后端服务器

### 修改API地址

只需要修改 `.env` 文件中的 `NEXT_PUBLIC_API_URL` 即可：

```bash
# 开发环境
NEXT_PUBLIC_API_URL=http://localhost:2001

# 生产环境
NEXT_PUBLIC_API_URL=http://192.168.31.80:2001

# 其他服务器
NEXT_PUBLIC_API_URL=http://your-server-ip:2001
```

### 注意事项

1. 环境变量必须以 `NEXT_PUBLIC_` 开头才能在客户端使用
2. 修改环境变量后需要重启前端服务
3. 确保后端服务在指定地址和端口运行
4. 检查防火墙和网络连接设置 