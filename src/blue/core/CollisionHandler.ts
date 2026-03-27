import { store } from '../..';
import { LocalStorageKey } from '../../components/Hooks/useLocalStorageState';
import { ReduxState } from '../../reducers';
import { getFromLocalStorage } from '../../sharing/utils/localStorageHelper';
import { Item } from '../items/item';
import { Scene } from '../model/scene';

const collisionGroups = [
  ['FloorItem'],
  ['WallItem', 'WallFloorItem', 'InWallItem', 'InWallFloorItem'],
  ['OnFloorItem'],
  ['CeilingItem'],
];

//CollisionHandler should manage the restrictions on movement of items.
//All of the collision logics should be implemented here and removed from item and controller.
export class CollisionHandler {
  private scene: Scene;
  constructor(scene: Scene) {
    this.scene = scene;
  }
  private numberOfRooms = 0;
  public setNumberOfRooms(numberOfRooms: number) {
    this.numberOfRooms = numberOfRooms;
  }
  private keepInRoom =
    getFromLocalStorage(LocalStorageKey.KeepInRoom) &&
    this.numberOfRooms &&
    this.numberOfRooms !== 0;
  private preventCollision = getFromLocalStorage(
    LocalStorageKey.CollisionPrevention
  );
  private detectCollision = getFromLocalStorage(
    LocalStorageKey.CollisionDetection
  );
  private ignoreFixed = (store.getState() as ReduxState).blue.ignoreFixed;

  private _collisionItems: Item[] = [];

  // Getter for collisionItems
  public get collisionItems(): Item[] {
    // You can perform some additional logic or validation here
    return this._collisionItems;
  }

  // Setter for collisionItems
  private set collisionItems(items: Item[]) {
    // Validation or logic before setting the value
    this._collisionItems = items;
  }

  private _intersectionItems: Item[] = [];

  // Getter for collisionItems
  public get intersectionItems(): Item[] {
    // You can perform some additional logic or validation here
    return this._intersectionItems;
  }

  // Setter for collisionItems
  private set intersectionItems(items: Item[]) {
    // Validation or logic before setting the value
    this._intersectionItems = items;
  }

  private getCollisionGroupForItem = (item: Item) => {
    return collisionGroups.find((group) =>
      group.includes(item.asset.classType)
    );
  };

  private isNotSelf = (item: Item, selectedItems: Item[]): boolean => {
    return selectedItems.every(
      (selectedItem) => selectedItem.uuid !== item.uuid
    );
  };

  private canCollideClass = (item: Item, collisionGroup: string[]): boolean => {
    return collisionGroup.includes(item.asset.classType);
  };

  private isCollidable = (item: Item, ignoreFixed: boolean): boolean => {
    return (
      !ignoreFixed ||
      item.asset?.extensionProperties?.fixed === undefined ||
      (ignoreFixed && item.asset?.extensionProperties?.fixed)
    );
  };

  private isNotPartOfGroup = (item: Item, selectedItems: Item[]): boolean => {
    return selectedItems.every(
      (selectedItem: Item) => selectedItem.asset.groupId !== item.asset.groupId
    );
  };

  private ifTempDontCollideWithTemp = (
    item: Item,
    selectedItems: Item[]
  ): boolean => {
    if (
      selectedItems.every(
        (selectedItem) => selectedItem.asset.groupId === 'temp'
      )
    ) {
      return item.asset.groupId !== 'temp';
    }
    return true;
  };

  // get collision items for selectedItems on select
  public getCollisionItemsForSelected = (selectedItems: Item[]) => {
    const items = this.scene.getItems();
    const fixtureItems = this.scene.getFixtureItems();
    const collidesWithClasses = this.getCollisionGroupForItem(selectedItems[0]);
    this.collisionItems = items.concat(fixtureItems).filter((item) => {
      // think about what a group of dissimilar items collides with
      return (
        this.ifTempDontCollideWithTemp(item, selectedItems) &&
        this.isCollidable(item, this.ignoreFixed) &&
        this.isNotSelf(item, selectedItems) &&
        this.canCollideClass(item, collidesWithClasses) &&
        // this.isNotPartOfGroup(item, selectedItems) &&
        true
      );
    });
  };

  public getIntersectionItemsForSelected = (selectedItems: Item[]) => {
    if (selectedItems[0].asset.classType === 'FloorItem') {
      const items = this.scene.getItems();
      const fixtureItems = this.scene.getFixtureItems();
      const collidesWithClasses = this.getCollisionGroupForItem(
        selectedItems[0]
      ).concat('OnFloorItem');

      this.intersectionItems = items.concat(fixtureItems).filter((item) => {
        // think about what a group of dissimilar items collides with
        return (
          this.isCollidable(item, this.ignoreFixed) &&
          this.isNotSelf(item, selectedItems) &&
          this.canCollideClass(item, collidesWithClasses) &&
          // this.isNotPartOfGroup(item, selectedItems) &&
          true
        );
      });
    } else {
      this.intersectionItems = this.collisionItems;
    }
  };
}
