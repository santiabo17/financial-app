"use client"

import { useMemo, useState } from "react"
import { CreateTransactionForm, Transaction } from "@/types/transaction"
import { Category } from "@/types/category"
import { TransactionForm } from "./transaction-form"
import { SummaryMetrics } from "./summary-metrics"
import { ViewMode } from "@/app/page"
import { VisualizationPanel } from "./visualization-panel"

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
            categories={categories}
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
