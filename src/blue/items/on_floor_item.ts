import { FloorItem } from './floor_item';
import { Asset } from './asset';

export abstract class OnFloorItem extends FloorItem {
  constructor(asset: Asset) {
    super(asset);
    this.receiveShadow = true;
    this.castShadow = false;
  }
}
