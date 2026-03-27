import { GuestAccessClaims } from './GuestAccessClaims';

export default interface ShareLayoutRequest {
  layoutId: string;
  sendUpdateNotificationsToTokenCreator?: boolean;
  users: SharedUser[];
}

export interface SharedUser {
  email: string;
  name: string;
  expirationUtcDateTime?: Date;
  guestAccess?: GuestAccessClaims[];
}
