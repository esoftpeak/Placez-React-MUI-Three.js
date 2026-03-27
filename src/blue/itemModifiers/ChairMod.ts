import { Modifier } from './Modifier';
import { Asset } from '../items/asset';
import { Item } from '../items/item';
import {
  Vector3,
  Matrix4,
  Object3D,
  Vector2,
  Mesh,
  MeshStandardMaterial,
} from 'three';
import { Utils } from '../core/utils';
import { CameraLayers } from '../../models/BlueState';
import { ModifierBase } from './ModifierBase';
import { CSS3DLabelMaker } from '../three/CSS3DlabelMaker';
import { getFromLocalStorage } from '../../sharing/utils/localStorageHelper';

export interface ChairParams extends ModifierBase {
  // Admin Settings
  chairAsset?: Asset;
  chairAssetId?: number;
  tableType?: TableTypes;
  maxSeats?: number;

  // User Settings
  right?: boolean;
  top?: boolean;
  left?: boolean;
  bottom?: boolean;
  seatPositions?: SeatInstance[];
  seats?: number;
  distance?: number;
  seatWidth?: number;
  equalSpacing?: boolean;
}

export const defaultChairParams = {
  maxSeats: 20,
  top: true,
  bottom: true,
  left: true,
  right: true,
  seatWidth: 60,
  seats: null,
  equalSpacing: true,
  seatPositions: [],
  distance: 0,
};

const defualtChairScale = new Vector3(0.096, 0.384, 0.003);

export interface SeatInstance {
  id: number;
  chairModifierId: number;
  position: number[];
  empty?: boolean;
  hidden?: boolean;
  instancePlaceSettingAsset?: Asset;
  instanceChairAsset?: Asset;
  chairNumber?: number;
  chairIndex?: number;
  organizationId?: number;
}

const defaultSeatInstance: SeatInstance = {
  id: 0,
  chairModifierId: 0,
  position: [],
  empty: false,
  instancePlaceSettingAsset: undefined,
  instanceChairAsset: undefined,
  chairNumber: undefined,
  chairIndex: undefined,
  hidden: false,
};

export enum TableTypes {
  Square = 'Square',
  Round = 'Round',
  Banquet = 'Banquet',
  Preset = 'Preset',
  Oval = 'Oval',
  Sweetheart = 'Sweetheart',
  Serpentine = 'Serpentine',
}

export interface TableSideParams {
  position: TableSide;
  seats: number;
  x: number;
  z: number;
  space: number;
}

export enum TableSide {
  Right,
  Top,
  Left,
  Bottom,
}

export class ChairMod extends Modifier {
  public chairModels: Object3D;
  // protected params: ChairParams;

  protected placeSettingDepth: number = 34;
  protected placeSettingWidth: number = 50;

  private topSide: TableSideParams | undefined;
  private bottomSide: TableSideParams | undefined;
  private leftSide: TableSideParams | undefined;
  private rightSide: TableSideParams | undefined;
  public tableWidth: number | undefined;
  public maxSeats: number;

  private seatPositions: SeatInstance[] = [];

  constructor(item: Item) {
    super(item);
    this.chairModels = new Object3D();
    // this.params = {};
  }

  public build(params: ChairParams): Promise<unknown> {
    return new Promise((resolve, reject) => {
      this.item.remove(this.modifiers);
      this.asset = params && params.chairAsset ? params.chairAsset : undefined;
      this.placeSettingWidth = params.seatWidth
        ? params.seatWidth
        : this.placeSettingWidth;
      this.seatPositions = params.seatPositions ?? [];

      if (this.asset) {
        this.loadGLTF(
          params.chairAsset,
          this.buildChairs(params, resolve).bind(this),
          resolve
        );
      } else {
        resolve(undefined); // TODO Reject
      }
    });
  }

  private shiftLeft(placeSettingDepth) {
    if (this.topSide) {
      this.topSide.space -= placeSettingDepth;
      this.topSide.x -= placeSettingDepth / 2;
    }
    if (this.bottomSide) {
      this.bottomSide.space -= placeSettingDepth;
      this.bottomSide.x -= placeSettingDepth / 2;
    }
  }

