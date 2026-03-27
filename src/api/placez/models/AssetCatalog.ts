import { PrimaryCategory } from './';

export default interface AssetCatalog {
  id: number;
  catalogCode: string;
  sortOrder: number;
  imageURL: string;
  partitionKey: string;
  name: string;
  catalogType: string;
  description: string;
  categories: PrimaryCategory[];
}
