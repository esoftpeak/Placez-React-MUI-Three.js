import { Utils } from '../core/utils';
import { HalfEdge } from './half_edge';
import { Floorplan } from './floorplan';
import { Corner } from './corner';
import {
  PlacezMaterial,
  DefaultFloorMaterial,
} from '../../api/placez/models/PlacezMaterial';
import {
  BackSide,
  Mesh,
  MeshBasicMaterial,
  Path,
  Shape,
  ShapeGeometry,
  Vector2,
} from 'three';
import { RenderOrder } from '../../api/placez/models/UserSetting';
import { CallbackRegistry } from '../../helpers/Callback'

/**
 * A Room is the combination of a Floorplan with a floor plane.
 */
const roomMaterial = new MeshBasicMaterial({
  side: BackSide,
  depthTest: false,
});
export class Room {
  /** */
  public interiorCorners: Vector2[] = [];

  /** */
  private edgePointer: HalfEdge = null;

  /** floor plane for intersection testing */
  public floorPlane: Mesh = null;

  /** */
  private customTexture = false;

  /** */
  private floorChangeCallbacks = new CallbackRegistry();

  public holes: Corner[][] = [];

  /**
   *  ordered CCW
   */
  constructor(
    private floorplan: Floorplan,
    public corners: Corner[],
    private otherRoomCorners: Corner[][],
    color?: string
  ) {
    this.updateWalls();
    this.updateInteriorCorners();
    this.findHoles(otherRoomCorners);
    // this.generatePlane();
    // roomMaterial.color.setStyle(color ?? '#aa0000');
  }

  public getUuid(): string {
    return this.corners
      .map((c: Corner) => {
        return c.id;
      })
      .sort()
      .join();
  }

  public fireOnFloorChange(callback) {
    this.floorChangeCallbacks.add(callback);
  }

  public getTexture() {
    const uuid = this.getUuid();
    const tex = this.floorplan.getFloorTexture(uuid);
    return tex ? tex : DefaultFloorMaterial;
  }

  public setMaterial(material: PlacezMaterial) {
    const uuid = this.getUuid();
    this.floorplan.setFloorTexture(uuid, material);
    this.floorChangeCallbacks.fire();
  }

  private generatePlane() {
    const points = [];
    this.interiorCorners.forEach((corner: Vector2) => {
      points.push(new Vector2(corner.x, corner.y));
    });

    const holePaths = [];
    this.holes.forEach((hole: Corner[]) => {
      const holePoints = [];
      hole.forEach((corner: Corner) => {
        holePoints.push(new Vector2(corner._position.x, corner._position.z));
      });
      holePoints.push(holePoints[0]);

      holePaths.push(new Path(holePoints));
    });

    const shape = new Shape(points);
    holePaths.forEach((hole: Path) => {
      shape.holes.push(hole);
    });

    const geometry = new ShapeGeometry(shape);
    this.floorPlane = new Mesh(geometry, roomMaterial);
    // this.floorPlane.visible = true;
    this.floorPlane.renderOrder = RenderOrder.Floorplane;
    // (<any>this.floorPlane.material).visible = false;

    //floorplan needs to be one thing in threeFloorplan and another in layout

    this.floorPlane.rotation.set(Math.PI / 2, 0, 0);
    this.floorPlane.updateMatrixWorld();
    // (<any>this.floorPlane).room = this; // js monkey patch
  }

  private cycleIndex(index) {
    if (index < 0) {
      return index + this.corners.length;
    }
    return index % this.corners.length;
  }

  private updateInteriorCorners() {
    let edge = this.edgePointer;
    let closedLoop = false;
    while (!closedLoop) {
      this.interiorCorners.push(edge.interiorStart());
      edge.generatePlane();
      if (edge.next === this.edgePointer) {
        closedLoop = true;
      } else {
        edge = edge.next;
      }
    }
  }

  public getEdges() {
    let edge: HalfEdge = this.edgePointer;

    const edges: HalfEdge[] = [];
    let closedLoop = false;
    while (!closedLoop) {
      edges.push(edge);
      if (edge.next === this.edgePointer) {
        closedLoop = true;
      } else {
        edge = edge.next;
      }
    }
    return edges;
  }

  /**
   * Populates each wall's half edge relating to this room
   * this creates a fancy doubly connected edge list (DCEL)
   */
  private updateWalls(): void {
    let prevEdge: HalfEdge = null;
    let firstEdge: HalfEdge = null;

    for (let i = 0; i < this.corners.length; i++) {
      const firstCorner = this.corners[i];
      const secondCorner = this.corners[(i + 1) % this.corners.length];

      // find if wall is heading in that direction
      const wallTo = firstCorner.wallTo(secondCorner);
      const wallFrom = firstCorner.wallFrom(secondCorner);

      let edge: HalfEdge;
      if (wallTo) {
        edge = new HalfEdge(this, wallTo, true);
      } else if (wallFrom) {
        edge = new HalfEdge(this, wallFrom, false);
      } else {
        // something horrible has happened
        console.warn('Corners arent connected by a wall, uh oh');
      }

      if (i === 0) {
        firstEdge = edge;
      } else {
        edge.prev = prevEdge;
        prevEdge.next = edge;
        if (i + 1 === this.corners.length) {
          firstEdge.prev = edge;
          edge.next = firstEdge;
        }
      }
      prevEdge = edge;
    }

    // hold on to an edge reference
    this.edgePointer = firstEdge;
  }

  public findHoles(rooms: Corner[][]) {
    this.holes = [];
    rooms.forEach((roomCorners: Corner[]) => {
      if (Utils.polygonInsidePolygon(roomCorners, this.corners)) {
        this.holes.push(roomCorners);
      }
    });
  }
}
