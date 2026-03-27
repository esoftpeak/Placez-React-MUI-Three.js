import { Item } from './item';
import { Asset } from './asset';
import { Utils } from '../core/utils';
import { LoadingProgressService } from '../model/loading_progress';
import { ArrowDirection } from '../three/controller';
import { Room } from '../model/room';
import { Intersection, Quaternion, Vector3 } from 'three';

export abstract class FloorItem extends Item {
  protected loadingProgressService: LoadingProgressService;
  constructor(asset: Asset) {
    super(asset);
    this.castShadow = true;
    this.receiveShadow = false;

    this.loadingProgressService = LoadingProgressService.getInstance();
  }

  private rooms: Room[];

  public build(cb?) {
    if (this.model) {
      this.rooms = this.model.floorplan.getRooms();
    }
    super.build(cb);
  }

  /** Take action after a resize */
  public resized(): void {
    this.position.setY(0);
  }

  public getNewPosition(
    currentPosition: Vector3,
    relVec: Vector3,
    snap: boolean,
    intersection?: Intersection
  ): Vector3 {
    const newPosition = new Vector3().addVectors(currentPosition, relVec);
    if (newPosition.y < 0) {
      newPosition.setY(0);
    }
    if (snap) {
      newPosition.copy(this.snapPosition(newPosition));
    }
    return newPosition;
  }

  /** */
  public moveToPosition(newPosition: Vector3, normal?: Vector3) {
    if (normal?.y < 0.8) return;
    this.position.copy(newPosition);
    this.visible = true;
    this.update();
  }

  /** */
  public isValidPosition(
    collisionItems: Item[],
    newPosition: Vector3,
    newRotation?: Quaternion
  ): boolean {
    this.hideError();

    const corners = this.getCorners(newPosition, newRotation);
    let isInARoom = false;
    if (this.rooms?.length) {
      for (let i = 0; i < this.rooms.length; i++) {
        const pip = Utils.pointInPolygon(
          newPosition.x,
          newPosition.z,
          this.rooms[i].interiorCorners
        );
        const ppi = Utils.polygonPolygonIntersect(
          corners,
          this.rooms[i].interiorCorners
        );

        if (pip && !ppi) {
          isInARoom = true;
        }
      }
    }

    if (!isInARoom && this.keepInRoom) {
      if (this.detectCollision) this.showError(newPosition);
      return false;
    }

    if (this.collides(collisionItems, newPosition, newRotation)) {
      if (this.detectCollision) {
        this.showError(newPosition);
      }
      if (this.preventCollision) {
        return false;
      }
    }

    this.selectGlow.position.copy(this.position);
    this.selectGlow.rotation.copy(this.rotation);
    return true;
  }

  private speed = 2.54;
  private speedAdjustment = 2;

  public arrowMove(
    collisionItems: Item[],
    dir: ArrowDirection,
    azimuth: number,
    speedIncrease: number
  ): void {
    const y = new Vector3(0, 1, 0);
    const vec = new Vector3(1, 0, 0).applyAxisAngle(y, azimuth - Math.PI / 2);
    switch (dir) {
      case 'up':
        vec.applyAxisAngle(y, Math.PI);
        break;
      case 'down':
        break;
      case 'left':
        vec.applyAxisAngle(y, (3 * Math.PI) / 2);
        break;
      case 'right':
        vec.applyAxisAngle(y, Math.PI / 2);
        break;
    }
    vec.multiplyScalar(this.speed);
    if (speedIncrease) {
      vec.multiplyScalar(speedIncrease);
    }
    const newPos = this.position.clone();
    newPos.add(vec);
    if (this.isValidPosition(collisionItems, newPos)) {
      this.moveToPosition(newPos);
      this.speed = 2;
    } else {
      this.speed /= this.speedAdjustment;
    }
  }
}
