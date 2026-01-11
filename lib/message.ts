import { ACTION, ActionData, ENTITY } from "@/types/message";

export function successTitle(ACTION: ACTION){
    return `Succesful ${ActionData[ACTION].error}`
}

export function successMessage(ENTITY: ENTITY, ACTION: ACTION){
    return `${ENTITY} ${ActionData[ACTION].success} succesfully`
}

export function errorTitle(ACTION: ACTION){
    return `Failed ${ActionData[ACTION].error}`
}

export function errorMessage(ENTITY: ENTITY, ACTION: ACTION){
    return `Error during ${ENTITY} ${ActionData[ACTION].error}`
}