import EventEmitter from "events";
import { Payment, FinishPayment, StatusCapturePayment, StatusFinishPayment, StatusGetPayment, WebhookGetPaymentBP } from '../models/payment.model';
import * as paymentService from "../services/payment.service";

const event = new EventEmitter();
const mapTimers = new Map<string, NodeJS.Timeout>();

export async function startPayment(req: any, res: any) {
    const payment = new Payment(req.body.itemId, req.body.amount, req.body.currency, req.body.clientId);
    const responseCreatePaymentBP = await paymentService.createPayment(payment);

    res.json({
        token: responseCreatePaymentBP.token
    });
}

export function finishPayment(req: any, res: any) {
    const finishPayment = new FinishPayment(req.body.itemId, req.body.clientId, req.body.status);

    const payment = paymentService.getPaymentByIds(finishPayment);

    if (payment === undefined || finishPayment.status === StatusFinishPayment.declined) {
        res.status(400).json(`payment for item = ${finishPayment.itemId} failed!`);
        paymentService.removePayment(payment);
    }
    else if (finishPayment.status === StatusFinishPayment.accepted) {

        // wait 10 seconds for the webhook callback
        const timer = setTimeout(async () => {
            // run this code only if the callback wasn't received in time
            const respGetPaymentResponseBP = await paymentService.getPaymentBP(payment);
            // call event to capture payment
            event.emit(payment.paymentReference!, respGetPaymentResponseBP.status);
        }, 10000);
        mapTimers.set(payment.paymentReference!, timer);

        // create event to call 'capture' from BP API. 'eventName' is the 'paymentReference' to avoid conflicts.
        // the event will be executed after the webhook callback or after calling 'get' from BP API
        event.once((payment?.paymentReference)!, async (status: StatusGetPayment) => {
            clearTimeout(mapTimers.get(payment.paymentReference!));

            if (status === StatusGetPayment.reserved) {
                const captureBP = await paymentService.capturePaymentBP(payment);

                if (captureBP.status === StatusCapturePayment.ok || captureBP.status === StatusCapturePayment.alreadyCaptured) {
                    res.status(200).json(`payment for item = ${payment.itemId} successful!`);
                    paymentService.removePayment(payment);
                } else {
                    res.status(400).json(`payment for item = ${payment.itemId} failed!`);
                    paymentService.removePayment(payment);
                }
            } else {
                // if status from GetPaymentBP is 'initiated', 'error', 'captured', or some garbage at this point, then it's an error
                res.status(400).json(`payment for item = ${payment.itemId} failed!`);
                paymentService.removePayment(payment);
            }

        });

    } else {
        // StatusFinishPayment.error or some garbage
        res.status(402).json({
            token: payment.token
        });
    }

}

export function webhookPayment(req: any, res: any) {
    const webhookBP = new WebhookGetPaymentBP(req.body.paymentReference, req.body.status);

    // call event to capture payment
    event.emit(webhookBP.paymentReference, webhookBP.status);

    res.sendStatus(200);
}

