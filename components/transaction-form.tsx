'use client'

import { useEffect, useMemo, useState } from 'react'
import { Button } from '@/components/ui-old/button'
import { Input } from '@/components/ui-old/input'
import { Label } from '@/components/ui-old/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui-old/select'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui-old/card'
import { Plus, DollarSign } from 'lucide-react'
import { Category } from '@/types/category'
import { getCategories } from '@/services/category'
import { CreateTransactionForm, TransactionType, TYPE_ENUM, TYPE_TEXT_ENUM } from '@/types/transaction'
import { useTheme } from 'next-themes'
import { useToast } from '@/hooks/use-toast'
import { ConfirmationModal } from './confirmation-modal'

interface TransactionFormProps {
  onSubmit: (transaction: CreateTransactionForm) => void
  onDeleteTransaction: (id: number) => void
}

export function TransactionForm({ onSubmit, onDeleteTransaction }: TransactionFormProps) {
  const { theme } = useTheme();
  const { toast } = useToast()

  const [type, setType] = useState<Boolean>(!!TYPE_ENUM.INCOME)
  const [amount, setAmount] = useState('')
  const [categories, setCategories] = useState<Category[]>([]);
  const [categoryId, setCategoryId] = useState<number>();
  const [description, setDescription] = useState('')
  const [date, setDate] = useState(new Date().toISOString().split('T')[0])

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const categoriesData = await getCategories(type ? TYPE_TEXT_ENUM.OUTCOME : TYPE_TEXT_ENUM.INCOME );
        console.log("categoriesData: ", categoriesData);
        setCategories(categoriesData);
      } catch (error) {
        console.log("error: ", error);
        toast({
          title: "Error",
          description: `Problem fetching categories.`,
          variant: "default",
        })
        setCategories([]);
      }
    }
    fetchCategories();
  }, [type]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!amount || !categoryId) return

    onSubmit({
      type: type == !!TYPE_ENUM.INCOME ? false : true,
      amount: parseFloat(amount),
      category_id: categoryId,
      description,
      date,
    })

    // Reset form
    setAmount('')
    setCategoryId(undefined)
    setDescription('')
    setDate(new Date().toISOString().split('T')[0])
  }

  const defaultStyle = theme == "light" ? "bg-white text-black" : "bg-black text-white";
  const selectedStyle = `outline-2 outline-offset-1 outline-double ${theme == "light" ? "bg-black text-white outline-black" : "bg-white text-black outline-white"}`;

  const completedMandatoryData = useMemo(() => {
    return !!amount && !!categoryId && !!date;
  }, [amount, categoryId, date]);

  return (
    <div>

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
                  onClick={() => {
                    setType(!!TYPE_ENUM.INCOME)
                    setCategoryId(undefined)
                  }}
                  className={`cursor-pointer gap-2 border 
                    ${type === !!TYPE_ENUM.INCOME ? selectedStyle : defaultStyle}`}
                >
                  Income
                </Button>
                <Button
                  type="button"
                  onClick={() => {
                    setType(!!TYPE_ENUM.OUTCOME)
                    setCategoryId(undefined)
                  }}
                  className={`cursor-pointer gap-2 border 
                    ${type === !!TYPE_ENUM.OUTCOME ? selectedStyle : defaultStyle}`}
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

            {/* CategoryId */}
            <div className="space-y-2">
              <Label htmlFor="category" className="text-sm font-medium">Category *</Label>
              <Select value={categoryId?.toString()} onValueChange={(value) => setCategoryId(Number(value))} required>
                <SelectTrigger id="category" className="h-11 w-full">
                  <SelectValue placeholder="Select category" />
                </SelectTrigger>
                <SelectContent className={theme == "dark" ? "bg-black text-white" : "bg-white text-black"}>
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
              <Label htmlFor="date" className="text-sm font-medium">Date *</Label>
              <Input
                id="date"
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="h-11"
              />
            </div>

            {/* Submit Button */}
            <Button type="submit" className={`w-full gap-2 h-11 shadow-sm cursor-pointer ${theme == "light" ? "bg-black text-white" : "bg-white text-black"}`} disabled={!completedMandatoryData}>
              <Plus className="w-4 h-4" />
              Log Transaction
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
