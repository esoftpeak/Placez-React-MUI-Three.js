import { Utils } from '../core/utils';
import { Wall } from './wall';
import { Floorplan } from './floorplan';
import {
  BufferGeometry,
  Material,
  Points,
  PointsMaterial,
  TextureLoader,
  Vector2,
  Vector3,
} from 'three';
import { Theme } from '@mui/material';
import { FloorPlanModes } from '../../reducers/floorPlan';
import { CallbackRegistry } from '../../helpers/Callback'

/**
 * Corners are used to define Walls.
 */

export interface BlueVec2 {
  x: number;
  y: number;
}

const chord = new Vector2();
const origin = new Vector2();

const sprite = new TextureLoader().load('disc.png');
// const sprite = new TextureLoader().load('ball.png');
// const sprite = new TextureLoader().load('circle.png');

const defaultMaterial: PointsMaterial = new PointsMaterial({
  size: 10,
  depthTest: false,
  map: sprite,
  transparent: true,
  opacity: 0,
});

const deleteMaterial: PointsMaterial = new PointsMaterial({
  size: 10,
  depthTest: false,
  map: sprite,
  transparent: true,
  color: 0xff0000,
});

const intersectedMaterial: PointsMaterial = new PointsMaterial({
  size: 16,
  depthTest: false,
  map: sprite,
  transparent: true,
});

const selectedMaterial: PointsMaterial = new PointsMaterial({
  size: 10,
  depthTest: false,
  map: sprite,
  transparent: true,
});

export const setCornerTheme = (theme: Theme) => {
  defaultMaterial.color.setStyle(Utils.rgbaToRgb(theme.palette.text.secondary));
  selectedMaterial.color.setStyle(Utils.rgbaToRgb(theme.palette.primary.main));
  intersectedMaterial.color.setStyle(
    Utils.rgbaToRgb(theme.palette.secondary.main)
  );
};

export class Corner {
  private _pointsGeometry: BufferGeometry = new BufferGeometry();
  private _pointsMaterial: PointsMaterial = defaultMaterial.clone();
  private _point: Points = new Points(
    this._pointsGeometry,
    this._pointsMaterial
  );
  public _position: Vector3 = new Vector3();
  private _positionBak: Vector3 = new Vector3();
  public selected: boolean = false;

  public set_positionBak = () => {
    this._positionBak.copy(this._position);
  };

  private tempPositionVec = new Vector3();
  private intersected: boolean = false;

  /** Array of start walls. */
  private wallStarts: Wall[] = [];

  /** Array of end walls. */
  private wallEnds: Wall[] = [];

  /** Callbacks to be fired on removal. */
  private deletedCallbacks = new CallbackRegistry<Corner>();

  /** Callbacks to be fired in case of action. */
  private actionCallbacks = new CallbackRegistry<Corner>();

  /** Constructs a corner.
   * @param floorplan The associated floorplan.
   * @param x X coordinate.
   * @param y Y coordinate.
   * @param id An optional unique id. If not set, created internally.
   */

  public id: string = Utils.guid();

  constructor(
    position: [number, number, number],
    private floorplan: Floorplan,
    id?: string
  ) {
    this.id = id || Utils.guid();
    this._position.fromArray(position);
    this._positionBak.fromArray(position);
    this.update();
    this._point.userData = {
      id: this.id,
    };
    this._point.renderOrder = 99;
  }

  public update = () => {
    this._point.geometry.setFromPoints([this._position]);
    this._point.geometry.computeBoundingSphere(); // this updates raycast
    this.wallStarts.forEach((wall) => wall.update());
    this.wallEnds.forEach((wall) => wall.update());
  };

  public select = () => {
    if (this.selected) return;
    this.selected = true;
    this.determinColor();
  };

  public intersect = (mode: FloorPlanModes) => {
    if (this.intersected) return;
    this.intersected = true;
    this.determinColor(mode);
  };

  public deIntersect = () => {
    if (!this.intersected) return;
    this.intersected = false;
    this.determinColor();
  };

  public unSelect = () => {
    if (!this.selected) return;
    this.selected = false;
    this.determinColor();
  };

  public determinColor = (mode?: FloorPlanModes) => {
    if (this.intersected) {
      if (mode === FloorPlanModes.DELETE) {
        (this._point.material as Material).copy(deleteMaterial);
      } else {
        (this._point.material as Material).copy(intersectedMaterial);
      }
    } else if (this.selected) {
      (this._point.material as Material).copy(selectedMaterial);
    } else {
      (this._point.material as Material).copy(defaultMaterial);
    }
    this.wallStarts.forEach((wall) => wall.determineColor());
    this.wallEnds.forEach((wall) => wall.determineColor());
  };

  public getPoint = () => this._point;

  /** Add function to deleted callbacks.
   * @param func The function to be added.
   */
  public fireOnDelete(func) {
    this.deletedCallbacks.add(func);
  }

