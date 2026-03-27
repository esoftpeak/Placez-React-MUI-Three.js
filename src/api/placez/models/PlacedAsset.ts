import { Asset } from "../../../blue/items/asset";

export default interface PlacedAsset extends Asset {
  mediaAssetId?: number;
  layoutId?: string;
  floorPlanId?: string;
  mediaAssetGroupId?: string;
}
