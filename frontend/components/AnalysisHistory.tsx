'use client'

import React, { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { 
  History, 
  Trash2, 
  Eye, 
  Calendar,
  Clock,
  AlertTriangle,
  CheckCircle,
  XCircle,
  ChevronLeft,
  ChevronRight,
  Search,
  Filter,
  RefreshCw
} from 'lucide-react'

interface AnalysisRecord {
  id: string
  image1_path: string
  image2_path: string
  similarity_score: number
  alert_level: string
  created_at: string
  processing_time: number
  differences: Array<{
    type: string
    description: string
    confidence: number
  }>
}

interface AnalysisHistoryProps {
  isDarkMode?: boolean
}

const AnalysisHistory: React.FC<AnalysisHistoryProps> = ({ isDarkMode = false }) => {
  const [records, setRecords] = useState<AnalysisRecord[]>([])
  const [loading, setLoading] = useState(true)
  const [currentPage, setCurrentPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [selectedRecord, setSelectedRecord] = useState<AnalysisRecord | null>(null)
  const [searchTerm, setSearchTerm] = useState('')
  const [filterLevel, setFilterLevel] = useState('all')

  const fetchHistory = async (page: number = 1) => {
    setLoading(true)
    try {
      const response = await fetch(`/api/v1/analysis-history?page=${page}&limit=10`)
      if (!response.ok) {
        throw new Error('Failed to fetch history records')
      }
      const data = await response.json()
      if (data.status === 'success') {
        setRecords(data.data.records || [])
        setTotalPages(Math.ceil((data.data.total || 0) / 10))
      }
    } catch (error) {
      console.error('Failed to fetch history records:', error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchHistory(currentPage)
  }, [currentPage])

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this record?')) return
    
    try {
      const response = await fetch(`/api/v1/analysis/${id}`, {
        method: 'DELETE',
      })
      if (response.ok) {
        fetchHistory(currentPage)
      }
    } catch (error) {
      console.error('Failed to delete record:', error)
    }
  }

  const getAlertIcon = (level: string) => {
    switch (level) {
      case 'error':
        return <XCircle className="h-4 w-4 text-red-500" />
      case 'warning':
        return <AlertTriangle className="h-4 w-4 text-yellow-500" />
      case 'info':
        return <CheckCircle className="h-4 w-4 text-green-500" />
      default:
        return <CheckCircle className="h-4 w-4 text-blue-500" />
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

  const filteredRecords = records.filter(record => {
    const matchesSearch = record.id.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesFilter = filterLevel === 'all' || record.alert_level === filterLevel
    return matchesSearch && matchesFilter
  })

  return (
    <div className="max-w-7xl mx-auto space-y-4">
      {/* 搜索和过滤 */}
              <Card className={`shadow-sm border-0 ${isDarkMode ? 'bg-gray-800' : 'bg-white'} border ${isDarkMode ? 'border-gray-700' : 'border-gray-200'}`}>
          <CardHeader>
            <CardTitle className={`text-lg ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>Analysis History</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col sm:flex-row gap-4">
              <div className="flex-1">
                <div className="relative">
                  <Search className={`absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`} />
                  <input
                    type="text"
                    placeholder="Search by ID..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className={`w-full pl-10 pr-4 py-2 border rounded-lg ${isDarkMode ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400' : 'bg-gray-50 border-gray-300 text-gray-900 placeholder-gray-500'}`}
                  />
                </div>
              </div>
              <div className="flex gap-2">
                <select
                  value={filterLevel}
                  onChange={(e) => setFilterLevel(e.target.value)}
                  className={`px-3 py-2 border rounded-lg ${isDarkMode ? 'bg-gray-700 border-gray-600 text-white' : 'bg-gray-50 border-gray-300 text-gray-900'}`}
                >
                  <option value="all">All Levels</option>
                  <option value="error">Critical</option>
                  <option value="warning">Warning</option>
                  <option value="info">Normal</option>
                </select>
                <Button
                  onClick={() => fetchHistory(currentPage)}
                  variant="outline"
                  className={`${isDarkMode ? 'border-gray-600 text-gray-300 hover:bg-gray-700' : 'border-gray-300 text-gray-700 hover:bg-gray-100'}`}
                >
                  <RefreshCw className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

      {/* 历史记录列表 */}
      <Card className={`shadow-sm border-0 ${isDarkMode ? 'bg-gray-700' : 'bg-white'}`}>
        <CardContent className="p-0">
          {loading ? (
            <div className="p-6 text-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
              <p className={`mt-4 ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>Loading records...</p>
            </div>
          ) : filteredRecords.length === 0 ? (
            <div className="p-6 text-center">
              <History className={`h-12 w-12 mx-auto ${isDarkMode ? 'text-gray-400' : 'text-gray-300'}`} />
              <p className={`mt-4 ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>No analysis records found</p>
            </div>
          ) : (
            <div className="divide-y divide-gray-200">
              {filteredRecords.map((record) => (
                <div
                  key={record.id}
                  className={`p-4 hover:bg-gray-50 transition-colors duration-200 ${isDarkMode ? 'hover:bg-gray-600' : 'hover:bg-gray-50'}`}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-4">
                      <div className="flex items-center space-x-2">
                        {getAlertIcon(record.alert_level)}
                        {getAlertBadge(record.alert_level)}
                      </div>
                      <div>
                        <h3 className={`font-medium ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>Analysis #{record.id}</h3>
                        <p className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                          Similarity: {(record.similarity_score * 100).toFixed(1)}% | 
                          Differences: {record.differences.length} | 
                          Time: {new Date(record.created_at).toLocaleString()}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Button
                        onClick={() => setSelectedRecord(record)}
                        variant="outline"
                        size="sm"
                        className={`${isDarkMode ? 'border-gray-600 text-gray-300 hover:bg-gray-600' : 'border-gray-300 text-gray-700 hover:bg-gray-50'}`}
                      >
                        <Eye className="h-4 w-4 mr-1" />
                        View
                      </Button>
                      <Button
                        onClick={() => handleDelete(record.id)}
                        variant="outline"
                        size="sm"
                        className="border-red-300 text-red-600 hover:bg-red-50"
                      >
                        <Trash2 className="h-4 w-4 mr-1" />
                        Delete
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* 分页 */}
      {totalPages > 1 && (
        <Card className={`shadow-sm border-0 ${isDarkMode ? 'bg-gray-700' : 'bg-white'}`}>
          <CardContent className="p-3">
            <div className="flex items-center justify-between">
              <p className={`text-sm ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>
                Page {currentPage} of {totalPages}
              </p>
              <div className="flex items-center space-x-2">
                <Button
                  onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                  disabled={currentPage === 1}
                  variant="outline"
                  size="sm"
                  className={`${isDarkMode ? 'border-gray-600 text-gray-300 hover:bg-gray-600' : 'border-gray-300 text-gray-700 hover:bg-gray-50'}`}
                >
                  <ChevronLeft className="h-4 w-4" />
                  Previous
                </Button>
                <Button
                  onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
                  disabled={currentPage === totalPages}
                  variant="outline"
                  size="sm"
                  className={`${isDarkMode ? 'border-gray-600 text-gray-300 hover:bg-gray-600' : 'border-gray-300 text-gray-700 hover:bg-gray-50'}`}
                >
                  Next
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* 详情弹窗 */}
      {selectedRecord && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <Card className={`w-full max-w-2xl max-h-[80vh] overflow-y-auto ${isDarkMode ? 'bg-gray-800' : 'bg-white'}`}>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className={`text-lg ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                  Analysis Details #{selectedRecord.id}
                </CardTitle>
                <Button
                  onClick={() => setSelectedRecord(null)}
                  variant="outline"
                  size="sm"
                  className={`${isDarkMode ? 'border-gray-600 text-gray-300 hover:bg-gray-600' : 'border-gray-300 text-gray-700 hover:bg-gray-50'}`}
                >
                  Close
                </Button>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <span className={`text-sm font-medium ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>Similarity Score:</span>
                  <p className={`text-lg font-bold ${isDarkMode ? 'text-blue-400' : 'text-blue-600'}`}>
                    {(selectedRecord.similarity_score * 100).toFixed(1)}%
                  </p>
                </div>
                <div>
                  <span className={`text-sm font-medium ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>Alert Level:</span>
                  <div className="mt-1">{getAlertBadge(selectedRecord.alert_level)}</div>
                </div>
                <div>
                  <span className={`text-sm font-medium ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>Processing Time:</span>
                  <p className={`${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>
                    {selectedRecord.processing_time.toFixed(1)} seconds
                  </p>
                </div>
                <div>
                  <span className={`text-sm font-medium ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>Created At:</span>
                  <p className={`${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>
                    {new Date(selectedRecord.created_at).toLocaleString()}
                  </p>
                </div>
              </div>
              
              {selectedRecord.differences.length > 0 && (
                <div>
                  <h4 className={`font-medium ${isDarkMode ? 'text-white' : 'text-gray-900'} mb-3`}>Detected Differences:</h4>
                  <div className="space-y-2">
                    {selectedRecord.differences.map((diff, index) => (
                      <div
                        key={index}
                        className={`p-3 rounded-lg border ${isDarkMode ? 'bg-gray-700 border-gray-600' : 'bg-gray-50 border-gray-200'}`}
                      >
                        <div className="flex items-center justify-between">
                          <span className={`font-medium capitalize ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                            {diff.type.replace('_', ' ')}
                          </span>
                          <span className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                            Confidence: {(diff.confidence * 100).toFixed(0)}%
                          </span>
                        </div>
                        <p className={`text-sm mt-1 ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>
                          {diff.description}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  )
}

export default AnalysisHistory 