  public removeFireOnDelete(func) {
    this.deletedCallbacks.remove(func);
  }

  /** Add function to action callbacks.
   * @param func The function to be added.
   */
  public fireOnAction(func) {
    this.actionCallbacks.add(func);
  }
  public removefireOnAction(func) {
    this.actionCallbacks.remove(func);
  }

  /**
   *
   */
  public snapToAxis(azimuthAngle: number) {
    // try to snap this corner to an axis
    const scope = this; //tslint:disable-line

    this.adjacentCorners().forEach((corner: Corner) => {
      chord.set(
        scope._position.x - corner._position.x,
        scope._position.z - corner._position.z
      );
      const angle = chord.angle();
      const newAngle = Utils.snapRotation(
        angle,
        true,
        Math.PI / 64,
        Math.PI / 2,
        azimuthAngle
      );
      chord.set(chord.length(), 0).rotateAround(origin, newAngle);

      scope._position.set(
        corner._position.x + chord.x,
        corner._position.y + 0,
        corner._position.z + chord.y
      );
      scope.update();
      this.wallStarts.forEach((wall: any) => {
        wall.fireMoved();
      });
      this.wallEnds.forEach((wall: any) => {
        wall.fireMoved();
      });
    });
  }

  /** Moves corner relatively to new position.
   * @param dx The delta x.
   * @param dy The delta y.
   */
  public relativeMove(relPosition: Vector3, tolerance?: number) {
    this.move(
      this.tempPositionVec.addVectors(this._positionBak, relPosition),
      tolerance
    );
  }

  public fireAction(action) {
    this.actionCallbacks.fire(action);
  }

  /** Remove callback. Fires the delete callbacks. */
  public remove() {
    this.deletedCallbacks.fire(this);
  }

  public removeWall(wall: Wall) {
    this.wallEnds = this.wallEnds.filter((wallEnd: Wall) => wallEnd !== wall);
    this.wallStarts = this.wallStarts.filter(
      (wallStart: Wall) => wallStart !== wall
    );
  }

  /** Removes all walls. */
  public removeAll() {
    this.wallStarts.forEach((wall) => wall.remove());
    this.wallEnds.forEach((wall) => wall.remove());
    this.remove();
  }

  public move(newPosition: Vector3, tolerance?: number) {
    this._position.set(newPosition.x, newPosition.y, newPosition.z);
    this.update();

    // if (tolerance) this.mergeWithIntersected(tolerance);

    this.wallStarts.forEach((wall: any) => {
      wall.fireMoved();
    });

    this.wallEnds.forEach((wall: any) => {
      wall.fireMoved();
    });
  }

  /** Gets the adjacent corners.
   * @returns Array of corners.
   */
  public adjacentCorners(): Corner[] {
    const retArray: Corner[] = [];
    for (let i = 0; i < this.wallStarts.length; i++) {
      retArray.push(this.wallStarts[i].getEnd());
    }
    for (let i = 0; i < this.wallEnds.length; i++) {
      retArray.push(this.wallEnds[i].getStart());
    }
    return retArray;
  }

  /** Checks if a wall is connected.
   * @param wall A wall.
   * @returns True in case of connection.
   */
  private isWallConnected(wall: Wall): boolean {
    return this.wallStarts.includes(wall) || this.wallEnds.includes(wall);
    // for (let i = 0; i < this.wallStarts.length; i++) {
    //   if (this.wallStarts[i] === wall) {
    //     return true;
    //   }
    // }
    // for (let i = 0; i < this.wallEnds.length; i++) {
    //   if (this.wallEnds[i] === wall) {
    //     return true;
    //   }
    // }
    // return false;
  }

  /** Gets the distance from a wall.
   * @param wall A wall.
   * @returns The distance.
   */
  public distanceFromWall(wall: Wall): number {
    return wall.distanceFrom(this._position.x, this._position.z);
  }

  /** Detaches a wall.
   * @param wall A wall.
   */
  public detachWall(wall: Wall) {
    this.wallStarts = this.wallStarts.filter((wallElement: Wall) => {
      return wallElement !== wall;
    });
    this.wallEnds = this.wallEnds.filter((wallElement: Wall) => {
      return wallElement !== wall;
    });
    if (this.wallStarts.length === 0 && this.wallEnds.length === 0) {
      this.remove();
    }
  }

  /** Attaches a start wall.
   * @param wall A wall.
   */
  public attachStart(wall: Wall) {
    this.wallStarts.push(wall);
  }

  /** Attaches an end wall.
   * @param wall A wall.
   */
  public attachEnd(wall: Wall) {
    this.wallEnds.push(wall);
  }

  /** Get wall to corner.
   * @param corner A corner.
   * @return The associated wall or null.
   */
  public wallTo(corner: Corner): Wall | null {
    for (let i = 0; i < this.wallStarts.length; i++) {
      if (this.wallStarts[i].getEnd() === corner) {
        return this.wallStarts[i];
      }
    }
    return null;
  }

