import { Wall, setWallTheme } from './wall';
import { Corner, setCornerTheme } from './corner';
import { Room } from './room';
import { HalfEdge } from './half_edge';

import { Configuration, configWallHeight } from '../core/configuration';
import PlacezFixturePlan from '../../api/placez/models/PlacezFixturePlan';
import PlacezWall from '../../api/placez/models/PlazcezWall';
import { PlacezMaterial } from '../../api/placez/models/PlacezMaterial';
import { SceneScan } from '../items/sceneScan';
import { TargetSpecs } from '../three/Cameras';
import { Theme } from '@mui/material';
import { Mesh, MeshPhysicalMaterial, Points, Vector3 } from 'three';
import { store } from '../..';
import { SetFloorPlan } from '../../reducers/designer';
import { Save } from '../../reducers/blue';
import { distinctUntilChanged, map } from 'rxjs/operators';
import { Subscription } from 'rxjs';
import {
  LocalStorageKey,
  localStorageObservable$,
} from '../../components/Hooks/useLocalStorageState';
import { CallbackRegistry } from '../../helpers/Callback';
import { Line2 } from 'three/examples/jsm/lines/Line2';
import { findRooms } from './findRooms';

/** */
const snapTolerance = 10.0;
const mergeTolerance = 30.0;
const yVec = new Vector3(0, 1, 0);

/**
 * A Floorplan represents a number of Walls, Corners and Rooms.
 */
export class Floorplan {
  /** */
  private firstLoad: boolean = true;

  private walls: Wall[] = [];

  private pauseUpdate: boolean = false;

  /** */
  public hideWalls: boolean = false;

  /** */
  private corners: Corner[] = [];

  /** */
  private rooms: Room[] = [];

  /** */
  public layoutImage: HTMLImageElement[] = [];

  /** */
  public sceneScan: SceneScan[] = [];

  /** */
  public wallHeight: number = Configuration.getNumericValue(configWallHeight);

  /** */
  public updatedRooms = new CallbackRegistry(); //TODO make private
  public roomLoaded = new CallbackRegistry(); //TODO make private
  public onAdd = new CallbackRegistry<Line2 | Points>(); //TODO make private
  public onRemove = new CallbackRegistry<Line2 | Points>(); //TODO make private
  public onUpdateWalls = new CallbackRegistry(); //TODO make private

  public defaultWallMaterial: MeshPhysicalMaterial = undefined;
  public defaultFloorMaterial: MeshPhysicalMaterial = undefined;

  private theme: Theme;

  /**
   * Floor textures are owned by the floorplan, because room objects are
   * destroyed and created each time we change the floorplan.
   * floorTextures is a map of room UUIDs (string) to a object with
   * url and scale attributes.
   */
  private floorTextures: { [id: string]: PlacezMaterial } = {};

  public subscribeDimensionCutoff: Subscription;

  /** Constructs a floorplan. */
  constructor() {
    this.subscribeDimensionCutoff = localStorageObservable$
      .pipe(
        map((localStorageState) => [
          localStorageState[LocalStorageKey.DimensionCutoff],
          localStorageState[LocalStorageKey.HideFloorplanDimensions],
          localStorageState[LocalStorageKey.DimensionLabelWidth],
        ]),
        distinctUntilChanged()
      )
      .subscribe(() => {
        this.updateWallDims();
      });
  }

  // hack
  public wallEdges(): HalfEdge[] {
    const edges = [];

    this.walls.forEach((wall: Wall) => {
      if (wall.frontEdge) {
        edges.push(wall.frontEdge);
      }
      if (wall.backEdge) {
        edges.push(wall.backEdge);
      }
    });
    return edges;
  }

  public setTheme(theme: Theme) {
    this.theme = theme;
    setCornerTheme(this.theme);
    this.getCorners().forEach((corner: Corner) => corner.determinColor());
    setWallTheme(this.theme);
    this.getWalls().forEach((wall: Wall) => wall.determineColor());
  }

  private azimuth = 0;

  public setAzimuth(angle: number) {
    this.azimuth = angle;
    this.getWalls().forEach((wall: Wall) => wall.setAzimuth(angle));
  }

  // hack
  public wallEdgePlanes(): Mesh[] {
    const planes = [];
    this.walls.forEach((wall: Wall) => {
      if (wall.frontEdge) {
        planes.push(wall.frontEdge.plane);
      }
      if (wall.backEdge) {
        planes.push(wall.backEdge.plane);
      }
    });
    return planes;
  }

