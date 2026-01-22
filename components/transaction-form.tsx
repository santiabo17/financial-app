'use client'

import { useEffect, useMemo, useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectTrigger,
  SelectValue,
  SelectItem
} from '@/components/ui/select'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Plus, DollarSign, Minus, Edit2, Trash2 } from 'lucide-react'
import { Category, DefaultCategoriesEnum } from '@/types/category'
import { CreateTransactionForm, Transaction, TransactionType, TYPE_ENUM, TYPE_TEXT_ENUM } from '@/types/transaction'
import { useTheme } from 'next-themes'
import { useToast } from '@/hooks/use-toast'

interface TransactionFormProps {
  onSubmit: (transaction: CreateTransactionForm) => void
  onDeleteTransaction: (id: number) => void
  onDeleteCategory: (id: number) => void
  onOpenCategoryModal: () => void
  categories: Category[]
  transaction: Transaction | null
  onCleanTransaction: () => void;
}

export function TransactionForm({ onSubmit, onDeleteTransaction, onDeleteCategory, onCleanTransaction, onOpenCategoryModal, categories, transaction }: TransactionFormProps) {
  const { theme } = useTheme();
  const { toast } = useToast()

  const [type, setType] = useState<Boolean>(!!TYPE_ENUM.INCOME);
  const [amount, setAmount] = useState('');
  const [categoryId, setCategoryId] = useState<number>();
  const [description, setDescription] = useState('');
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);

  const handleReset = () => {
    setAmount('')
    setCategoryId(undefined)
    setDescription('')
    setDate(new Date().toISOString().split('T')[0])
  }

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
    handleReset();
  }

  useEffect(() => {
    if(transaction){
      setType(transaction.type);
      setAmount(transaction.amount);
      setCategoryId(transaction.category_id);
      setDescription(transaction.description);
      setDate(transaction.date.split('T')[0]);
    } else {
      handleReset();
    }
  }, [transaction]);

  const categoriesOptions = useMemo(() => {
    return categories.filter(category => category.type == type);
  }, [categories, categoryId, type]); 

  const defaultStyle = theme == "light" ? "bg-white text-black" : "bg-black text-white";
  const selectedStyle = `outline-2 outline-offset-1 outline-double ${theme == "light" ? "bg-black text-white outline-black hover:bg-black" : "bg-white text-black outline-white hover:bg-white"}`;

  const completedMandatoryData = useMemo(() => {
    return !!amount && !!categoryId && !!date;
  }, [amount, categoryId, date]);

  return (
    <div>

      <Card className="shadow-lg border-border/50 pt-4">
        <CardHeader className="space-y-1">
          <CardTitle className="text-xl flex items-center gap-2">
            <div className="w-8 h-8 bg-foreground/10 rounded-lg flex items-center justify-center">
              <DollarSign className="w-4 h-4 text-foreground" />
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
                    ${type === !!TYPE_ENUM.INCOME ? selectedStyle : defaultStyle}
                    `}
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
                    ${type === !!TYPE_ENUM.OUTCOME ? selectedStyle : defaultStyle}
                    `}
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
              <div className="flex justify-between">
                <Label htmlFor="category" className="text-sm font-medium">Category *</Label>
                <Button type="button" size={"sm"} className="cursor-pointer px-2 py-[3px] h-fit text-[12px] border text-background bg-foreground hover:bg-background hover:text-foreground" onClick={() => onOpenCategoryModal()}>Add +</Button>
              </div>
              <Select value={(categoryId ? categoryId?.toString() : null) as any} 
              onValueChange={(value) => value && setCategoryId(Number(value))} 
              required>
                <SelectTrigger id="category" className="!h-11 w-full">
                  <SelectValue placeholder="Select category" />
                </SelectTrigger>
                <SelectContent className={theme == "dark" ? "bg-black text-white" : "bg-white text-black"}>
                  {categoriesOptions.map((cat) => (
                    <SelectItem key={cat.id} value={cat.id.toString()} deleteFunc={!Object.values(DefaultCategoriesEnum).includes(cat.id) ? () => onDeleteCategory(cat.id) : undefined}>
                       <div className="flex items-center gap-2 !w-full !h-8">
                          {cat.name}
                        </div>
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

            {
              transaction ? 
              <div className='flex'>
                <Button type="button" className={`flex-1 gap-2 h-11 rounded-r-none shadow-sm cursor-pointer ${theme == "light" ? "bg-white text-black border border-black" : "bg-black text-white border border-white"}`} onClick={() => onCleanTransaction()}>
                  <Minus className="w-4 h-4" />
                  Cancel
                </Button>
                <Button type="submit" className={`flex-1 gap-2 h-11 rounded-l-none shadow-sm cursor-pointer ${theme == "light" ? "bg-black text-white hover:bg-black" : "bg-white text-black hover:bg-white"}`} disabled={!completedMandatoryData}>
                  <Edit2 className="w-4 h-4" />
                  Update
                </Button>
              </div>
              :
              <Button type="submit" className={`w-full gap-2 h-11 shadow-sm cursor-pointer ${theme == "light" ? "bg-black text-white" : "bg-white text-black"}`} disabled={!completedMandatoryData}>
                <Plus className="w-4 h-4" />
                Log Transaction
              </Button>
            }
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
