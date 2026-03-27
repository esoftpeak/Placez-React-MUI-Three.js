import { InvoiceLineItem } from '../../../components/Invoicing/InvoiceLineItemModel';
import { PlacezAddress } from '../../placez/models/PlacezAddress';

export interface MerchantAccount {
  name?: string;
  connectedAccountId?: string;
  enableAVS?: boolean;
  status?: string;
  id?: string;
}

export interface PaymentDetails {
  totalAmount: number;
  currency?: string;
  serviceChargeAmount?: number;
  dicountAmount?: number;
  taxAmount?: number;
  tipAmount?: number;
  subTotal: number;
}

export interface HPayPaymentTransactions {
  state: TransactionState;
  message?: string;
  paymentDetails?: PaymentDetails;
  id?: string;
}

enum TransactionState {
  None = 'None',
  Authorize = 'Authorize',
  RequiresAction = 'RequiresAction',
  Capture = 'Captuer',
  Cancel = 'Cancel',
  Refund = 'Refund',
  Declined = 'Declined',
  Error = 'Error',
  Offline = 'Offline',
  Adjustment = 'Adjustment',
}

enum PaymentLinkStatus {
  Failed = 'Failed',
  Created = 'Created',
  Initialized = 'Initialized',
  Paid = 'Paid',
  Expired = 'Expired',
  Rejected = 'Rejected',
  Canceled = 'Canceled',
  Pending = 'Pending',
  Refund = 'Refund',
  AmexRejected = 'AmexRejected',
  Authorized = 'Authorized',
}

enum PaymentLinkType {
  PaymentLink,
  AuthorizedLink,
  ValidationLink,
}

// export default interface HPayPayment {
//   accountId: string;
//   actionUrl?: string;
//   autoCapture?: boolean;
//   cardIssuer?: string;
//   createdUtc: string;
//   disableTips?: boolean;
//   hPayPaymentTransactions?: HPayPaymentTransactions[];
//   id?: string;
//   idPayment: string;
//   maskedCardNumber?: string;
//   merchantAccount: MerchantAccount;
//   message?: string;
//   nameOnCard?: string;
//   paymentNumber: string;
//   refundId?: string;
//   state: TransactionState;
//   totalAmount: number;
//   totalPaid: number;
//   totalRefund: number;
//   totalServiceCharge: number;
//   totalTip: number;

//   transaction_details: TransactionDetails;
// }

export default interface HPayPayment {
  paymentId: string;
  id: string;
  ccTransactionId?: string | null;
  paymentProcessorTransactionId?: string | null;
  orderId: number;
  state: TransactionState;
  transactionType?: string | null;
  paymentMethod?: string;
  cardIssuer?: string | null;
  maskedCardNumber?: string | null;
  madeBy?: string | null;
  receivedBy?: string;
  comment?: string | null;
  ccPostal?: string | null;
  ccStatus?: string | null;
  ccAuthCode?: string | null;
  totalPaid: number;
  totalTip: number;
  totalSurcharge: number;
  totalRefund: number;
  dateApplied: Date;
  eventName?: string;
  eventStartDate?: string;
  accountLastFour?: string;
  createdUtcDateTime?: string;
  lastStatusChangeUtcDateTime?: string;

  payor: string;
  email: string;
  sceneId: string;
  dueDate: Date;
  expirationDate: Date;
  totalOwed: number;

  //temp
  payor_address: PlacezAddress;
}

export enum EncodedLogoPosition {
  left = 'left',
  right = 'right',
  center = 'center',
}

export enum PaymentTypes {
  CC = 'Credit Card',
  Cash = 'Cash',
  Check = 'Check',
}

export enum AvailablePaymentTypes {
  'CC' = 'cc',
  'ACH' = 'ach',
  'BOTH' = 'both',
}

export const DefaultPaymentLinkSettings: PaymentLinkSettings = {
  currency: 'USD',
  saveCardOnFile: true,
  showCardOnFileDialog: false,
  availablePaymentTypes: AvailablePaymentTypes.BOTH, // CC, ACH, PayPal
  paymentLinkType: 0,
  isMailSent: true,
  // backgroundColor?:	string,
  showTip: false,
  // textColor?:	string,
  encodedLogoPosition: EncodedLogoPosition.left,
  invoiceMessage:
    ' If you have any question regarding this credit card authorization, please call our office. Thanks again for doing business with Placez. Regards, Your Placez Team ',
  invoiceIntroductionMessage:
    'Thank you for choosing PLACEZ for your recent order. Please click the button below to authorize and store your credit card for future payments on your order.',
  paymentTermsNet: 30,
  excludeAmex: true,
  textColor: '#000000',
};

export interface HPayPaymentMethods {
  id?: string;
  paymentMethodId: string;
  type?: string;
  maskedcc: string;
  paymentNumber?: string;
}

export interface TransactionDetails {
  note?: string;
  itemized_receipt: ItemizedReceiptLineItem[];
}

export type ItemizedReceiptLineItem = {
  amount: number;
  currency: string;
  description?: string;
  item_price: number;
  quantity: number;
};

