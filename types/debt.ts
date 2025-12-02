export interface Debt {
  id: number,
  type: Boolean,
  amount: number,
  category_id: number,
  transaction_id: number | null,
  person: string,
  description: string  | null,
  date: string,
  status: boolean
}

export enum DEBT_STATUS_ENUM {
  NO_PAID = 0,
  PAID = 1
}

export interface CreateDebtForm {
  type: Boolean,
  amount: number,
  category_id: number,
  transaction_id?: number,
  person: string,
  description?: string,
  date: string,
  status: Boolean
}