import PickListOption from './PickListOption';

export default interface PickList {
  id: number;
  name: string;
  sortOrder: number;
  picklistOptions: PickListOption[];
}
