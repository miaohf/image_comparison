'use client'

import React, { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { 
  ImageIcon, 
  History, 
  Activity, 
  Sparkles,
  Zap,
  Shield,
  TrendingUp,
  Sun,
  Moon
} from 'lucide-react'
import ImageComparison from '@/components/ImageComparison'
import AnalysisHistory from '@/components/AnalysisHistory'
import SystemStatus from '@/components/SystemStatus'

export default function HomePage() {
  const [currentPage, setCurrentPage] = useState<'compare' | 'history' | 'status'>('compare')
  const [isDarkMode, setIsDarkMode] = useState(false)

  const pages = [
    {
      id: 'compare' as const,
      title: 'Image Comparison',
      icon: ImageIcon,
      component: ImageComparison
    },
    {
      id: 'history' as const,
      title: 'Analysis History',
      icon: History,
      component: AnalysisHistory
    },
    {
      id: 'status' as const,
      title: 'System Status',
      icon: Activity,
      component: SystemStatus
    }
  ]

  const CurrentComponent = pages.find(page => page.id === currentPage)?.component

  return (
    <div className={`min-h-screen relative overflow-hidden ${isDarkMode ? 'dark' : ''}`}>
      {/* 背景装饰 */}
      <div className={`absolute inset-0 ${isDarkMode ? 'bg-gray-900' : 'bg-gray-100'}`}></div>

      {/* 顶部导航栏 */}
      <nav className={`relative ${isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'} border-b sticky top-0 z-50 shadow-sm`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center space-x-8">
              <div className="flex items-center space-x-4">
                <div className="p-3 bg-blue-600 rounded-lg shadow-sm">
                  <Sparkles className="h-6 w-6 text-white" />
                </div>
                <div>
                  <h1 className={`text-xl font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                    Intelligent Image Comparison
                  </h1>
                  <p className={`text-sm ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>AI-powered analysis platform based on Qwen2.5 VL</p>
                </div>
              </div>
              
              {/* 页面导航 */}
              <div className="flex items-center space-x-4 ml-8">
                {pages.map((page) => {
                  const Icon = page.icon
                  const isActive = currentPage === page.id
                  return (
                    <button
                      key={page.id}
                      onClick={() => setCurrentPage(page.id)}
                      className={`flex items-center space-x-2 px-4 py-2 rounded-lg transition-all duration-300 ${
                        isActive
                          ? 'bg-blue-600 text-white shadow-sm'
                          : isDarkMode 
                            ? 'text-gray-300 hover:text-white hover:bg-gray-700'
                            : 'text-gray-600 hover:text-gray-800 hover:bg-gray-100'
                      }`}
                    >
                      <Icon className="h-4 w-4" />
                      <span className="font-medium">{page.title}</span>
                    </button>
                  )
                })}
              </div>
            </div>
            
            {/* 主题切换按钮 */}
            <div className="flex items-center space-x-4">
              <button
                onClick={() => setIsDarkMode(!isDarkMode)}
                className={`p-2 rounded-lg transition-all duration-300 ${
                  isDarkMode 
                    ? 'bg-gray-700 text-yellow-400 hover:bg-gray-600' 
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
              >
                {isDarkMode ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
              </button>
            </div>
          </div>
        </div>
      </nav>

      {/* 主要内容区域 */}
      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className={`${isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'} rounded-lg shadow-sm border overflow-hidden`}>
          <div className="p-6">
            {CurrentComponent && (
              <div key={currentPage} className="animate-page-transition">
                <CurrentComponent isDarkMode={isDarkMode} />
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
} 