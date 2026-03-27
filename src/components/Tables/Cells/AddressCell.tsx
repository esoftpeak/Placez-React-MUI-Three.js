import { GridCellProps } from '@progress/kendo-react-grid';
import { PlacezAddress } from '../../../api/placez/models/PlacezAddress';

export const formatAddress = (address: PlacezAddress): string => {
  if (!address) return '';

  let addressString = '';
  if (address.line1)
    addressString += address.line1?.replace('undefined', '') + ', ';
  if (address.line2) addressString += address.line2 + ', ';
  if (address.city) addressString += address.city + ', ';
  if (address.stateProvince) addressString += address.stateProvince + ', ';
  addressString += address.postalCode;
  // addressString += address.country;

  return addressString;
};

const AddressCell: any = (props: GridCellProps) => {
  const address: PlacezAddress = props.dataItem[props.field];

  // Format the address string as needed

  return <td title={formatAddress(address)}>{formatAddress(address)}</td>;
};

export default AddressCell;