  public floorPlanes(): Mesh[] {
    return this.rooms.map((room: Room) => {
      return room.floorPlane;
    });
  }

  public fireOnUpdatedRooms(callback) {
    this.updatedRooms.add(callback);
  }

  public fireOnAdd(callback) {
    this.onAdd.add(callback);
  }
  public fireOnRemove(callback) {
    this.onRemove.add(callback);
  }

  public fireOnUpdatedWalls(callback) {
    this.onUpdateWalls.add(callback);
  }

  public fireOnRoomLoaded(callback) {
    this.roomLoaded.add(callback);
  }

  /**
   * Creates a new wall.
   * @param start The start corner.
   * @param end he end corner.
   * @returns The new wall.
   */
  public newWall(start: Corner, end: Corner): Wall {
    const wall = new Wall(start, end);
    wall.height = this.wallHeight;
    this.walls.push(wall);
    const scope = this; //tslint:disable-line
    wall.fireOnDelete(() => {
      scope.removeWall(wall);
    });
    this.onAdd.fire(wall.getLine());
    this.assignOrphanEdges();
    wall.setAzimuth(this.azimuth);
    return wall;
  }

  /** Removes a wall.
   * @param wall The wall to be removed.
   */
  private removeWall(wall: Wall) {
    const corners = [wall.getStart(), wall.getEnd()];
    this.onRemove.fire(wall.getLine());
    this.walls = this.walls.filter((aWall: any) => {
      return aWall !== wall;
    });

    this.cleanUpWallsAndCorners(corners);
    this.update();
  }

  /**
   * Creates a new corner.
   * @param x The x coordinate.
   * @param y The y coordinate.
   * @param id An optional id. If unspecified, the id will be created internally.
   * @returns The new corner.
   */
  public newCorner(position: [number, number, number], id?: string): Corner {
    const corner = new Corner(position, this, id);
    this.corners.push(corner);
    corner.fireOnDelete(() => {
      this.removeCorner(corner);
    });
    this.onAdd.fire(corner.getPoint());
    return corner;
  }

  /** Removes a corner.
   * @param corner The corner to be removed.
   */
  public removeCorner(corner: Corner) {
    this.onRemove.fire(corner.getPoint());
    this.corners = this.corners.filter((cornerElement: Corner) => {
      return cornerElement !== corner;
    });
    this.cleanUpWallsAndCorners([corner]);
    this.update();
  }

  /** Gets the walls. */
  public getWalls(): Wall[] {
    return this.walls;
  }

  /** Gets the corners. */
  public getCorners(): Corner[] {
    return this.corners;
  }

  /** Gets the rooms. */
  public getRooms(): Room[] {
    return this.rooms;
  }

  /** Gets the layout. */
  public getLayoutImage(): HTMLImageElement[] {
    return this.layoutImage;
  }

  public setWallSettings(wallSettings: {
    wallHeight: number;
    hideWalls: boolean;
  }): void {
    store.dispatch(
      SetFloorPlan({
        ...wallSettings,
      })
    );
    this.wallHeight = wallSettings.wallHeight;
    this.hideWalls = wallSettings.hideWalls;
    this.updateWalls();
    store.dispatch(Save());
  }

  public getWallHeight(): number {
    return this.wallHeight / 30.48;
  }

  public overlappedCorner(x: number, y: number, tolerance?: number): Corner {
    for (let i = 0; i < this.corners.length; i++) {
      if (
        this.corners[i]._position.distanceTo(new Vector3(x, 0, y)) <
        (tolerance || snapTolerance)
      ) {
        return this.corners[i];
      }
    }
    return undefined;
  }

  public overlappedWall(x: number, y: number, tolerance?: number): Wall {
    for (let i = 0; i < this.walls.length; i++) {
      if (this.walls[i].distanceFrom(x, y) < (tolerance || snapTolerance)) {
        return this.walls[i];
      }
    }
    return undefined;
  }

  // import and export -- cleanup

