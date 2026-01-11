import { ApiResponse, ErrorResponse } from "@/types/api";
import { Category, CreateCategoryForm } from "@/types/category";
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

export async function addCategory(category: CreateCategoryForm) {
    try {
        const data: ApiResponse<Category> = await fetch("/api/categories", {
            body: JSON.stringify(category),
            method: "POST",
        }).then(data => data.json());
        return data.data;
    } catch (error: any) {
        throw Error(error);
    }
}

export async function deleteCategory(debtId: number) {
    try {
        const data: ApiResponse<null> = await fetch(`/api/categories?id=${debtId}`, {
            method: "DELETE",
        }).then(data => data.json());
        return data.success;
    } catch (error: any) {
        throw Error(error);
    }
}