  private shiftRight(placeSettingDepth) {
    if (this.topSide) {
      this.topSide.space -= placeSettingDepth;
      this.topSide.x += placeSettingDepth / 2;
    }
    if (this.bottomSide) {
      this.bottomSide.space -= placeSettingDepth;
      this.bottomSide.x += placeSettingDepth / 2;
    }
  }

  public getSeatPositions(): SeatInstance[] {
    return this.seatPositions;
  }

  private buildMaxSeatPositions(
    maxSeats: number,
    seats: number,
    seatPositions: SeatInstance[]
  ): SeatInstance[] {
    return [...Array(maxSeats).keys()]
      .map((i) => i + 1)
      .map((chairIndex: number): SeatInstance => {
        if (seatPositions.length > 0) {
          const existingSeat = seatPositions.find(
            (seatPosition: SeatInstance) => {
              return (
                seatPosition.chairIndex === chairIndex &&
                seatPosition.chairIndex <= seats
              );
            }
          );
          if (existingSeat) return existingSeat;
        }
        return {
          ...defaultSeatInstance,
          chairIndex,
        };
      });
  }

  private maskSavedSeatPositions(
    oldSeatPositions: SeatInstance[],
    newSeatPositions: SeatInstance[]
  ): SeatInstance[] {
    return oldSeatPositions.reduce((acc, seat: SeatInstance) => {
      const newPositionAtIndex = newSeatPositions.find(
        (newSeat: SeatInstance) => {
          return newSeat.chairIndex === seat.chairIndex;
        }
      );
      if (newPositionAtIndex) {
        acc.push({
          ...seat,
          position: newPositionAtIndex.position,
        });
      }
      return acc;
    }, []);
  }

  public computeRectSeatPositions(
    seatWidth: number,
    params: ChairParams
  ): SeatInstance[] {
    const { seats, right, top, left, bottom } = params;
    const seatPositions = params.seatPositions ?? [];
    // Left and Right are short sides
    let table: TableSideParams[] = [];

    this.rightSide = undefined;
    this.topSide = undefined;
    this.leftSide = undefined;
    this.bottomSide = undefined;

    if (right && this.item.getDepth() > seatWidth) {
      this.rightSide = {
        position: TableSide.Right,
        seats: 0,
        x: this.item.getWidth() / 2,
        z: 0,
        space: this.item.getDepth(),
      };
      table.push(this.rightSide);
    }

    if (top && this.item.getWidth() > seatWidth) {
      this.topSide = {
        position: TableSide.Top,
        seats: 0,
        x: 0,
        z: -this.item.getDepth() / 2,
        space: this.item.getWidth(),
      };
      table.push(this.topSide);
    }

    if (left && this.item.getDepth() > seatWidth) {
      this.leftSide = {
        position: TableSide.Left,
        seats: 0,
        x: -this.item.getWidth() / 2,
        z: 0,
        space: this.item.getDepth(),
      };
      table.push(this.leftSide);
    }

    if (bottom && this.item.getWidth() > seatWidth) {
      this.bottomSide = {
        position: TableSide.Bottom,
        seats: 0,
        x: 0,
        z: this.item.getDepth() / 2,
        space: this.item.getWidth(),
      };
      table.push(this.bottomSide);
    }

    if (
      this.rightSide &&
      this.item.getDepth() - 2 * this.placeSettingDepth < seatWidth
    ) {
      // this.shiftLeft(placeSettingDepth); // This prevent Place Setting Overlap
    }
    if (
      this.leftSide &&
      this.item.getDepth() - 2 * this.placeSettingDepth < seatWidth
    ) {
      // this.shiftRight(placeSettingDepth); // This prevents Place Setting Overlap
    }

    if (this.topSide) {
      this.tableWidth = this.topSide.space;
    } else if (this.bottomSide) {
      this.tableWidth = this.bottomSide.space;
    } else {
      this.tableWidth = this.item.getWidth();
    }

    table = table.filter((side) => {
      return side.space > 0;
    });

    // Compute MaxSeats
    const maxSeats = table.reduce((maxSeats: number, side: TableSideParams) => {
      if (
        side.position === TableSide.Left ||
        side.position === TableSide.Right
      ) {
        return maxSeats + 1;
      }
      return maxSeats + Math.floor(side.space / seatWidth);
    }, 0);
    // build max seat positions

    this.seatPositions = this.buildMaxSeatPositions(
      maxSeats,
      seats,
      seatPositions
    );

    let seatsLeft = Math.floor(Math.min(seats, maxSeats));

    if (this.leftSide) {
      this.leftSide.seats = 1;
      // this.leftSide.space -= seatWidth;
      this.leftSide.space = 0; // Only one seat left and right
      seatsLeft--;
    }

    if (this.rightSide && seatsLeft > 0) {
      this.rightSide.seats = 1;
      // this.rightSide.space -= seatWidth;
      this.rightSide.space = 0; // Only one seat left and right
      seatsLeft--;
    }

    // Put the rest of the chairs where there is room
    while (seatsLeft > 0) {
      // Sort the sides of the table
      table.sort((a, b) => {
        return b.space - a.space;
      });
      if (table[0].space >= seatWidth) {
        table[0].seats++;
        table[0].space -= seatWidth;
        seatsLeft--;
      } else {
        console.warn('Planner: Too many seats');
        break;
      }
    }

    const newSeatPositions = this.buildRectTable(table);
    this.seatPositions = this.maskSavedSeatPositions(
      this.seatPositions,
      newSeatPositions
    );
    this.seatPositions = adjustChairNumberLabels(this.seatPositions);

    return this.seatPositions;
  }

