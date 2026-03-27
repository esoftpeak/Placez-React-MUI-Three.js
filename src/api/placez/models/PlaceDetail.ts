import { PlacezAddress } from './PlacezAddress';

export default interface PlaceDetail {
  id: number;
  name: string;
  cost: number;
  isActive: boolean;

  contact: string;
  type: number;
  capacity: number;
  notes: string;
  imageUrl: string;
  taxRate: number;
  costMultiplier: number;
  address: PlacezAddress;
  addressId?: number;
}

export const DefaultPlaceDetail: Partial<PlaceDetail> = {
  costMultiplier: 1,
  taxRate: 0,
};
