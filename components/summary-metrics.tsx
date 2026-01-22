'use client'

import { useMemo } from 'react'
import { Card, CardContent } from '@/components/ui/card'
import { ViewMode } from '@/app/page'
import { TrendingUp, TrendingDown, DollarSign, Percent, ArrowUpRight, ArrowDownRight } from 'lucide-react'
import { cn } from '@/lib/utils'
import { Transaction, TYPE_ENUM } from '@/types/transaction'
import { useTheme } from 'next-themes'

interface SummaryMetricsProps {
  transactions: Transaction[]
  viewMode: ViewMode
}

export function SummaryMetrics({ transactions, viewMode }: SummaryMetricsProps) {
  const metrics = useMemo(() => {
    const now = new Date()
    const currentMonth = now.getMonth()
    const currentYear = now.getFullYear()

    const filteredTransactions = transactions.filter((t) => {
      const transactionDate = new Date(t.date)
      if (viewMode === 'monthly') {
        return (
          transactionDate.getMonth() === currentMonth &&
          transactionDate.getFullYear() === currentYear
        )
      } else {
        return transactionDate.getFullYear() === currentYear
      }
    })

    const totalIncome = filteredTransactions
      .filter((t) => t.type === !!TYPE_ENUM.INCOME)
      .reduce((sum, t) => sum + Number(t.amount), 0)

    const totalOutcomes = filteredTransactions
      .filter((t) => t.type === !!TYPE_ENUM.OUTCOME)
      .reduce((sum, t) => sum + Number(t.amount)-t.debts?.reduce((acc, d) => acc + (d.status ? Number(d.amount) : 0), 0), 0)

    const netBalance = totalIncome - totalOutcomes
    const savingsRate = totalIncome > 0 ? (netBalance / totalIncome) * 100 : 0

    return {
      netBalance,
      totalIncome,
      totalOutcomes,
      savingsRate,
    }
  }, [transactions, viewMode])

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(amount)
  }

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      {/* Net Balance */}
      <Card className="md:col-span-2 shadow-lg border-border/50 overflow-hidden relative">
        <div className={cn(
          "absolute inset-0 opacity-5",
          metrics.netBalance >= 0 ? "bg-success" : "bg-destructive"
        )} />
        <CardContent className="pt-6 relative">
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-muted-foreground text-sm font-medium">
                <div className={cn(
                  "w-9 h-9 rounded-lg flex items-center justify-center",
                  metrics.netBalance >= 0 ? "bg-success/10" : "bg-destructive/10"
                )}>
                  <DollarSign className={cn(
                    "w-5 h-5",
                    metrics.netBalance >= 0 ? "text-success" : "text-destructive"
                  )} />
                </div>
                <span>Net Balance</span>
              </div>
              {metrics.netBalance >= 0 ? (
                <ArrowUpRight className="w-5 h-5 text-success" />
              ) : (
                <ArrowDownRight className="w-5 h-5 text-destructive" />
              )}
            </div>
            <div
              className={cn(
                'text-4xl font-bold',
                metrics.netBalance >= 0 ? 'text-success' : 'text-destructive'
              )}
            >
              {formatCurrency(metrics.netBalance)}
            </div>
            <p className="text-sm text-muted-foreground font-medium">
              {viewMode === 'monthly' ? 'This month' : 'This year'}
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Total Income */}
      <Card className="shadow-lg border-border/50 overflow-hidden relative">
        <div className="absolute inset-0 bg-success opacity-5" />
        <CardContent className="pt-6 relative">
          <div className="space-y-3">
            <div className="flex items-center gap-2 text-muted-foreground text-sm font-medium">
              <div className="w-9 h-9 bg-success/10 rounded-lg flex items-center justify-center">
                <TrendingUp className="w-5 h-5 text-success" />
              </div>
              <span>Income</span>
            </div>
            <div className="text-2xl font-bold text-success">
              {formatCurrency(metrics.totalIncome)}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Total Outcomes */}
      <Card className="shadow-lg border-border/50 overflow-hidden relative">
        <div className="absolute inset-0 bg-destructive opacity-5" />
        <CardContent className="pt-6 relative">
          <div className="space-y-3">
            <div className="flex items-center gap-2 text-muted-foreground text-sm font-medium">
              <div className="w-9 h-9 bg-destructive/10 rounded-lg flex items-center justify-center">
                <TrendingDown className="w-5 h-5 text-destructive" />
              </div>
              <span>Outcomes</span>
            </div>
            <div className="text-2xl font-bold text-destructive">
              {formatCurrency(metrics.totalOutcomes)}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Savings Rate */}
      <Card className="md:col-span-2 lg:col-span-4 shadow-lg border-border/50">
        <CardContent className="pt-6">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div className="space-y-2">
              <div className="flex items-center gap-2 text-muted-foreground text-sm font-medium">
                <div className={cn(
                  "w-9 h-9 rounded-lg flex items-center justify-center",
                  metrics.savingsRate >= 0 ? "bg-success/10" : "bg-destructive/10"
                )}>
                  <Percent className={cn(
                    "w-5 h-5",
                    metrics.savingsRate >= 0 ? "text-success" : "text-destructive"
                  )} />
                </div>
                <span>Savings Rate</span>
              </div>
              <div className="text-3xl font-bold">
                {metrics.savingsRate.toFixed(1)}%
              </div>
            </div>
            <div className="h-16 flex-1 max-w-md bg-muted rounded-xl overflow-hidden shadow-inner">
              <div
                className={cn(
                  'h-full transition-all duration-500 ease-out',
                  metrics.savingsRate >= 0 ? 'bg-gradient-to-r from-success to-success/80' : 'bg-gradient-to-r from-destructive to-destructive/80'
                )}
                style={{
                  width: `${Math.min(Math.abs(metrics.savingsRate), 100)}%`,
                }}
              />
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
