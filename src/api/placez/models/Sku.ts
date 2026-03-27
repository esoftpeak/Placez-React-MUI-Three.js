import { Asset } from '../../../blue/items/asset';

export default interface Sku {
  sku: string;
  sortOrder: number;
  asset?: Asset;
}
