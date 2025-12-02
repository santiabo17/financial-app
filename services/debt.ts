import { ApiResponse } from "@/types/api";
import { CreateDebtForm, Debt } from "@/types/debt";

export async function getDebts() {
    try {
        const data: Debt[] = await fetch("/api/debts").then(data => data.json());
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
        console.log("error: ", error, "data: ", debt);
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