  public computeSquareSeatPositions(
    seatWidth: number,
    params: ChairParams
  ): SeatInstance[] {
    const { seats, right, top, left, bottom } = params;
    const seatPositions = params.seatPositions ?? [];

    this.rightSide = undefined;
    this.topSide = undefined;
    this.leftSide = undefined;
    this.bottomSide = undefined;

    const table: TableSideParams[] = [];

    if (right && this.item.getDepth() > seatWidth) {
      this.rightSide = {
        position: TableSide.Right,
        seats: 0,
        x: this.item.getWidth() / 2,
        z: 0,
        space: this.item.getDepth(),
      };
      table.push(this.rightSide);
    }

    if (top && this.item.getWidth() > seatWidth) {
      this.topSide = {
        position: TableSide.Top,
        seats: 0,
        x: 0,
        z: -this.item.getDepth() / 2,
        space: this.item.getWidth(),
      };
      table.push(this.topSide);
    }

    if (left && this.item.getDepth() > seatWidth) {
      this.leftSide = {
        position: TableSide.Left,
        seats: 0,
        x: -this.item.getWidth() / 2,
        z: 0,
        space: this.item.getDepth(),
      };
      table.push(this.leftSide);
    }

    if (bottom && this.item.getWidth() > seatWidth) {
      this.bottomSide = {
        position: TableSide.Bottom,
        seats: 0,
        x: 0,
        z: this.item.getDepth() / 2,
        space: this.item.getWidth(),
      };
      table.push(this.bottomSide);
    }

    // Compute MaxSeats
    const maxSeats = table.reduce((maxSeats: number, side: TableSideParams) => {
      return maxSeats + Math.floor(side.space / seatWidth);
    }, 0);

    this.seatPositions = this.buildMaxSeatPositions(
      maxSeats,
      seats,
      seatPositions
    );

    this.tableWidth = this.item.getWidth();

    let seatsLeft = Math.floor(Math.min(seats, maxSeats));

    if (this.leftSide) {
      this.leftSide.seats = 1;
      this.leftSide.space -= seatWidth;
      seatsLeft--;
    }

    if (this.rightSide && seatsLeft > 0) {
      this.rightSide.seats = 1;
      this.rightSide.space -= seatWidth;
      seatsLeft--;
    }

    // Put the rest of the chairs where there is room
    while (seatsLeft > 0) {
      // Sort the sides of the table
      table.sort((a, b) => {
        return b.space - a.space;
      });
      if (table[0].space >= seatWidth) {
        table[0].seats++;
        table[0].space = table[0].space - seatWidth;
        seatsLeft--;
      } else {
        console.warn('Planner: Too many seats');
        break;
      }
    }

    // Build the Table from table object
    table.sort((a, b) => {
      return a.position - b.position;
    });

    const newSeatPositions = this.buildRectTable(table);
    this.seatPositions = this.maskSavedSeatPositions(
      this.seatPositions,
      newSeatPositions
    );
    this.seatPositions = adjustChairNumberLabels(this.seatPositions);

    return this.seatPositions;
  }

