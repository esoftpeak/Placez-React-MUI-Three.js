import { HPayPaymentLink } from '../../payments/models/Payment';

interface PaymentsApi {
  // Payments
  getPayments(accountId: number): any;
  createPaymentLink(payment: HPayPaymentLink): any;
}

export default PaymentsApi;
