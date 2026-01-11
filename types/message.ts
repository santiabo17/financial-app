export enum ENTITY {
    CATEGORY = "Category",
    DEBT = "Debt",
    TRANSACTION = "Transaction"
}

export enum ACTION {
    FETCH = "FETCH",
    CREATE = "CREATE",
    UPDATE = "UPDATE",
    DELETE = "DELETE",
    PAY = "PAY"

}

export const ActionData =  {
    [ACTION.FETCH]: {
        action: "fetch",
        success: "fetched",
        error: "fetching"
    },
    [ACTION.CREATE]: {
        action: "create",
        success: "created",
        error: "creation"
    },
    [ACTION.UPDATE]: {
        action: "update",
        success: "updated",
        error: "update"
    },
    [ACTION.DELETE]: {
        action: "delete",
        success: "deleted",
        error: "deletion"
    },
    [ACTION.PAY]: {
        action: "pay",
        success: "paid",
        error: "payment"
    },
}