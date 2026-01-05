'use client'

import { useEffect, useMemo, useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui-old/card'
import { ViewMode } from '@/app/page'
import { Button } from '@/components/ui-old/button'
import { Trash2, PieChartIcon, BarChart3, Receipt, TrendingUp } from 'lucide-react'
import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip, BarChart, Bar, XAxis, YAxis, CartesianGrid, LineChart, Line } from 'recharts'
import { cn } from '@/lib/utils'
import { Category } from '@/types/category'
import { Transaction, TYPE_ENUM } from '@/types/transaction'
import { getCategories } from '@/services/category'
import { ConfirmationModal } from './confirmation-modal'
import { toast } from './ui/use-toast'
import { Separator } from '@radix-ui/react-select'

interface VisualizationPanelProps {
  transactions: Transaction[]
  viewMode: ViewMode
  onDeleteTransaction: (id: number) => void
}

const Outcome_COLORS = [
  '#ef4444', // red
  '#f97316', // orange
  '#f59e0b', // amber
  '#eab308', // yellow
  '#84cc16', // lime
  '#22c55e', // green
  '#14b8a6', // teal
  '#06b6d4', // cyan
  '#3b82f6', // blue
  '#8b5cf6', // violet
]

export function VisualizationPanel({
  transactions,
  viewMode,
  onDeleteTransaction,
}: VisualizationPanelProps) {
  const [allCategories, setAllCategories] = useState<Category[]>([]);
  const [selectedTransactionId, setSelectedTransactionId] = useState<number | null>(null)
  const [deleteModalOpen, setDeleteModalOpen] = useState(false)

  useEffect(() => {
    const fetchCategories = async () => {
      const categoriesData = await getCategories();
      setAllCategories(categoriesData);
    }
    fetchCategories();
  }, []);

  const confirmDelete = () => {
    if (selectedTransactionId) {
      onDeleteTransaction(selectedTransactionId)
      toast({
        title: "Transaction Deleted",
        description: "Transaction entry has been removed.",
        variant: "destructive",
      })
    }
  }


  const { outcomesByCategory, monthlyData, filteredTransactions, categoryEvolutionData } = useMemo(() => {
    const now = new Date()
    const currentMonth = now.getMonth()
    const currentYear = now.getFullYear()

    const filtered = transactions.filter((t) => {
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

    // Outcomes by category for pie chart
    const outcomeMap = new Map<string, number>()
    filtered
      .filter((t) => t.type === !!TYPE_ENUM.OUTCOME)
      .forEach((t) => {
        const category = allCategories.find(cat => cat.id == t.category_id)?.name || "";
        outcomeMap.set(category, (outcomeMap.get(category) || 0) + Number(t.amount) - t.debts?.reduce((acc, d) => acc + (d.status ? Number(d.amount) : 0), 0))
      })

    const outcomesByCategory = Array.from(outcomeMap.entries())
      .map(([name, value]) => ({ name, value }))
      .sort((a, b) => b.value - a.value)

    // Monthly trend data for bar chart (only for yearly view)
    const monthlyData: { month: string; income: number; outcomes: number }[] = []
    if (viewMode === 'yearly') {
      const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']
      for (let i = 0; i < 12; i++) {
        const monthTransactions = transactions.filter((t) => {
          const d = new Date(t.date)
          return d.getFullYear() === currentYear && d.getMonth() === i
        })
        const income = monthTransactions
          .filter((t) => t.type === !!TYPE_ENUM.INCOME)
          .reduce((sum, t) => sum + Number(t.amount), 0)
        const outcomes = monthTransactions
          .filter((t) => t.type === !!TYPE_ENUM.OUTCOME)
          .reduce((sum, t) => sum + Number(t.amount), 0)
        monthlyData.push({ month: months[i], income, outcomes })
      }
    }

    const categoryEvolutionData: any[] = []
    
    if (viewMode === 'monthly') {
      // For monthly view, show day-by-day evolution
      const daysInMonth = new Date(currentYear, currentMonth + 1, 0).getDate()
      
      for (let day = 1; day <= daysInMonth; day++) {
        const dataPoint: any = { period: day.toString() }
        
        // Get all categories
        const categories = new Set(filtered.filter(t => t.type === !!TYPE_ENUM.OUTCOME).map(t => allCategories.find(category => category.id == t.category_id)).filter(category => !!category));
        
        // For each category, sum up outcomes up to this day (cumulative)
        categories.forEach(category => {
          const categoryTotal = filtered
            .filter(t => 
              t.type === !!TYPE_ENUM.OUTCOME && 
              t.category_id === category?.id && 
              new Date(t.date).getDate() <= day
            )
            .reduce((sum, t) => sum + Number(t.amount), 0)
          dataPoint[category?.id] = categoryTotal
        })

        console.log("categories: ", categories, filtered, dataPoint);
        
        categoryEvolutionData.push(dataPoint)
      }
    } else {
      // For yearly view, show month-by-month evolution
      const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']
      
      for (let month = 0; month < 12; month++) {
        const dataPoint: any = { period: months[month] }
        
        // Get all categories from the year
        const categories = new Set(
          transactions
            .filter(t => t.type === !!TYPE_ENUM.OUTCOME && new Date(t.date).getFullYear() === currentYear)
            .map(t => allCategories.find(category => category.id == t.category_id))
            .filter(category => !!category)
        )
        
        // For each category, sum up outcomes up to this month (cumulative)
        categories.forEach(category => {
          const categoryTotal = transactions
            .filter(t => {
              const d = new Date(t.date)
              return (
                t.type === !!TYPE_ENUM.OUTCOME && 
                t.category_id === category.id && 
                d.getFullYear() === currentYear &&
                d.getMonth() <= month
              )
            })
            .reduce((sum, t) => sum + Number(t.amount), 0)
          dataPoint[category.id] = categoryTotal
        })
        
        categoryEvolutionData.push(dataPoint)
      }
    }

    return { outcomesByCategory, monthlyData, filteredTransactions: filtered, categoryEvolutionData }
  }, [allCategories, transactions, viewMode])

  const categories = useMemo(() => {
    return Array.from(
      new Set(
        filteredTransactions
          .filter(t => t.type === !!TYPE_ENUM.OUTCOME)
          .map(t => allCategories.find(category => category.id == t.category_id))
          .filter(category => !!category)
      )
    )
  }, [filteredTransactions])

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(amount)
  }

  return (
    <div className="grid gap-6 lg:grid-cols-2">
      {/* Outcomes by Category - Pie Chart */}
      <Card className="lg:col-span-1 shadow-lg border-border/50">
        <CardHeader>
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-destructive/10 rounded-lg flex items-center justify-center">
              <PieChartIcon className="w-4 h-4 text-destructive" />
            </div>
            <div>
              <CardTitle>Outcomes by Category</CardTitle>
              <CardDescription className="text-xs">Spending breakdown</CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {outcomesByCategory.length > 0 ? (
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={outcomesByCategory}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, percent }) =>
                    `${name} ${(percent * 100).toFixed(0)}%`
                  }
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {outcomesByCategory.map((entry, index) => (
                    <Cell
                      key={`cell-${index}`}
                      fill={Outcome_COLORS[index % Outcome_COLORS.length]}
                    />
                  ))}
                </Pie>
                <Tooltip formatter={(value) => formatCurrency(value as number)} />
              </PieChart>
            </ResponsiveContainer>
          ) : (
            <div className="h-[300px] flex flex-col items-center justify-center text-muted-foreground">
              <PieChartIcon className="w-12 h-12 mb-3 opacity-20" />
              <p className="text-sm">No outcome data to display</p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Monthly Trend - Bar Chart (Yearly View Only) */}
      {viewMode === 'yearly' && (
        <Card className="lg:col-span-1 shadow-lg border-border/50">
          <CardHeader>
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 bg-primary/10 rounded-lg flex items-center justify-center">
                <BarChart3 className="w-4 h-4 text-primary" />
              </div>
              <div>
                <CardTitle>Monthly Trend</CardTitle>
                <CardDescription className="text-xs">Yearly overview</CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={monthlyData}>
                <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                <XAxis dataKey="month" className="text-xs" />
                <YAxis className="text-xs" />
                <Tooltip formatter={(value) => formatCurrency(value as number)} />
                <Legend />
                <Bar dataKey="income" fill="#22c55e" name="Income" radius={[4, 4, 0, 0]} />
                <Bar dataKey="outcomes" fill="#ef4444" name="Outcomes" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      )}

      {/* Category Evolution Chart - Line Chart */}
      {categories.length > 0 && (
        <Card className="lg:col-span-2 shadow-lg border-border/50">
          <CardHeader>
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 bg-primary/10 rounded-lg flex items-center justify-center">
                <TrendingUp className="w-4 h-4 text-primary" />
              </div>
              <div>
                <CardTitle>Category Evolution</CardTitle>
                <CardDescription className="text-xs">
                  {viewMode === 'monthly' ? 'Daily cumulative spending' : 'Monthly cumulative spending'}
                </CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={350}>
              <LineChart data={categoryEvolutionData}>
                <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                <XAxis 
                  dataKey="period" 
                  className="text-xs"
                  label={{ 
                    value: viewMode === 'monthly' ? 'Day' : 'Month', 
                    position: 'insideBottom', 
                    offset: -5 
                  }}
                />
                <YAxis 
                  className="text-xs"
                  label={{ 
                    value: 'Amount ($)', 
                    angle: -90, 
                    position: 'insideLeft' 
                  }}
                />
                <Tooltip 
                  formatter={(value) => formatCurrency(value as number)}
                  contentStyle={{
                    backgroundColor: 'hsl(var(--background))',
                    border: '1px solid hsl(var(--border))',
                    borderRadius: '8px',
                  }}
                />
                <Legend wrapperStyle={{
                  paddingTop: "20px"
                }}/>
                {categories.map((category, index) => (
                  <Line
                    key={category.id}
                    type="monotone"
                    dataKey={category.id}
                    stroke={Outcome_COLORS[index % Outcome_COLORS.length]}
                    strokeWidth={2}
                    dot={false}
                    name={category.name}
                  />
                ))}
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      )}

      {/* Recent Transactions */}
      <Card className="lg:col-span-2 shadow-lg border-border/50">
        <CardHeader>
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-primary/10 rounded-lg flex items-center justify-center">
              <Receipt className="w-4 h-4 text-primary" />
            </div>
            <div>
              <CardTitle>Recent Transactions</CardTitle>
              <CardDescription className="text-xs">Your latest activity</CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {filteredTransactions.length > 0 ? (
            <div className="space-y-2 max-h-[400px] overflow-y-auto pr-2">
              {filteredTransactions.slice(0, 20).map((transaction) => (
              <div className='p-4 rounded-xl border-2 border-border/50'>  
                <div
                  key={transaction.id}
                  className="flex items-center justify-between bg-muted/30 hover:bg-muted/50 transition-colors "
                >
                  <div className="flex-1 min-w-0 flex items-center gap-3">
                    <div
                      className={cn(
                        'w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0',
                        transaction.type === !!TYPE_ENUM.INCOME ? 'bg-success/10' : 'bg-destructive/10'
                      )}
                    >
                      <div
                        className={`w-2 h-2 rounded-full ${
                          transaction.type === !!TYPE_ENUM.INCOME ? 'bg-success' : 'bg-destructive'
                        }`}
                      />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-baseline gap-2">
                        <span className="font-semibold text-foreground">
                          {allCategories.find(cat => cat.id == transaction.category_id)?.name}
                        </span>
                        <span className="text-xs text-muted-foreground">
                          {new Date(transaction.date).toLocaleDateString('en-US', {
                            month: 'short',
                            day: 'numeric'
                          })}
                        </span>
                      </div>
                      {transaction.description && (
                        <p className="text-sm text-muted-foreground truncate">
                          {transaction.description}
                        </p>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <span
                      className={`font-bold text-base ${
                        transaction.type === !!TYPE_ENUM.INCOME ? 'text-success' : 'text-destructive'
                      }`}
                    >
                      {transaction.type === !!TYPE_ENUM.INCOME ? '+' : '-'}
                      {formatCurrency(Number(transaction.amount) - transaction.debts?.reduce((acc, debt) => acc += debt.status ? Number(debt.amount) : 0, 0))}
                    </span>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => {setSelectedTransactionId(transaction.id); setDeleteModalOpen(true);}}
                      className="text-muted-foreground hover:text-destructive h-8 w-8 cursor-pointer"
                    >
                      <Trash2 className="w-4 h-4" />
                      <span className="sr-only">Delete transaction</span>
                    </Button>
                  </div>
                </div>
                {transaction.debts?.length > 0 &&
                <>
                <Separator
                  data-slot="button-group-separator"
                  className="bg-gray-200/60 w-full h-[.7px] self-stretch mx-0 my-2"
                />
                <div >
                  <h4 className="font-semibold text-foreground mb-1">Debts</h4>
                  <div className='flex flex-col gap-3'>
                    {transaction.debts?.map(debt => <div className={`border ${debt.status ? 'border-success text-success bg-success/5' : 'border-destructive text-destructive bg-destructive/5'} border-border/50 rounded-lg p-2 flex justify-between items-center`}>
                      <h5 className={`text-sm w-full p-1 rounded-md`}>{debt.person} - {formatCurrency(Number(debt.amount))}{debt?.description ? ` - ${debt.description}` : ''}</h5>
                      <h5 className={`text-sm h-fit !mb-0`}>
                        {debt.status ? "Paid" : "Owed"}
                      </h5>
                    </div>)}
                  </div>
                </div>
                </>
                }
              </div>
              ))}
            </div>
          ) : (
            <div className="py-16 text-center">
              <Receipt className="w-16 h-16 mx-auto mb-4 text-muted-foreground/20" />
              <p className="text-muted-foreground font-medium">No transactions yet</p>
              <p className="text-sm text-muted-foreground/70 mt-1">Add your first transaction to get started</p>
            </div>
          )}
        </CardContent>
      </Card>
      <ConfirmationModal
        open={deleteModalOpen}
        onOpenChange={setDeleteModalOpen}
        title="Delete Transaction"
        description="Are you sure you want to delete this transaction entry? This action cannot be undone."
        confirmLabel="Delete"
        cancelLabel="Cancel"
        variant="destructive"
        onConfirm={confirmDelete}
      />
    </div>
  )
}
