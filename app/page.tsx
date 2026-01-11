'use client'

import { useState, useEffect } from 'react'
import { ThemeToggle } from '@/components/theme-toggle'
import { Button } from '@/components/ui-old/button'
import { Calendar, HandCoins, TrendingUp } from 'lucide-react'
import { addTransaction, deleteTransaction, getTransactions, updateTransaction } from '@/services/transaction'
import { Transaction, CreateTransactionForm, TYPE_ENUM } from '@/types/transaction'
import { useTheme } from 'next-themes'
import { CreateDebtForm, Debt, DEBT_STATUS_ENUM } from '@/types/debt'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { DebtManager } from '@/components/debt-manager'
import { addDebt, deleteDebt, getDebts, paidDebt } from '@/services/debt'
import { Category, DefaultCategoriesEnum } from '@/types/category'
import { CategoryModal } from '@/components/category-modal'
import { toast } from '@/hooks/use-toast'
import { deleteCategory, getCategories } from '@/services/category'
import { TransactionManager } from '@/components/transaction-manager'
import { errorMessage, errorTitle, successMessage, successTitle } from '@/lib/message'
import { ACTION, ENTITY } from '@/types/message'
import { ConfirmationModal } from '@/components/confirmation-modal'

export type ViewMode = 'monthly' | 'yearly'

