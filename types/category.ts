export interface Category {
    id: number;
    name: string;
    type: boolean;
    color: string;
}

export enum CATEGORY_ENUM {
    INCOME = "false",
    OUTCOME = "true"
}