  public saveFixturePlan(): PlacezFixturePlan {
    const fixturePlan: PlacezFixturePlan = {
      corners: {},
      walls: [],
      floorTextures: this.floorTextures,
    };

    this.corners.forEach((corner: Corner) => {
      fixturePlan.corners[corner.id] = {
        x: corner._position.x, //legacy
        y: corner._position.z, //legacy
        position: corner._position.toArray(),
      };
    });

    this.walls.forEach((wall: Wall, index: number) => {
      fixturePlan.walls.push({
        corner1: wall.getStart().id,
        corner2: wall.getEnd().id,
        frontMaterial: wall.frontMaterial,
        backMaterial: wall.backMaterial,
        hidden: wall.hidden,
        id: wall.id,
        frontMaterialId: wall.frontMaterialId,
        backMaterialId: wall.backMaterialId,
        organizationId: wall.organizationId,
      });
    });
    return fixturePlan;
  }

  public adaptForLegacy(placezFixturePlan: PlacezFixturePlan) {
    for (const corner in placezFixturePlan.corners) {
      if (placezFixturePlan.corners[corner].position) return;
      placezFixturePlan.corners[corner] = {
        ...placezFixturePlan.corners[corner],
        position: [
          placezFixturePlan.corners[corner].x,
          0,
          placezFixturePlan.corners[corner].y,
        ],
      };
    }
  }

  public loadFloorplan(floorplan: PlacezFixturePlan) {
    this.adaptForLegacy(floorplan);

    this.reset();

    const corners = {};
    if (
      floorplan == null ||
      !('corners' in floorplan) ||
      !('walls' in floorplan)
    ) {
      return;
    }

    for (const id in floorplan.corners) {
      const corner = floorplan.corners[id];
      corners[id] = this.newCorner(corner.position, id);
    }
    if (floorplan.wallHeight) {
      this.wallHeight = floorplan.wallHeight;
    }
    const scope = this; // tslint:disable-line
    floorplan.walls.forEach((wall: PlacezWall) => {
      if (
        corners[wall.corner1] === undefined ||
        corners[wall.corner2] === undefined
      ) {
        console.error('Wall Broken', wall);
        return;
      }
      const newWall = scope.newWall(
        corners[wall.corner1],
        corners[wall.corner2]
      );
      if (wall.frontMaterial) {
        newWall.frontMaterial = wall.frontMaterial;
        newWall.frontMaterialId = wall.frontMaterialId;
      }
      if (wall.backMaterial) {
        newWall.backMaterial = wall.backMaterial;
        newWall.backMaterialId = wall.backMaterialId;
      }
      newWall.organizationId = wall.organizationId;
      newWall.id = wall.id;
      newWall.hidden = false;
      if (wall.hidden) {
        newWall.hidden = wall.hidden;
      }
    });

    this.floorTextures = JSON.parse(JSON.stringify(floorplan.floorTextures));

    this.hideWalls = floorplan.hideWalls;

    this.update();
    this.setTheme(this.theme);
    if (this.firstLoad) {
      this.firstLoad = false;
      this.roomLoaded.fire();
    }
  }

  public getFloorTexture(uuid: string) {
    if (uuid in this.floorTextures) {
      // if (this.floorTextures[uuid] && this.floorTextures[uuid].matUrl) {
      if (this.floorTextures[uuid]) {
        return this.floorTextures[uuid];
      }
    }
    return undefined;
  }

  public setFloorTexture(uuid: string, texture: PlacezMaterial) {
    this.floorTextures = {
      ...this.floorTextures,
      [uuid]: texture ?? null,
    };
  }

  /** clear out obsolete floor textures */
  private updateFloorTextures() {
    const uuids = this.rooms.map((room: Room) => {
      return room.getUuid();
    });
    for (const uuid in this.floorTextures) {
      if (!uuids.includes(uuid)) {
        delete this.floorTextures[uuid];
      }
    }
  }

  public removeCorners(corners: Corner[]) {
    this.pauseUpdate = true;
    corners.forEach((corner: any) => {
      corner.removeAll();
    });
    this.pauseUpdate = false;
    this.update();
  }

  /** */
  public reset = (clearImages?: boolean) => {
    const tmpCorners = this.corners.slice(0);
    const tmpWalls = this.walls.slice(0);
    this.pauseUpdate = true;
    tmpCorners.forEach((corner: any) => {
      corner.remove();
    });
    tmpWalls.forEach((wall: any) => {
      wall.remove();
    });
    this.pauseUpdate = false;
    this.update();
    this.rooms = [];
    this.updatedRooms.fire();
    this.floorTextures = {};
    this.corners = [];
    this.walls = [];
    if (clearImages) {
      this.layoutImage = [];
    }
  };

