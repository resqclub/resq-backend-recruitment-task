export class Payment {
  public constructor(
    public itemId: string,
    public amount: number,
    public currency: string,
    public clientId: string,
    public paymentReference?: string,
    public token?: string
  ) { }
}

export enum StatusFinishPayment {
  accepted = 'accepted',
  declined = 'declined',
  error = 'error'
}

export class FinishPayment {
  public constructor(
    public itemId: string,
    public clientId: string,
    public status: StatusFinishPayment
  ) { }
}

export class CreatePaymentBP {
  public constructor(
    public merchantReference: string,
    public amount: number,
    public currency: string,
    public webhookCallbackUrl: string
  ) { }
}

export class CreatePaymentResponseBP {
  public constructor(
    public paymentReference: string,
    public token: string
  ) { }
}

export class GetPaymentBP {
  public constructor(
    public paymentReference: string
  ) { }
}

export enum StatusGetPayment {
  initiated = 'initiated',
  reserved = 'reserved',
  error = 'error',
  captured = 'captured'
}

export class GetPaymentResponseBP {
  public constructor(
    public merchantReference: string,
    public amount: number,
    public currency: string,
    public status: StatusGetPayment
  ) { }
}

export class WebhookGetPaymentBP {
  public constructor(
    public paymentReference: string,
    public status: StatusGetPayment
  ) { }
}

export enum StatusCapturePayment {
  ok = 'ok',
  alreadyCaptured = 'alreadyCaptured',
  error = 'error'
}

export class CapturePaymentBP {
  public constructor(
    public status: StatusCapturePayment,
    public errorMessage: string
  ) { }
}
