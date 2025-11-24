import { Category } from "@/types/category";

export async function getCategories() {
    try {
        const data: Category[] = await fetch("/categories").then(data => data.json());
        return data;
    } catch (error: any) {
        throw Error(error);
    }
}