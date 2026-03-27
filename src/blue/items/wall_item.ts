import { Utils } from '../core/utils';
import { HalfEdge } from '../model/half_edge';
import { Item } from './item';
import { Asset } from './asset';
import { ArrowDirection } from '../three/controller';
import { Intersection, Quaternion, Vector2, Vector3 } from 'three';
import { ArchitectureMod } from '../itemModifiers/ArchitectureMod';

/**
 * A Wall Item is an entity to be placed related to a wall.
 */
export abstract class WallItem extends Item {
  /** The currently applied wall edge. */
  protected currentWallEdge: HalfEdge = null;
  /* TODO:
      This caused a huge headache.
      HalfEdges get destroyed/created every time floorplan is edited.
      This item should store a reference to a wall and front/back,
      and grab its edge reference dynamically whenever it needs it.
    */

  /** used for finding rotations */
  private refVec = new Vector2(0, 1.0);

  /** */
  private wallOffsetScalar = 0;

  /** */
  private sizeX = 0;

  /** */
  private sizeY = 0;

  /** */
  protected addToWall = false;

  /** */
  protected boundToFloor = false;

  /** */
  protected frontVisible = false;

  /** */
  protected backVisible = false;

  constructor(asset: Asset) {
    super(asset);

    this.allowRotate = false;
    this.castShadow = false;

    // Hotfix untill all items are set to 0 spacing in db
    this.asset.spacing = 0;
  }

  /** Get the closet wall edge.
   * @returns The wall edge.
   */
  public closestWallEdge(): HalfEdge {
    const wallEdges = this?.model?.floorplan?.wallEdges() ?? [];

    let wallEdge = null;
    let minDistance = null;

    const itemX = this.position.x;
    const itemZ = this.position.z;

    wallEdges.forEach((edge: HalfEdge) => {
      const distance = edge.distanceTo(itemX, itemZ);
      if (minDistance === null || distance < minDistance) {
        minDistance = distance;
        wallEdge = edge;
      }
    });

    return wallEdge;
  }

  /** */
  public removed() {
    if (this.currentWallEdge != null && this.addToWall) {
      this.currentWallEdge.wall.items = this.currentWallEdge.wall.items.filter(
        (item: Item) => {
          return item !== this;
        }
      );
      this.redrawWall();
    }
  }

  /** */
  private redrawWall() {
    if (this.addToWall) {
      this.currentWallEdge?.wall?.fireRedraw();
    }
  }

  /** */
  private updateEdgeVisibility(visible: boolean, front: boolean) {
    if (front) {
      this.frontVisible = visible;
    } else {
      this.backVisible = visible;
    }
    this.visible = this.frontVisible || this.backVisible;

    // Fix this
    // this.material[0].opacity = 0.25;
    // this.material[1].opacity = 0.25;
    // this.material[0].transparent = this.frontVisible || this.backVisible;
    // this.material[0].needsUpdate = true;
    // this.material[1].transparent = this.frontVisible || this.backVisible;
    // this.material[1].needsUpdate = true;
  }

  /** */
  public updateSize() {
    this.sizeY = this.boundingBox.max.y - this.boundingBox.min.y;
  }

  /** */
  public resized() {
    this.updateSize();
    this.boundMove(this.position);
    this.redrawWall();
  }

  public build(cb?) {
    if (this.position.x === 0 && this.position.z === 0) {
      this.position.y = this.halfSize.y;
    }
    this.placeInRoom();
    super.build(cb);
  }

  /** */
  public placeInRoom() {
    const closestWallEdge = this.closestWallEdge();
    this.changeWallEdge(closestWallEdge);
    this.updateSize();

    if (!this.asset.transformation) {
      // position not set
      const center = closestWallEdge.interiorCenter();
      const newPos = new Vector3(
        center.x,
        closestWallEdge.wall.height / 2.0,
        center.y
      );
      this.boundMove(newPos);
      this.position.copy(newPos);
      this.redrawWall();
    } else {
      // this will perform bound move on load
      const drop = this.position.clone();
      this.boundMove(drop);
      this.position.copy(drop);
      this.redrawWall();
    }
  }

  public getNewPosition(
    currentPosition: Vector3,
    relVec: Vector3,
    snap: boolean,
    intersection?: Intersection
  ): Vector3 {
    const newPosition = new Vector3().addVectors(currentPosition, relVec);
    if (
      intersection &&
      intersection.object &&
      (intersection as any).object.edge
    ) {
      this.changeWallEdge((intersection.object as any).edge);
    }
    if (snap) {
      newPosition.copy(this.snapPosition(newPosition));
    }
    this.boundMove(newPosition);
    return newPosition;
  }

  public moveToPosition(newPosition: Vector3, normal: Vector3) {
    if (normal) {
      if (normal.y > 0.2) return;
      const normalShift = new Vector3().copy(normal).multiplyScalar(2);
      this.position.copy(newPosition.add(normalShift));
      const dot = new Vector2(normal.x, normal.z).dot(new Vector2(1, 0));
      let angle = new Vector3()
        .copy(normal)
        .setY(0)
        .angleTo(new Vector3(0, 0, 1));
      if (dot < 0) {
        angle *= -1;
      }

      const newQuat = new Quaternion().setFromAxisAngle(
        new Vector3(0, 1, 0),
        angle
      );
      this.quaternion.copy(newQuat);
    } else {
      this.position.copy(newPosition);
    }

    this.redrawWall();
  }

