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
import { Transaction, TYPE_ENUM, TYPE_TEXT_ENUM } from "@/types/transaction"
import { CreateDebtForm, Debt, DEBT_STATUS_ENUM } from "@/types/debt"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "./ui/select"
import { Category, DefaultCategoriesEnum } from "@/types/category"
import { getCategories } from "@/services/category"
import { formatDate } from "@/lib/date"

interface DebtManagerProps {
  debts: Debt[]
  transactions: Transaction[]
  categories: Category[]
  onAddDebt: (debt: CreateDebtForm) => void
  onSettleDebt: (id: number) => void
  onDeleteDebt: (id: number) => void
  onDeleteCategory: (id: number) => void
  onOpenCategoryModal: () => void
}

export function DebtManager({ debts, transactions, categories, onAddDebt, onSettleDebt, onDeleteDebt, onDeleteCategory, onOpenCategoryModal }: DebtManagerProps) {
  const [type, setType] = useState<boolean>(false)
  const [amount, setAmount] = useState("")
  const [person, setPerson] = useState("")
  const [description, setDescription] = useState("")
  const [date, setDate] = useState(new Date().toISOString().split("T")[0])
  const [settleModalOpen, setSettleModalOpen] = useState(false)
  const [deleteModalOpen, setDeleteModalOpen] = useState(false)
  const [selectedDebtId, setSelectedDebtId] = useState<number | null>(null)
  const [categoryId, setCategoryId] = useState<number>();
  const [transactionId, setTransactionId] = useState<number>();
  const [activeTab, setActiveTab] = useState("payable")
  const { toast } = useToast()
  const { theme } = useTheme();

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

    // Reset form
    setAmount("")
    setPerson("")
    setDescription("")
    setCategoryId(undefined)
    setTransactionId(undefined)
    setDate(new Date().toISOString().split("T")[0])
  }

  const handleSettleDebt = (id: number) => {
    setSelectedDebtId(id)
    setSettleModalOpen(true)
  }

  const handleDeleteDebt = (id: number) => {
    setSelectedDebtId(id)
    setDeleteModalOpen(true)
  }

  const confirmSettle = () => {
    if (selectedDebtId) {
      onSettleDebt(selectedDebtId)
      const debt = debts.find((d) => d.id === selectedDebtId)
      toast({
        title: "Debt Paid",
        description: `Transaction ${debt?.transaction_id ? `${debt.transaction_id} updated` : 'created'} for ${debt?.type === !!TYPE_ENUM.OUTCOME ? "payment" : "receipt"} of $${debt?.amount}.`,
        variant: "default",
      })
    }
  }

  const confirmDelete = () => {
    if (selectedDebtId) {
      onDeleteDebt(selectedDebtId)
      toast({
        title: "Debt Deleted",
        description: "Debt entry has been removed.",
        variant: "destructive",
      })
    }
  }

  const activeDebts = debts.filter((d) => d.status === !!DEBT_STATUS_ENUM.NO_PAID)
  const payableDebts = activeDebts.filter((d) => d.type === !!TYPE_ENUM.OUTCOME)
  const receivableDebts = activeDebts.filter((d) => d.type === !!TYPE_ENUM.INCOME)

  const selectedDebt = debts.find((d) => d.id === selectedDebtId)

  const defaultStyle = theme == "light" ? "bg-white text-black" : "bg-black text-white";
  const selectedStyle = `outline-2 outline-offset-1 outline-double ${theme == "light" ? "bg-black text-white outline-black" : "bg-white text-black outline-white"}`;

  const completedMandatoryData = useMemo(() => {
    return !!amount && !!person && !!categoryId && !!date;
  }, [amount, person, categoryId, date]);

  const excededDebtAmount = useMemo(() => {
    if(!transactionId) return false;
    const transaction = transactions.find(transaction => transaction.id == transactionId);
    return (Number(amount) > (Number(transaction?.amount) - Number(transaction?.debts.reduce((acc, debt) => acc + (debt.status ? Number(debt.amount) : 0), 0))));
  }, [transactionId, amount]);

  return (
    <>
      <div className="grid lg:grid-cols-[340px_1fr] gap-6">
        {/* Left - Add Debt Form */}
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
                {/* <div className="grid grid-cols-2 gap-2">
                  <Button
                    type="button"
                    variant={type === "payable" ? "default" : "outline"}
                    onClick={() => setType("payable")}
                    className={
                      type === "payable"
                        ? "bg-destructive hover:bg-destructive/90 text-destructive-foreground shadow-sm"
                        : ""
                    }
                  >
                    <ArrowDownRight className="w-4 h-4 mr-1" />I Owe
                  </Button>
                  <Button
                    type="button"
                    variant={type === "receivable" ? "default" : "outline"}
                    onClick={() => setType("receivable")}
                    className={
                      type === "receivable" ? "bg-success hover:bg-success/90 text-success-foreground shadow-sm" : ""
                    }
                  >
                    <ArrowUpRight className="w-4 h-4 mr-1" />
                    Owed to Me
                  </Button>
                </div> */}
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
                  <Button type="button" size={"sm"} className="cursor-pointer px-2 py-[3px] h-fit text-[12px] border text-background bg-foreground hover:bg-background hover:text-foreground" onClick={() => onOpenCategoryModal()}>Add +</Button>
                </div>
                <Select value={(categoryId?.toString() || null) as any} onValueChange={(value) => setCategoryId(Number(value))} required>
                  <SelectTrigger id="category" className="!h-11 w-full">
                    <SelectValue placeholder="Select category" />
                  </SelectTrigger>
                  <SelectContent className={theme == "dark" ? "bg-black text-white w-full" : "bg-white text-black w-full"}>
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
                    <SelectContent className={theme == "dark" ? "bg-black text-white" : "bg-white text-black"}>
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
              <Button type="submit" disabled={!completedMandatoryData || excededDebtAmount} className={`w-full gap-2 h-11 shadow-sm cursor-pointer ${theme == "light" ? "bg-black text-white" : "bg-white text-black"}`}>
                <Plus className="w-4 h-4" />
                Register Debt
              </Button>
            </form>
          </CardContent>
        </Card>

        {/* Right - Debt Lists */}
        <Card className="shadow-lg border-border/50">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <HandCoins className="w-5 h-5" />
              Active Debts
            </CardTitle>
            <CardDescription>Track and manage your debts</CardDescription>
          </CardHeader>
          <CardContent>
            <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
              <TabsList className="grid w-full grid-cols-2 mb-6">
                <TabsTrigger value="payable" className={`gap-2 cursor-pointer ${activeTab == "payable" ? 'underline underline-offset-5' : ''}`}>
                  <ArrowDownRight className="w-4 h-4" />I Owe ({payableDebts.length})
                </TabsTrigger>
                <TabsTrigger value="receivable" className={`gap-2 cursor-pointer ${activeTab != "payable" ? 'underline underline-offset-5' : ''}`}>
                  <ArrowUpRight className="w-4 h-4" />
                  Owed to Me ({receivableDebts.length})
                </TabsTrigger>
              </TabsList>

              <TabsContent value="payable" className="space-y-3">
                {payableDebts.length === 0 ? (
                  <div className="text-center py-12 text-muted-foreground">
                    <ArrowDownRight className="w-12 h-12 mx-auto mb-3 opacity-20" />
                    <p>No payable debts</p>
                  </div>
                ) : (
                  payableDebts.map((debt) => (
                    <Card key={debt.id} className="bg-muted/50 border-destructive/20">
                      <CardContent className="">
                        <div className="flex items-start justify-between gap-4">
                          <div className="flex-1 space-y-2">
                            <div className="flex items-center gap-2">
                              <Badge className="font-semibold bg-destructive">
                                ${Number(debt.amount).toFixed(2)}
                              </Badge>
                              <span className="text-sm font-medium">{debt.person}</span>
                            </div>
                            {debt.description && <p className="text-sm text-muted-foreground">{debt.description}</p>}
                            <p className="text-xs text-muted-foreground">
                              Registered: {new Date(debt.date).toLocaleDateString()}
                            </p>
                          </div>
                          <div className="flex gap-2">
                            <Button
                              size="sm"
                              variant="default"
                              onClick={() => handleSettleDebt(debt.id)}
                              className="gap-1 border cursor-pointer bg-black"
                            >
                              <Check className="w-3 h-3" />
                              Paid
                            </Button>
                            <Button size="sm" variant="ghost" className="cursor-pointer" onClick={() => handleDeleteDebt(debt.id)}>
                              <Trash2 className="w-3 h-3" />
                            </Button>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))
                )}
              </TabsContent>

              <TabsContent value="receivable" className="space-y-3">
                {receivableDebts.length === 0 ? (
                  <div className="text-center py-12 text-muted-foreground">
                    <ArrowUpRight className="w-12 h-12 mx-auto mb-3 opacity-20" />
                    <p>No receivable debts</p>
                  </div>
                ) : (
                  receivableDebts.map((debt) => (
                    <Card key={debt.id} className="bg-muted/50 border-success/20">
                      <CardContent className="">
                        <div className="flex items-start justify-between gap-4">
                          <div className="flex-1 space-y-2">
                            <div className="flex items-center gap-2">
                              <Badge variant="default" className="bg-success hover:bg-success/90 font-semibold">
                                ${Number(debt.amount).toFixed(2)}
                              </Badge>
                              <span className="text-sm font-medium">{debt.person}</span>
                            </div>
                            {debt.description && <p className="text-sm text-muted-foreground">{debt.description}</p>}
                            <p className="text-xs text-muted-foreground">
                              Registered: {new Date(debt.date).toLocaleDateString()}
                            </p>
                          </div>
                          <div className="flex gap-2">
                            <Button
                              size="sm"
                              variant="default"
                              onClick={() => handleSettleDebt(debt.id)}
                              className="gap-1 bg-success hover:bg-success/90 border cursor-pointer"
                            >
                              <Check className="w-3 h-3" />
                              Received
                            </Button>
                            <Button size="sm" variant="ghost" className="cursor-pointer" onClick={() => handleDeleteDebt(debt.id)}>
                              <Trash2 className="w-3 h-3" />
                            </Button>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))
                )}
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      </div>

      {/* Settle Confirmation Modal */}
      <ConfirmationModal
        open={settleModalOpen}
        onOpenChange={setSettleModalOpen}
        title={`Confirm ${selectedDebt?.type === !!TYPE_ENUM.OUTCOME ? "Payment" : "Receipt"}`}
        description={
          selectedDebt
            ? `Are you sure you want to mark this debt as paid? This will ${selectedDebt.transaction_id ? "reduce the debt related" :
              `create a ${selectedDebt.type === !!TYPE_ENUM.OUTCOME ? "outcome" : "income"}`
              } transaction ${!selectedDebt.transaction_id ? 'for' : ''} $${selectedDebt.amount} and update your balance.`
            : ""
        }
        confirmLabel={selectedDebt?.type === !!TYPE_ENUM.OUTCOME ? "Mark as Paid" : "Mark as Received"}
        cancelLabel="Cancel"
        variant="default"
        onConfirm={confirmSettle}
      />

      {/* Delete Confirmation Modal */}
      <ConfirmationModal
        open={deleteModalOpen}
        onOpenChange={setDeleteModalOpen}
        title="Delete Debt"
        description="Are you sure you want to delete this debt entry? This action cannot be undone."
        confirmLabel="Delete"
        cancelLabel="Cancel"
        variant="destructive"
        onConfirm={confirmDelete}
      />
    </>
  )
}
