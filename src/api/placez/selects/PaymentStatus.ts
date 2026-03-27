export enum PaymentStatus {
  Paid = 0,
  InvoiceSent = 1,
}

// Define a type for the status-color mappings
type PaymentProperties = {
  [key in PaymentStatus]: { color: string; label: string }; // string can be replaced with a more specific type if you have predefined color values
};

// Example of using the mapping
const paymentStatuses: PaymentProperties = {
  [PaymentStatus.Paid]: {
    color: '#FAB436',
    label: 'Tenative',
  },
  [PaymentStatus.InvoiceSent]: {
    label: 'Completed',
    color: '#0AAF60',
  },
};

export default paymentStatuses;