  /** */
  protected getWallOffset() {
    return this.wallOffsetScalar;
  }

  private speed = 2.54;

  public arrowMove(
    collisionItems: Item[],
    dir: ArrowDirection,
    azimuth: number,
    speedIncrease: number
  ): void {
    let vec;
    switch (dir) {
      case 'up':
        vec = new Vector3(0, 1, 0);
        break;
      case 'down':
        vec = new Vector3(0, -1, 0);
        break;
      case 'left':
        vec = new Vector3(-1, 0, 0).applyQuaternion(this.quaternion);
        break;
      case 'right':
        vec = new Vector3(1, 0, 0).applyQuaternion(this.quaternion);
        break;
    }
    vec.multiplyScalar(this.speed);
    if (speedIncrease) {
      vec.multiplyScalar(speedIncrease);
    }
    const newPos = this.position.clone();
    newPos.add(vec);
    newPos.copy(this.snapPosition(newPos));
    this.boundMove(newPos);
    this.position.copy(newPos);
    this.redrawWall();
  }

  /** */
  private changeWallEdge(wallEdge) {
    if (wallEdge === this.currentWallEdge) {
      return;
    }
    if (this.currentWallEdge != null) {
      if (this.addToWall) {
        this.currentWallEdge.wall.items =
          this.currentWallEdge.wall.items.filter((item: WallItem) => {
            return item !== this;
          });
        this.redrawWall();
      } else {
        this.currentWallEdge.wall.onItems =
          this.currentWallEdge.wall.items.filter((item: WallItem) => {
            return item !== this;
          });
      }
    }

    // handle subscription to wall being removed
    if (this.currentWallEdge != null) {
      this.currentWallEdge.wall.dontFireOnDelete(this.remove.bind(this));
    }
    wallEdge.wall.fireOnDelete(this.remove.bind(this));

    // find angle between wall normals
    const normals = wallEdge.plane.geometry.getAttribute('normal').array;
    const normal2 = new Vector2();
    const normal3 = new Vector3(normals[0], normals[1], normals[2]);

    normal2.x = normal3.x;
    normal2.y = normal3.z;

    const angle = Utils.angle(
      this.refVec.x,
      this.refVec.y,
      normal2.x,
      normal2.y
    );

    const newQuat = new Quaternion().setFromAxisAngle(
      new Vector3(0, 1, 0),
      angle
    );

    this.quaternion.copy(newQuat);
    this.updateMatrixWorld();

    // update currentWall
    this.currentWallEdge = wallEdge;
    if (this.addToWall) {
      wallEdge.wall.items.push(this);
      this.redrawWall();
    } else {
      wallEdge.wall.onItems.push(this);
    }
  }

  /** takes the move vec3, and makes sure object stays bounded on plane */
  private boundMove(vec3) {
    const tolerance = 0.1;
    const edge = this.currentWallEdge;
    if (edge) {
      vec3.applyMatrix4(edge.interiorTransform);

      if (vec3.x < this.sizeX / 2.0 + tolerance) {
        vec3.x = this.sizeX / 2.0 + tolerance;
      } else if (
        vec3.x >
        edge.interiorDistance() - this.sizeX / 2.0 - tolerance
      ) {
        vec3.x = edge.interiorDistance() - this.sizeX / 2.0 - tolerance;
      }

      if (this.boundToFloor) {
        vec3.y =
          0.5 * (this.boundingBox.max.y - this.boundingBox.min.y) + tolerance;
      } else {
        if (vec3.y < this.sizeY / 2.0 + tolerance) {
          vec3.y = this.sizeY / 2.0 + tolerance;
        } else if (vec3.y > edge.height - this.sizeY / 2.0 - tolerance) {
          vec3.y = edge.height - this.sizeY / 2.0 - tolerance;
        }
      }

      vec3.z = this.getWallOffset();

      vec3.applyMatrix4(edge.invInteriorTransform);
      if (this?.mods?.architectureMod) {
        (this.mods.architectureMod as ArchitectureMod).updatePosition(vec3.y);
      }
    }
  }

  public resize(height: number, width: number, depth: number): void {
    if (this.currentWallEdge) {
      const limitHeight = Math.min(height, this.currentWallEdge.height - 1);
      const limitWidth = Math.min(
        width,
        this.currentWallEdge.interiorDistance() - 1
      );

      super.resize(limitHeight, limitWidth, depth);
    } else {
      super.resize(height, width, depth);
    }
  }

  public setHeight(height: number) {
    const vec3 = this.position.clone();
    vec3.y = height;
    this.boundMove(vec3);

    if (this.isValidPosition([], vec3)) {
      this.position.copy(vec3);
      this.redrawWall();
    }
  }
}
