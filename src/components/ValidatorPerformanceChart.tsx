'use client'

import { ValidatorInfo } from '@/store/slices/validatorSlice'
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, AreaChart, Area } from 'recharts'
import { TrendingUp, TrendingDown, Activity, Award } from 'lucide-react'
import { formatPercent } from '@/utils/formatters'

interface ValidatorPerformanceChartProps {
  validator: ValidatorInfo
}

export function ValidatorPerformanceChart({ validator }: ValidatorPerformanceChartProps) {
  const { performanceHistory, uptime, apy, skipRate } = validator

  if (!performanceHistory || performanceHistory.length === 0) {
    return (
      <div className="card text-center py-8">
        <Activity className="text-solana-gray-600 mx-auto mb-4" size={48} />
        <h3 className="text-lg font-semibold mb-2">Performance Data Unavailable</h3>
        <p className="text-solana-gray-400">
          Performance history is not available for this validator.
        </p>
      </div>
    )
  }

  // Prepare chart data
  const chartData = performanceHistory.map(entry => ({
    epoch: entry.epoch,
    apy: entry.apy,
    skipRate: entry.skipRate,
    credits: entry.credits,
  })).reverse() // Show oldest to newest

  // Calculate performance metrics
  const avgApy = performanceHistory.reduce((sum, entry) => sum + entry.apy, 0) / performanceHistory.length
  const avgSkipRate = performanceHistory.reduce((sum, entry) => sum + entry.skipRate, 0) / performanceHistory.length
  const trend = performanceHistory.length > 1 
    ? performanceHistory[performanceHistory.length - 1].apy - performanceHistory[0].apy 
    : 0

  return (
    <div className="space-y-6">
      {/* Performance Metrics */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="card bg-gradient-to-br from-solana-green/20 to-solana-green/10 border-solana-green/20">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-solana-gray-400 text-xs mb-1">Avg APY (30d)</p>
              <p className="text-lg font-bold text-solana-green">{formatPercent(avgApy)}</p>
            </div>
            <Award className="text-solana-green" size={20} />
          </div>
        </div>

        <div className="card bg-gradient-to-br from-solana-blue/20 to-solana-blue/10 border-solana-blue/20">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-solana-gray-400 text-xs mb-1">Uptime</p>
              <p className="text-lg font-bold text-solana-blue">
                {uptime ? `${uptime.toFixed(1)}%` : 'N/A'}
              </p>
            </div>
            <Activity className="text-solana-blue" size={20} />
          </div>
        </div>

        <div className="card bg-gradient-to-br from-yellow-400/20 to-yellow-400/10 border-yellow-400/20">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-solana-gray-400 text-xs mb-1">Avg Skip Rate</p>
              <p className="text-lg font-bold text-yellow-400">{formatPercent(avgSkipRate)}</p>
            </div>
            <TrendingDown className="text-yellow-400" size={20} />
          </div>
        </div>

        <div className="card bg-gradient-to-br from-solana-purple/20 to-solana-purple/10 border-solana-purple/20">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-solana-gray-400 text-xs mb-1">Performance Trend</p>
              <p className={`text-lg font-bold ${trend >= 0 ? 'text-solana-green' : 'text-red-400'}`}>
                {trend >= 0 ? '+' : ''}{formatPercent(trend)}
              </p>
            </div>
            {trend >= 0 ? (
              <TrendingUp className="text-solana-green" size={20} />
            ) : (
              <TrendingDown className="text-red-400" size={20} />
            )}
          </div>
        </div>
      </div>

      {/* APY Chart */}
      <div className="card">
        <h3 className="text-lg font-semibold mb-4">APY Performance (Last 30 Epochs)</h3>
        <div className="h-64">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
              <XAxis 
                dataKey="epoch" 
                stroke="#9CA3AF"
                fontSize={12}
              />
              <YAxis 
                stroke="#9CA3AF"
                fontSize={12}
                tickFormatter={(value) => `${value.toFixed(1)}%`}
              />
              <Tooltip
                contentStyle={{
                  backgroundColor: '#1F2937',
                  border: '1px solid #374151',
                  borderRadius: '8px',
                  color: '#fff'
                }}
                formatter={(value, name) => [
                  `${(value as number).toFixed(2)}%`,
                  name === 'apy' ? 'APY' : name
                ]}
                labelFormatter={(label) => `Epoch ${label}`}
              />
              <Area
                type="monotone"
                dataKey="apy"
                stroke="#14F195"
                fill="#14F195"
                fillOpacity={0.2}
                strokeWidth={2}
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Skip Rate Chart */}
      <div className="card">
        <h3 className="text-lg font-semibold mb-4">Skip Rate Performance (Last 30 Epochs)</h3>
        <div className="h-64">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
              <XAxis 
                dataKey="epoch" 
                stroke="#9CA3AF"
                fontSize={12}
              />
              <YAxis 
                stroke="#9CA3AF"
                fontSize={12}
                tickFormatter={(value) => `${value.toFixed(1)}%`}
              />
              <Tooltip
                contentStyle={{
                  backgroundColor: '#1F2937',
                  border: '1px solid #374151',
                  borderRadius: '8px',
                  color: '#fff'
                }}
                formatter={(value, name) => [
                  `${(value as number).toFixed(2)}%`,
                  'Skip Rate'
                ]}
                labelFormatter={(label) => `Epoch ${label}`}
              />
              <Line
                type="monotone"
                dataKey="skipRate"
                stroke="#F59E0B"
                strokeWidth={2}
                dot={{ r: 3, fill: '#F59E0B' }}
                activeDot={{ r: 5, fill: '#F59E0B' }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Credits Chart */}
      <div className="card">
        <h3 className="text-lg font-semibold mb-4">Epoch Credits (Last 30 Epochs)</h3>
        <div className="h-64">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
              <XAxis 
                dataKey="epoch" 
                stroke="#9CA3AF"
                fontSize={12}
              />
              <YAxis 
                stroke="#9CA3AF"
                fontSize={12}
                tickFormatter={(value) => value.toLocaleString()}
              />
              <Tooltip
                contentStyle={{
                  backgroundColor: '#1F2937',
                  border: '1px solid #374151',
                  borderRadius: '8px',
                  color: '#fff'
                }}
                formatter={(value, name) => [
                  (value as number).toLocaleString(),
                  'Credits'
                ]}
                labelFormatter={(label) => `Epoch ${label}`}
              />
              <Area
                type="monotone"
                dataKey="credits"
                stroke="#9945FF"
                fill="#9945FF"
                fillOpacity={0.2}
                strokeWidth={2}
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  )
}