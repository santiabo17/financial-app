import { ApiResponse, ErrorResponse } from "@/types/api";
import { CreateDebtForm, Debt } from "@/types/debt";

export async function getDebts() {
    try {
        const response = await fetch("/api/debts");
        const result = await response.json();
        if (!response.ok) {
            const errorBody: ErrorResponse = result;
            throw new Error(errorBody.message || `HTTP error! Status: ${response.status}`);
        }
        const data: Debt[] = result;
        return data;
    } catch (error: any) {
        throw Error(error);
    }
}

export async function addDebt(debt: CreateDebtForm) {
    try {
        const data: ApiResponse<Debt> = await fetch("/api/debts", {
            body: JSON.stringify(debt),
            method: "POST",
        }).then(data => data.json());
        return data.data;
    } catch (error: any) {
        throw Error(error);
    }
}

export async function paidDebt(debtId: number) {
    try {
        const data: ApiResponse<Debt> = await fetch(`/api/debts?id=${debtId}`, {
            method: "PUT",
        }).then(data => data.json());
        return data.data;
    } catch (error: any) {
        throw Error(error);
    }
}

export async function deleteDebt(debtId: number) {
    try {
        const data: ApiResponse<null> = await fetch(`/api/debts?id=${debtId}`, {
            method: "DELETE",
        }).then(data => data.json());
        return data.success;
    } catch (error: any) {
        throw Error(error);
    }
}