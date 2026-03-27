import { Asset } from './asset';
import { FloorItem } from './floor_item';
import { Vector3 } from 'three';

export abstract class CeilingItem extends FloorItem {
  constructor(asset: Asset) {
    super(asset);
    this.castShadow = false;
    this.receiveShadow = false;
  }

  /** Take action after a resize */
  public resized(): void {
    this.position.setY(this.scene.getWallHeight());
  }

  public getNewPosition(
    currentPosition: THREE.Vector3,
    relVec: THREE.Vector3,
    snap: boolean,
    intersection?: THREE.Intersection
  ): THREE.Vector3 {
    const newPosition = new Vector3().addVectors(currentPosition, relVec);
    newPosition.setY(this.scene.getWallHeight());
    if (snap) {
      newPosition.copy(this.snapPosition(newPosition));
    }
    return newPosition;
  }
}
