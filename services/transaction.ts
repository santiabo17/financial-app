import { ApiResponse, ErrorResponse } from "@/types/api";
import { CreateTransactionForm, Transaction } from "@/types/transaction";

export async function getTransactions({order}: {order?: string}) {
    try {
        const response = await fetch(`/api/transactions?order=${order}`);
        const result = await response.json();

        if (!response.ok) {
            const errorBody: ErrorResponse = result;
            throw new Error(errorBody.message || `HTTP error! Status: ${response.status}`);
        }

        const data: Transaction[] = result;
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
        throw Error(error);
    }
}

export async function updateTransaction(id: number, transaction: CreateTransactionForm) {
    try {
        const data: ApiResponse<Transaction> = await fetch(`/api/transactions?id=${id}`, {
            body: JSON.stringify(transaction),
            method: "PUT",
        }).then(data => data.json());
        return data.data;
    } catch (error: any) {
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