  /**
   * Update rooms
   */
  public update = () => {
    if (this.pauseUpdate) return;
    // only update walls and rooms that need to be
    //this function takes time

    // TODO dedupe

    this.walls.forEach((wall: any) => {
      wall.resetFrontBack();
    });

    const roomCorners = findRooms(this.corners);
    this.rooms = [];
    const scope = this; // tslint:disable-line
    // this makes new room meshes on update
    roomCorners.forEach((corners: any) => {
      // scope.rooms.push(new Room(scope, corners, roomCorners, this.theme.palette.secondary.main));
      const newRoom = new Room(scope, corners, roomCorners, '#999999');
      scope.rooms.push(newRoom);
      return;
    });
    this.assignOrphanEdges();

    this.updateFloorTextures();
    this.updatedRooms.fire();
    store.dispatch(SetFloorPlan(this.saveFixturePlan()));
  };

  private cleanUpWallsAndCorners(corners?: Corner[]) {
    corners.forEach((corner: Corner) => {
      if (!corner) return;
      corner.updateWalls(this.walls);
    });
    this.corners = this.corners.filter((corner: any) => {
      return corner.wallEnds.length > 0 || corner.wallStarts.length > 0;
    });
  }

  /**
   * Returns the center of the floorplan in the y plane
   */
  public getCenter(): Vector3 {
    return this.getDimensions(true);
  }

  public getSize(): Vector3 {
    return this.getDimensions(false);
  }

  public getSpecs(): TargetSpecs {
    const yOffset = 1000;
    const size = this.getSize();
    const diagonal = Math.hypot(size.x, size.z);
    return {
      size,
      center: this.getCenter(),
      centerOffset: this.getCenter().setY(yOffset),
      diagonal,
    };
  }

  public getDimensions(center): Vector3 {
    let xMin = Infinity;
    let xMax = -Infinity;
    let zMin = Infinity;
    let zMax = -Infinity;
    this.corners.forEach((corner: Corner) => {
      if (corner._position.x < xMin) {
        xMin = corner._position.x;
      }
      if (corner._position.x > xMax) {
        xMax = corner._position.x;
      }
      if (corner._position.z < zMin) {
        zMin = corner._position.z;
      }
      if (corner._position.z > zMax) {
        zMax = corner._position.z;
      }
    });

    let ret;
    if (
      xMin === Infinity ||
      xMax === -Infinity ||
      zMin === Infinity ||
      zMax === -Infinity
    ) {
      ret = new Vector3();
    } else {
      if (center) {
        // center
        ret = new Vector3((xMin + xMax) * 0.5, 0, (zMin + zMax) * 0.5);
      } else {
        // size
        ret = new Vector3(xMax - xMin, 0, zMax - zMin).applyAxisAngle(
          yVec,
          this.azimuth
        );
      }
    }
    return ret;
  }

  private assignOrphanEdges() {
    // kinda hacky
    // find orphaned wall segments (i.e. not part of rooms) and
    // give them edges
    const orphanWalls = [];
    this.walls.forEach((wall: any) => {
      if (!wall.backEdge && !wall.frontEdge) {
        wall.setOrphan(true);
        const back = new HalfEdge(null, wall, false);
        back.generatePlane();
        const front = new HalfEdge(null, wall, true);
        front.generatePlane();
        orphanWalls.push(wall);
      }
    });
  }

  private findCloseCorner(corner: Corner, corners: Corner[]): Corner {
    return corners.find((otherCorner: Corner) => {
      const distance = otherCorner._position.distanceTo(corner._position);
      const found = otherCorner !== corner && distance < mergeTolerance;
      return found;
    });
  }

  private removeOrphanCorners(corners: Corner[], walls: Wall[]): Corner[] {
    return corners.filter((corner: Corner): boolean => {
      return walls.some((wall: Wall): boolean => {
        return wall.getStart() === corner || wall.getEnd() === corner;
      });
    });
  }

  public scale(scale: number) {
    this.corners.forEach((corner) => {
      corner._position.multiplyScalar(scale);
      corner.update();
      corner.set_positionBak();
    });
    this.updateWalls();
  }

  public updateWalls() {
    this.walls.forEach((wall: Wall) => wall.fireRedraw());
    this.onUpdateWalls.fire();
  }

  public updateWallDims() {
    this.walls.forEach((wall: Wall) => wall.updateDim(true));
    this.onUpdateWalls.fire();
  }
}
