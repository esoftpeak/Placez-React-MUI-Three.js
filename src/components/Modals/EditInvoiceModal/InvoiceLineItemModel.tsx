export interface InvoiceLineItem {
  id?: number;
  layoutId?: string;
  guid?: string;
  description?: string;
  quantity?: number;
  price?: number;
  priceRateInHours?: number;
  notes?: string;
  total?: number;
  sortOrder?: number;
  inEdit?: boolean;
  taxRate?: number;
  group?: string;
  isTotalField?: boolean;
  uuid?: string;
}

export const keysOfInvoiceLineItem = [
  'id',
  'layoutId',
  'description',
  'quantity',
  'price',
  'priceRateInHours',
  'notes',
  'total',
  'sortOrder',
  'inEdit',
  'group',
];
