'use client'

import { useEffect, useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Transaction, TransactionType } from '@/app/page'
import { Plus, DollarSign } from 'lucide-react'
import { Category } from '@/types/category'
import { getCategories } from '@/services/category'

const INCOME_CATEGORIES = ['Salary', 'Freelance', 'Investment', 'Other']
const EXPENSE_CATEGORIES = [
  'Rent/Mortgage',
  'Groceries',
  'Transportation',
  'Utilities',
  'Entertainment',
  'Debt',
  'Other',
]

interface TransactionFormProps {
  onSubmit: (transaction: Omit<Transaction, 'id'>) => void
}

export function TransactionForm({ onSubmit }: TransactionFormProps) {
  const [type, setType] = useState<TransactionType>('outcome')
  const [amount, setAmount] = useState('')
  const [categories, setCategories] = useState<Category[]>([]);
  const [category, setCategory] = useState<number>();
  const [description, setDescription] = useState('')
  const [date, setDate] = useState(new Date().toISOString().split('T')[0])

  useEffect(() => {
    const fetchCategories = async () => {
      const categoriesData = await getCategories();
      setCategories(categoriesData);
    }
    fetchCategories();
  }, [type]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!amount || !category) return

    onSubmit({
      type,
      amount: parseFloat(amount),
      category,
      description,
      date,
    })

    // Reset form
    setAmount('')
    setCategory(undefined)
    setDescription('')
    setDate(new Date().toISOString().split('T')[0])
  }

  return (
    <Card className="shadow-lg border-border/50">
      <CardHeader className="space-y-1">
        <CardTitle className="text-xl flex items-center gap-2">
          <div className="w-8 h-8 bg-primary/10 rounded-lg flex items-center justify-center">
            <DollarSign className="w-4 h-4 text-primary" />
          </div>
          Add Transaction
        </CardTitle>
        <CardDescription>Log your income or outcomes</CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Transaction Type Toggle */}
          <div className="space-y-2">
            <Label className="text-sm font-medium">Transaction Type</Label>
            <div className="grid grid-cols-2 gap-2">
              <Button
                type="button"
                variant={type === 'income' ? 'default' : 'outline'}
                onClick={() => {
                  setType('income')
                  setCategory(undefined)
                }}
                className={
                  type === 'income'
                    ? 'bg-success hover:bg-success/90 text-success-foreground shadow-sm'
                    : ''
                }
              >
                Income
              </Button>
              <Button
                type="button"
                variant={type === 'outcome' ? 'default' : 'outline'}
                onClick={() => {
                  setType('outcome')
                  setCategory(undefined)
                }}
                className={
                  type === 'outcome'
                    ? 'bg-destructive hover:bg-destructive/90 text-destructive-foreground shadow-sm'
                    : ''
                }
              >
                Outcome
              </Button>
            </div>
          </div>

          {/* Amount */}
          <div className="space-y-2">
            <Label htmlFor="amount" className="text-sm font-medium">Amount *</Label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground font-medium">
                $
              </span>
              <Input
                id="amount"
                type="number"
                step="0.01"
                min="0"
                placeholder="0.00"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                className="pl-7 h-11"
                required
              />
            </div>
          </div>

          {/* Category */}
          <div className="space-y-2">
            <Label htmlFor="category" className="text-sm font-medium">Category *</Label>
            <Select value={category?.toString()} onValueChange={(value) => setCategory(Number(value))} required>
              <SelectTrigger id="category" className="h-11">
                <SelectValue placeholder="Select category" />
              </SelectTrigger>
              <SelectContent>
                {categories.map((cat) => (
                  <SelectItem key={cat.id} value={cat.id.toString()}>
                    {cat.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Description */}
          <div className="space-y-2">
            <Label htmlFor="description" className="text-sm font-medium">Description</Label>
            <Input
              id="description"
              type="text"
              placeholder="Brief note..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="h-11"
            />
          </div>

          {/* Date */}
          <div className="space-y-2">
            <Label htmlFor="date" className="text-sm font-medium">Date</Label>
            <Input
              id="date"
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              className="h-11"
            />
          </div>

          {/* Submit Button */}
          <Button type="submit" className="w-full gap-2 h-11 shadow-sm">
            <Plus className="w-4 h-4" />
            Log Transaction
          </Button>
        </form>
      </CardContent>
    </Card>
  )
}
