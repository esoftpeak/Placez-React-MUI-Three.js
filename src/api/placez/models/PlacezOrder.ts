import { InvoiceLineItem } from '../../../components/Invoicing/InvoiceLineItemModel';

enum OrderStatus {
  Sent,
  Paid,
  Canceled,
  Overdue,
}

export default interface PlacezOrder {
  id: number;
  status: OrderStatus;
  notes: string;
  invoiceLineItems: InvoiceLineItem[];
  sceneId: number;
  // payments: Payment[];
  discountTotal: number;
  taxTotal: number;
  subTotal: number;
  paid: number;
  balanceDue: number;
  total: number;
}
