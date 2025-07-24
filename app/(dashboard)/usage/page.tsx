"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { BarChart, DollarSign, MessageSquare, TrendingUp } from "lucide-react"
import { createSupabaseClient } from "@/lib/supabase/client"
import { UsageTracker } from "@/lib/services/usage-tracker"
import {
  BarChart as RechartsBarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Legend
} from "recharts"

interface UsageStats {
  totalTokens: number
  totalCost: number
  chatCount: number
  byModel: Array<{
    model: string
    tokens: number
    cost: number
    count: number
  }>
  byDate: Array<{
    date: string
    tokens: number
    cost: number
  }>
}

const COLORS = ['#E74C3C', '#3B82F6', '#10B981', '#F59E0B', '#8B5CF6', '#EC4899']

export default function UsagePage() {
  const [stats, setStats] = useState<UsageStats | null>(null)
  const [loading, setLoading] = useState(true)
  const [dateRange, setDateRange] = useState('week') // week, month, all

  useEffect(() => {
    loadUsageStats()
  }, [dateRange])

  const loadUsageStats = async () => {
    try {
      const supabase = createSupabaseClient()
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return

      // Get date filter
      const now = new Date()
      let startDate = new Date()
      if (dateRange === 'week') {
        startDate.setDate(now.getDate() - 7)
      } else if (dateRange === 'month') {
        startDate.setMonth(now.getMonth() - 1)
      } else {
        startDate = new Date(0) // All time
      }

      // Fetch usage data
      const { data: usageData, error } = await supabase
        .from('usage')
        .select('*')
        .eq('user_id', user.id)
        .gte('created_at', startDate.toISOString())
        .order('created_at', { ascending: false })

      if (error) throw error

      // Process stats
      const stats: UsageStats = {
        totalTokens: 0,
        totalCost: 0,
        chatCount: usageData?.length || 0,
        byModel: [],
        byDate: []
      }

      // Group by model
      const modelMap = new Map<string, { tokens: number; cost: number; count: number }>()
      const dateMap = new Map<string, { tokens: number; cost: number }>()

      usageData?.forEach(record => {
        stats.totalTokens += record.total_tokens
        stats.totalCost += record.cost

        // By model
        const existing = modelMap.get(record.model) || { tokens: 0, cost: 0, count: 0 }
        modelMap.set(record.model, {
          tokens: existing.tokens + record.total_tokens,
          cost: existing.cost + record.cost,
          count: existing.count + 1
        })

        // By date
        const date = new Date(record.created_at).toLocaleDateString('ko-KR')
        const dateExisting = dateMap.get(date) || { tokens: 0, cost: 0 }
        dateMap.set(date, {
          tokens: dateExisting.tokens + record.total_tokens,
          cost: dateExisting.cost + record.cost
        })
      })

      stats.byModel = Array.from(modelMap.entries()).map(([model, data]) => ({
        model,
        ...data
      }))

      stats.byDate = Array.from(dateMap.entries())
        .map(([date, data]) => ({ date, ...data }))
        .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
        .slice(-7) // Last 7 entries

      setStats(stats)
    } catch (error) {
      console.error('Failed to load usage stats:', error)
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">사용량 통계</h1>
        <p className="text-muted-foreground mt-2">
          AI 모델 사용량과 비용을 확인하세요
        </p>
      </div>

      {/* Summary Cards */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">총 사용 토큰</CardTitle>
            <BarChart className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {UsageTracker.formatTokens(stats?.totalTokens || 0)}
            </div>
            <p className="text-xs text-muted-foreground">
              tokens
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">총 비용</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {UsageTracker.formatCost(stats?.totalCost || 0)}
            </div>
            <p className="text-xs text-muted-foreground">
              USD
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">총 대화 수</CardTitle>
            <MessageSquare className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {stats?.chatCount.toLocaleString() || 0}
            </div>
            <p className="text-xs text-muted-foreground">
              conversations
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Charts */}
      <div className="grid gap-6 md:grid-cols-2">
        {/* Usage by Model */}
        <Card>
          <CardHeader>
            <CardTitle>모델별 사용량</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={stats?.byModel || []}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="tokens"
                  nameKey="model"
                >
                  {stats?.byModel.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip formatter={(value: number) => UsageTracker.formatTokens(value)} />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Usage Over Time */}
        <Card>
          <CardHeader>
            <CardTitle>일별 사용량</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <RechartsBarChart data={stats?.byDate || []}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" />
                <YAxis />
                <Tooltip formatter={(value: number) => UsageTracker.formatTokens(value)} />
                <Bar dataKey="tokens" fill="#E74C3C" />
              </RechartsBarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Detailed Usage Table */}
      <Card>
        <CardHeader>
          <CardTitle>모델별 상세 사용량</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="relative overflow-x-auto">
            <table className="w-full text-sm text-left">
              <thead className="text-xs uppercase bg-gray-50">
                <tr>
                  <th className="px-6 py-3">모델</th>
                  <th className="px-6 py-3">사용 횟수</th>
                  <th className="px-6 py-3">토큰</th>
                  <th className="px-6 py-3">비용</th>
                  <th className="px-6 py-3">평균 토큰/대화</th>
                </tr>
              </thead>
              <tbody>
                {stats?.byModel.map((model) => (
                  <tr key={model.model} className="bg-white border-b">
                    <td className="px-6 py-4 font-medium">{model.model}</td>
                    <td className="px-6 py-4">{model.count.toLocaleString()}</td>
                    <td className="px-6 py-4">{UsageTracker.formatTokens(model.tokens)}</td>
                    <td className="px-6 py-4">{UsageTracker.formatCost(model.cost)}</td>
                    <td className="px-6 py-4">
                      {UsageTracker.formatTokens(Math.round(model.tokens / model.count))}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}