  public computeSweetheartSeatPositions(
    seatWidth: number,
    params: ChairParams
  ): SeatInstance[] {
    const { seats, top, bottom } = params;
    const seatPositions = params.seatPositions ?? [];

    const table: TableSideParams[] = [];

    this.tableWidth = this.item.getWidth();

    if (top && this.item.getWidth() > seatWidth) {
      this.topSide = {
        position: TableSide.Top,
        seats: 0,
        x: 0,
        z: 0,
        space: this.tableWidth,
      };
      table.push(this.topSide);
    }
    if (bottom && this.item.getWidth() > seatWidth) {
      this.bottomSide = {
        position: TableSide.Bottom,
        seats: 0,
        x: 0,
        z: 0,
        space: (2 * Math.PI * (this.tableWidth / 2)) / 2,
      };
      table.push(this.bottomSide);
    }
    // Compute MaxSeats
    const maxSeats = table.reduce((maxSeats: number, side: TableSideParams) => {
      return maxSeats + Math.floor(side.space / seatWidth);
    }, 0);

    this.seatPositions = this.buildMaxSeatPositions(
      maxSeats,
      seats,
      seatPositions
    );

    let seatsLeft = Math.floor(Math.min(seats, maxSeats));

    if (this.topSide && seatsLeft > 0) {
      this.topSide.seats++;
      this.topSide.space -= seatWidth;
      seatsLeft--;
    }

    if (this.topSide && seatsLeft > 0) {
      this.topSide.seats++;
      this.topSide.space -= seatWidth;
      seatsLeft--;
    }

    // Put the rest of the chairs where there is room
    while (seatsLeft > 0) {
      // Sort the sides of the table
      table.sort((a, b) => {
        return b.space - a.space;
      });
      if (table[0].space >= seatWidth) {
        table[0].seats++;
        table[0].space -= seatWidth;
        seatsLeft--;
      } else {
        console.warn('Planner: Too many seats');
        break;
      }
    }

    const newSeatPositions = this.buildSweetheartTable(table);

    this.seatPositions = this.maskSavedSeatPositions(
      this.seatPositions,
      newSeatPositions
    );
    this.seatPositions = adjustChairNumberLabels(this.seatPositions);
    return this.seatPositions;
  }

  public buildRectTable(table: TableSideParams[]): SeatInstance[] {
    const out: number[][] = [];
    for (const side in table) {
      const mat = new Matrix4();
      switch (table[side].position) {
        case TableSide.Right:
          mat.makeRotationY(Math.PI);
          break;
        case TableSide.Top:
          mat.makeRotationY((3 * Math.PI) / 2);
          break;
        case TableSide.Left:
          mat.makeRotationY(0);
          break;
        case TableSide.Bottom:
          mat.makeRotationY(Math.PI / 2);
          break;
      }
      for (let seat = 1; seat <= table[side].seats; seat++) {
        const pos = new Vector3(table[side].x, 0, table[side].z);

        const width = this.placeSettingWidth * table[side].seats;
        if (
          table[side].position === TableSide.Top ||
          table[side].position === TableSide.Bottom
        ) {
          // pos.x =  table[side].x + this.spreadSeats(this.item.getWidth(), table[side].seats, seat); // Around Justified
          pos.x =
            table[side].x + this.spreadSeats(width, table[side].seats, seat); // Center Justified
        } else {
          // pos.z =  this.spreadSeats(this.item.getDepth(), table[side].seats, seat ); // Around Justified
          pos.z = this.spreadSeats(width, table[side].seats, seat); // Center Justified
        }
        mat.setPosition(pos);
        const result = mat.clone();
        out.push(result.toArray());
      }
    }

    this.sortRectangleSeatPositions(
      out,
      this.item.getWidth(),
      this.item.getDepth()
    );

    return out.map((seatPos: number[], index: number): SeatInstance => {
      return {
        ...defaultSeatInstance,
        position: seatPos,
        chairNumber: index + 1,
        chairIndex: index + 1,
      };
    });
  }

