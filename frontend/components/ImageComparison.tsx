'use client'

import React, { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { 
  Upload, 
  AlertTriangle, 
  CheckCircle, 
  XCircle,
  Clock,
  Activity
} from 'lucide-react'
import { api, fetchApi } from '@/lib/api'

interface AnalysisResult {
  similarity_score: number
  differences: Array<{
    type: string
    description: string
    confidence: number
    bbox?: number[]
  }>
  alert_level: string
  alert_details?: {
    severity: string
    category: string
    description: string
    impact: string
    recommendations: string[]
    risk_level: string
    estimated_resolution_time?: string
  }
  analysis_summary: string
  analysis_time: string
  processing_time: number
}

interface ImageComparisonProps {
  isDarkMode?: boolean
}

const ImageComparison: React.FC<ImageComparisonProps> = ({ isDarkMode = false }) => {
  const [image1, setImage1] = useState<File | null>(null)
  const [image2, setImage2] = useState<File | null>(null)
  const [preview1, setPreview1] = useState<string>('')
  const [preview2, setPreview2] = useState<string>('')
  const [threshold, setThreshold] = useState(0.9)
  const [isAnalyzing, setIsAnalyzing] = useState(false)
  const [result, setResult] = useState<AnalysisResult | null>(null)
  const [error, setError] = useState<string>('')

  const handleImageUpload = (file: File, setImage: (file: File) => void, setPreview: (url: string) => void) => {
    if (file.type.startsWith('image/')) {
      setImage(file)
      const url = URL.createObjectURL(file)
      setPreview(url)
    }
  }

  const handleAnalyze = async () => {
    if (!image1 || !image2) {
      setError('Please select two images')
      return
    }

    setIsAnalyzing(true)
    setError('')
    setResult(null)

    try {
      const formData = new FormData()
      formData.append('image1', image1)
      formData.append('image2', image2)
      formData.append('threshold', threshold.toString())
      formData.append('enable_alert', 'true')
      formData.append('save_results', 'true')

      const response = await fetchApi(api.compareImages(), {
        method: 'POST',
        body: formData,
      })

      const responseText = await response.text()
      let data
      try {
        data = JSON.parse(responseText)
      } catch (e) {
        throw new Error('Response format error, unable to parse JSON')
      }
      
      if (data.status === 'success') {
        setResult(data.data)
      } else {
        throw new Error(data.message || 'Analysis failed')
      }
    } catch (err) {
      console.error('Analysis error:', err)
      setError(err instanceof Error ? err.message : 'Unknown error')
    } finally {
      setIsAnalyzing(false)
    }
  }

  const getAlertIcon = (level: string) => {
    switch (level) {
      case 'error':
        return <XCircle className="h-5 w-5 text-red-500" />
      case 'warning':
        return <AlertTriangle className="h-5 w-5 text-gray-500" />
      case 'info':
        return <CheckCircle className="h-5 w-5 text-gray-500" />
      default:
        return <CheckCircle className="h-5 w-5 text-gray-500" />
    }
  }

  const getAlertBadge = (level: string) => {
    switch (level) {
      case 'error':
        return <Badge variant="destructive">Critical</Badge>
      case 'warning':
        return <Badge variant="secondary" className="bg-gray-100 text-gray-800">Warning</Badge>
      case 'info':
        return <Badge variant="secondary" className="bg-gray-100 text-gray-800">Normal</Badge>
      default:
        return <Badge variant="secondary">Unknown</Badge>
    }
  }

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'critical':
        return 'text-red-600 bg-red-50 border-red-200'
      case 'high':
        return 'text-gray-600 bg-gray-50 border-gray-200'
      case 'medium':
        return 'text-gray-600 bg-gray-50 border-gray-200'
      case 'low':
        return 'text-gray-600 bg-gray-50 border-gray-200'
      default:
        return 'text-gray-600 bg-gray-50 border-gray-200'
    }
  }

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'equipment':
        return <Activity className="h-4 w-4" />
      case 'safety':
        return <AlertTriangle className="h-4 w-4" />
      case 'environment':
        return <CheckCircle className="h-4 w-4" />
      case 'system':
        return <Activity className="h-4 w-4" />
      default:
        return <Activity className="h-4 w-4" />
    }
  }

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      {/* 图片上传区域 */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* 图片1 */}
        <Card className={`shadow-sm hover:shadow-md transition-all duration-300 border-0 ${isDarkMode ? 'bg-gray-700' : 'bg-white'}`}>
          <CardHeader className="pb-3">
            <CardTitle className={`text-base flex items-center gap-2 ${isDarkMode ? 'text-white' : 'text-gray-800'}`}>
              <div className="p-1.5 bg-blue-600 rounded-lg">
                <Upload className="h-4 w-4 text-white" />
              </div>
              Image 1
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-0">
            <div className={`border-2 border-dashed ${isDarkMode ? 'border-gray-600' : 'border-gray-300 bg-gray-50'} rounded-xl text-center hover:border-blue-400 transition-colors duration-300 min-h-[250px] relative`}>
              <input
                type="file"
                accept="image/*"
                onChange={(e) => {
                  const file = e.target.files?.[0]
                  if (file) {
                    handleImageUpload(file, setImage1, setPreview1)
                  }
                }}
                className="hidden"
                id="image1-upload"
              />
              <label htmlFor="image1-upload" className="cursor-pointer">
                {preview1 ? (
                  <div className="relative w-full h-full absolute inset-0">
                    <img src={preview1} alt="Preview 1" className="w-full h-full object-cover rounded-lg" />
                    <div className="absolute inset-0 bg-black bg-opacity-0 hover:bg-opacity-20 transition-all duration-300 rounded-lg flex items-center justify-center">
                      <p className={`text-sm ${isDarkMode ? 'text-gray-300' : 'text-gray-600'} opacity-0 hover:opacity-100 transition-opacity duration-300`}>Click to change image</p>
                    </div>
                  </div>
                ) : (
                  <div className="absolute inset-0 flex flex-col items-center justify-center space-y-4 p-6">
                    <div className="mx-auto w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center">
                      <Upload className="h-8 w-8 text-blue-600" />
                    </div>
                    <div>
                      <p className={`font-medium ${isDarkMode ? 'text-white' : 'text-gray-700'}`}>Click to upload image</p>
                      <p className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>Supports JPG, PNG, WebP formats</p>
                    </div>
                  </div>
                )}
              </label>
            </div>
          </CardContent>
        </Card>

        {/* 图片2 */}
        <Card className={`shadow-sm hover:shadow-md transition-all duration-300 border-0 ${isDarkMode ? 'bg-gray-700' : 'bg-white'}`}>
          <CardHeader className="pb-3">
            <CardTitle className={`text-base flex items-center gap-2 ${isDarkMode ? 'text-white' : 'text-gray-800'}`}>
              <div className="p-1.5 bg-green-600 rounded-lg">
                <Upload className="h-4 w-4 text-white" />
              </div>
              Image 2
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-0">
            <div className={`border-2 border-dashed ${isDarkMode ? 'border-gray-600' : 'border-gray-300 bg-gray-50'} rounded-xl text-center hover:border-green-400 transition-colors duration-300 min-h-[250px] relative`}>
              <input
                type="file"
                accept="image/*"
                onChange={(e) => {
                  const file = e.target.files?.[0]
                  if (file) {
                    handleImageUpload(file, setImage2, setPreview2)
                  }
                }}
                className="hidden"
                id="image2-upload"
              />
              <label htmlFor="image2-upload" className="cursor-pointer">
                {preview2 ? (
                  <div className="relative w-full h-full absolute inset-0">
                    <img src={preview2} alt="Preview 2" className="w-full h-full object-cover rounded-lg" />
                    <div className="absolute inset-0 bg-black bg-opacity-0 hover:bg-opacity-20 transition-all duration-300 rounded-lg flex items-center justify-center">
                      <p className={`text-sm ${isDarkMode ? 'text-gray-300' : 'text-gray-600'} opacity-0 hover:opacity-100 transition-opacity duration-300`}>Click to change image</p>
                    </div>
                  </div>
                ) : (
                  <div className="absolute inset-0 flex flex-col items-center justify-center space-y-4 p-6">
                    <div className="mx-auto w-16 h-16 bg-green-100 rounded-full flex items-center justify-center">
                      <Upload className="h-8 w-8 text-green-600" />
                    </div>
                    <div>
                      <p className={`font-medium ${isDarkMode ? 'text-white' : 'text-gray-700'}`}>Click to upload image</p>
                      <p className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>Supports JPG, PNG, WebP formats</p>
                    </div>
                  </div>
                )}
              </label>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* 分析设置 */}
      <Card className={`shadow-sm border-0 ${isDarkMode ? 'bg-gray-700' : 'bg-white'}`}>
        <CardHeader className="pb-2">
          <CardTitle className={`text-base flex items-center gap-2 ${isDarkMode ? 'text-white' : 'text-gray-800'}`}>
            <div className="p-1.5 bg-green-600 rounded-lg">
              <Activity className="h-4 w-4 text-white" />
            </div>
            Analysis Settings
          </CardTitle>
        </CardHeader>
        <CardContent className="pt-0">
          <div className="space-y-2">
            <div>
              <label className={`block text-sm font-medium ${isDarkMode ? 'text-gray-300' : 'text-gray-700'} mb-2`}>
                Similarity Threshold: <span className="text-blue-600 font-bold">{threshold}</span>
              </label>
              <div className="relative">
                <input
                  type="range"
                  min="0.1"
                  max="1.0"
                  step="0.1"
                  value={threshold}
                  onChange={(e) => setThreshold(parseFloat(e.target.value))}
                  className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer slider"
                />
                <div className="flex justify-between text-xs text-gray-500 mt-1">
                  <span className="bg-gray-100 text-gray-700 px-2 py-1 rounded">Strict</span>
                  <span className="bg-gray-100 text-gray-700 px-2 py-1 rounded">Medium</span>
                  <span className="bg-gray-100 text-gray-700 px-2 py-1 rounded">Loose</span>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* 分析按钮 */}
      <div className="flex justify-center mt-2">
        <Button
          onClick={handleAnalyze}
          disabled={!image1 || !image2 || isAnalyzing}
          className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-3 rounded-lg shadow-sm transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isAnalyzing ? (
            <div className="flex items-center space-x-2">
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
              <span>Analyzing...</span>
            </div>
          ) : (
            <div className="flex items-center space-x-2">
              <Activity className="h-5 w-5" />
              <span>Start Analysis</span>
            </div>
          )}
        </Button>
      </div>

      {/* 错误信息 */}
      {error && (
        <Card className={`shadow-sm border-0 ${isDarkMode ? 'bg-gray-800' : 'bg-white'} border ${isDarkMode ? 'border-gray-700' : 'border-gray-200'}`}>
          <CardContent className="pt-6">
            <div className={`flex items-center space-x-2 ${isDarkMode ? 'text-red-400' : 'text-red-600'}`}>
              <XCircle className="h-5 w-5" />
              <span className="font-medium">Error: {error}</span>
            </div>
          </CardContent>
        </Card>
      )}

      {/* 分析结果 */}
      {result && (
        <Card className={`shadow-lg border-0 ${isDarkMode ? 'bg-gray-700' : 'bg-white'} animate-fade-in`}>
          <CardHeader className="pb-4">
            <div className="flex items-center justify-between">
              <CardTitle className={`text-xl font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>Analysis Results</CardTitle>
              <div className="flex items-center gap-2">
                {getAlertBadge(result.alert_level)}
                <div className={`text-xs ${isDarkMode ? 'text-gray-400 bg-gray-800' : 'text-gray-500 bg-gray-100'} px-2 py-1 rounded`}>
                  {new Date(result.analysis_time).toLocaleString()}
                </div>
              </div>
            </div>
          </CardHeader>
          <CardContent className="pt-0">
            <div className="space-y-3">
              {/* 核心信息 */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                {/* 相似度 */}
                <div className={`${isDarkMode ? 'bg-gray-800' : 'bg-white'} p-4 rounded-xl border ${isDarkMode ? 'border-gray-700' : 'border-gray-200'} shadow-sm`}>
                  <div className="text-center">
                    <div className={`text-3xl font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'} mb-2`}>
                      {(result.similarity_score * 100).toFixed(0)}%
                    </div>
                    <div className={`text-sm ${isDarkMode ? 'text-gray-300' : 'text-gray-600'} font-medium`}>Similarity</div>
                    <div className={`w-full ${isDarkMode ? 'bg-gray-700' : 'bg-gray-200'} rounded-full h-2 mt-3`}>
                      <div 
                        className="bg-blue-600 h-2 rounded-full transition-all duration-1000"
                        style={{ width: `${(result.similarity_score * 100)}%` }}
                      ></div>
                    </div>
                  </div>
                </div>

                {/* 告警级别 */}
                <div className={`${isDarkMode ? 'bg-gray-800' : 'bg-white'} p-4 rounded-xl border ${isDarkMode ? 'border-gray-700' : 'border-gray-200'} shadow-sm`}>
                  <div className="text-center">
                    <div className="flex justify-center mb-3">
                      <div className={`p-3 ${isDarkMode ? 'bg-gray-700' : 'bg-gray-100'} rounded-full`}>
                        {getAlertIcon(result.alert_level)}
                      </div>
                    </div>
                    <div className={`text-sm font-medium ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                      {result.alert_level === 'error' ? 'Critical Issue' :
                       result.alert_level === 'warning' ? 'Potential Issue' : 'Normal'}
                    </div>
                    <div className={`text-xs ${isDarkMode ? 'text-gray-400' : 'text-gray-500'} mt-1`}>
                      {result.alert_level === 'error' ? 'Immediate action required' :
                       result.alert_level === 'warning' ? 'Monitor closely' : 'Running normally'}
                    </div>
                  </div>
                </div>

                {/* 差异数量 */}
                <div className={`${isDarkMode ? 'bg-gray-800' : 'bg-white'} p-4 rounded-xl border ${isDarkMode ? 'border-gray-700' : 'border-gray-200'} shadow-sm`}>
                  <div className="text-center">
                    <div className={`text-3xl font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'} mb-2`}>
                      {result.differences.length}
                    </div>
                    <div className={`text-sm ${isDarkMode ? 'text-gray-300' : 'text-gray-600'} font-medium`}>Detected Differences</div>
                    <div className={`text-xs ${isDarkMode ? 'text-gray-400' : 'text-gray-500'} mt-1`}>
                      {result.differences.length === 0 ? 'No differences' : 
                       result.differences.length === 1 ? '1 difference' : `${result.differences.length} differences`}
                    </div>
                  </div>
                </div>
              </div>

              {/* 告警详情 - 仅在严重告警时显示 */}
              {result.alert_details && result.alert_level === 'error' && (
                <div className={`${isDarkMode ? 'bg-gray-800' : 'bg-white'} rounded-xl p-6 border ${isDarkMode ? 'border-gray-700' : 'border-gray-200'}`}>
                  <h4 className={`font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'} mb-4 text-lg flex items-center gap-2`}>
                    <div className={`p-1.5 ${isDarkMode ? 'bg-gray-700' : 'bg-gray-100'} rounded-lg`}>
                      <AlertTriangle className={`h-4 w-4 ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`} />
                    </div>
                    Alert Details
                  </h4>
                  <div className="space-y-3">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <span className={`text-sm font-medium ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>Severity: </span>
                        <span className={`text-sm ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>{result.alert_details.severity}</span>
                      </div>
                      <div>
                        <span className={`text-sm font-medium ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>Category: </span>
                        <span className={`text-sm ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>{result.alert_details.category}</span>
                      </div>
                    </div>
                    <div>
                      <span className={`text-sm font-medium ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>Description: </span>
                      <span className={`text-sm ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>{result.alert_details.description}</span>
                    </div>
                    <div>
                      <span className={`text-sm font-medium ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>Impact: </span>
                      <span className={`text-sm ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>{result.alert_details.impact}</span>
                    </div>
                    {result.alert_details.recommendations && result.alert_details.recommendations.length > 0 && (
                      <div>
                        <span className={`text-sm font-medium ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>Recommendations:</span>
                        <ul className={`text-sm ${isDarkMode ? 'text-gray-300' : 'text-gray-600'} mt-2 space-y-1`}>
                          {result.alert_details.recommendations.map((rec, index) => (
                            <li key={index} className="flex items-start space-x-2">
                              <span className={`${isDarkMode ? 'text-gray-400' : 'text-gray-500'} mt-1`}>•</span>
                              <span>{rec}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* 检测差异 */}
              {result.differences.length > 0 && (
                <div className={`${isDarkMode ? 'bg-gray-800' : 'bg-white'} rounded-xl p-6 border ${isDarkMode ? 'border-gray-700' : 'border-gray-200'}`}>
                  <h4 className={`font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'} mb-4 text-lg flex items-center gap-2`}>
                    <div className={`p-1.5 ${isDarkMode ? 'bg-gray-700' : 'bg-gray-100'} rounded-lg`}>
                      <Activity className={`h-4 w-4 ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`} />
                    </div>
                    Detected Differences
                  </h4>
                  <div className="space-y-2">
                    {result.differences.slice(0, 3).map((diff, index) => (
                      <div key={index} className={`flex items-center justify-between p-4 ${isDarkMode ? 'bg-gray-700' : 'bg-gray-50'} rounded-lg border ${isDarkMode ? 'border-gray-600' : 'border-gray-200'}`}>
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 bg-gray-600 rounded-full flex items-center justify-center">
                            <span className="text-white text-xs font-bold">{index + 1}</span>
                          </div>
                          <div>
                            <span className={`text-sm font-semibold ${isDarkMode ? 'text-white' : 'text-gray-900'} capitalize`}>
                              {diff.type.replace('_', ' ')}
                            </span>
                            <div className={`text-xs ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                              Confidence: {(diff.confidence * 100).toFixed(0)}%
                            </div>
                          </div>
                        </div>
                        <span className={`text-sm ${isDarkMode ? 'text-gray-300' : 'text-gray-600'} max-w-xs truncate`}>{diff.description}</span>
                      </div>
                    ))}
                    {result.differences.length > 3 && (
                      <div className={`text-center text-sm ${isDarkMode ? 'text-gray-400 bg-gray-700' : 'text-gray-500 bg-gray-50'} p-3 rounded-lg border ${isDarkMode ? 'border-gray-600' : 'border-gray-200'}`}>
                        {result.differences.length - 3} more differences...
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* 处理信息 */}
              <div className={`flex items-center justify-between p-3 ${isDarkMode ? 'bg-gray-800' : 'bg-white'} rounded-xl border ${isDarkMode ? 'border-gray-700' : 'border-gray-200'}`}>
                <div className="flex items-center gap-3">
                  <div className={`p-2 ${isDarkMode ? 'bg-gray-700' : 'bg-gray-100'} rounded-lg`}>
                    <Clock className={`h-4 w-4 ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`} />
                  </div>
                  <div>
                    <div className={`text-sm font-medium ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>Analysis Time</div>
                    <div className={`text-xs ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>{new Date(result.analysis_time).toLocaleString()}</div>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <div className={`p-2 ${isDarkMode ? 'bg-gray-700' : 'bg-gray-100'} rounded-lg`}>
                    <Activity className={`h-4 w-4 ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`} />
                  </div>
                  <div>
                    <div className={`text-sm font-medium ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>Processing Time</div>
                    <div className={`text-xs ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>{result.processing_time.toFixed(1)} seconds</div>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}

export default ImageComparison 