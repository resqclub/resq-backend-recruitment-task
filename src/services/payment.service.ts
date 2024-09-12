import { FinishPayment, Payment } from "../models/payment.model";
import { removeFromArray } from "../utils";
import * as bpService from "./bp.service";

// variable that works like a really simple in-memory database
export const payments: Payment[] = [];


export async function createPayment(payment: Payment) {
    payments.push(payment);

    const responseCreatePaymentBP = await bpService.createPayment(payment);

    payment.token = responseCreatePaymentBP.token;
    payment.paymentReference = responseCreatePaymentBP.paymentReference;

    return responseCreatePaymentBP;
}

export function getPaymentByIds(finishPayment: FinishPayment) {
    return payments.find(p => p.clientId === finishPayment.clientId && p.itemId === finishPayment.itemId);
}

export function removePayment(payment: Payment | undefined) {
    if (payment !== undefined) {
        removeFromArray(payments, payment);
    }
}

export async function getPaymentBP(payment: Payment) {
    return bpService.getPayment(payment);
}

export async function capturePaymentBP(payment: Payment) {
    return bpService.capturePayment(payment);
}