export default function FinanceTracker() {
  const { theme } = useTheme();

  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [debts, setDebts] = useState<Debt[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [viewMode, setViewMode] = useState<ViewMode>('monthly');
  const [activeTab, setActiveTab] = useState("transactions")
  const [showCategoryModal, setShowCategoryModal] = useState(false);
  const [selectedCategoryId, setSelectedCategoryId] = useState<number | null>(null);
  const [showDeleteCategoryModal, setShowDeleteCategoryModal] = useState(false);

  useEffect(() => {
    const fetchTransactions = async () => {
      try {
        const transactionsData = await getTransactions({order: "ORDER BY id DESC"});
        setTransactions(transactionsData);
      } catch (error) {
        toast({
          title: errorTitle(ACTION.FETCH),
          description: errorMessage(ENTITY.TRANSACTION, ACTION.FETCH),
          variant: "default",
        })
        setTransactions([]);
      }
    }
    fetchTransactions();
    const fetchDebts = async () => {
      try {
        const debtsData = await getDebts();
        setDebts(debtsData);
      } catch (error) {
        toast({
          title: errorTitle(ACTION.FETCH),
          description: errorMessage(ENTITY.DEBT, ACTION.FETCH),
          variant: "destructive",
        })
        setTransactions([]);
      }
    }
    fetchDebts();
    const fetchCategories = async () => {
      try {
        const categoriesData = await getCategories();
        setCategories(categoriesData);
      } catch (error) {
        toast({
          title: errorTitle(ACTION.FETCH),
          description: errorMessage(ENTITY.CATEGORY, ACTION.FETCH),
          variant: "destructive",
        })
        setCategories([]);
      }
    }
    fetchCategories();
  }, []);

  const handleAddTransaction = async (transaction: CreateTransactionForm) => {
    try {
      const addTransactionResult = await addTransaction(transaction);
      setTransactions((prev) => [{...addTransactionResult, debts: []}, ...prev]);
      toast({
        title: successTitle(ACTION.CREATE),
        description: successMessage(ENTITY.TRANSACTION, ACTION.CREATE),
        variant: "default",
      })
    } catch (error) {
      toast({
        title: errorTitle(ACTION.CREATE),
        description: errorMessage(ENTITY.TRANSACTION, ACTION.CREATE),
        variant: "destructive",
      })
    }
  }

  const handleUpdateTransaction = async (id: number, transaction: CreateTransactionForm) => {
    try {
      const updateTransactionResult = await updateTransaction(id, transaction);
      setTransactions((prev) => prev.map(transaction => transaction.id == id ? {...updateTransactionResult, debts: transaction.debts} : transaction));
      toast({
        title: successTitle(ACTION.UPDATE),
        description: successMessage(ENTITY.TRANSACTION, ACTION.UPDATE),
        variant: "default",
      })
    } catch (error) {
      toast({
        title: errorTitle(ACTION.UPDATE),
        description: errorMessage(ENTITY.TRANSACTION, ACTION.UPDATE),
        variant: "destructive",
      })
    }
  }

  const handleDeleteTransaction = async (id: number) => {
    try {
      await deleteTransaction(id);
      setTransactions((prev) => prev.filter((t) => t.id !== id))
      toast({
        title: successTitle(ACTION.DELETE),
        description: successMessage(ENTITY.TRANSACTION, ACTION.DELETE),
        variant: "default",
      })
    } catch (error) {
      toast({
        title: errorTitle(ACTION.DELETE),
        description: errorMessage(ENTITY.TRANSACTION, ACTION.DELETE),
        variant: "destructive",
      })
    }
  }

  const handleAddCategory = async (data: Category) => {
    try {
      setCategories(prev => [...prev, data]);
      toast({
        title: successTitle(ACTION.CREATE),
        description: successMessage(ENTITY.CATEGORY, ACTION.CREATE),
        variant: "default",
      })
    } catch (error) {
      toast({
        title: errorTitle(ACTION.CREATE),
        description: errorMessage(ENTITY.CATEGORY, ACTION.CREATE),
        variant: "destructive",
      })
    }
  }

  const handleDeleteCategory = async () => {
    if(!selectedCategoryId) return;
    try {
      await deleteCategory(selectedCategoryId);
      setCategories((prev) => prev.filter((t) => t.id !== selectedCategoryId))
      toast({
        title: successTitle(ACTION.DELETE),
        description: successMessage(ENTITY.CATEGORY, ACTION.DELETE),
        variant: "default",
      })
    } catch (error) {
      toast({
        title: errorTitle(ACTION.DELETE),
        description: errorMessage(ENTITY.CATEGORY, ACTION.DELETE),
        variant: "destructive",
      })
    }
  }

  const handleAddDebt = async (debt: CreateDebtForm) => {
    try {
      const newDebt: CreateDebtForm = {
        ...debt,
        status: !!DEBT_STATUS_ENUM.NO_PAID,
      }
      const debtResponse = await addDebt(newDebt);
      setDebts((prev) => [debtResponse, ...prev]);
      if(debtResponse.transaction_id){
        setTransactions(prev => prev.map(transaction => transaction.id == debtResponse.transaction_id ? {...transaction, debts: [...transaction.debts, debtResponse]} : transaction))
      }
      toast({
        title: successTitle(ACTION.CREATE),
        description: successMessage(ENTITY.DEBT, ACTION.CREATE),
        variant: "default",
      })
    } catch (error) {
      toast({
        title: errorTitle(ACTION.CREATE),
        description: errorMessage(ENTITY.DEBT, ACTION.CREATE),
        variant: "destructive",
      })
    }
  }

  const handleSettleDebt = async (id: number) => {
    try {
      
      const debt = debts.find((d) => d.id === id)
      if (!debt) return
  
      // Mark debt as settled
      await paidDebt(id);
      setDebts((prev) => prev.map((d) => (d.id === id ? { ...d, status: true } : d)))
  
      if(debt.transaction_id){
        const transaction = transactions.find(transaction => transaction.id == debt.transaction_id);
        if(transaction){
          setTransactions((prev) => prev.map(transactionItem => transactionItem.id == transaction.id ? 
            {...transactionItem, debts: transaction.debts.map(debt => debt.id == id ? {...debt, status: true} : debt)}
            : transactionItem));
        }
      } else {
        const newTransaction: CreateTransactionForm = {
          type: debt.type,
          amount: Number(debt.amount),
          category_id: DefaultCategoriesEnum.DebtPayments,
          description: `Debt paid: ${debt.person}${debt.description ? ` - ${debt.description}` : ""}`,
          date: new Date().toISOString().split("T")[0],
        }
        const newTransactionResult = await addTransaction(newTransaction);
        setTransactions((prev) => [newTransactionResult, ...prev]);
      }
      toast({
        title: successTitle(ACTION.PAY),
        description: successMessage(ENTITY.DEBT, ACTION.PAY),
        variant: "default",
      })
    } catch (error) {
      toast({
        title: errorTitle(ACTION.PAY),
        description: errorMessage(ENTITY.DEBT, ACTION.PAY),
        variant: "destructive",
      })
    }
  }

  const handleDeleteDebt = async (id: number) => {
    try {
      await deleteDebt(id);
      const debt = debts.find(debt => debt.id == id);
      setDebts((prev) => prev.filter((d) => d.id !== id));
      if(debt?.transaction_id){
        const transaction = transactions.find(transaction => transaction.id == debt.transaction_id);
        if(transaction){
          setTransactions((prev) => prev.map(transactionItem => transactionItem.id == transaction.id ? 
            {...transactionItem, debts: transaction.debts.filter(debtItem => debtItem.id != debt.id)} : transactionItem));
        }
      }
      toast({
        title: successTitle(ACTION.DELETE),
        description: successMessage(ENTITY.DEBT, ACTION.DELETE),
        variant: "default",
      })
    } catch (error) {
      toast({
        title: errorTitle(ACTION.DELETE),
        description: errorMessage(ENTITY.DEBT, ACTION.DELETE),
        variant: "destructive",
      })
    }
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
      <div className="container mx-auto px-4 pt-6 pb-0">
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
          <TransactionManager transactions={transactions} categories={categories} onAddTransaction={handleAddTransaction} onUpdateTransaction={handleUpdateTransaction} onDeleteCategory={(id) => {setSelectedCategoryId(id); setShowDeleteCategoryModal(true);}} onDeleteTransaction={handleDeleteTransaction} onDeleteDebt={handleDeleteDebt} onOpenCategoryModal={() => setShowCategoryModal(true)} viewMode={viewMode}/>
          </TabsContent>
          <TabsContent value="debts">
            <DebtManager
              debts={debts}
              transactions={transactions}
              categories={categories}
              onAddDebt={handleAddDebt}
              onDeleteCategory={(id) => {
                setSelectedCategoryId(id); 
                setShowDeleteCategoryModal(true);
              }}
              onSettleDebt={handleSettleDebt}
              onDeleteDebt={handleDeleteDebt}
              onOpenCategoryModal={() => setShowCategoryModal(true)}
            />
          </TabsContent>
        </Tabs>
      </div>
      <CategoryModal open={showCategoryModal} onOpenChange={(value) => setShowCategoryModal(value)} onConfirm={(newCategory: Category) => handleAddCategory(newCategory)}/>
      <ConfirmationModal
        open={showDeleteCategoryModal}
        onOpenChange={setShowDeleteCategoryModal}
        title="Delete Category"
        description="Are you sure you want to delete this category? This action cannot be undone."
        confirmLabel="Delete"
        cancelLabel="Cancel"
        variant="destructive"
        onConfirm={handleDeleteCategory}
      />
    </div>
  )
}
