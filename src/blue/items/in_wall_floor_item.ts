import { InWallItem } from './in_wall_item';
import { Asset } from './asset';

export abstract class InWallFloorItem extends InWallItem {
  constructor(asset: Asset) {
    super(asset);
    this.boundToFloor = true;
  }
}
