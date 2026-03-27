import { FloorItem } from './floor_item';
import { WallItem } from './wall_item';
import { InWallItem } from './in_wall_item';
import { InWallFloorItem } from './in_wall_floor_item';
import { OnFloorItem } from './on_floor_item';
import { WallFloorItem } from './wall_floor_item';
import { CeilingItem } from './ceiling_item';

/** Enumeration of item types. */
const itemTypes = {
  FloorItem,
  WallItem,
  InWallItem,
  InWallFloorItem,
  OnFloorItem,
  WallFloorItem,
  CeilingItem,
};

export enum AssetClassType {
  Item = 'Item',
  FloorItem = 'FloorItem',
  OnFloorItem = 'OnFloorItem',
  WallItem = 'WallItem',
  InWallItem = 'InWallItem',
  WallFloorItem = 'WallFloorItem',
  InWallFloorItem = 'InWallFloorItem',
  CeilingItem = 'CeilingItem',
}

/** Factory class to create items. */
export class Factory {
  /** Gets the class for the specified item. */
  public static getClass(itemType) {
    return itemTypes[itemType];
  }
}
