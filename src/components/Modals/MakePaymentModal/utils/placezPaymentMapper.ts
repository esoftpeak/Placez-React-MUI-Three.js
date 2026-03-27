import {
  CC_TRANSACTION_ID,
  PAYMENT_PROCESSOR_TRANSACTION_ID,
} from './constant';

export const placezPaymentMapper = ({
  hPayPaymentMethods,
  hPayPayments,
  email,
  postalCode,
  state,
  payor,
  sceneId,
  dueDate
}: {
  hPayPaymentMethods: any;
  hPayPayments: any;
  email: string;
  postalCode: string;
  state: string;
  payor: string;
  sceneId: string;
  dueDate: string
}) => ({
  ccTransactionId: CC_TRANSACTION_ID,
  paymentProcessorTransactionId: PAYMENT_PROCESSOR_TRANSACTION_ID,
  state,
  orderId: null,
  transactionType: 'Sale',
  paymentMethod: 'card',
  cardIssuer: hPayPaymentMethods?.credit_card?.card_brand,
  maskedCardNumber: hPayPaymentMethods?.id,
  madeBy: email,
  email,
  payor,
  sceneId,
  totalOwed: 0,
  receivedBy: null,
  comment: '',
  ccPostal: postalCode,
  ccStatus: hPayPayments.status,
  ccAuthCode: hPayPayments.id,
  totalPaid: hPayPayments.amount,
  totalTip: 0,
  totalSurcharge: 0,
  totalRefund: 0,
  dueDate,
  dateApplied: new Date(hPayPayments.create_time * 1000).toISOString(),
});
