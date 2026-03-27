// FIXME Model exactly matches mock. Not ideal data format for address

import { PlacezAddress } from './PlacezAddress';

export default interface ClientDetail {
  id: number;
  isActive: boolean;
  name: string;
  type: string;
  phone: string;
  email: string;
  notes: string;
  address: PlacezAddress;
  addressId?: number;
  organization?: {
    applySurcharge: boolean;
    tipPercent1: number;
    tipPercent2: number;
    tipPercent3: number;
    surchargePercentage: number;
    applicationStatus: number;
    enableAddTip: boolean;
    enableCatereaseIntegration: boolean;
    internal: number;
    organizationName: string;
    resettable: number;
    merchantAccount: string;
    merchantId: string;
    guid: string;
    serialNumber: string;
  };
}
