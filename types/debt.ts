export interface Debt {
  id: number,
  type: boolean,
  amount: string,
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
  type: boolean,
  amount: number,
  category_id: number,
  transaction_id: number | null,
  person: string,
  description: string | null,
  date: string,
  status: boolean
}