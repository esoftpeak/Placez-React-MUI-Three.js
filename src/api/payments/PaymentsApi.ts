import { AuthenticatedBase } from '../AuthenticatedBase';

import HPayPayment, { HPayPaymentLink } from './models/Payment';

export default class PaymentsApi
  extends AuthenticatedBase
  implements PaymentsApi
{
  private url: string =
    'https://dev-payment-gateway.horizoncloud.com/api/hpay/';

  constructor(url: string) {
    super();
    this.url = url;

    this.createPaymentLink = this.createPaymentLink.bind(this);
    this.getPaymentLinks = this.getPaymentLinks.bind(this);
    this.createPayment = this.createPayment.bind(this);
    this.getHPayPaymentMethods = this.getHPayPaymentMethods.bind(this);
    this.createHpaySurcharge = this.createHpaySurcharge.bind(this);
  }

  public async createPaymentLink(payment: HPayPaymentLink) {
    return await super.post<any>(
      `${this.url}/api/hpay/payment-link/payment`,
      payment
    );
  }

  public async extendPaymentLink(
    paymentNumber: string,
    expirationDate: string
  ) {
    return await super.post<any>(`${this.url}/api/hpay/payment-link/extend`, {
      paymentNumber,
      expirationDate,
    });
  }

  public async cancelPaymentLink(paymentNumber: string) {
    return await super.post<any>(`${this.url}/api/hpay/payment-link/cancel`, {
      paymentNumber,
    });
  }

  public async resendPaymentLink(paymentNumber: string) {
    return await super.post<any>(`${this.url}/api/hpay/payment-link/resend`, {
      paymentNumber,
    });
  }

  public async getPaymentLinks(
    params: {
      accountId: string;
      invoiceNumber?: string;
      pageNumber?: number;
      pageSize?: number;
    },
    options?: any
  ) {
    const query = new URLSearchParams({
      accountId: params.accountId,
      ...(params.invoiceNumber && { invoiceNumber: params.invoiceNumber }),
      pageNumber: String(params.pageNumber ?? 1),
      pageSize: String(params.pageSize ?? 20),
    });

    return await super.get<any>(
      `${this.url}/payment-link/search?${query.toString()}`,
      options
    );
  }

  public async createPayment(payment: HPayPayment, options?: any) {
    return await super.post<any>(
      `${this.url}/api/hpay/placez/payments/`,
      payment,
      undefined,
      options
    );
  }

  public async createHpaySurcharge(payment: HPayPayment, options?: any) {
    return await super.post<any>(
      `${this.url}/api/hpay/payment/applySurcharge`,
      payment,
      undefined,
      options
    );
  }

  public async getHPayPaymentMethods(options?: any) {
    return await super.get<any>(
      `${this.url}/api/hpay/payment_methods/${options.paymentMethodsId}`,
      undefined,
      options
    );
  }
}
