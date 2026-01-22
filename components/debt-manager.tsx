"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { useToast } from "@/hooks/use-toast"
import { HandCoins, Check, Trash2, ArrowDownRight, ArrowUpRight } from "lucide-react"
import { ConfirmationModal } from "./confirmation-modal"
import { Transaction, TYPE_ENUM } from "@/types/transaction"
import { CreateDebtForm, Debt, DEBT_STATUS_ENUM } from "@/types/debt"
import { Category } from "@/types/category"
import { DebtForm } from "./debt-form"

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
  const [settleModalOpen, setSettleModalOpen] = useState(false)
  const [deleteModalOpen, setDeleteModalOpen] = useState(false)
  const [selectedDebtId, setSelectedDebtId] = useState<number | null>(null)
  const [activeTab, setActiveTab] = useState("payable")
  const { toast } = useToast()

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

  return (
    <>
      <div className="grid grid-cols-1 lg:grid-cols-[340px_1fr] gap-6">
        <DebtForm onAddDebt={onAddDebt} onOpenCategoryModal={onOpenCategoryModal} onDeleteCategory={onDeleteCategory} categories={categories} transactions={transactions}/>
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
                        <div className="flex flex-col sm:flex-row items-start justify-between gap-4">
                          <div className="flex-1 space-y-2">
                            <div className="flex items-center gap-2">
                              <Badge className="font-semibold bg-destructive text-white">
                                ${Number(debt.amount).toFixed(2)}
                              </Badge>
                              <span className="text-sm font-medium">{debt.person}</span>
                              <span>|</span>
                              <span className={`text-sm font-medium font-semibold text-foreground`}>
                                {categories.find(cat => cat.id == debt.category_id)?.name}
                              </span>
                              {categories.find(cat => cat.id == debt.category_id) && 
                                <div
                                  className={`w-2 h-2 rounded-full bg-[${categories.find(cat => cat.id == debt.category_id)?.color}]`}
                                  style={{backgroundColor: categories.find(cat => cat.id == debt.category_id)?.color}}
                                />
                              }
                            </div>
                            {debt.description && <p className="text-sm text-muted-foreground">{debt.description}</p>}
                            <p className="text-xs text-muted-foreground">
                              Registered: {new Date(debt.date).toLocaleDateString()}
                            </p>
                          </div>
                          <div className="w-full h-[.6px] bg-foreground/60 block sm:hidden"></div>
                          <div className="flex ml-auto sm:ml-0 gap-2">
                            <Button
                              size="sm"
                              variant="default"
                              onClick={() => handleSettleDebt(debt.id)}
                              className="gap-1 border cursor-pointer bg-background hover:bg-foreground hover:text-background transition duration-300"
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
                        <div className="flex flex-col sm:flex-row items-start justify-between gap-4">
                          <div className="flex-1 space-y-2">
                            <div className="flex items-center gap-2">
                              <Badge variant="default" className="bg-success hover:bg-success/90 text-white font-semibold">
                                ${Number(debt.amount).toFixed(2)}
                              </Badge>
                              <span className="text-sm font-medium">{debt.person}</span>
                              <span>|</span>
                              <span className={`text-sm font-medium font-semibold text-foreground`}>
                                {categories.find(cat => cat.id == debt.category_id)?.name}
                              </span>
                              {categories.find(cat => cat.id == debt.category_id) && 
                                <div
                                  className={`w-2 h-2 rounded-full bg-[${categories.find(cat => cat.id == debt.category_id)?.color}]`}
                                  style={{backgroundColor: categories.find(cat => cat.id == debt.category_id)?.color}}
                                />
                              }
                            </div>
                            {debt.description && <p className="text-sm text-muted-foreground">{debt.description}</p>}
                            <p className="text-xs text-muted-foreground">
                              Registered: {new Date(debt.date).toLocaleDateString()}
                            </p>
                          </div>
                          <div className="w-full h-[.6px] bg-foreground/60 block sm:hidden"></div>
                          <div className="flex ml-auto sm:ml-0 gap-2">
                            <Button
                              size="sm"
                              variant="default"
                              onClick={() => handleSettleDebt(debt.id)}
                              className="gap-1 bg-background hover:bg-foreground hover:text-background transition duration-300 border cursor-pointer"
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
