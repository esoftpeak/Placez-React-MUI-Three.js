import { WallItem } from './wall_item';
import { Asset } from './asset';

export abstract class WallFloorItem extends WallItem {
  constructor(asset: Asset) {
    super(asset);
    this.boundToFloor = true;
  }
}
