import { Sku } from './';

export default interface SecondaryCategory {
  name: string;
  description?: string;
  sortOrder: number;
  itemSkus: Sku[];
}