  /** Get wall from corner.
   * @param corner A corner.
   * @return The associated wall or null.
   */
  public wallFrom(corner: Corner): Wall | null {
    for (let i = 0; i < this.wallEnds.length; i++) {
      if (this.wallEnds[i].getStart() === corner) {
        return this.wallEnds[i];
      }
    }
    return null;
  }

  /** Get wall to or from corner.
   * @param corner A corner.
   * @return The associated wall or null.
   */
  public wallToOrFrom(corner: Corner): Wall | null {
    return this.wallTo(corner) || this.wallFrom(corner);
  }

  /**
   *
   */
  private combineWithCorner(corner: Corner) {
    if (this === corner) return;
    // update position to other corner's
    this._position.copy(corner._position);
    // absorb the other corner's wallStarts and wallEnds
    for (let i = corner.wallStarts.length - 1; i >= 0; i--) {
      corner.wallStarts[i].setStart(this);
    }
    for (let i = corner.wallEnds.length - 1; i >= 0; i--) {
      corner.wallEnds[i].setEnd(this);
    }
    // delete the other corner
    corner.removeAll();
    this.removeDuplicateWalls();
    this.update();
    this.floorplan.update();
  }

  public updateWalls(walls: Wall[]) {
    this.wallEnds = this.wallEnds.filter((wallEnd: Wall) =>
      walls.some((wall: Wall) => wall === wallEnd)
    );
    this.wallStarts = this.wallStarts.filter((wallStart: Wall) =>
      walls.some((wall: Wall) => wall === wallStart)
    );
  }

  public mergeWithClosest(tolerance: number, corner?): boolean {
    // check corners
    if (corner) {
      this.combineWithCorner(corner);
    } else {
      for (let i = 0; i < this.floorplan.getCorners().length; i++) {
        const corner = this.floorplan.getCorners()[i];
        if (
          this._position.distanceTo(corner._position) < tolerance &&
          corner !== this
        ) {
          this.combineWithCorner(corner);
          return true;
        }
      }
    }
    // check walls
    for (let i = 0; i < this.floorplan.getWalls().length; i++) {
      const wall = this.floorplan.getWalls()[i];
      if (
        this.distanceFromWall(wall) < tolerance &&
        !this.isWallConnected(wall)
      ) {
        // update position to be on wall
        const intersection = Utils.closestPointOnLine(
          this._position.x,
          this._position.z,
          wall.getStart()._position.x,
          wall.getStart()._position.z,
          wall.getEnd()._position.x,
          wall.getEnd()._position.z
        );
        this._position.setX(intersection.x);
        this._position.setZ(intersection.y); /// hate this
        // merge this corner into wall by breaking wall into two parts
        this.floorplan.newWall(this, wall.getEnd());
        wall.setEnd(this);
        this.update();
        this.floorplan.update();
        return true;
      }
    }
    return false;
  }

  public mergeWithIntersected(wallOrCorner: Corner | Wall): Wall[] {
    // check corners
    if (wallOrCorner instanceof Corner) {
      this.combineWithCorner(wallOrCorner);
      return undefined;
    } else if (wallOrCorner instanceof Wall) {
      const wall = wallOrCorner;
      if (!this.isWallConnected(wall)) {
        // update position to be on wall
        const intersection = Utils.closestPointOnLine(
          this._position.x,
          this._position.z,
          wall.getStart()._position.x,
          wall.getStart()._position.z,
          wall.getEnd()._position.x,
          wall.getEnd()._position.z
        );
        this._position.setX(intersection.x);
        this._position.setZ(intersection.y); /// hate this
        // merge this corner into wall by breaking wall into two parts
        const newWall = this.floorplan.newWall(this, wall.getEnd());
        wall.setEnd(this);
        this.update();
        this.floorplan.update();
        return [wall, newWall];
      }
    }
    return undefined;
  }

  /** Ensure we do not have duplicate walls (i.e. same start and end points) */
  private removeDuplicateWalls() {
    // delete the wall between these corners, if it exists
    const wallEndpoints = {};
    const wallStartpoints = {};
    for (let i = this.wallStarts.length - 1; i >= 0; i--) {
      if (this.wallStarts[i].getEnd() === this) {
        // remove zero length wall
        this.wallStarts[i].remove();
      } else if (this.wallStarts[i].getEnd().id in wallEndpoints) {
        // remove duplicated wall
        this.wallStarts[i].remove();
      } else {
        wallEndpoints[this.wallStarts[i].getEnd().id] = true;
      }
    }
    for (let i = this.wallEnds.length - 1; i >= 0; i--) {
      if (this.wallEnds[i].getStart() === this) {
        // removed zero length wall
        this.wallEnds[i].remove();
      } else if (this.wallEnds[i].getStart().id in wallStartpoints) {
        // removed duplicated wall
        this.wallEnds[i].remove();
      } else {
        wallStartpoints[this.wallEnds[i].getStart().id] = true;
      }
    }
  }
}
