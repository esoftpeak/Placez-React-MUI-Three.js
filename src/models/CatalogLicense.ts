import { AssetCollection } from '../api';

export class CatalogLicense {
  constructor(collection: AssetCollection) {
    this.id = collection.id;
    this.catalogCode = collection.assetCollectionApplication;
    this.catalogName = collection.assetCollectionName;
    this.created = collection.createdUtcDateTime;
    this.lastModified = collection.lastModifiedUtcDateTime;
  }

  id: number;
  catalogCode: string;
  catalogName: string;
  created: Date;
  lastModified: Date;
}
