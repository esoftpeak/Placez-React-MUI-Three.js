export default interface InvoiceFormat {
  createdUtcDateTime: string;
  lastModifiedUtcDateTime: string;
  createdBy: string;
  lastModifiedBy: string;
  deleted: boolean;
  id: number;
  venueName: boolean;
  venueAddress: boolean;
  businessPhone: boolean;
  businessEmail: boolean;
  eventName: boolean;
  eventAddress: boolean;
  eventCategory: boolean;
  guestCount: boolean;
  payment: boolean;
  paymentMethod: boolean;
  paymentDate: boolean;
  amount: boolean;
  payorName: boolean;
  topNotes: string;
  bottomNotes: string;
  footer: string;
  displayCentered: boolean;
  timeAndPageCount: boolean;
  organizationId: number;
}
