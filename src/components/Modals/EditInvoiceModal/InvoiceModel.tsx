import { InvoiceLineItem } from './InvoiceLineItemModel';

type PaymentsType = 'CC | ACH Both';
type LogoPosition = 'Top Left' | 'Top Right' | 'Center';
enum PaymentLinkType {
  Validation = 1,
  //...
}

export interface Invoice {
  amountToCharge: number;
  availablePaymentTypes: PaymentsType;
  ccEmail: string;
  backgroundColor: string;
  paymentNumber: string; // GUID
  payor_address: {
    line1: string;
    line2: string;
    city: string;
    country: string;
    postalCode: number;
    stateProvince: string;
  };
  payorEmail: string;
  payor: string; //name
  dueDate: string;
  encodedLogo: string;
  encodedLogoPosition: LogoPosition;
  expirationDate: string;
  invoiceIntroductionMessage: string;
  invoiceMessage: string;
  invoiceNumber: string; // event id date time
  accountId?: string; // merchant account id
  merchantName: string;
  paymentLinkType: number; // need types
  zipCode: string; // billing zip of payor
  productName: string; //Caterease , placez
  replyEmail: string;
  sendEmail: boolean;
  senderName: string;
  showCardOnFileDialog: boolean;
  showTip: boolean;
  textColor: string;
  transaction_details: {
    itemized_receipt: InvoiceLineItem[];
    note: string;
  };
}

export type taxCategory = {
  value: number;
  label: string;
}

export const taxCategories: taxCategory[] = [
  {
    value: 0,
    label: 'None'
  },
  {
    value: 0.07,
    label: 'Goods'
  },
  {
    value: 0.09,
    label: 'Alcohol'
  },
]
