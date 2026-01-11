export type TransactionType = 'income' | 'outcome'

export enum TYPE_ENUM {
  INCOME = 0,
  OUTCOME = 1
}

export enum TYPE_TEXT_ENUM {
  INCOME = "income",
  OUTCOME = "outcome"
}

// export const  TypesData = {
//     [TYPE_ENUM.INCOME]: false,
//     [TYPE_ENUM.OUTCOME]: true
// }

export interface Transaction {
  id: number
  type: boolean
  amount: string
  category_id: number
  description: string
  date: string
  debts: TransactionDebt[]
}

export interface TransactionDebt {
  id: number
  amount: string
  status: boolean
  person: string | null
  description: string | null
}

export interface CreateTransactionForm {
    type: boolean
    amount: number
    category_id: number
    description: string
    date: string
}
