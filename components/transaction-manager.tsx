"use client"

import type React from "react"

import { useEffect, useMemo, useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { useToast } from "@/hooks/use-toast"
import { HandCoins, Plus, Check, Trash2, ArrowDownRight, ArrowUpRight } from "lucide-react"
import { ConfirmationModal } from "./confirmation-modal"
import { useTheme } from "next-themes"
import { CreateTransactionForm, Transaction, TYPE_ENUM, TYPE_TEXT_ENUM } from "@/types/transaction"
import { CreateDebtForm, Debt, DEBT_STATUS_ENUM } from "@/types/debt"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "./ui/select"
import { Category } from "@/types/category"
import { getCategories } from "@/services/category"
import { formatDate } from "@/lib/date"
import { TransactionForm } from "./transaction-form"
import { SummaryMetrics } from "./summary-metrics"
import { VisualizationPanel } from "./visualization-panel"
import { ViewMode } from "@/app/page"

interface TransactionManagerProps {
  transactions: Transaction[]
  categories: Category[]
  onAddTransaction: (transaction: CreateTransactionForm) => void
  onUpdateTransaction: (id: number, transaction: CreateTransactionForm) => void
  onDeleteTransaction: (id: number) => void
  onDeleteCategory: (id: number) => void
  onDeleteDebt: (id: number) => void
  onOpenCategoryModal: () => void
  viewMode: ViewMode
}

export function TransactionManager({ transactions, categories, onAddTransaction, onUpdateTransaction, onDeleteTransaction, onDeleteCategory, onDeleteDebt, onOpenCategoryModal, viewMode }: TransactionManagerProps) {
  const [selectedTransactionId, setSelectedTransactionId] = useState<number | null>(null);

  const transaction = useMemo(() => {
    if(!selectedTransactionId) return null;
    const transaction = transactions.find(t => t.id == selectedTransactionId);
    return transaction || null;
  }, [selectedTransactionId]);

  return (
     <div className="grid lg:grid-cols-[340px_1fr] gap-6">
        <aside className="lg:sticky lg:top-22 lg:self-start">
          <TransactionForm categories={categories} onOpenCategoryModal={() => onOpenCategoryModal()} onSubmit={(formData) => selectedTransactionId ? onUpdateTransaction(selectedTransactionId, formData) : onAddTransaction(formData)} onDeleteTransaction={onDeleteTransaction} onDeleteCategory={onDeleteCategory} transaction={transaction} onCleanTransaction={() => setSelectedTransactionId(null)}/>
        </aside>

        <main className="space-y-6">
          <SummaryMetrics
            transactions={transactions}
            viewMode={viewMode}
          />

          <VisualizationPanel
            transactions={transactions}
            viewMode={viewMode}
            onDeleteTransaction={onDeleteTransaction}
            onDeleteDebt={onDeleteDebt}
            selectedTransactionId={selectedTransactionId}
            setSelectedTransactionId={setSelectedTransactionId}
          />
        </main>
      </div>
  )
}
