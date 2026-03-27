import PlacedAsset from '../../api/placez/models/PlacedAsset';

export interface AssetGroup {
  assets: PlacedAsset[];
  mask:  {x: number, y: number}[][];
  name: string;
  image?: string;
  id?: string;
}
