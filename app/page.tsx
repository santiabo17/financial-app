'use client'

import { useState, useEffect } from 'react'
import { TransactionForm } from '@/components/transaction-form'
import { SummaryMetrics } from '@/components/summary-metrics'
import { VisualizationPanel } from '@/components/visualization-panel'
import { ThemeToggle } from '@/components/theme-toggle'
import { Button } from '@/components/ui-old/button'
import { Calendar, HandCoins, TrendingUp } from 'lucide-react'
import { addTransaction, deleteTransaction, getTransactions } from '@/services/transaction'
import { Transaction, CreateTransactionForm, TYPE_ENUM } from '@/types/transaction'
import { useTheme } from 'next-themes'
import { CreateDebtForm, Debt, DEBT_STATUS_ENUM } from '@/types/debt'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { DebtManager } from '@/components/debt-manager'
import { addDebt, deleteDebt, getDebts } from '@/services/debt'

export type ViewMode = 'monthly' | 'yearly'

export default function FinanceTracker() {
  const { theme } = useTheme();

  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [debts, setDebts] = useState<Debt[]>([]);
  const [viewMode, setViewMode] = useState<ViewMode>('monthly');
  const [activeTab, setActiveTab] = useState("transactions")

  useEffect(() => {
    const fetchTransactions = async () => {
      const transactionsData = await getTransactions();
      setTransactions(transactionsData);
    }
    fetchTransactions();
    const fetchDebts = async () => {
      const debtsData = await getDebts();
      setDebts(debtsData);
    }
    fetchDebts();
  }, []);

  const handleAddTransaction = async (transaction: CreateTransactionForm) => {
    // const newTransaction: Transaction = {
    //   ...transaction,
    //   id: crypto.randomUUID(),
    // }
    const addTransactionResult = await addTransaction(transaction);
    setTransactions((prev) => [addTransactionResult, ...prev])
  }

  const handleDeleteTransaction = async (id: number) => {
    try {
      await deleteTransaction(id);
      setTransactions((prev) => prev.filter((t) => t.id !== id))
    } catch (error) {
    }
  }

  const handleAddDebt = async (debt: CreateDebtForm) => {
    const newDebt: CreateDebtForm = {
      ...debt,
      status: !!DEBT_STATUS_ENUM.NO_PAID,
    }
    const debtResponse = await addDebt(newDebt);
    setDebts((prev) => [debtResponse, ...prev]);
  }

  const handleSettleDebt = (id: string) => {
    const debt = debts.find((d) => d.id === id)
    if (!debt) return

    // Mark debt as settled
    setDebts((prev) => prev.map((d) => (d.id === id ? { ...d, status: "settled" as const } : d)))

    // Create corresponding transaction
    const newTransaction: CreateTransactionForm = {
      type: debt.type === "payable" ? !!TYPE_ENUM.OUTCOME : !!TYPE_ENUM.INCOME,
      amount: debt.amount,
      category_id: debt.type === "payable" ? "Debt" : "Other",
      description: `Debt settled: ${debt.counterparty} - ${debt.description}`,
      date: new Date().toISOString().split("T")[0],
    }
    // setTransactions((prev) => [newTransaction, ...prev])
  }

  const handleDeleteDebt = async (id: number) => {
    await deleteDebt(id);
    setDebts((prev) => prev.filter((d) => d.id !== id))
  }

  const defaultStyle = theme == "light" ? "bg-white text-black" : "bg-black text-white";
  const selectedStyle = `outline-2 outline-offset-1 outline-double ${theme == "light" ? "bg-black text-white outline-black" : "bg-white text-black outline-white"}`;

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
                // variant={viewMode === 'monthly' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setViewMode('monthly')}
                className={`cursor-pointer gap-2 border ${viewMode === 'monthly' ? selectedStyle : defaultStyle}`}
              >
                <Calendar className="w-4 h-4" />
                Monthly
              </Button>
              <Button
                size="sm"
                onClick={() => setViewMode('yearly')}
                className={`cursor-pointer gap-2 border 
                  ${viewMode === 'yearly' ? selectedStyle : defaultStyle}`}
              >
                Yearly
              </Button>
            </div>
            {/* Mobile View Toggle */}
            <div className="sm:hidden">
              <Button
                className='cursor-pointer'
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
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid w-full max-w-md mx-auto grid-cols-2">
            <TabsTrigger value="transactions" className={`gap-2 cursor-pointer transition-all ${activeTab == "transactions" ? 'underline underline-offset-5' : ''}`}>
              <TrendingUp className="w-4 h-4" />
              Transactions
            </TabsTrigger>
            <TabsTrigger value="debts" className={`gap-2 cursor-pointer transition-all ${activeTab != "transactions" ? 'underline underline-offset-5' : ''}`}>
              <HandCoins className="w-4 h-4" />
              Debts
            </TabsTrigger>
          </TabsList>
          <TabsContent value="transactions">
            <div className="grid lg:grid-cols-[340px_1fr] gap-6">
              {/* Left Sidebar - Data Entry */}
              <aside className="lg:sticky lg:top-24 lg:self-start">
                <TransactionForm onSubmit={handleAddTransaction} onDeleteTransaction={handleDeleteTransaction}/>
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
          </TabsContent>
          <TabsContent value="debts">
            <DebtManager
              debts={debts}
              transactions={transactions}
              onAddDebt={handleAddDebt}
              onSettleDebt={handleSettleDebt}
              onDeleteDebt={handleDeleteDebt}
            />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}