  public buildSweetheartTable(table: TableSideParams[]): SeatInstance[] {
    const out: number[][] = [];
    for (const side in table) {
      if (table[side].position === TableSide.Top) {
        const mat = new Matrix4();
        mat.makeRotationY((3 * Math.PI) / 2);
        for (let seat = 1; seat <= table[side].seats; seat++) {
          const pos = new Vector3(table[side].x, 0, table[side].z);

          const width = this.placeSettingWidth * table[side].seats;
          if (
            table[side].position === TableSide.Top ||
            table[side].position === TableSide.Bottom
          ) {
            // pos.x =  table[side].x + this.spreadSeats(this.item.getWidth(), table[side].seats, seat); // Around Justified
            pos.x =
              table[side].x + this.spreadSeats(width, table[side].seats, seat); // Center Justified
          } else {
            // pos.z =  this.spreadSeats(this.item.getDepth(), table[side].seats, seat ); // Around Justified
            pos.z = this.spreadSeats(width, table[side].seats, seat); // Center Justified
          }
          mat.setPosition(pos);
          const result = mat.clone();
          out.push(result.toArray());
        }
      }
      if (table[side].position === TableSide.Bottom) {
        const box = new Vector3();
        this.item.boundingBox.getSize(box); // TODO not pure
        const a = box.x / 2;
        const b = box.z / 2;
        for (let i = 1; i <= table[side].seats; i++) {
          const theta = (i * Math.PI) / (table[side].seats + 1);
          const mat = new Matrix4();
          mat.makeTranslation(a * Math.cos(theta), 0, b * Math.sin(theta));
          const spin = new Matrix4();
          spin.makeRotationY(Math.PI - theta);
          mat.multiply(spin);
          out.push(mat.toArray());
        }
      }
    }

    this.sortRectangleSeatPositions(
      out,
      this.item.getWidth(),
      this.item.getDepth()
    );

    return out.map((seatPos: number[], index: number): SeatInstance => {
      return {
        ...defaultSeatInstance,
        position: seatPos,
        chairNumber: index + 1,
        chairIndex: index + 1,
      };
    });
  }

  public buildSerpentineTable(table: TableSideParams[]): SeatInstance[] {
    const out: number[][] = [];
    for (const side in table) {
      if (table[side].position === TableSide.Top) {
        const mat = new Matrix4();
        mat.makeRotationY(0);
        for (let seat = 1; seat <= table[side].seats; seat++) {
          const pos = new Vector3(table[side].x, 0, table[side].z);
          pos.z =
            table[side].z +
            this.spreadSeats(this.item.getDepth() / 2, table[side].seats, seat); // Around Justified
          mat.setPosition(pos);
          const result = mat.clone();
          out.push(result.toArray());
        }
      }
      if (table[side].position === TableSide.Bottom) {
        const mat = new Matrix4();
        mat.makeRotationY(Math.PI / 2);
        for (let seat = 1; seat <= table[side].seats; seat++) {
          const pos = new Vector3(table[side].x, 0, table[side].z);
          pos.x =
            table[side].x +
            this.spreadSeats(this.item.getWidth() / 2, table[side].seats, seat); // Around Justified
          mat.setPosition(pos);
          const result = mat.clone();
          out.push(result.toArray());
        }
      }
      if (table[side].position === TableSide.Left) {
        const box = new Vector3();
        this.item.boundingBox.getSize(box); // TODO not pure
        const a = box.x / 2;
        const b = box.z / 2;
        for (let i = 1; i <= table[side].seats; i++) {
          const theta =
            (3 / 2) * Math.PI + (i * Math.PI) / 2 / (table[side].seats + 1);
          const mat = new Matrix4();
          mat.makeTranslation(
            a * Math.cos(theta) + table[side].x,
            0,
            b * Math.sin(theta) + table[side].z
          );
          const spin = new Matrix4();
          spin.makeRotationY(2 * Math.PI - theta);
          mat.multiply(spin);
          out.push(mat.toArray());
        }
      }
      if (table[side].position === TableSide.Right) {
        const box = new Vector3();
        this.item.boundingBox.getSize(box); // TODO not pure
        const a = box.x;
        const b = box.z;
        for (let i = 1; i <= table[side].seats; i++) {
          const theta =
            (3 / 2) * Math.PI + (i * Math.PI) / 2 / (table[side].seats + 1);
          const mat = new Matrix4();
          mat.makeTranslation(
            a * Math.cos(theta) + table[side].x,
            0,
            b * Math.sin(theta) + table[side].z
          );
          const spin = new Matrix4();
          spin.makeRotationY(Math.PI - theta);
          mat.multiply(spin);
          out.push(mat.toArray());
        }
      }
    }

    this.sortRectangleSeatPositions(
      out,
      this.item.getWidth(),
      this.item.getDepth()
    );

    return out.map((seatPos: number[], index: number): SeatInstance => {
      return {
        ...defaultSeatInstance,
        position: seatPos,
        chairNumber: index + 1,
        chairIndex: index + 1,
      };
    });
  }

