import axios from "axios";
import { Payment, GetPaymentBP, CapturePaymentBP, StatusCapturePayment, GetPaymentResponseBP, StatusGetPayment, CreatePaymentBP, CreatePaymentResponseBP } from "../models/payment.model";

const headers = {
    'Accept': 'application/json',
    'Content-Type': 'application/json'
};

export async function createPayment(payment: Payment) {
    try {
        const res = await axios.post('https://bp.pay/v2/payments/create',
            JSON.stringify(new CreatePaymentBP('unique merchantReference', payment.amount, payment.currency, 'http://localhost:3000/payment/webhook')),
            { headers: headers });

        const responseCreatePayment = await res.data as CreatePaymentResponseBP;
        // TODO validations

        return responseCreatePayment;
    } catch (err: any) {
        // TODO implement error handling
        console.log(err.message);

        // TODO remove fake response
        return new CreatePaymentResponseBP('paymentReference' + payment.clientId + payment.itemId, 'token');
    }
}

export async function capturePayment(payment: Payment) {
    try {
        const res = await axios.post('https://bp.pay/v2/payments/capture',
            JSON.stringify(new GetPaymentBP(payment.paymentReference!)), {
                headers: headers, 
                timeout: 5000
             });

        const responseCaptureBP = res.data as CapturePaymentBP;
        // TODO validations

        return responseCaptureBP;
    } catch (err: any) {
        // TODO implement error handling
        console.log(err.message);

        // TODO remove fake response
        return new CapturePaymentBP(StatusCapturePayment.ok, '');
    }
}

export async function getPayment(payment: Payment) {
    try {
        const res = await axios.get('https://bp.pay/v2/payments/get', {
            headers: headers,
            data: JSON.stringify(new GetPaymentBP(payment.paymentReference!)),
            timeout: 5000
        });

        const getPaymentResponseBP = await res.data as GetPaymentResponseBP;
        // TODO validations

        return getPaymentResponseBP;
    } catch (err: any) {
        // TODO implement error handling
        console.log(err.message);

        // TODO remove fake response
        return new GetPaymentResponseBP('unique merchantReference', payment.amount, payment.currency, StatusGetPayment.reserved);
    }
}

/*
    const res = await axios.get('https://bp.pay/v2/payments/capture', {
        params: new GetPaymentBP(payment.paymentReference!),
        headers: headers
    });
*/