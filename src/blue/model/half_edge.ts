import { Utils } from '../core/utils';
import { Room } from './room';
import { Wall } from './wall';
import {
  PlacezMaterial,
  DefaultWallMaterial,
} from '../../api/placez/models/PlacezMaterial';
import {
  BufferGeometry,
  Matrix4,
  Mesh,
  MeshBasicMaterial,
  Vector2,
  Vector3,
} from 'three';
import { CallbackRegistry } from '../../helpers/Callback';

/**
 * Half Edges are created by Room.
 * Once rooms have been identified, Half Edges are created for each interior wall.
 * A wall can have two half edges if it is visible from both sides.
 */

const labelOffsetVec = new Vector2();
const angleAdjustment = new Vector2();

export class HalfEdge {
  /** The successor edge in CCW ??? direction. */
  public next: HalfEdge;

  /** The predecessor edge in CCW ??? direction. */
  public prev: HalfEdge;

  /** */
  public offset: number;

  /** */
  public height: number;

  /** used for intersection testing... not convinced this belongs here */
  public plane: Mesh = null;

  /** transform from world coords to wall planes (z=0) */
  public interiorTransform = new Matrix4();

  /** transform from world coords to wall planes (z=0) */
  public invInteriorTransform = new Matrix4();

  /** transform from world coords to wall planes (z=0) */
  private exteriorTransform = new Matrix4();

  /** transform from world coords to wall planes (z=0) */
  private invExteriorTransform = new Matrix4();

  /** */
  public redrawCallbacks = new CallbackRegistry();

  /**
   * Constructs a half edge.
   * @param room The associated room.
   * @param wall The corresponding wall.
   * @param front True if front side.
   */
  constructor(
    public room: Room,
    public wall: Wall,
    private front: boolean
  ) {
    this.front = front || false;

    this.offset = wall.thickness / 2.0;
    this.height = wall.height;

    if (this.front) {
      this.wall.frontEdge = this;
    } else {
      this.wall.backEdge = this;
    }
    this.wall.fireRedraw();
  }

  /**
   *
   */
  public getMaterial(): PlacezMaterial {
    if (this.front) {
      return this.wall.frontMaterial || DefaultWallMaterial;
    }
    return this.wall.backMaterial || DefaultWallMaterial;
  }

  public labelOffset(
    end: Vector2,
    start: Vector2,
    rotationAngle: number,
    distance?: number
  ): Vector3 {
    labelOffsetVec
      .subVectors(end, start)
      .rotateAround(new Vector2(), Math.PI / 2)
      .normalize()
      .multiplyScalar(distance)
      .multiplyScalar(
        Math.abs(
          Math.sin(
            angleAdjustment.subVectors(end, start).angle() + rotationAngle
          )
        ) + 0.3
      );

    return new Vector3(labelOffsetVec.x, 0, labelOffsetVec.y);
  }

  /**
   *
   */
  public setMaterial(material: PlacezMaterial) {
    if (this.front) {
      this.wall.frontMaterial = material;
    } else {
      this.wall.backMaterial = material;
    }
    this.redrawCallbacks.fire();
  }

  public setVisibility(visible: boolean) {
    this.wall.hidden = !visible;
    this.redrawCallbacks.fire();
  }

  public getVisibility(): boolean {
    return !this.wall.hidden;
  }

  public toggleVisibility() {
    this.wall.hidden = !this.wall.hidden;
    this.redrawCallbacks.fire();
  }

  /**
   * this feels hacky, but need wall items
   */
  public generatePlane = function () {
    function transformCorner(corner) {
      return new Vector3(corner.x, 0, corner.y);
    }

    const v1 = transformCorner(this.interiorStart());
    const v2 = transformCorner(this.interiorEnd());
    const v3 = v2.clone();
    v3.y = this.wall.height;
    const v4 = v1.clone();
    v4.y = this.wall.height;

    const geometry = new BufferGeometry();
    const corners = [v1, v2, v3, v4];

    const points = [
      new Vector3().copy(corners[0]),
      new Vector3().copy(corners[1]),
      new Vector3().copy(corners[2]),

      new Vector3().copy(corners[0]),
      new Vector3().copy(corners[2]),
      new Vector3().copy(corners[3]),
    ];
    geometry.setFromPoints(points);
    geometry.computeVertexNormals();

    this.plane = new Mesh(geometry, new MeshBasicMaterial());
    this.plane.visible = true;
    this.plane.material.visible = false;
    this.plane.edge = this; // js monkey patch

    this.computeTransforms(
      this.interiorTransform,
      this.invInteriorTransform,
      this.interiorStart(),
      this.interiorEnd()
    );
    this.computeTransforms(
      this.exteriorTransform,
      this.invExteriorTransform,
      this.exteriorStart(),
      this.exteriorEnd()
    );
  };

  public interiorDistance(): number {
    const start = this.interiorStart();
    const end = this.interiorEnd();
    return Utils.distance(start.x, start.y, end.x, end.y);
  }