  public spreadSeats(
    length: number,
    numberOfSeats: number,
    index: number
  ): number {
    return ((index * 2 - 1) * length) / (numberOfSeats * 2) - length / 2;
  }

  public computeOvalSeatPositions(
    seatWidth: number,
    params: ChairParams
  ): SeatInstance[] {
    const { seats, maxSeats, equalSpacing } = params;
    const seatPositions = params.seatPositions ?? [];
    const box = new Vector3();
    this.item.boundingBox.getSize(box); // TODO not pure
    const a = box.x / 2;
    const b = box.z / 2;
    const out: number[][] = [];

    const circumference = Utils.distanceAlongEllipse(a, b, 0, 2 * Math.PI);
    const fillSeats = this.item.asset?.resizable
      ? Math.min(Math.ceil(circumference / seatWidth), maxSeats)
      : maxSeats;
    const minSeats = Math.min(seats, fillSeats);

    this.seatPositions = this.buildMaxSeatPositions(
      maxSeats,
      seats,
      seatPositions
    );
    const angles = Utils.anglesForEllipse(
      a,
      b,
      Math.PI / 2,
      (5 * Math.PI) / 2,
      seatWidth,
      equalSpacing,
      minSeats
    );

    angles.forEach((angle: number) => {
      const mat = new Matrix4();
      const x = a * Math.cos(angle);
      const z = b * Math.sin(angle);
      mat.makeRotationY(
        Math.PI - Math.atan2(a * Math.sin(angle), b * Math.cos(angle))
      );
      mat.setPosition(x, 0, z);
      out.push(mat.toArray());
    });

    const newSeatPositions = out.map(
      (seatPos: number[], index: number): SeatInstance => {
        return {
          ...defaultSeatInstance,
          position: seatPos,
          chairNumber: index + 1,
          chairIndex: index + 1,
        };
      }
    );

    this.seatPositions = this.maskSavedSeatPositions(
      this.seatPositions,
      newSeatPositions
    );
    this.seatPositions = adjustChairNumberLabels(this.seatPositions);
    return this.seatPositions;
  }

