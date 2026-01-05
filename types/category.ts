export interface Category {
    id: number;
    name: string;
    type: boolean;
    color: string;
}

export enum DefaultCategoriesEnum {
  Salary = 1,
  Investments = 2,
  GiftRefund = 3,
  Freelance = 4,
  RentMortgage = 5,
  Groceries = 6,
  Transportation = 7,
  Utilities = 8,
  Entertainment = 9,
  DebtPayments = 10,
}