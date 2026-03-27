export default interface Attendee {
  id?: number;
  firstName?: string;
  lastName?: string;
  tableId?: string;
  chairNumber?: number;
  selected?: boolean;
  group?: string;
  meal?: string;
  allergies?: string;
  email?: string;
  phone?: string;
  rsvp?: string;
  tableInfo?: string;
  badNumber?: string;
  ['#']?: string;
}

export const AttendeeMetadata: (keyof Attendee)[] = [
  'firstName',
  'lastName',
  'tableInfo',
  'chairNumber',
  'group',
  'meal',
  'allergies',
  'email',
  'phone',
  'rsvp',
];
