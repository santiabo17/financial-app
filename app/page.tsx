'use client'

import { useState, useMemo, useEffect } from 'react'
import { TransactionForm } from '@/components/transaction-form'
import { SummaryMetrics } from '@/components/summary-metrics'
import { VisualizationPanel } from '@/components/visualization-panel'
import { ThemeToggle } from '@/components/theme-toggle'
import { Button } from '@/components/ui/button'
import { Calendar, TrendingUp } from 'lucide-react'
import { getTransactions } from '@/services/transaction'

export type TransactionType = 'income' | 'outcome'

export interface Transaction {
  id: string
  type: TransactionType
  amount: number
  category: number
  description: string
  date: string
}

export type ViewMode = 'monthly' | 'yearly'

export default function FinanceTracker() {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [viewMode, setViewMode] = useState<ViewMode>('monthly');

  useEffect(() => {
    const fetchTransactions = async () => {
      const transactionsData = await getTransactions();
      setTransactions(transactionsData);
    }
    fetchTransactions();
  }, []);

  const handleAddTransaction = (transaction: Omit<Transaction, 'id'>) => {
    const newTransaction: Transaction = {
      ...transaction,
      id: crypto.randomUUID(),
    }
    setTransactions((prev) => [newTransaction, ...prev])
  }

  const handleDeleteTransaction = (id: string) => {
    setTransactions((prev) => prev.filter((t) => t.id !== id))
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="sticky top-0 z-50 border-b border-border bg-card/95 backdrop-blur supports-[backdrop-filter]:bg-card/60">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-br from-primary to-primary/70 rounded-xl flex items-center justify-center shadow-lg">
              <TrendingUp className="w-5 h-5 text-primary-foreground" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-foreground">Finance Tracker</h1>
              <p className="text-xs text-muted-foreground">Manage your finances</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            {/* Theme Toggle Button */}
            <ThemeToggle />
            <div className="hidden sm:flex items-center gap-2">
              <Button
                variant={viewMode === 'monthly' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setViewMode('monthly')}
                className="gap-2"
              >
                <Calendar className="w-4 h-4" />
                Monthly
              </Button>
              <Button
                variant={viewMode === 'yearly' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setViewMode('yearly')}
              >
                Yearly
              </Button>
            </div>
            {/* Mobile View Toggle */}
            <div className="sm:hidden">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setViewMode(viewMode === 'monthly' ? 'yearly' : 'monthly')}
              >
                {viewMode === 'monthly' ? 'Monthly' : 'Yearly'}
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Layout */}
      <div className="container mx-auto px-4 py-6">
        <div className="grid lg:grid-cols-[340px_1fr] gap-6">
          {/* Left Sidebar - Data Entry */}
          <aside className="lg:sticky lg:top-24 lg:self-start">
            <TransactionForm onSubmit={handleAddTransaction} />
          </aside>

          {/* Main Content Area */}
          <main className="space-y-6">
            {/* Summary Metrics */}
            <SummaryMetrics
              transactions={transactions}
              viewMode={viewMode}
            />

            {/* Visualization & Insights */}
            <VisualizationPanel
              transactions={transactions}
              viewMode={viewMode}
              onDeleteTransaction={handleDeleteTransaction}
            />
          </main>
        </div>
      </div>
    </div>
  )
}