  private computeTransforms(transform, invTransform, start, end) {
    const v1 = start;
    const v2 = end;

    const angle = Utils.angle(1, 0, v2.x - v1.x, v2.y - v1.y);

    const tt = new Matrix4();
    tt.makeTranslation(-v1.x, 0, -v1.y);
    const tr = new Matrix4();
    tr.makeRotationY(-angle);
    transform.multiplyMatrices(tr, tt);
    (invTransform.copy(transform) as any).invert();
  }

  /** Gets the distance from specified point.
   * @param x X coordinate of the point.
   * @param y Y coordinate of the point.
   * @returns The distance.
   */
  public distanceTo(x: number, y: number): number {
    // x, y, x1, y1, x2, y2
    return Utils.pointDistanceFromLine(
      x,
      y,
      this.interiorStart().x,
      this.interiorStart().y,
      this.interiorEnd().x,
      this.interiorEnd().y
    );
  }

  private getStart() {
    if (this.front) {
      return this.wall.getStart();
    }
    return this.wall.getEnd();
  }

  private getEnd() {
    if (this.front) {
      return this.wall.getEnd();
    }
    return this.wall.getStart();
  }

  private getOppositeEdge(): HalfEdge {
    if (this.front) {
      return this.wall.backEdge;
    }
    return this.wall.frontEdge;
  }

  // these return an object with attributes x, y
  public interiorEnd(): Vector2 {
    const vec = this.halfAngleVector(this, this.next);
    return new Vector2(
      this.getEnd()._position.x + vec.x,
      this.getEnd()._position.z + vec.y
    );
  }

  public interiorStart(): Vector2 {
    const vec = this.halfAngleVector(this.prev, this);
    return new Vector2(
      this.getStart()._position.x + vec.x,
      this.getStart()._position.z + vec.y
    );
  }

  public interiorCenter(): Vector2 {
    return new Vector2(
      (this.interiorStart().x + this.interiorEnd().x) / 2.0,
      (this.interiorStart().y + this.interiorEnd().y) / 2.0
    );
  }

  public exteriorEnd(): Vector2 {
    const vec = this.halfAngleVector(this, this.next);
    return new Vector2(
      this.getEnd()._position.x - vec.x,
      this.getEnd()._position.z - vec.y
    );
  }

  public exteriorStart(): Vector2 {
    const vec = this.halfAngleVector(this.prev, this);
    return new Vector2(
      this.getStart()._position.x - vec.x,
      this.getStart()._position.z - vec.y
    );
  }

  /** Get the corners of the half edge.
   * @returns An array of x,y pairs.
   */
  public corners(): Vector2[] {
    return [
      this.interiorStart(),
      this.interiorEnd(),
      this.exteriorEnd(),
      this.exteriorStart(),
    ];
  }

  /**
   * Gets CCW angle from v1 to v2
   */
  private halfAngleVector(v1: HalfEdge, v2: HalfEdge): Vector2 {
    // make the best of things if we dont have prev or next
    let v1startX;
    let v1startY;
    let v1endX;
    let v1endY;
    let v2startX;
    let v2startY;
    let v2endX;
    let v2endY;

    if (!v1) {
      v1startX =
        v2.getStart()._position.x -
        (v2.getEnd()._position.x - v2.getStart()._position.x);
      v1startY =
        v2.getStart()._position.z -
        (v2.getEnd()._position.z - v2.getStart()._position.z);
      v1endX = v2.getStart()._position.x;
      v1endY = v2.getStart()._position.z;
    } else {
      v1startX = v1.getStart()._position.x;
      v1startY = v1.getStart()._position.z;
      v1endX = v1.getEnd()._position.x;
      v1endY = v1.getEnd()._position.z;
    }

    if (!v2) {
      v2startX = v1.getEnd()._position.x;
      v2startY = v1.getEnd()._position.z;
      v2endX =
        v1.getEnd()._position.x +
        (v1.getEnd()._position.x - v1.getStart()._position.x);
      v2endY =
        v1.getEnd()._position.z +
        (v1.getEnd()._position.z - v1.getStart()._position.z);
    } else {
      v2startX = v2.getStart()._position.x;
      v2startY = v2.getStart()._position.z;
      v2endX = v2.getEnd()._position.x;
      v2endY = v2.getEnd()._position.z;
    }

    // CCW angle between edges
    const theta = Utils.angle2pi(
      v1startX - v1endX,
      v1startY - v1endY,
      v2endX - v1endX,
      v2endY - v1endY
    );

    // cosine and sine of half angle
    const cs = Math.cos(theta / 2.0);
    const sn = Math.sin(theta / 2.0);

    // rotate v2
    const v2dx = v2endX - v2startX;
    const v2dy = v2endY - v2startY;

    const vx = v2dx * cs - v2dy * sn;
    const vy = v2dx * sn + v2dy * cs;

    // normalize
    const mag = Utils.distance(0, 0, vx, vy);
    const desiredMag = this.offset / sn;
    const scalar = desiredMag / mag;

    const halfAngleVector = {
      x: vx * scalar,
      y: vy * scalar,
    };

    return new Vector2(halfAngleVector.x, halfAngleVector.y);
  }
}
