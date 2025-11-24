import { Transaction } from "@/app/page";
import { Category } from "@/types/category";

export async function getTransactions() {
    try {
        const data: Transaction[] = await fetch("/transactions").then(data => data.json());
        return data;
    } catch (error: any) {
        throw Error(error);
    }
}