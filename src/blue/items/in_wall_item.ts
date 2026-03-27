import { WallItem } from './wall_item';
import { Asset } from './asset';

export abstract class InWallItem extends WallItem {
  constructor(asset: Asset) {
    super(asset);
    this.addToWall = true;
  }

  /** */
  public getWallOffset() {
    // fudge factor so it saves to the right wall
    return -this.currentWallEdge?.offset + 0.5;
  }

  public updateSize() {
    this['sizeX'] = this.boundingBox.max.x - this.boundingBox.min.x;
    this['sizeY'] = this.boundingBox.max.y - this.boundingBox.min.y;
  }
}
