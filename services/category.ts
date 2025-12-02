import { ErrorResponse } from "@/types/api";
import { Category } from "@/types/category";
import { TransactionType } from "@/types/transaction";

export async function getCategories(type?: TransactionType) {
    let url = "/api/categories";
    if (type) {
        url += `?type=${type}`;
    }
    try {
        const response = await fetch(url);

        if (!response.ok) {
            const errorBody: ErrorResponse = await response.json();
            throw new Error(errorBody.message || `HTTP error! Status: ${response.status}`);
        }

        const data: Category[] = await response.json();
        return data;
    } catch (error: any) {
        throw error;
    }
}