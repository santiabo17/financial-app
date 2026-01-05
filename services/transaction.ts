import { ApiResponse } from "@/types/api";
import { CreateTransactionForm, Transaction } from "@/types/transaction";

export async function getTransactions({order}: {order?: string}) {
    try {
        const data: Transaction[] = await fetch(`/api/transactions?order=${order}`).then(data => data.json());
        return data;
    } catch (error: any) {
        throw Error(error);
    }
}

export async function addTransaction(transaction: CreateTransactionForm) {
    try {
        const data: ApiResponse<Transaction> = await fetch("/api/transactions", {
            body: JSON.stringify(transaction),
            method: "POST",
        }).then(data => data.json());
        return data.data;
    } catch (error: any) {
        console.log("error: ", error, "data: ", transaction);
        throw Error(error);
    }
}

export async function deleteTransaction(transactionId: number) {
    try {
        const data: ApiResponse<null> = await fetch(`/api/transactions?id=${transactionId}`, {
            method: "DELETE",
        }).then(data => data.json());
        return data.success;
    } catch (error: any) {
        throw Error(error);
    }
}