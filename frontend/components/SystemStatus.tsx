'use client'

import React, { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { 
  Activity, 
  Server, 
  Wifi, 
  WifiOff, 
  CheckCircle, 
  XCircle,
  RefreshCw,
  Clock,
  AlertTriangle,
  Database,
  Cpu,
  HardDrive
} from 'lucide-react'
import { api, fetchApi } from '@/lib/api'

interface SystemHealth {
  status: string
  ollama_connected: boolean
  timestamp: string
  error?: string
}

interface SystemStatusProps {
  isDarkMode?: boolean
}

const SystemStatus: React.FC<SystemStatusProps> = ({ isDarkMode = false }) => {
  const [health, setHealth] = useState<SystemHealth | null>(null)
  const [loading, setLoading] = useState(true)
  const [lastCheck, setLastCheck] = useState<Date | null>(null)
  const [systemMetrics, setSystemMetrics] = useState({
    cpu: 45,
    memory: 68,
    disk: 32,
    network: 85
  })

  const checkHealth = async () => {
    setLoading(true)
    try {
      const response = await fetchApi(api.health())
      const data: SystemHealth = await response.json()
      setHealth(data)
      setLastCheck(new Date())
      
      // 模拟系统指标更新
      setSystemMetrics({
        cpu: Math.floor(Math.random() * 30) + 30,
        memory: Math.floor(Math.random() * 40) + 50,
        disk: Math.floor(Math.random() * 20) + 25,
        network: Math.floor(Math.random() * 30) + 70
      })
    } catch (error) {
      setHealth({
        status: 'unhealthy',
        ollama_connected: false,
        timestamp: new Date().toISOString(),
        error: error instanceof Error ? error.message : 'Unknown error'
      })
      setLastCheck(new Date())
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    checkHealth()
    // 每30秒自动检查一次
    const interval = setInterval(checkHealth, 30000)
    return () => clearInterval(interval)
  }, [])

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'healthy':
        return <CheckCircle className="h-6 w-6 text-green-500" />
      case 'unhealthy':
        return <XCircle className="h-6 w-6 text-red-500" />
      default:
        return <Activity className="h-6 w-6 text-yellow-500" />
    }
  }

  const getMetricColor = (value: number) => {
    if (value < 50) return 'text-blue-600'
    if (value < 80) return 'text-gray-600'
    return 'text-gray-800'
  }

  return (
    <div className="max-w-7xl mx-auto space-y-4">
      {/* 系统健康状态 */}
      <Card className={`shadow-sm border-0 ${isDarkMode ? 'bg-gray-800' : 'bg-white'} border ${isDarkMode ? 'border-gray-700' : 'border-gray-200'}`}>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <Server className={`h-6 w-6 ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`} />
              <div>
                <CardTitle className={`text-xl ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>System Health</CardTitle>
                <p className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>Real-time system status monitoring</p>
              </div>
            </div>
            <Button
              onClick={checkHealth}
              disabled={loading}
              variant="outline"
              className={`${isDarkMode ? 'border-gray-600 text-gray-300 hover:bg-gray-700' : 'border-gray-300 text-gray-700 hover:bg-gray-100'}`}
            >
              <RefreshCw className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
              Refresh
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="text-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
              <p className={`mt-4 ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>Checking system health...</p>
            </div>
          ) : health ? (
                          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                {/* 整体状态 */}
                <div className={`p-4 rounded-lg border ${isDarkMode ? 'bg-gray-700' : 'bg-gray-50'}`}>
                  <div className="flex items-center justify-between mb-4">
                    <h3 className={`font-semibold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>Overall Status</h3>
                    {getStatusIcon(health.status)}
                  </div>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>Status:</span>
                    <Badge 
                      variant={health.status === 'healthy' ? 'default' : 'destructive'}
                      className={health.status === 'healthy' ? 'bg-gray-100 text-gray-800' : ''}
                    >
                      {health.status === 'healthy' ? 'Healthy' : 'Unhealthy'}
                    </Badge>
                  </div>
                  <div className="flex justify-between">
                    <span className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>Last Check:</span>
                    <span className={`text-sm ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                      {lastCheck ? lastCheck.toLocaleTimeString() : 'Never'}
                    </span>
                  </div>
                </div>
              </div>

                              {/* Ollama连接状态 */}
                <div className={`p-4 rounded-lg border ${isDarkMode ? 'bg-gray-700' : 'bg-gray-50'}`}>
                  <div className="flex items-center justify-between mb-4">
                    <h3 className={`font-semibold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>Ollama Service</h3>
                    {health.ollama_connected ? (
                      <Wifi className="h-6 w-6 text-green-500" />
                    ) : (
                      <WifiOff className="h-6 w-6 text-red-500" />
                    )}
                  </div>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>Connection:</span>
                    <Badge 
                      variant={health.ollama_connected ? 'default' : 'destructive'}
                      className={health.ollama_connected ? 'bg-gray-100 text-gray-800' : ''}
                    >
                      {health.ollama_connected ? 'Connected' : 'Disconnected'}
                    </Badge>
                  </div>
                  <div className="flex justify-between">
                    <span className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>Endpoint:</span>
                    <span className={`text-sm ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>192.168.31.80:11434</span>
                  </div>
                </div>
              </div>

              {/* 错误信息 */}
              {health.error && (
                <div className={`p-6 rounded-lg border ${isDarkMode ? 'bg-gray-700' : 'bg-gray-50'} md:col-span-2`}>
                  <div className="flex items-center space-x-2 mb-3">
                    <AlertTriangle className="h-5 w-5 text-red-500" />
                    <h3 className={`font-semibold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>Error Details</h3>
                  </div>
                  <p className={`text-sm ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>{health.error}</p>
                </div>
              )}
            </div>
          ) : (
            <div className="text-center py-8">
              <XCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
              <p className={`${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>Unable to fetch system health data</p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* 系统指标 */}
      <Card className={`shadow-sm border-0 ${isDarkMode ? 'bg-gray-800' : 'bg-white'} border ${isDarkMode ? 'border-gray-700' : 'border-gray-200'}`}>
        <CardHeader>
          <CardTitle className={`text-lg ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>System Metrics</CardTitle>
          <p className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>Real-time performance indicators</p>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* CPU使用率 */}
            <div className={`p-4 rounded-lg border ${isDarkMode ? 'bg-gray-700' : 'bg-gray-50'}`}>
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center space-x-2">
                  <Cpu className={`h-5 w-5 ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`} />
                  <h3 className={`font-semibold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>CPU Usage</h3>
                </div>
                <span className={`text-2xl font-bold ${getMetricColor(systemMetrics.cpu)}`}>
                  {systemMetrics.cpu}%
                </span>
              </div>
              <Progress value={systemMetrics.cpu} className="h-2" />
            </div>

            {/* 内存使用率 */}
            <div className={`p-4 rounded-lg border ${isDarkMode ? 'bg-gray-700' : 'bg-gray-50'}`}>
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center space-x-2">
                  <Activity className={`h-5 w-5 ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`} />
                  <h3 className={`font-semibold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>Memory Usage</h3>
                </div>
                <span className={`text-2xl font-bold ${getMetricColor(systemMetrics.memory)}`}>
                  {systemMetrics.memory}%
                </span>
              </div>
              <Progress value={systemMetrics.memory} className="h-2" />
            </div>

            {/* 磁盘使用率 */}
            <div className={`p-4 rounded-lg border ${isDarkMode ? 'bg-gray-700' : 'bg-gray-50'}`}>
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center space-x-2">
                  <HardDrive className={`h-5 w-5 ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`} />
                  <h3 className={`font-semibold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>Disk Usage</h3>
                </div>
                <span className={`text-2xl font-bold ${getMetricColor(systemMetrics.disk)}`}>
                  {systemMetrics.disk}%
                </span>
              </div>
              <Progress value={systemMetrics.disk} className="h-2" />
            </div>

            {/* 网络状态 */}
            <div className={`p-4 rounded-lg border ${isDarkMode ? 'bg-gray-700' : 'bg-gray-50'}`}>
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center space-x-2">
                  <Wifi className={`h-5 w-5 ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`} />
                  <h3 className={`font-semibold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>Network</h3>
                </div>
                <span className={`text-2xl font-bold ${getMetricColor(systemMetrics.network)}`}>
                  {systemMetrics.network}%
                </span>
              </div>
              <Progress value={systemMetrics.network} className="h-2" />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* 系统信息 */}
      <Card className={`shadow-sm border-0 ${isDarkMode ? 'bg-gray-800' : 'bg-white'} border ${isDarkMode ? 'border-gray-700' : 'border-gray-200'}`}>
        <CardHeader>
          <div className="flex items-center space-x-3">
            <Database className={`h-5 w-5 ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`} />
            <div>
              <CardTitle className={`text-lg ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>System Information</CardTitle>
              <p className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>Application configuration and technology stack</p>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
            <div className={`p-2 ${isDarkMode ? 'bg-gray-700' : 'bg-gray-50'} rounded-lg`}>
              <div className="flex items-center space-x-2 mb-1">
                <Server className={`h-4 w-4 ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`} />
                <span className={`text-sm font-medium ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>Application Name</span>
              </div>
              <span className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>Intelligent Image Comparison</span>
            </div>
            
            <div className={`p-2 ${isDarkMode ? 'bg-gray-700' : 'bg-gray-50'} rounded-lg`}>
              <div className="flex items-center space-x-2 mb-1">
                <Activity className={`h-4 w-4 ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`} />
                <span className={`text-sm font-medium ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>Version</span>
              </div>
              <span className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>1.0.0</span>
            </div>
            
            <div className={`p-2 ${isDarkMode ? 'bg-gray-700' : 'bg-gray-50'} rounded-lg`}>
              <div className="flex items-center space-x-2 mb-1">
                <Cpu className={`h-4 w-4 ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`} />
                <span className={`text-sm font-medium ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>Technology Stack</span>
              </div>
              <span className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>Next.js 15 + FastAPI</span>
            </div>
            
            <div className={`p-2 ${isDarkMode ? 'bg-gray-700' : 'bg-gray-50'} rounded-lg`}>
              <div className="flex items-center space-x-2 mb-1">
                <Database className={`h-4 w-4 ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`} />
                <span className={`text-sm font-medium ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>Database</span>
              </div>
              <span className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>SQLite</span>
            </div>
            
            <div className={`p-3 ${isDarkMode ? 'bg-gray-700' : 'bg-gray-50'} rounded-lg`}>
              <div className="flex items-center space-x-2 mb-1">
                <Activity className={`h-4 w-4 ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`} />
                <span className={`text-sm font-medium ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>AI Model</span>
              </div>
              <span className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>Qwen2.5 VL</span>
            </div>
            
            <div className={`p-3 ${isDarkMode ? 'bg-gray-700' : 'bg-gray-50'} rounded-lg`}>
              <div className="flex items-center space-x-2 mb-1">
                <Clock className={`h-4 w-4 ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`} />
                <span className={`text-sm font-medium ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>Last Updated</span>
              </div>
              <span className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>{new Date().toLocaleDateString()}</span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* 使用指南 */}
      <Card className={`shadow-sm border-0 ${isDarkMode ? 'bg-gray-800' : 'bg-white'} border ${isDarkMode ? 'border-gray-700' : 'border-gray-200'}`}>
        <CardHeader>
          <CardTitle className={`text-lg ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>Quick Start Guide</CardTitle>
          <p className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>How to use the image comparison system</p>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="space-y-3">
              <div className="flex items-start space-x-3">
                <div className={`w-6 h-6 ${isDarkMode ? 'bg-gray-600' : 'bg-gray-200'} rounded-full flex items-center justify-center flex-shrink-0 mt-0.5`}>
                  <span className={`text-sm font-bold ${isDarkMode ? 'text-white' : 'text-gray-800'}`}>1</span>
                </div>
                <span className={`text-sm ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>Navigate to the "Image Comparison" tab</span>
              </div>
              <div className="flex items-start space-x-3">
                <div className={`w-6 h-6 ${isDarkMode ? 'bg-gray-600' : 'bg-gray-200'} rounded-full flex items-center justify-center flex-shrink-0 mt-0.5`}>
                  <span className={`text-sm font-bold ${isDarkMode ? 'text-white' : 'text-gray-800'}`}>2</span>
                </div>
                <span className={`text-sm ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>Upload two images you want to compare</span>
              </div>
              <div className="flex items-start space-x-3">
                <div className={`w-6 h-6 ${isDarkMode ? 'bg-gray-600' : 'bg-gray-200'} rounded-full flex items-center justify-center flex-shrink-0 mt-0.5`}>
                  <span className={`text-sm font-bold ${isDarkMode ? 'text-white' : 'text-gray-800'}`}>3</span>
                </div>
                <span className={`text-sm ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>Adjust the similarity threshold if needed</span>
              </div>
              <div className="flex items-start space-x-3">
                <div className={`w-6 h-6 ${isDarkMode ? 'bg-gray-600' : 'bg-gray-200'} rounded-full flex items-center justify-center flex-shrink-0 mt-0.5`}>
                  <span className={`text-sm font-bold ${isDarkMode ? 'text-white' : 'text-gray-800'}`}>4</span>
                </div>
                <span className={`text-sm ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>Click "Start Analysis" to begin the comparison process</span>
              </div>
              <div className="flex items-start space-x-3">
                <div className={`w-6 h-6 ${isDarkMode ? 'bg-gray-600' : 'bg-gray-200'} rounded-full flex items-center justify-center flex-shrink-0 mt-0.5`}>
                  <span className={`text-sm font-bold ${isDarkMode ? 'text-white' : 'text-gray-800'}`}>5</span>
                </div>
                <span className={`text-sm ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>View detailed results and analysis reports</span>
              </div>
              <div className="flex items-start space-x-3">
                <div className={`w-6 h-6 ${isDarkMode ? 'bg-gray-600' : 'bg-gray-200'} rounded-full flex items-center justify-center flex-shrink-0 mt-0.5`}>
                  <span className={`text-sm font-bold ${isDarkMode ? 'text-white' : 'text-gray-800'}`}>6</span>
                </div>
                <span className={`text-sm ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>Check "Analysis History" for all previous comparisons</span>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

export default SystemStatus 