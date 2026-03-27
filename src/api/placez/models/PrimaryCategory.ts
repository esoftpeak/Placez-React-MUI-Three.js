import { SecondaryCategory } from './';

export default interface PrimaryCategory {
  name: string;
  description?: string;
  itemSkus?: string[];
  sortOrder: number;
  subCategories: SecondaryCategory[];
}