  public computeSerpentineSeatPositions(
    seatWidth: number,
    params: ChairParams
  ): SeatInstance[] {
    const { seats, top, bottom } = params;
    const seatPositions = params.seatPositions ?? [];
    const insideArc = params.left;
    const outsideArc = params.right;
    const table: TableSideParams[] = [];

    this.tableWidth = this.item.getWidth();

    if (top && this.item.getWidth() / 2 > seatWidth) {
      this.topSide = {
        position: TableSide.Top,
        seats: 0,
        x: -this.item.getDepth() / 2,
        z: -this.item.getDepth() / 4,
        space: this.tableWidth / 2,
      };
      table.push(this.topSide);
    }
    if (bottom && this.item.getWidth() / 2 > seatWidth) {
      this.bottomSide = {
        position: TableSide.Bottom,
        seats: 0,
        x: this.item.getDepth() / 4,
        z: this.item.getDepth() / 2,
        space: this.tableWidth / 2,
      };
      table.push(this.bottomSide);
    }
    const insideSpace = (2 * Math.PI * (this.tableWidth / 2)) / 4;
    if (insideArc && insideSpace > seatWidth) {
      this.leftSide = {
        position: TableSide.Left,
        seats: 0,
        x: -this.item.getWidth() / 2,
        z: this.item.getDepth() / 2,
        space: insideSpace,
      };
      table.push(this.leftSide);
    }
    const outsideSpace = (2 * Math.PI * this.tableWidth) / 4;
    if (outsideArc && outsideSpace > seatWidth) {
      this.rightSide = {
        position: TableSide.Right,
        seats: 0,
        x: -this.item.getWidth() / 2,
        z: this.item.getDepth() / 2,
        space: outsideSpace,
      };
      table.push(this.rightSide);
    }
    // Compute MaxSeats
    const maxSeats = table.reduce((maxSeats: number, side: TableSideParams) => {
      return maxSeats + Math.floor(side.space / seatWidth);
    }, 0);

    this.seatPositions = this.buildMaxSeatPositions(
      maxSeats,
      seats,
      seatPositions
    );

    let seatsLeft = Math.floor(Math.min(seats, maxSeats));

    // Put the rest of the chairs where there is room
    while (seatsLeft > 0) {
      // Sort the sides of the table
      table.sort((a, b) => {
        return b.space - a.space;
      });
      if (table[0].space >= seatWidth) {
        table[0].seats++;
        table[0].space -= seatWidth;
        seatsLeft--;
      } else {
        console.warn('Planner: Too many seats');
        break;
      }
    }

    const newSeatPositions = this.buildSerpentineTable(table);
    this.seatPositions = this.maskSavedSeatPositions(
      this.seatPositions,
      newSeatPositions
    );
    this.seatPositions = adjustChairNumberLabels(this.seatPositions);
    return this.seatPositions;
  }

  private sortRectangleSeatPositions = (
    seatPositions: number[][],
    width: number,
    depth: number
  ): number[][] => {
    const topLeftCorner = new Vector2(-width, depth);
    const startAngle = topLeftCorner.angle();

    return seatPositions.sort((a, b) => {
      const aAngle = Utils.convertAngle0To2Pi(
        new Vector2(a[12], a[14]).angle() + startAngle
      ); // now reeduce to 0-2PI
      const bAngle = Utils.convertAngle0To2Pi(
        new Vector2(b[12], b[14]).angle() + startAngle
      );
      return aAngle - bAngle;
    });
  };

  private buildChairs = (params: ChairParams, callback) => (chair: Mesh) => {
    this.chairModels.remove(...this.chairModels.children); // THIS is how children should be removed

    if (params.seats === 0 || !params.seats) {
      this.seatPositions = [];
    } else if (params.tableType === TableTypes.Banquet) {
      this.seatPositions = this.computeRectSeatPositions(
        this.placeSettingWidth,
        params
      );
    } else if (params.tableType === TableTypes.Square) {
      this.seatPositions = this.computeSquareSeatPositions(
        this.placeSettingWidth,
        params
      );
    } else if (params.tableType === TableTypes.Round) {
      this.seatPositions = this.computeOvalSeatPositions(
        this.placeSettingWidth,
        params
      );
    } else if (params.tableType === TableTypes.Oval) {
      this.seatPositions = this.computeOvalSeatPositions(
        this.placeSettingWidth,
        params
      );
    } else if (params.tableType === TableTypes.Sweetheart) {
      this.seatPositions = this.computeSweetheartSeatPositions(
        this.placeSettingWidth,
        params
      );
    } else if (params.tableType === TableTypes.Serpentine) {
      this.seatPositions = this.computeSerpentineSeatPositions(
        this.placeSettingWidth,
        params
      );
    } else if (
      params.seatPositions !== undefined &&
      params.seatPositions !== null
    ) {
      const seats = Math.min(params.seats, params.seatPositions.length);
      this.seatPositions = params.seatPositions.slice(0, seats);
    }

    this.seatPositions = this.adjustChairNumbers(this.seatPositions);

    let hiddenMaterial;
    if (this.item.configureMode) {
      hiddenMaterial = new MeshStandardMaterial({
        color: this.item.selectColor,
        transparent: true,
        opacity: 0.4,
      });
    }

    for (let seat = 0; seat < this.seatPositions.length; seat++) {
      if (
        this.seatPositions[seat].position.length === 0 ||
        (!this.item.configureMode && this.seatPositions[seat].hidden)
      )
        continue;
      const depthMat = new Matrix4().setPosition(
        params.distance ? -params.distance : 0,
        0,
        0
      );
      const mat4 = new Matrix4().fromArray(this.seatPositions[seat].position);
      const singleSeat = chair.clone();

      if (this.item.configureMode && this.seatPositions[seat].hidden) {
        singleSeat.material = hiddenMaterial.clone();
      }

      singleSeat.castShadow = true;
      singleSeat.applyMatrix4(depthMat);
      singleSeat.applyMatrix4(mat4);
      singleSeat.updateMatrix();
      singleSeat.userData.type = 'chair';
      singleSeat.userData.chairNumber = this.seatPositions[seat].chairNumber;
      singleSeat.userData.chairIndex = this.seatPositions[seat].chairIndex;
      singleSeat.userData.tableInstanceId = this.item.asset.instanceId;
      singleSeat.layers.set(CameraLayers.Items);
      this.createChairLabel(singleSeat);
      this.chairModels.add(singleSeat);
    }
    this.modifiers.add(this.chairModels);
    if (this.scene) {
      this.scene.update();
    }
    this.item.add(this.modifiers);
    callback(this.seatPositions);
  };

