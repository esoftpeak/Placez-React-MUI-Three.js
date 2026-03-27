export default interface MediaAsset {
  id?: string;
  skuType?: string;
  sku?: string;
  classType: string;
  species: string;
  name: string;
  description: string;
  tags: string[];
  resizable: boolean;
  catalogs: string[];
  resourceSize: number;
}
