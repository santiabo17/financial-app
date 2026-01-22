import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { HandCoins, Plus } from "lucide-react"
import { Transaction, TYPE_ENUM } from "@/types/transaction"
import { CreateDebtForm, DEBT_STATUS_ENUM } from "@/types/debt"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Category, DefaultCategoriesEnum } from "@/types/category"
import { formatDate } from "@/lib/date"
import { useEffect, useMemo, useState } from "react"
import { useToast } from "./ui/use-toast"

interface DebtFormProps {
  onAddDebt: (debt: CreateDebtForm) => void
  onOpenCategoryModal: () => void
  onDeleteCategory: (id: number) => void
  categories: Category[]
  transactions: Transaction[]
}

export function DebtForm({ onAddDebt, onOpenCategoryModal, onDeleteCategory, categories, transactions }: DebtFormProps) {
    const [type, setType] = useState<boolean>(false);
    const [amount, setAmount] = useState("")
    const [person, setPerson] = useState("")
    const [description, setDescription] = useState("")
    const [date, setDate] = useState(new Date().toISOString().split("T")[0])
    const [categoryId, setCategoryId] = useState<number>();
    const [transactionId, setTransactionId] = useState<number>();
    const { toast } = useToast();

    const defaultStyle = "bg-background text-foreground hover:bg-foreground/40 hover:text-background";
    const selectedStyle = `outline-2 outline-offset-1 outline-double bg-foreground text-background outline-foreground hover:bg-foreground hover:text-background`;

    useEffect(() => {
        if(type == !!TYPE_ENUM.OUTCOME){
            setTransactionId(undefined);
        }
    }, [type]);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault()
        if (!amount || !categoryId || !person) return

        onAddDebt({
            type,
            amount: Number.parseFloat(amount),
            category_id: categoryId,
            transaction_id: transactionId || null,
            description: description || null,
            person: person,
            date: date,
            status: !!DEBT_STATUS_ENUM.NO_PAID
        })

        toast({
            title: "Debt Added",
            description: `${type === false ? "Payable" : "Receivable"} debt registered successfully.`,
            variant: "default",
        })

        setAmount("")
        setPerson("")
        setDescription("")
        setCategoryId(undefined)
        setTransactionId(undefined)
        setDate(new Date().toISOString().split("T")[0])
    }

    const completedMandatoryData = useMemo(() => {
        return !!amount && !!person && !!categoryId && !!date;
    }, [amount, person, categoryId, date]);

    const excededDebtAmount = useMemo(() => {
        if(!transactionId) return false;
        const transaction = transactions.find(transaction => transaction.id == transactionId);
        return (Number(amount) > (Number(transaction?.amount) - Number(transaction?.debts.reduce((acc, debt) => acc + (debt.status ? Number(debt.amount) : 0), 0))));
    }, [transactionId, amount]);

    return (
        <Card className="shadow-lg border-border/50 lg:sticky lg:top-24 lg:self-start">
          <CardHeader className="space-y-1">
            <CardTitle className="text-xl flex items-center gap-2">
              <div className="w-8 h-8 bg-foreground/10 rounded-lg flex items-center justify-center">
                <HandCoins className="w-4 h-4 text-foreground" />
              </div>
              Add Debt
            </CardTitle>
            <CardDescription>Register money owed or receivable</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Debt Type Toggle */}
              <div className="space-y-2">
                <Label className="text-sm font-medium">Debt Type</Label>
                <div className="grid grid-cols-2 gap-2">
                  <Button
                    type="button"
                    onClick={() => setType(false)}
                    className={`cursor-pointer gap-2 border 
                      ${type === !!TYPE_ENUM.INCOME ? selectedStyle : defaultStyle}`}
                  >
                    Income
                  </Button>
                  <Button
                    type="button"
                    onClick={() => setType(true)}
                    className={`cursor-pointer gap-2 border 
                      ${type === !!TYPE_ENUM.OUTCOME ? selectedStyle : defaultStyle}`}
                  >
                    Outcome
                  </Button>
                </div>
              </div>

              {/* Amount */}
              <div className="space-y-2">
                <Label htmlFor="debt-amount" className="text-sm font-medium">
                  Amount *
                </Label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground font-medium">$</span>
                  <Input
                    id="debt-amount"
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
                {
                  excededDebtAmount ? 
                  <span className="text-[13px]">Debt amount cannot be bigger than transaction pending</span> : null}
              </div>

              {/* Counterparty */}
              <div className="space-y-2">
                <Label htmlFor="counterparty" className="text-sm font-medium">
                  {type === !!TYPE_ENUM.OUTCOME ? "Who I Owe" : "Who Owes Me"} *
                </Label>
                <Input
                  id="person"
                  type="text"
                  placeholder="Name or entity"
                  value={person}
                  onChange={(e) => setPerson(e.target.value)}
                  className="h-11"
                  required
                />
              </div>

              <div className="space-y-2">
                <div className="flex justify-between">
                  <Label htmlFor="category" className="text-sm font-medium">Category *</Label>
                  <Button type="button" size={"sm"} className="cursor-pointer px-2 py-[3px] h-fit text-[12px] transition duration-300 border text-foreground bg-background hover:bg-foreground hover:text-background" onClick={() => onOpenCategoryModal()}>Add +</Button>
                </div>
                <Select value={(categoryId?.toString() || null) as any} onValueChange={(value) => setCategoryId(Number(value))} required>
                  <SelectTrigger id="category" className="!h-11 w-full">
                    <SelectValue placeholder="Select category" />
                  </SelectTrigger>
                  <SelectContent className={"bg-background text-foreground w-full"}>
                    {categories.filter(cat => cat.type == type).map((cat) => (
                      <SelectItem key={cat.id} value={cat.id.toString()} deleteFunc={!Object.values(DefaultCategoriesEnum).includes(cat.id) ? () => onDeleteCategory(cat.id) : undefined}>
                        <div className="flex items-center gap-2 !w-full !h-8">
                          {cat.name}
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {
                type == !!TYPE_ENUM.INCOME &&
                <div className="space-y-2">
                  <Label htmlFor="category" className="text-sm font-medium">Associated Transaction</Label>
                  <Select value={(transactionId?.toString() || null) as any} onValueChange={(value) => setTransactionId(value == "none" ? undefined : Number(value))}>
                    <SelectTrigger id="transaction" className="!h-11 w-full">
                      <SelectValue placeholder="Select transaction" />
                    </SelectTrigger>
                    <SelectContent className={"bg-background text-foreground"}>
                      <SelectItem value={"none"}>No Transaction</SelectItem>
                      {transactions.map((transaction) => (
                        <SelectItem key={transaction.id} value={transaction.id.toString()}>
                          {formatDate(transaction.date)} | {transaction.description || categories.find(cat => cat.id == transaction.id)?.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              }

              {/* Description */}
              <div className="space-y-2">
                <Label htmlFor="debt-description" className="text-sm font-medium">
                  Description
                </Label>
                <Input
                  id="debt-description"
                  type="text"
                  placeholder="What is this debt for?"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="h-11"
                />
              </div>

              {/* Date */}
              <div className="space-y-2">
                <Label htmlFor="debt-date" className="text-sm font-medium">
                  Date Registered *
                </Label>
                <Input
                  id="debt-date"
                  type="date"
                  value={date}
                  onChange={(e) => setDate(e.target.value)}
                  className="h-11"
                />
              </div>

              {/* Submit Button */}
              <Button type="submit" disabled={!completedMandatoryData || excededDebtAmount} className={`w-full gap-2 h-11 shadow-sm cursor-pointer transition duration-300 bg-foreground text-background hover:bg-foreground/10 hover:text-foreground border-0 hover:border-1 border-foreground`}>
                <Plus className="w-4 h-4" />
                Register Debt
              </Button>
            </form>
          </CardContent>
        </Card>
    )
}