  public updateLabels = () => {
    this.chairModels.children.forEach((seat: Mesh) => {
      this.createChairLabel(seat);
    });
  };

  private createChairLabel = (singleSeat: Mesh) => {
    if (singleSeat.userData.chairNumber === undefined) return;
    for (const children of singleSeat.children) {
      singleSeat.remove(children);
    }
    const labelSize = Utils.scaleFactor(getFromLocalStorage('Chair Number'));
    const chairlabelMaker = new CSS3DLabelMaker(
      {
        labelText: `${singleSeat.userData.chairNumber}`,
        margin: 2,
        borderRadius: 5,
        borderThickness: 2,
      },
      CameraLayers.ChairNumberLabel
    );
    const chairLabel = chairlabelMaker.getObject();
    chairLabel.scale.set(0.01, 0.01, 0.01);
    chairLabel.position.setY(60 / singleSeat.scale.y);
    chairLabel.position.setX(-65 / singleSeat.scale.y);
    chairLabel.rotation.z = (3 * Math.PI) / 2;
    chairLabel.scale.multiplyScalar(labelSize);
    singleSeat.add(chairLabel);
  };

  private adjustChairNumbers = (
    seatInstances: SeatInstance[]
  ): SeatInstance[] => {
    return seatInstances
      .sort((seatA: SeatInstance, seatB: SeatInstance): number => {
        return seatA.chairNumber - seatB.chairNumber;
      })
      .map((seat: SeatInstance, index: number): SeatInstance => {
        return {
          ...seat,
          // chairNumber: index + 1,
        };
      });
  };
}

export const adjustChairNumberLabels = (
  seatPositions: SeatInstance[]
): SeatInstance[] => {
  const availabelSeats = seatPositions
    .filter((seatPosition: SeatInstance) => {
      return seatPosition.position !== undefined && !seatPosition.hidden;
    })
    .sort((seatA: SeatInstance, seatB: SeatInstance) => {
      return seatA.chairIndex - seatB.chairIndex;
    })
    .map((seatPosition: SeatInstance, index: number) => {
      return {
        ...seatPosition,
        chairNumber: index + 1,
      };
    });

  return seatPositions.map((seatPosition: SeatInstance): SeatInstance => {
    if (seatPosition.hidden) {
      return {
        ...seatPosition,
        chairNumber: undefined,
      };
    }
    const shiftedChairNumber = availabelSeats.find(
      (availableSeatPosition: SeatInstance): boolean => {
        return seatPosition.chairIndex === availableSeatPosition.chairIndex;
      }
    );
    if (shiftedChairNumber) {
      return {
        ...seatPosition,
        chairNumber: shiftedChairNumber.chairNumber,
      };
    }
    return seatPosition;
  });
};