// export interface HPayPayment {
//     "rbits": [
//         {
//           "type": "address",
//           "receive_time": 2085851003,
//           "source": "user",
//           "address": PlacezAddress,
//         },
//         {
//             "type": "transaction_details",
//             "receive_time": 2085851003,
//             "source": "partner_database",
//             "transaction_details": {
//                 "itemized_receipt": [
//                     {
//                         "amount": 10000,
//                         "currency": "USD",
//                         "description": "New Delivery",
//                         "item_price": 10000,
//                         "quantity": 1
//                     },
//                     {
//                         "amount": 1000,
//                         "currency": "USD",
//                         "description": "Tip",
//                         "item_price": 1000,
//                         "quantity": 1
//                     }
//                 ],
//                 "note": ""
//             }
//         }
//     ],
//     "amount": number,
//     "tip": number,
//     "applySurcharge": boolean,
//     "surchargeRate": number,
//     "serialNumber": "USA34080",
//     "auto_capture": true,
//     "currency": "USD",
//     "custom_data": {
//         "ce_contact_id": "00001-00000000000304",
//         "ce_contact_num": "Q00304",
//         "ce_order_id": "00001-00000000000015",
//         "ce_order_num": "Q00015",
//         "ce_transaction_type": "Sale"
//     },
//     "fee_amount": 0,
//     "initiated_by": "customer",
//     "account_id": "1b6de8fb-203f-4984-9bdc-059f9c11e10c",
//     "payment_method": {
//         "credit_card": {
//             "auto_update": false,
//             "card_holder": {
//                 "address": {
//                     "country": "US",
//                     "postal_code": "03087"
//                 },
//                 "email": "sonny.elhamahmy@gmail.com",
//                 "holder_name": "Sonny EL"
//             },
//             "card_on_file": true,
//             "virtual_terminal_mode": "web"
//         },
//         "token": {
//             "id": "payment_methods-5a9bb5e8-bdb6-4c5f-832c-8962f3c8faef"
//         }
//     }
// }

export interface HPayPaymentLink {
  accountId: string;
  paymentNumber: string;
  invoiceNumber: string;
  paymentId?: string;
  iframeUrl?: string;
  payer?: string;
  payor?: string;
  sendEmail?: boolean;
  currency?: string;
  payerEmail?: string;
  payorEmail?: string;
  ccEmail?: string;
  senderName?: string;
  replyEmail?: string;
  saveCardOnFile?: boolean;
  showCardOnFileDialog?: boolean;
  availablePaymentTypes?: AvailablePaymentTypes;
  storeCardForEventOnly?: boolean;
  amountToCharge: number;
  serviceFee?: number;
  paymentLinkStatus?: PaymentLinkStatus;
  paymentLinkType?: PaymentLinkType;
  isMailSent?: boolean;
  backgroundColor?: string;
  encodedLogo?: string;
  payor_address?: PlacezAddress;
  transaction_details: TransactionDetails;
  dueDate: string;
  expirationDate: string;
  merchantName: string;
  productName: string;
  showTip?: boolean;
  textColor?: string;
  encodedLogoPosition?: EncodedLogoPosition;
  invoiceMessage?: string;
  invoiceIntroductionMessage?: string;
  zipCode?: string;
  paymentMethods?: HPayPaymentMethods;
  statusModifiedUtcDateTime?: string;
  excludeAmex?: boolean;
  surchargePercent: number;
  subSystem: number;
  serialNumber: string;
  createdUtcDateTime?: any;
}

export interface PaymentLinkSettings extends Partial<HPayPaymentLink> {
  paymentTermsNet?: number;
}

export const formatItemizedReceipt = (
  lineItems: InvoiceLineItem[]
): ItemizedReceiptLineItem[] => {
  return lineItems
    .filter((lineItem) => lineItem.price)
    .map((lineItem) => {
      return {
        amount: lineItem.total,
        currency: 'USD',
        description: lineItem.description,
        item_price: lineItem.price,
        quantity: lineItem.quantity,
      };
    });
};

export interface HpayPaymentPayload {
  rbits: Rbit[];
  amount: number;
  tip: number;
  applySurcharge: boolean;
  surchargeRate: number;
  serialNumber: string;
  auto_capture: boolean;
  currency: string;
  custom_data: CustomData;
  fee_amount: number;
  initiated_by: string;
  account_id: string;
  payment_method: PaymentMethod;
}

interface Rbit {
  type: string;
  receive_time: number;
  source: string;
  address?: {
    origin_address: {
      line1: string;
      city: string;
      postal_code: string;
      country: string;
      region: string;
    };
  };
  transaction_details?: TransactionDetailsObject;
}

interface TransactionDetailsObject {
  itemized_receipt: ItemizedReceipt[];
  note: string;
}

interface ItemizedReceipt {
  amount: number;
  currency: string;
  description: string;
  item_price: number;
  quantity: number;
}

interface CustomData {
  ce_contact_id: string;
  ce_contact_num: string;
  ce_order_id: string;
  ce_order_num: string;
  ce_transaction_type: string;
}

interface PaymentMethod {
  credit_card: CreditCard;
  token: Token;
}

interface CreditCard {
  auto_update: boolean;
  card_holder: CardHolder;
  card_on_file: boolean;
  virtual_terminal_mode: string;
}

interface CardHolder {
  address: Address;
  email: string;
  holder_name: string;
}

interface Address {
  country: string;
  postal_code: string;
}

interface Token {
  id: string;
}
