import { AssetCatalog, PrimaryCategory } from '../api';
import { CatalogLicense } from './CatalogLicense';
const defaultAuthor = 'Placez Team';

export interface Catalog extends AssetCatalog {
  created: Date;
  assetCount: number;
  active: boolean;
  owned: boolean;
  author: string;
  private: boolean;
}

export class UnlicensedCatalog implements Catalog {
  constructor(assetCatalog: AssetCatalog) {
    Object.assign(this, assetCatalog);
    this.imageURL = this.imageURL === '' ? '' : this.imageURL;
    this.created = new Date();
    this.assetCount = countCatalogAssets(assetCatalog);
    this.active = false;
    this.owned = false;
    this.author = defaultAuthor;
  }

  id: number;
  catalogCode: string;
  sortOrder: number;
  imageURL: string;
  partitionKey: string;
  name: string;
  catalogType: string;
  description: string;
  categories: PrimaryCategory[];
  created: Date;
  assetCount: number;
  active: boolean;
  owned: boolean;
  author: string;
  private: boolean;
}

export const countCatalogAssets = (catalog: AssetCatalog): number => {
  return catalog.categories.reduce((count, category) => {
    const subItemSkuCount = category.subCategories.reduce(
      (subCount, subCategory) => {
        return subCount + subCategory.itemSkus.length;
      },
      0
    );
    return count + subItemSkuCount + category.itemSkus.length || 0;
  }, 0);
};

export const applyLicense = (catalog: Catalog, license: CatalogLicense) => {
  if (license.catalogCode === catalog.catalogCode) {
    catalog.owned = true;
    catalog.active = true;
  }
};
