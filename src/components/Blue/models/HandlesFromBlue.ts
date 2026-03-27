import { Item } from '../../../blue/items/item';
import { Asset } from '../../../blue/items';
import { Photosphere } from './Photosphere';
import { Attendee } from '../../../api';
import {
  HorizAlignModifiers,
  VertAlignModifiers,
  ArrowDirection,
} from '../../../blue/three/controller';
import { Labels } from '../../../blue/items/asset';
import { Vector3 } from 'three';

export interface HandlesFromBlue extends AddAssetControls, FloorPlanControls {
  mode: number;
  Camera?: Function;
  onScreenshot?: Function;
  onExport?: (callback: (blob: Blob) => void) => void;
  // Not used right now, left For Example
  handleForZoom?: Function;
  callbackArray?: Function[];
  registerCallbacks?: Function;
  removeItems?: (items: Item[]) => void;
  getInventory?: Function;
  setAllWalls?: Function;
  setAllFloors?: Function;
  setRoom?: Function;
  copyCommonAsset?: (asset: Asset) => void;
  setItemLabel?: (selectedList: Item[], labelType: keyof Labels, value) => void;
  onDragAttendee?: (attendee: Attendee) => void;
  onDragCoordinates?: (e: any) => { normal: Vector3; position: Vector3 };
  getCameraFar?: () => number;
  getPhotosphere?: () => Photosphere;
  drawPhotosphereLocations?: (photos: Photosphere[]) => void;
  copyItems?: () => void;
  alignHorizontal?: (modifier: HorizAlignModifiers) => void;
  alignVertical?: (modifier: VertAlignModifiers) => void;
  setItemHeight?: (selectedList: Item[], height: number) => void;
  updateItemsList?: (itemIDs?: Item[]) => void;
  setLabelSize?: (selectedList: Item[], size: number) => void;
  setAssetProp?: (selectedList: Item[], assetProperty, value) => void;
  setExtensionProp?: (selectedList: Item[], extensionProperty, value) => void;
  fixItems?: (selectedList: Item[], fixed: boolean) => void;
  rotateControlsTo?: (angle: number) => void;
  rotateItemBy?: (selectedList: Item[], angle: number) => void;
  rotateItemTo?: (selectedList: Item[], angle: number) => void;
  movePointerLockCamera?: (dir: ArrowDirection) => void;
  rotatePointerLockCamera?: (dir: ArrowDirection) => void;
}

export interface AddAssetControls {
  onDragAndDrop?: any;
  onDragAndDropAssetGroup?: any;
}

export interface FloorPlanControls {
  getFloorPlan?: any;
  setWallSettings?: Function;
  onLoadFloorplanImg?: any;
  deleteFloorplan?: (clearImages?: boolean) => void;
}

export class LayoutDesignerCallbacks implements HandlesFromBlue {
  constructor() {
    this.mode = 0; // FIXME: PlannerMode ?
    this.onScreenshot = () => {};
    this.handleForZoom = () => {};
    this.callbackArray = [];
    this.registerCallbacks = (functionalArray: Function[]) => {
      functionalArray.forEach((element) => {
        element();
      });
    };
    this.onExport = (callback: (blob: Blob) => void) => {
      throw new Error('Method not implemented.');
    };
  }

  onLoadFloorplanImg?: any;
  onDragAndDrop?: any;
  getFloorPlan?: any;
  mode: number;
  onScreenshot?: Function;
  handleForZoom?: Function;
  callbackArray?: Function[];
  registerCallbacks?: Function;
  setWallSettings?: (wallSettings: {
    hideWalls: boolean;
    wallHeight: number;
  }) => void;
  onExport?: (callback: (blob: Blob) => void) => void;
  setAllWalls?: Function;
  setAllFloors?: Function;
  setRoom?: Function;
  copyCommonAsset?: (asset: Asset) => void;
  setItemLabel?: (selectedList: Item[], labelType: keyof Labels, value) => void;
  onDragAttendee?: (attendee: Attendee) => void;
  onDragCoordinates?: (e: any) => { normal: Vector3; position: Vector3 };
  getCameraFar?: () => number;
  getPhotosphere?: () => Photosphere;
  drawPhotosphereLocations?: (photos: Photosphere[]) => void;
  copyItems?: () => void;
  alignHorizontal?: (modifier?: HorizAlignModifiers) => void;
  alignVertical?: (modifier?: VertAlignModifiers) => void;
  setItemHeight?: (selectedList: Item[], height: number) => void;
  updateItemsList?: (itemIDs?: Item[]) => void;
  setLabelSize?: (selectedList: Item[], size: number) => void;
  setAssetProp?: (selectedList: Item[], assetProperty, value) => void;
  setExtensionProp?: (selectedList: Item[], extensionProperty, value) => void;
  fixItems?: (selectedList: Item[], fixed: boolean) => void;
  rotateControlsTo?: (angle: number) => void;
  onDragAndDropAssetGroup?: any;
  rotateItemBy?: (selectedList: Item[], angle: number) => void;
  rotateItemTo?: (selectedList: Item[], angle: number) => void;
  movePointerLockCamera?: (dir: ArrowDirection) => void;
  rotatePointerLockCamera?: (dir: ArrowDirection) => void;
}
