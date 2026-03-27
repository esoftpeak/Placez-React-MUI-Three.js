import { Utils } from '../core/utils';
import { Item, isFloorItem, isWallItem } from '../items/item';
import { Asset } from '../items/asset';
import { store } from '../..';
import { ReduxState } from '../../reducers';
import {
  SetMultiSelect,
  ChangeCopiedAssetsState,
  SetSelectedItems,
  Save,
  NeedSaveAction,
  SetSelectedSurfaces,
} from '../../reducers/blue';
import { canEditLayout } from '../../reducers/globalState';
import {
  SetPast,
  SetFuture,
  UndoHistory,
  RedoHistory,
} from '../../reducers/undoRedo';
import { WallItem } from '../items/wall_item';
import { ControllerType } from '../../models/BlueState';
import { ToolState } from '../../models/GlobalState';

import produce, { enablePatches, applyPatches, Patch } from 'immer';
import { getOrgTheme } from '../../api/placez/models/UserSetting';
import { debounce } from 'ts-debounce';
import { RotationTypes } from './hud';
import { AssetGroup } from '../items';
import { MouseEvent } from 'react';

import {
  BufferGeometry,
  DoubleSide,
  Intersection,
  Matrix4,
  Mesh,
  MeshBasicMaterial,
  Object3D,
  Plane,
  PlaneGeometry,
  Quaternion,
  Raycaster,
  Sprite,
  Vector2,
  Vector3,
} from 'three';

import * as math from 'mathjs';
import { Model } from '../model/model';
import { getFromLocalStorage } from '../../sharing/utils/localStorageHelper';
import { LocalStorageKey } from '../../components/Hooks/useLocalStorageState';
import PlacedAsset from '../../api/placez/models/PlacedAsset';
import AssetModifierHelper from '../itemModifiers/AssetModifierHelper';

export enum VertAlignModifiers {
  left = 'left',
  center = 'center',
  right = 'right',
}

export enum HorizAlignModifiers {
  top = 'top',
  center = 'center',
  bottom = 'bottom',
}

const EmptyGuid = '00000000-0000-0000-0000-000000000000';

export type IntersectionTypes = ItemHandles | BatchHandles;

export enum ItemHandles {
  item = 'item',
  rotateItem = 'rotateItem',
}

export enum BatchHandles {
  batchRotate = 'batchRotate',
  batchRightEdge = 'batchRightEdge',
  batchTopEdge = 'batchTopEdge',
  batchLeftEdge = 'batchLeftEdge',

  batchBottomEdge = 'batchBottomEdge',
  batchTranslate = 'batchTranslate',

  batchTopRightCorner = 'batchTopRightCorner',
  batchTopLeftCorner = 'batchTopLeftCorner',
  batchBottomRightCorner = 'batchBottomRightCorner',
  batchBottomLeftCorner = 'batchBottomLeftCorner',
}

//This has not been refactored to rxjs. It's a big one.
//It also includes area batching controlls I would start by pulling that out first.
//The box highlight should be independent, since it could be used for all area selections and area batch

export const Controller = function (
  model: Model,
  scene,
  cam,
  element,
  controls,
  hud,
  main
) {
  enablePatches();
  const speed = 2.54;
  const speedAdjustment = 2;
  const scope = this; //tslint:disable-line
  const y = new Vector3(0, 1, 0);
  this.controllerType = ControllerType.Main;
  this.activeController = ControllerType.None;
  this.multiSelect = (store.getState() as ReduxState).blue.multiSelect;
  this.controllerMode = (store.getState() as ReduxState).blue.controllerMode;
  this.globalViewState = (
    store.getState() as ReduxState
  ).globalstate.globalViewState;
  this.ignoreFixed = (store.getState() as ReduxState).blue.ignoreFixed;
  this.highlightMaterial = new MeshBasicMaterial({
    color: scope.themeColor,
    wireframe: false,
    side: DoubleSide,
    opacity: 0.3,
    transparent: true,
  });

  this.redMaterial = new MeshBasicMaterial({
    color: 0xff0000,
    wireframe: false,
    side: DoubleSide,
    opacity: 0.3,
    transparent: true,
  });

  this.blockUndoRedo = false;
  this.initialRotationAngles = undefined;

  const intersectionType: IntersectionTypes = undefined;
  let selectedHandle: Object3D = undefined; // object

  this.intersection = undefined;
  this.mouseDownPosition = undefined;
  this.previousPosition = undefined;

  this.viewWidth = 1;

  this.getItemMap = () => {
    return model.scene.getAssets(main, true);
  };

  const draftStateCallback = (patches, inversePatches) => {
    const past = (store.getState() as ReduxState).undoRedo.past;
    const newPast = [...past];

    newPast.push({
      assets: { redo: { ...patches }, undo: { ...inversePatches } },
    });
    store.dispatch(SetPast(newPast));
  };

  this.updateItemsList = (modifiedItemIds?: string[]) => {
    store.dispatch(SetFuture([]));

    const stateLength = this.itemState.data.length;
    const newItemState = this.getItemMap();
    const newStateLength = newItemState.length;

    if (stateLength < newStateLength) {
      const newItems = newItemState.filter((asset) => {
        const found =
          this.itemState.data.findIndex((check) => {
            return check.instanceId === asset.instanceId;
          }) === -1;
        return found;
      });

      this.itemState = produce(
        this.itemState,
        (draftState) => {
          newItems.forEach((asset) => {
            draftState.data.push(JSON.parse(JSON.stringify(asset)));
          });
          return draftState;
        },
        draftStateCallback
      );
    } else if (newStateLength < stateLength) {
      const newIds = newItemState.map((asset: Asset) => asset.instanceId);
      const removedIds = this.itemState.data
        .map((asset: Asset) => asset.instanceId)
        .filter((instanceId: string) => !newIds.includes(instanceId));

      this.itemState = produce(
        this.itemState,
        (draftState) => {
          removedIds.forEach((instanceId: string) => {
            const index = draftState.data.findIndex(
              (asset) => asset.instanceId === instanceId
            );
            if (index !== -1) draftState.data.splice(index, 1);
          });
        },
        draftStateCallback
      );
    } else if (modifiedItemIds) {
      const modifiedItemIndexes = [];

      modifiedItemIds.forEach((id: string) => {
        const index = newItemState.findIndex((asset: Asset) => {
          return asset.instanceId === id;
        });
        if (index !== -1) {
          modifiedItemIndexes.push(index);
        }
      });

      this.itemState = produce(
        this.itemState,
        (draftState) => {
          modifiedItemIndexes.forEach((index) => {
            draftState.data[index] = JSON.parse(
              JSON.stringify(newItemState[index])
            );
          });
          return draftState;
        },
        draftStateCallback
      );

      this.updateSelectedList(); // this is wrong, there are two selected list the local list and the one in store.
    }

    store.dispatch(NeedSaveAction(true));
  };

  this.updateSelectedItemsEvent = () => {
    scope.selectedItemList.forEach((item: Item) => {
      item.fireUpdateEvent();
    });
  };

  this.updateSelectedList = () => {
    const newSelected = model.scene.getItems().filter((item: Item) => {
      return scope.selectedItemList.some((currentItem) => {
        return currentItem.asset.instanceId === item.asset.instanceId;
      });
    });
    store.dispatch(SetSelectedItems(newSelected));
  };

  this.initHistory = () => {
    if (this.historyReady) return;
    this.historyReady = true;
    store.dispatch(SetPast([]));
    store.dispatch(SetFuture([]));
    this.itemState = { data: JSON.parse(JSON.stringify(this.getItemMap())) };
  };

  this.drawAllCollisions = () => {
    console.log('draw All collisions');
    model.scene.getItems().forEach((item) => {
      model.scene.collisionHandler.getCollisionItemsForSelected([item]);
      item.isValidPosition(
        model.scene.collisionHandler.collisionItems,
        item.position
      );
    });
  };

  this.updatePositionHistory = (items) => {
    store.dispatch(SetFuture([]));
    const newItemState = this.getItemMap();
    this.itemState = produce(
      this.itemState,
      (draftState) => {
        items.forEach((element) => {
          const index = newItemState.findIndex((item) => {
            return item.instanceId === element.asset.instanceId;
          });
          draftState.data[index].transformation =
            newItemState[index].transformation;
        });
        return draftState;
      },
      (patches, inversePatches) => {
        const past = (store.getState() as ReduxState).undoRedo.past;
        const newPast = [...past];
        newPast.push({
          assets: { redo: { ...patches }, undo: { ...inversePatches } },
        });
        store.dispatch(SetPast(newPast));
      }
    );
    store.dispatch(NeedSaveAction(true));
  };

  this.undo = (change) => {
    this.selectItems([]);
    const patches = [];

    this.blockUndoRedo = true;
    const adds: Asset[] = Object.values<Patch>(change.assets.undo)
      .filter((diff: Patch) => diff.op === 'add')
      .map((diff: Patch): Asset => JSON.parse(JSON.stringify(diff.value)));

    scene.distinctLoadAsync(adds);
    this.blockUndoRedo = false;
    patches.push(
      ...Object.values<Patch>(change.assets.undo).filter(
        (diff: Patch) => diff.op === 'add'
      )
    );

    for (const diff in change.assets.undo) {
      let item;
      switch (change.assets.undo[diff].op) {
        case 'remove':
          item = model.scene.getItems().find((item) => {
            return (
              item.asset.instanceId ===
              this.itemState.data[change.assets.undo[diff].path[1]].instanceId
            );
          });
          this.deleteSelectedItems([item]);
          patches.push(change.assets.undo[diff]);
          break;
        case 'replace':
          item = model.scene.getItems().find((item) => {
            return (
              item.asset.instanceId ===
              this.itemState.data[change.assets.undo[diff].path[1]].instanceId
            );
          });

          if (change.assets.undo[diff].path[2]) {
            switch (change.assets.undo[diff].path[2]) {
              case 'transformation':
                item.setFromTransformation(change.assets.undo[diff].value);
                break;
            }
          } else {
            this.blockUndoRedo = true;

            this.deleteSelectedItems([item]);
            scene
              .addAssetAsync(
                JSON.parse(JSON.stringify(change.assets.undo[diff].value))
              )
              .then(() => {
                this.blockUndoRedo = false;
              });
          }
          patches.push(change.assets.undo[diff]);
          break;

        default:
          break;
      }
    }

    this.itemState = applyPatches(this.itemState, patches);

    scene.updateSceneStats();
    this.drawAllCollisions();
    this.update();
    store.dispatch(NeedSaveAction(true));
  };

  this.redo = (change) => {
    this.selectItems([]);
    const patches = [];

    this.blockUndoRedo = true;
    const adds: Asset[] = Object.values<Patch>(change.assets.redo)
      .filter((diff: Patch) => diff.op === 'add')
      .map((diff: Patch): Asset => JSON.parse(JSON.stringify(diff.value)));
    scene.distinctLoadAsync(adds);
    this.blockUndoRedo = false;
    patches.push(
      ...Object.values<Patch>(change.assets.redo).filter(
        (diff: Patch) => diff.op === 'add'
      )
    );

    // const removes: Asset[] = Object.values<Patch>(change.assets.redo)
    //   .filter((diff: Patch) => diff.op === 'remove')
    //   .map((diff: Patch): Asset => diff.value)

    // const replace: Asset[] = Object.values<Patch>(change.assets.redo)
    //   .filter((diff: Patch) => diff.op === 'replace')
    //   .map((diff: Patch): Asset => diff.value)

    for (const diff in change.assets.redo) {
      let item;
      switch (change.assets.redo[diff].op) {
        case 'remove':
          item = model.scene.getItems().find((item) => {
            return (
              item.asset.instanceId ===
              this.itemState.data[change.assets.redo[diff].path[1]].instanceId
            );
          });
          this.deleteSelectedItems([item]);
          patches.push(change.assets.redo[diff]);
          break;
        case 'replace':
          item = model.scene.getItems().find((item) => {
            return (
              item.asset.instanceId ===
              this.itemState.data[change.assets.redo[diff].path[1]].instanceId
            );
          });

          if (change.assets.redo[diff].path[2]) {
            switch (change.assets.redo[diff].path[2]) {
              case 'transformation':
                item.setFromTransformation(change.assets.redo[diff].value);
                break;
            }
          } else {
            this.blockUndoRedo = true;

            this.deleteSelectedItems([item]);
            scene
              .addAssetAsync(
                JSON.parse(JSON.stringify(change.assets.redo[diff].value))
              )
              .then(() => {
                this.blockUndoRedo = false;
              });
          }
          patches.push(change.assets.redo[diff]);
          break;

        default:
          break;
      }
    }
    this.itemState = applyPatches(this.itemState, patches);
    this.update();
    store.dispatch(NeedSaveAction(true));
  };
  this.selectedItemList = [];

  this.snap = getFromLocalStorage(LocalStorageKey.SnapPosition);
  this.preventCollision = getFromLocalStorage(
    LocalStorageKey.CollisionPrevention
  );
  this.detectCollision = getFromLocalStorage(
    LocalStorageKey.CollisionDetection
  );
  this.keepInRoom = getFromLocalStorage(LocalStorageKey.KeepInRoom);

  this.listener = () => {
    const state = store.getState() as ReduxState;
    if (this.selectedSurfaces !== state.blue.selectedSurfaces) {
      this.selectedSurfaces = state.blue.selectedSurfaces;
    }
    if (
      state.blue.blueInitialized &&
      this.activeController !== state.blue.activeController
    ) {
      this.activeController = state.blue.activeController;
      const controllerIsActive: boolean =
        this.activeController === this.controllerType;
      const canEdit: boolean = canEditLayout(store.getState() as ReduxState);
      this.enabled = controllerIsActive && canEdit;

      this.initHistory();

      if (!this.enabled) {
        if (this.activeController !== ControllerType.Batch) {
          this.deselectItems(scope.selectedItemList);
          switchState(states.UNSELECTED);
        }
        store.dispatch(SetMultiSelect(false));
        store.dispatch(ChangeCopiedAssetsState(undefined));
        return;
      }
    }
    if (this.multiSelect !== state.blue.multiSelect) {
      this.multiSelect = state.blue.multiSelect;
      if (!this.multiSelect && scope.selectedItemList.length !== 1) {
        this.deselectItems(scope.selectedItemList);
        switchState(states.UNSELECTED);
      }
    }
    if (this.globalViewState !== state.globalstate.globalViewState) {
      this.globalViewState = state.globalstate.globalViewState;
    }
    if (this.ignoreFixed !== state.blue.ignoreFixed) {
      this.ignoreFixed = state.blue.ignoreFixed;
    }
    const oidc = (store.getState() as ReduxState).oidc;
    if (oidc && oidc.user && oidc.user.profile.organization_id) {
      this.themeColor = getOrgTheme(
        oidc.user.profile.organization_id
      ).primaryColor;
    } else {
      this.themeColor = 'purple';
    }
    scope.selectedItemList = (
      store.getState() as ReduxState
    ).blue.selectedItems;
  };

  //
  this.cameras = cam;
  this.controls = controls;
  this.batchMode = false;
  this.itemUIConfg = {};
  this.longPress = undefined;
  this.main = main;

  let plane; // ground plane used for intersection testing
  let buffer = [];

  // TODO
  let highlightGeometry = new BufferGeometry();
  let highlightMesh;
  let batchCount;

  const footprint = new Object3D();

  let mouse: Vector2;
  let mouseDownScreenPosition: Vector2;
  let intersectedObject: Item;
  let mouseoverObject;
  const selectedIndex = 0;

  let mouseDown = false;
  let mouseMoved = false; // has mouse moved since down click
  let touchDown = [0, 0];

  enum states {
    UNSELECTED, // no object selected
    SELECTED, // selected but inactive
    DRAGGING, // performing an action while mouse depressed
    ROTATING, // rotating with mouse down
    ROTATING_FREE, // rotating with mouse up
    PANNING,
    BEGINHIGHLIGHT,
    DRAWHIGHLIGHT,
    ENDHIGHLIGHT,
    BATCHEDGE,
    BATCHMODIFY,
  }

  let state = states.UNSELECTED;

  this.needsUpdate = true;

  this.update = () => {
    this.needsUpdate = true;
  };

  function init() {
    element.addEventListener('mousedown', mouseDownEvent, false);
    element.addEventListener('mouseup', mouseUpEvent, false);
    element.addEventListener('mousemove', mouseMoveEvent, false);
    element.addEventListener('dragover', dragover, false);
    window.addEventListener('keydown', keyDownEvent, false);
    window.addEventListener('keyup', keyUpEvent, false);

    controls.addEventListener('change', scope.update);

    element.addEventListener('touchstart', onTouchStart, false);
    element.addEventListener('touchend', mouseUpEvent, false);
    element.addEventListener('touchmove', mouseMoveEvent, false);

    mouse = new Vector2();
    setGroundPlane();
    scope.unsubscribeStore = store.subscribe(scope.listener);
    scene.add(footprint);
  }

  this.dispose = function () {
    element.removeEventListener('mousedown', mouseDownEvent, false);
    element.removeEventListener('mouseup', mouseUpEvent, false);
    element.removeEventListener('mousemove', mouseMoveEvent, false);
    element.removeEventListener('dragover', dragover, false);
    window.removeEventListener('keydown', keyDownEvent, false);
    window.removeEventListener('keyup', keyUpEvent, false);

    controls.removeEventListener('change', scope.update);

    element.removeEventListener('touchstart', onTouchStart, false);
    element.removeEventListener('touchend', mouseUpEvent, false);
    element.removeEventListener('touchmove', mouseMoveEvent, false);

    scope.unsubscribeStore();
    scene.remove(plane);
    scene.remove(footprint);
  };

  this.setControls = function (newControls) {
    scope.controls.removeEventListener('change', scope.update);
    scope.controls = newControls;
    scope.controls.addEventListener('change', scope.update);
  };

  this.setCursorStyle = function (cursorStyle) {
    element.style.cursor = cursorStyle;
  };

  function dragover(event) {
    event.preventDefault();
  }

  this.dragAndDrop = (event: any, asset: Asset): boolean => {
    this.setMouseFromEvent(event);
    const intersections: Intersection[] = this.getAssetIntersections(
      asset,
      mouse
    );
    if (intersections.length > 0) {
      const position = intersections[0].point;
      const normal = intersections[0].face.normal;

      if (asset.classType === 'CeilingItem') {
        position.setY(model.scene.getWallHeight());
      }
      if (
        isFloorItem(asset.classType) &&
        normal?.y < 0.8 &&
        model.scene.sceneScan
      ) {
        return false;
      }
      if (
        isWallItem(asset.classType) &&
        normal?.y > 0.2 &&
        model.scene.sceneScan
      ) {
        return false;
      }
      if (isWallItem(asset.classType)) {
        asset.transformation = this.recomposeTransformationArray(
          asset.transformation,
          position,
          this.quaternionFromNormal(normal)
        );
      } else {
        const mat4 = new Matrix4()
          .fromArray(asset.transformation)
          .setPosition(position);
        asset.transformation = mat4.toArray();
      }
      return true;
    }
    return false;
  };

  this.recomposeTransformationArray = (
    transformation: number[],
    newPosition: Vector3,
    newRotation: Quaternion
  ): number[] => {
    const position = new Vector3();
    const rotation = new Quaternion();
    const scale = new Vector3();
    const mat4 = new Matrix4()
      .fromArray(transformation)
      .decompose(position, rotation, scale);
    return mat4.compose(newPosition, newRotation, scale).toArray();
  };

  this.quaternionFromNormal = (normal: Vector3): Quaternion => {
    const angle = new Vector3()
      .copy(normal)
      .setY(0)
      .angleTo(new Vector3(0, 0, 1));

    return new Quaternion().setFromAxisAngle(new Vector3(0, 1, 0), angle);
  };

  this.drawAttendeeGroupFootprints = (
    event: MouseEvent,
    assetGroup: AssetGroup
  ) => {
    scope.setMouseFromEvent(event);
    const coordinates = scope.dragAndDropCoordinates();
    if (coordinates) {
      if (footprint.userData.id !== assetGroup.id) {
        for (let i = footprint.children.length - 1; i >= 0; i--) {
          footprint.remove(footprint.children[i]);
          if (footprint.children[i] as Mesh) {
            (footprint.children[i] as Mesh).geometry.dispose();
          }
        }
        footprint.userData.id = assetGroup.id;
        assetGroup.mask.forEach((corners: { x: number; y: number }[]) => {
          footprint.add(scope.buildFootprint(corners));
        });
      }

      footprint.position.copy(coordinates.position);
      scope.update();
    }
  };

  this.clearFootprint = (footprint: Mesh) => {
    for (let i = footprint.children.length - 1; i >= 0; i--) {
      footprint.remove(footprint.children[i]);
      if (footprint.children[i] as Mesh) {
        (footprint.children[i] as Mesh).geometry.dispose();
      }
    }
    this.needsUpdate = true;
    footprint.userData = {};
  };

  this.buildFootprint = (corners: { x: number; y: number }[]): Mesh => {
    const boxGeom = createBoxGeometry(corners, 10.0);
    return new Mesh(boxGeom, scope.highlightMaterial);
  };

  this.getAssetIntersections = (
    asset: Asset,
    mouse: Vector2
  ): Intersection[] => {
    let intersects = [];
    if (isFloorItem(asset.classType)) {
      const floorItems = model.scene
        .getItems()
        .filter((item: Item) => {
          return isFloorItem(item.asset.classType);
        })
        .filter(
          (item) =>
            !(
              item.asset.extensionProperties &&
              item.asset.extensionProperties.fixed &&
              scope.ignoreFixed
            )
        );
      if (model.scene.sceneScan) {
        intersects = intersects.concat(model.scene.sceneScan);
      } else {
        if (this.keepInRoom && main?.floorplan?.floorPlaneMeshes()) {
          intersects = intersects.concat(main.floorplan.floorPlaneMeshes());
        } else {
          intersects = intersects.concat([plane]);
        }
      }
      intersects = intersects.concat(floorItems);
    } else if (asset.classType === 'CeilingItem') {
      if (this.keepInRoom && main?.floorplan?.floorPlaneMeshes()) {
        intersects = intersects.concat(main.floorplan.floorPlaneMeshes());
      } else {
        intersects = intersects.concat([plane]);
      }
    } else {
      if (model.scene.sceneScan) {
        intersects = intersects.concat(model.scene.sceneScan);
      } else {
        intersects = intersects.concat(model.floorplan.wallEdgePlanes());
      }
    }

    return scope.getIntersections(mouse, intersects, [0, 4, 6, 7, 10, 13]);
  };

  this.getSurfaceIntersections = (mouse: Vector2) => {
    const floorPlanes = main.floorplan.floorPlaneMeshes();
    const wallPlanes = model.floorplan.wallEdgePlanes();
    const sceneScan = model.scene.sceneScan ?? [];
    const surfacePlanes = []
      .concat(floorPlanes)
      .concat(wallPlanes)
      .concat(sceneScan);
    return scope.getIntersections(mouse, surfacePlanes, [0, 4, 6]);
  };

  this.positionGroupAsset = (asset: Asset, newOrigin: Vector3): number[] => {
    const pos = new Vector3();
    const quat = new Quaternion();
    const scale = new Vector3();
    const transMat = new Matrix4().fromArray(asset.transformation);
    transMat.decompose(pos, quat, scale);

    pos.add(newOrigin);

    return new Matrix4().compose(pos, quat, scale).toArray();
  };

  this.pasteItems = (assetGroup: AssetGroup): void => {
    if (
      assetGroup === undefined ||
      assetGroup.assets.length === 0 ||
      intersectedObject ||
      (state !== states.UNSELECTED &&
        state !== states.SELECTED &&
        state !== states.DRAWHIGHLIGHT)
    )
      return;
    const pasteCoordinates = scope.dragAndDropCoordinates();
    if (pasteCoordinates === undefined) return;
    const modifiedItems = assetGroup.assets.map((asset: Asset) => {
      const assetCopy: PlacedAsset = {
        ...JSON.parse(JSON.stringify(asset)),
        id: 0,
        groupId: undefined,
        fromScene: true,
        modifiers: AssetModifierHelper.clearAllModifierFields(asset.modifiers),
        materialMask: asset.materialMask?.map((material) =>
          material
            ? {
                ...material,
                id: EmptyGuid,
                mediaAssetId: null,
                placedAssetId: null,
                organizationId: null,
              }
            : null
        ),
      };

      assetCopy.transformation = this.positionGroupAsset(
        asset,
        pasteCoordinates.position
      );
      assetCopy.groupId = undefined;
      if (asset.gltf) {
        assetCopy.gltf = asset.gltf.clone();
      }
      assetCopy.fromScene = true;
      assetCopy.instanceId = Utils.guid();
      return assetCopy;
    });

    const pastePromise = model.scene.distinctLoadAsync(modifiedItems);

    pastePromise.then((vallues) => {
      const items = model.scene.getItems();
      scope.deselectItems(scope.selectedItemList);
      scope.selectItems(items.slice(items.length - vallues[0].value.length));
      scope.updateItemsList();
      this.clearFootprint(footprint);
      updateIntersections();
    });
  };

  this.copySelected = () => {
    if (scope.selectedItemList && scope.selectedItemList.length > 0) {
      store.dispatch(
        ChangeCopiedAssetsState(
          createAssetGroupFromItems(scope.selectedItemList, 'copied')
        )
      );
    }
  };

  this.dragAndDropCoordinates = ():
    | { position: Vector3; normal: Vector3 }
    | undefined => {
    let intersects = [];
    if (model.scene.sceneScan) {
      intersects = intersects.concat([model.scene.sceneScan]);
    }
    if (this.keepInRoom && main?.floorplan?.floorPlaneMeshes()) {
      intersects = intersects.concat(main.floorplan.floorPlaneMeshes());
    } else {
      intersects = intersects.concat([plane]);
    }

    const intersections = scope.getIntersections(mouse, intersects, [0, 6]);
    if (intersections.length > 0) {
      const position = intersections[0].point;
      const normal = intersections[0].face.normal;
      return {
        position,
        normal,
      };
    }
    return undefined;
  };

  this.confirmBatch = () => {
    this.batchMode = false;
    switchState(states.UNSELECTED);
    removeHighlight();
    switchState(states.SELECTED);
  };

  this.resetBatch = () => {
    this.batchMode = true;
    switchState(states.BEGINHIGHLIGHT);
    removeHighlight();
    scene.clearBatchItems('temp');
  };

  this.clearBatch = () => {
    this.batchMode = false;
    if (scope.selectedItemList.length > 0) {
      switchState(states.SELECTED);
    } else {
      switchState(states.UNSELECTED);
    }
    removeHighlight();
    scene.clearBatchItems('temp');
  };

  this.updateBatch = (itemUIConfig) => {
    const toolState = (store.getState() as ReduxState).globalstate.toolState;
    if (toolState === ToolState.AddBatch) {
      this.itemUIConfg = itemUIConfig;
      this.batchMode = true;
      if (highlightMesh !== undefined) {
        switchState(states.ENDHIGHLIGHT);
        updateBatch();
      } else {
        switchState(states.BEGINHIGHLIGHT);
      }
    }
  };

  function finishBoxSelect() {
    scope.boxSelect = false;
    scope.controls.enabled = true;
    removeHighlight();
    if (scope.selectedItemList.length > 0) {
      switchState(states.SELECTED);
    } else {
      switchState(states.UNSELECTED);
    }
  }

  function onBoxSelect() {
    scope.boxSelect = true;
    switchState(states.BEGINHIGHLIGHT);
  }

  function clickPressed(vec2?) {
    let planeIntersection;
    if (intersectedObject && isFloorItem(intersectedObject.asset.classType)) {
      // Create a plane sitting under the object for intersection
      const bottomPlaneGeometry = new PlaneGeometry(10000, 10000);
      bottomPlaneGeometry.rotateX(-Math.PI / 2);
      bottomPlaneGeometry.translate(
        intersectedObject.position.x,
        intersectedObject.position.y,
        intersectedObject.position.z
      );
      const material = new MeshBasicMaterial({
        color: 0xffff00,
        side: DoubleSide,
      });
      const bottomPlane = new Mesh(bottomPlaneGeometry, material);
      scene.add(bottomPlane);
      planeIntersection = scope.getIntersections(mouse, [bottomPlane], [0]);

      scene.remove(bottomPlane);
    } else if (intersectedObject) {
      planeIntersection = scope.getIntersections(
        mouse,
        [intersectedObject],
        [0, 7, 13]
      );
    }

    if (
      scope.intersectionType === ItemHandles.item &&
      planeIntersection.length > 0
    ) {
      // This sets drag offset
      intersectedObject.clickPressed(planeIntersection[0].point);
    }

    if (scope.intersectionType === ItemHandles.rotateItem) {
      scope.selectedItemList[selectedIndex].clickPressed(
        scope.intersection.point
      );
    }
  }

  function clickDragged(selectedItem, selectedItemList) {
    const intersection = scope.itemIntersection(mouse, selectedItem);
    // This checks item intersection with plane and or objects

    if (intersection) {
      const transVec = new Vector3().subVectors(
        intersection.point,
        selectedItem.position
      );
      if (isFloorItem(selectedItem.asset.classType)) {
        // For stacking floor items
        transVec.setY(intersection.point.y - selectedItem.position.y + 0.4);
      }

      const newItemPositions = selectedItemList.map(
        (
          item: Item
        ): {
          item: Item;
          newPosition: Vector3;
          valid: boolean;
          normal: Vector3;
        } => {
          const adjVec = new Vector3().subVectors(
            transVec,
            selectedItem.dragOffset
          );
          const newPosition = item.getNewPosition(
            item.position,
            adjVec,
            scope.snap,
            intersection
          );
          const valid = item.isValidPosition(
            model.scene.collisionHandler.collisionItems,
            newPosition,
            item.quaternion
          );
          const normal = intersection.face.normal;
          return {
            item,
            newPosition,
            valid,
            normal,
          };
        }
      );

      if (
        newItemPositions.every((el) => {
          return el.valid;
        })
      ) {
        if (model.scene.sceneScan) {
          newItemPositions.forEach((el) => {
            el.item.moveToPosition(el.newPosition, el.normal);
          });
        } else {
          newItemPositions.forEach((el) => {
            el.item.moveToPosition(el.newPosition);
          });
        }
      }
    }
  }

  function newRotationFromInitial(
    initialRotationAngle: number,
    intersectionAngle,
    dragOffsetAngle,
    snap
  ) {
    const newAngle = Utils.snapRotation(
      intersectionAngle - dragOffsetAngle + initialRotationAngle,
      scope.snap
    );
    return new Quaternion().setFromAxisAngle(new Vector3(0, 1, 0), newAngle);
  }

  function rotateItem(item?) {
    const intersection = scope.getPoint();
    if (scope.selectedItemList[selectedIndex] && intersection) {
      const transVec = new Vector3().subVectors(
        intersection,
        scope.selectedItemList[selectedIndex].position
      );
      const currentAngle = scope.selectedItemList[selectedIndex].rotation.y;
      const dragOffsetAngle = Utils.angle(
        0,
        1,
        scope.selectedItemList[selectedIndex].dragOffset.x,
        scope.selectedItemList[selectedIndex].dragOffset.z
      );

      const intersectionAngle = Utils.angle(0, 1, transVec.x, transVec.z);

      if (scope.initialRotationAngles === undefined) {
        scope.initialRotationAngles = scope.selectedItemList.reduce(
          (acc, item: Item) => {
            acc[item.asset.instanceId] = item.rotation.y;
            return acc;
          },
          {}
        );
      }

      let newItemPositions;

      const newAngle = Utils.snapRotation(
        intersectionAngle -
          dragOffsetAngle +
          scope.initialRotationAngles[
            scope.selectedItemList[selectedIndex].asset.instanceId
          ],
        scope.snap
      );
      const newRotation = newRotationFromInitial(
        scope.initialRotationAngles[
          scope.selectedItemList[selectedIndex].asset.instanceId
        ],
        intersectionAngle,
        dragOffsetAngle,
        scope.snap
      );

      if (
        scope.intersection?.object?.userData?.name ===
        RotationTypes.LocalRotation
      ) {
        newItemPositions = scope.selectedItemList.map((item: Item) => {
          return {
            item,
            newPosition: item.position,
            newRotation,
            valid: item.isValidPosition(
              model.scene.collisionHandler.collisionItems,
              item.position,
              newRotation
            ),
          };
        });
      } else if (
        scope.intersection?.object?.userData?.name ===
        RotationTypes.GlobalRotation
      ) {
        // Global Rotation
        newItemPositions = scope.selectedItemList.map((item: Item) => {
          const relAngle = newAngle - (currentAngle % (2 * Math.PI));
          const newRotation = newRotationFromInitial(
            scope.initialRotationAngles[item.asset.instanceId],
            intersectionAngle,
            dragOffsetAngle,
            scope.snap
          );

          const radiusVec = new Vector3().subVectors(
            item.position,
            scope.selectedItemList[selectedIndex].position
          );
          radiusVec.applyAxisAngle(new Vector3(0, 1, 0), relAngle);
          const relPosition = new Vector3()
            .addVectors(
              scope.selectedItemList[selectedIndex].position,
              radiusVec
            )
            .sub(item.position);
          const newPosition = item.getNewPosition(
            item.position,
            relPosition,
            false
          );

          return {
            item,
            newPosition,
            newRotation,
            valid: item.isValidPosition(
              model.scene.collisionHandler.collisionItems,
              newPosition,
              newRotation
            ),
          };
        });
      }

      if (
        newItemPositions?.every((el) => {
          return el.valid;
        })
      ) {
        newItemPositions.forEach((el, index) => {
          el.item.moveToPosition(el.newPosition);
          el.item.rotateTo(el.newRotation);
        });
      }
    }
  }

  this.rotateItemBy = (rotation: Quaternion) => {
    if (scope.selectedItemList[selectedIndex]) {
      const newItemPositions = scope.selectedItemList.map((item: Item) => {
        const newRotation = new Quaternion().multiplyQuaternions(
          item.quaternion,
          rotation
        );
        return {
          item,
          newPosition: item.position,
          newRotation,
          valid: item.isValidPosition(
            model.scene.collisionHandler.collisionItems,
            item.position,
            newRotation
          ),
        };
      });

      if (
        newItemPositions?.every((el) => {
          return el.valid;
        })
      ) {
        newItemPositions.forEach((el, index) => {
          el.item.moveToPosition(el.newPosition);
          el.item.rotateTo(el.newRotation);
        });
        hud.update();
        scope.update();
      }
    }
  };

  function rotateBatch() {
    const obj = highlightMesh;
    const transVec = new Vector3().subVectors(scope.getPoint(), obj.position);

    const intersectionAngle =
      Utils.angle(0, 1, transVec.x, transVec.z) - Math.PI;
    if (scope.initialRotationAngle === undefined) {
      scope.initialRotationAngle = obj.rotation.y;
    }

    const transVecAngle = Utils.snapRotation(intersectionAngle, scope.snap);
    const rotation = new Quaternion().setFromAxisAngle(
      new Vector3(0, 1, 0),
      transVecAngle
    );

    obj.rotation.setFromQuaternion(rotation);
  }

  function cornerBatch() {
    // const obj = highlightMesh;
    // const name = selectedHandle.userData.name;
    // const localTranslation = obj.worldToLocal(scope.getPoint());
    // localTranslation
    //   .sub(selectedHandle.position)
    //   .multiplyScalar(0.5);
    // const vertices = Utils.positionBufferToVec3Corners(obj.geometry);
    // const widthTranslation = new Vector3(localTranslation.x, 0, 0);
    // const depthTranslation = new Vector3(0, 0, localTranslation.z);
    // console.log('widthTranslation', widthTranslation);
    // console.log('depthTranslation', depthTranslation);
    // let grow
    // vertices.forEach((corner: Vector3) => {
    //   const cornerVec = corner.clone();
    //   grow = widthTranslation.dot(selectedHandle.position) > 0;
    //   cornerVec.projectOnVector(widthTranslation);
    //   if (
    //     (grow && cornerVec.dot(widthTranslation) < 0) || (!grow && cornerVec.dot(widthTranslation) > 0)
    //   ) {
    //     widthTranslation.multiplyScalar(-1);
    //   }
    //   corner.add(widthTranslation);
    //   grow = depthTranslation.dot(selectedHandle.position) > 0;
    // });
    // vertices.forEach((corner: Vector3) => {
    //   const cornerVec = corner.clone();
    //   cornerVec.projectOnVector(depthTranslation);
    //   if (
    //     (grow && cornerVec.dot(depthTranslation) < 0) || (!grow && cornerVec.dot(depthTranslation) > 0)
    //   ) {
    //     depthTranslation.multiplyScalar(-1);
    //   }
    //   corner.add(depthTranslation);
    // });
    // obj.geometry.setFromPoints(Utils.cornersToRectPoints(vertices));
    // obj.position.add(localTranslation.applyQuaternion(obj.quaternion));
    // updateHighlightControls();
    // selectedHandle = obj.children.find((el) => el.userData.name === name);
  }

  function edgeBatch() {
    const obj = highlightMesh;
    const name = selectedHandle.userData.name;

    const localTranslation = obj.worldToLocal(scope.getPoint());
    localTranslation
      .projectOnVector(selectedHandle.position)
      .sub(selectedHandle.position)
      .multiplyScalar(0.5);

    const grow = localTranslation.dot(selectedHandle.position) > 0;

    const vertices = Utils.positionBufferToVec3Corners(obj.geometry);

    vertices.forEach((corner: Vector3) => {
      const cornerVec = corner.clone();
      const cornerTranslation = localTranslation.clone();
      cornerVec.projectOnVector(cornerTranslation);
      if (
        (grow && cornerVec.dot(cornerTranslation) < 0) ||
        (!grow && cornerVec.dot(cornerTranslation) > 0)
      ) {
        cornerTranslation.multiplyScalar(-1);
      }
      corner.add(cornerTranslation);
    });

    obj.geometry.setFromPoints(Utils.cornersToRectPoints(vertices));
    obj.position.add(localTranslation.applyQuaternion(obj.quaternion));

    updateHighlightControls();
    selectedHandle = obj.children.find((el) => el.userData.name === name);
  }

  function translateBatch() {
    const obj = highlightMesh;
    obj.position.copy(scope.getPoint());
  }

  function setGroundPlane(cellSize = 3 * 12 * 2.54) {
    // TODO dynamically size ground plane used to find intersections
    const size = 100000; // in cm
    plane = new Mesh(new PlaneGeometry(size, size), new MeshBasicMaterial());
    plane.rotation.x = -Math.PI / 2;
    plane.visible = true;
    plane.material.visible = false;
    scene.add(plane);
  }

  function createBoxGeometry(
    corners: { x: number; y: number }[],
    height?: number
  ): BufferGeometry {
    const vec3Corners = [
      new Vector3(corners[0].x, height ? height : 10.0, corners[0].y),
      new Vector3(corners[1].x, height ? height : 10.0, corners[1].y),
      new Vector3(corners[2].x, height ? height : 10.0, corners[2].y),
      new Vector3(corners[3].x, height ? height : 10.0, corners[3].y),
    ];

    const points = Utils.cornersToRectPoints(vec3Corners);

    const geom = new BufferGeometry().setFromPoints(points);
    return geom;
  }

  function createHighlight(corner1: Vector3, point2?: Vector3) {
    removeHighlight();
    const corner2 = point2 !== undefined ? point2 : new Vector3(1, 1, 1);
    corner2.addVectors(corner1, corner2);

    const midpoint = Utils.midpoint(corner1, corner2);
    corner1.sub(midpoint);
    corner2.sub(midpoint);

    highlightGeometry.copy(
      createBoxGeometry([
        { x: corner1.x, y: corner1.z },
        { x: corner2.x, y: corner1.z },
        { x: corner2.x, y: corner2.z },
        { x: corner1.x, y: corner2.z },
      ])
    );

    const material = new MeshBasicMaterial({
      color: scope.themeColor,
      wireframe: false,
      side: DoubleSide,
      opacity: 0.3,
      transparent: true,
    });

    highlightMesh = new Mesh(highlightGeometry, material);
    highlightMesh.position.copy(midpoint);
    scene.add(highlightMesh);
  }

  function updateHighlight(point: Vector3): void {
    //make points from drag in whatever angle
    //rotate points by angle
    //rotate back mesh by opposite of angle

    // Make Points Global
    const x = new Vector3(1, 0, 0);
    const z = new Vector3(0, 0, 1);
    x.applyAxisAngle(y, controls.getAzimuthalAngle());
    z.applyAxisAngle(y, controls.getAzimuthalAngle());

    const vertices = Utils.positionBufferToVec3Corners(highlightMesh.geometry);
    vertices.forEach((vertex: Vector3) => {
      vertex.y = 0;
      vertex.applyAxisAngle(y, controls.getAzimuthalAngle());
    });

    const startPoint = new Vector3().addVectors(
      vertices[0],
      highlightMesh.position
    );
    const A = math.matrix([
      [x.x, z.x],
      [x.z, z.z],
    ]);
    const newRelativePoint = new Vector3().subVectors(point, startPoint);
    const b = math.matrix([newRelativePoint.x, newRelativePoint.z]);
    const scalars = math.lusolve(A, b) as any;
    x.multiplyScalar(scalars.get([0, 0]));
    x.setY(0);
    z.multiplyScalar(scalars.get([1, 0]));
    z.setY(0);

    const globalMidPoint = Utils.midpoint(startPoint, point);

    vertices[0].copy(startPoint);
    vertices[1].addVectors(startPoint, x);
    vertices[2].copy(point);
    vertices[3].addVectors(startPoint, z);

    vertices.forEach((vertex: Vector3) => {
      vertex.sub(globalMidPoint);
      vertex.y = 0;
      vertex.applyAxisAngle(y, -controls.getAzimuthalAngle());
    });

    const newPoints = Utils.cornersToRectPoints(vertices);
    highlightMesh.geometry.setFromPoints(newPoints);
    highlightMesh.position.set(0, 0, 0);
    highlightMesh.setRotationFromAxisAngle(y, controls.getAzimuthalAngle());
    highlightMesh.position.copy(globalMidPoint);
  }

  function createHighlightControls() {
    const vertices = Utils.positionBufferToVec3Corners(highlightMesh.geometry);
    const rectangleValues = Utils.lwOfRectangle([
      vertices[0],
      vertices[1],
      vertices[2],
      vertices[3],
    ]);

    const width = rectangleValues[0];
    const depth = rectangleValues[1];
    const scale = Math.max(width, depth);

    const rotateControls = hud.makeRotationHandle(depth / 2, {
      name: BatchHandles.batchRotate,
    });

    const rightEdgeControls = hud.makeSphereControl(
      scale,
      width / 2,
      0,
      0,
      BatchHandles.batchRightEdge
    );
    const leftEdgeControls = hud.makeSphereControl(
      scale,
      -width / 2,
      0,
      0,
      BatchHandles.batchLeftEdge
    );
    const topEdgeControls = hud.makeSphereControl(
      scale,
      0,
      0,
      -depth / 2,
      BatchHandles.batchTopEdge
    );
    const bottomEdgeControls = hud.makeSphereControl(
      scale,
      0,
      0,
      depth / 2,
      BatchHandles.batchBottomEdge
    );

    // const bottomRightCornerControls = hud.makeSphereControl(
    //   scale,
    //   width / 2,
    //   0,
    //   depth / 2,
    //   BatchHandles.batchBottomRightCorner,
    //   scope.redMaterial
    // );
    // const bottomLeftCornerControls = hud.makeSphereControl(
    //   scale,
    //   -width / 2,
    //   0,
    //   depth / 2,
    //   BatchHandles.batchBottomLeftCorner,
    //   scope.redMaterial
    // );
    // const topRightCornerControls = hud.makeSphereControl(
    //   scale,
    //   width / 2,
    //   0,
    //   -depth / 2,
    //   BatchHandles.batchTopRightCorner,
    //   scope.redMaterial
    // );
    // const topLeftCornerControls = hud.makeSphereControl(
    //   scale,
    //   -width / 2,
    //   0,
    //   -depth / 2,
    //   BatchHandles.batchTopLeftCorner,

    //   scope.redMaterial
    // );

    const translateControls = hud.makeCenterControl(
      scale * 4,
      0,
      0,
      0,
      BatchHandles.batchTranslate
    );

    highlightMesh.add(rotateControls);
    highlightMesh.add(rightEdgeControls);
    highlightMesh.add(leftEdgeControls);
    highlightMesh.add(topEdgeControls);
    highlightMesh.add(bottomEdgeControls);

    // highlightMesh.add(bottomRightCornerControls);
    // highlightMesh.add(bottomLeftCornerControls);
    // highlightMesh.add(topRightCornerControls);
    // highlightMesh.add(topLeftCornerControls)

    highlightMesh.add(translateControls);
  }

  function updateHighlightBatchCount() {
    const translateControls = highlightMesh.children.at(-1);
    translateControls.remove(batchCount);
    const count = model.scene
      .getItems()
      .filter((item) => item.asset.groupId === 'temp')
      .length.toString();
    batchCount = hud.createText(count, {});
    highlightMesh.children.at(-1).add(batchCount);
    scope.update();
  }

  function updateHighlightControls() {
    removeHighlightControls();
    createHighlightControls();
  }

  function removeHighlightControls(): void {
    highlightMesh.remove(...highlightMesh.children);
  }

  function removeHighlight(): void {
    scene.remove(highlightMesh);
    highlightGeometry.dispose();
    highlightGeometry = new BufferGeometry();
    highlightMesh = undefined;
  }

  // TODO leaving for now could just be createHighlight
  function startHighlight(): void {
    state = states.DRAWHIGHLIGHT;
    const intersections = scope.getIntersections(mouse, [plane], [0]);
    const clickPoint = intersections[0].point;

    createHighlight(clickPoint);
    createHighlightControls();

    // Need to create a batch here
  }

  this.getPoint = function (objects = [plane]): Vector3 {
    const intersections = scope.getIntersections(mouse, objects, [0]);
    return intersections[0]?.point;
  };

  function addBatchItem() {
    if (highlightMesh === undefined) return;
    model.scene.clearBatchItems('temp');
    model.scene
      .addBatchItem(highlightMesh, 'temp', scope.itemUIConfg)
      .then(updateHighlightBatchCount);
  }

  const updateBatch = debounce(addBatchItem, 50);

  function getCorners(highlightMesh: Mesh): Vector2[] {
    const vec3 = Utils.positionBufferToVec3Corners(
      highlightMesh.geometry,
      highlightMesh.matrix
    );
    return vec3.map((vec: Vector3) => {
      return new Vector2(vec.x, vec.z);
    });
  }

  function boxSelectAll(corners: Vector2[], items: Item[]) {
    scope.selectItems(
      items
        .filter(
          (item) =>
            !(item.asset?.extensionProperties?.fixed && scope.ignoreFixed)
        )
        .filter((item) => !isWallItem(item.asset.classType))
        .filter((item) =>
          Utils.pointInPolygon(item.position.x, item.position.z, corners)
        )
        .filter((item) => !item.getSelected())
        .concat(scope.selectedItemList)
    );
  }

  this.setMouseFromEvent = function (event) {
    const rect = element.getBoundingClientRect();
    if (event.touches && event.touches.length > 0) {
      mouse.x = event.touches[0].clientX - rect.x;
      mouse.y = event.touches[0].clientY - rect.y;
    } else if (event.changedTouches && event.changedTouches.length > 0) {
      mouse.x = event.changedTouches[0].clientX - rect.x;
      mouse.y = event.changedTouches[0].clientY - rect.y;
    } else {
      mouse.x = event.clientX - rect.x;
      mouse.y = event.clientY - rect.y;
    }
  };

  function mouseMoveEvent(e: any) {
    if (e.type === 'mouemove' && e.movementX === 0 && e.movementY === 0) return;
    if (e.type === 'touchmove' && e.touches.length === 1) {
      if (
        Math.abs(touchDown[0] - e.touches[0].clientX) < 2 &&
        Math.abs(touchDown[1] - e.touches[0].clientY) < 2
      ) {
        touchDown = [e.touches[0].clientX, e.touches[0].clientY];
        return;
      }
      touchDown = [e.touches[0].clientX, e.touches[0].clientY];
    }

    if (scope.enabled) {
      e.preventDefault();

      mouseMoved = true;
      scope.setMouseFromEvent(e);

      if (mouseDown && mouseDownScreenPosition.distanceTo(mouse) > 3) {
        clearTimeout(scope.longPress);
      }
      if (!mouseDown) {
        updateIntersections();
        if ((store.getState() as ReduxState).blue.copiedAssets) {
          scope.drawAttendeeGroupFootprints(
            e,
            (store.getState() as ReduxState).blue.copiedAssets
          );
        } else {
          if (footprint.children.length !== 0) {
            scope.clearFootprint(footprint);
          }
        }
      }

      switch (state) {
        case states.DRAGGING:
          clickDragged(intersectedObject, scope.selectedItemList);
          hud.update();
          scope.update();
          e.stopImmediatePropagation();
          break;
        case states.ROTATING:
        case states.ROTATING_FREE:
          rotateItem();
          hud.update();
          scope.update();
          e.stopImmediatePropagation();
          break;
        case states.BATCHMODIFY:
          switch (selectedHandle.userData.name) {
            case BatchHandles.batchRotate:
              rotateBatch();
              break;
            case BatchHandles.batchTranslate:
              translateBatch();
              break;
            case BatchHandles.batchTopLeftCorner:
            case BatchHandles.batchTopRightCorner:
            case BatchHandles.batchBottomLeftCorner:
            case BatchHandles.batchBottomRightCorner:
              cornerBatch();
              break;
            default:
              edgeBatch();
              break;
          }
          scope.update();
          e.stopImmediatePropagation();
          break;
        case states.DRAWHIGHLIGHT:
          updateHighlight(scope.getPoint());
          if (scope.batchMode) {
            updateHighlightControls();
          }
          scope.update();
          e.stopImmediatePropagation();
          break;
        case states.ENDHIGHLIGHT:
          e.stopImmediatePropagation();
          break;
        default:
          updateMouseover();
          break;
      }
      scope.previousPosition = scope.getSurfaceIntersections(mouse)[0]?.point;
    } else {
      if (footprint.children.length > 0) {
        scope.clearFootprint(footprint);
      }
    }
  }

  this.isRotating = () => {
    return state === states.ROTATING || state === states.ROTATING_FREE;
  };

  function mouseDownEvent(event) {
    this.preventCollision = getFromLocalStorage(
      LocalStorageKey.CollisionPrevention
    );
    this.detectCollision = getFromLocalStorage(
      LocalStorageKey.CollisionDetection
    );
    this.keepInRoom = getFromLocalStorage(LocalStorageKey.KeepInRoom);

    if (event.type === 'touchstart' && event.touches.length === 1) {
      touchDown = [event.touches[0].clientX, event.touches[0].clientY];
    }
    if (scope.enabled && (event.button === undefined || event.button === 0)) {
      event.preventDefault();
      mouseMoved = false;
      mouseDown = true;
      scope.initialRotationAngle = undefined;
      mouseDownScreenPosition = mouse.clone();
      if (scope.intersection) {
        scope.mouseDownPosition = scope.intersection.point;
        scope.previousPosition = scope.intersection.point;
        selectedHandle = scope.intersection.object;
      } else {
        const intersections = scope.getIntersections(mouse, [plane], [0]);
        scope.mouseDownPosition =
          intersections[0]?.point ?? scope.mouseDownPosition;
        scope.previousPosition =
          intersections[0]?.point ?? scope.mouseDownPosition;
      }
      const longpressTime = 500;

      if ((store.getState() as ReduxState).blue.copiedAssets !== undefined) {
        function paste() {
          scope.pasteItems((store.getState() as ReduxState).blue.copiedAssets);
          finishBoxSelect();
        }
        scope.longPress = setTimeout(paste, longpressTime);
      }

      switch (state) {
        case states.UNSELECTED:
          switch (scope.intersectionType) {
            case ItemHandles.item:
              scope.selectItems([intersectedObject]);
              switchState(states.SELECTED);
              if (!intersectedObject.fixed) {
                switchState(states.DRAGGING);
              }
              break;
            default:
              if (
                (event.ctrlKey || scope.multiSelect) &&
                !scope.boxSelect &&
                !scope.batchMode &&
                !event.shiftKey
              ) {
                onBoxSelect();
                startHighlight();
                scope.controls.enabled = false;
              }
              break;
          }
          break;
        case states.SELECTED:
          if (scope.intersectionType === ItemHandles.rotateItem) {
            // Mouse down set rotating
            switchState(states.ROTATING);
            // intersected alread in list
          } else if (
            intersectedObject !== null &&
            scope.selectedItemList.find((el) => {
              return el === intersectedObject;
            })
          ) {
            // obj needs to be selected for hud
            if (event.ctrlKey || scope.multiSelect) {
              scope.selectItems([intersectedObject], scope.selectedItemList);

              if (!intersectedObject.fixed) {
                switchState(states.DRAGGING);
              }
            } else {
              scope.deselectItems(scope.selectedItemList);
              scope.selectItems([intersectedObject]);
              if (!intersectedObject.fixed) {
                switchState(states.DRAGGING);
              }
            }
            // MULTI SELECT adding intersected to list
          } else if (
            intersectedObject !== null &&
            (event.ctrlKey || scope.multiSelect)
          ) {
            //
            scope.selectItems([intersectedObject], scope.selectedItemList);

            if (!intersectedObject.fixed) {
              switchState(states.DRAGGING);
            }
          } else if (intersectedObject !== null) {
            scope.deselectItems(scope.selectedItemList);
            scope.selectItems([intersectedObject]);
            if (!intersectedObject.fixed) {
              switchState(states.DRAGGING);
            }
          } else if (
            (event.ctrlKey || scope.multiSelect) &&
            !scope.boxSelect &&
            !scope.batchMode &&
            !event.shiftKey
          ) {
            onBoxSelect();
            startHighlight();
            scope.controls.enabled = false;
          }
          break;
        case states.DRAGGING:
        case states.ROTATING:
          break;
        case states.ROTATING_FREE:
          switchState(states.SELECTED);
          break;
        case states.BEGINHIGHLIGHT:
          if (event.shiftKey) {
            break;
          }
          startHighlight();
          break;
        case states.ENDHIGHLIGHT:
          if (Object.values(BatchHandles).includes(scope.intersectionType)) {
            switchState(states.BATCHMODIFY);
          }
          break;
      }
    }
  }

  function onTouchStart(event) {
    if (scope.enabled) {
      event.preventDefault();

      switch (event.touches.length) {
        case 1: // one-fingered touch: select
          scope.setMouseFromEvent(event);
          if (!mouseDown) {
            updateIntersections();
          }
          mouseDownEvent(event);

          break;

        // case 2: // two-fingered touch: dolly-pan
      }
    }
  }

  function mouseUpEvent(event) {
    if (event.type === 'touchend' && event.touches.length > 0) return;
    if (scope.enabled) {
      mouseDown = false;
      scope.initialRotationAngles = undefined;
      clearTimeout(scope.longPress);

      switch (state) {
        case states.UNSELECTED:
          break;
        case states.SELECTED:
          if (intersectedObject === null && !mouseMoved) {
            scope.deselectItems(scope.selectedItemList);
            store.dispatch(SetSelectedItems([]));
            switchState(states.UNSELECTED);
          }
          break;
        case states.DRAGGING:
          if (mouseMoved) {
            scope.selectedItemList.forEach((item: Item) => {
              item.isValidPosition(
                model.scene.collisionHandler.collisionItems,
                item.position,
                item.quaternion
              );
            });
            scope.selectedItemList[selectedIndex].clickReleased();
            scope.updatePositionHistory(scope.selectedItemList);
            switchState(states.SELECTED);
            scope.updateSelectedItemsEvent();
          } else {
            if (event.ctrlKey || scope.multiSelect) {
              switchState(states.SELECTED);
            } else {
              if (scope.selectedItemList.length > 1) {
                scope.deselectItems(scope.selectedItemList);
                scope.selectItems([intersectedObject]);
                switchState(states.SELECTED);
              } else {
                switchState(states.SELECTED);
              }
            }
          }

          switchState(states.SELECTED);
          break;
        case states.ROTATING:
          if (!mouseMoved) {
            switchState(states.ROTATING_FREE);
          } else {
            switchState(states.SELECTED);
            scope.updatePositionHistory(scope.selectedItemList);
            scope.updateSelectedItemsEvent();
          }
          break;
        case states.ROTATING_FREE:
          break;
        case states.DRAWHIGHLIGHT:
          if (scope.boxSelect) {
            boxSelectAll(getCorners(highlightMesh), model.scene.getItems());
            finishBoxSelect();
            if (!mouseMoved) {
              scope.deselectItems(scope.selectedItemList);
            }
          }
          if (scope.batchMode && mouseMoved) {
            updateBatch();
            switchState(states.ENDHIGHLIGHT);
          }
          break;
        case states.ENDHIGHLIGHT:
          // if (scope.batchMode) {
          //   updateBatch();
          //   state = states.BEGINHIGHLIGHT;
          // }
          if (scope.boxSelect) {
            boxSelectAll(getCorners(highlightMesh), model.scene.getItems());
            finishBoxSelect();
          }
          break;
        case states.BATCHMODIFY:
          updateBatch();
          switchState(states.ENDHIGHLIGHT);
          break;
        default:
          break;
      }
    }
  }

  const toggleWallsVisibility = () => {
    this.selectedSurfaces[0].setVisibility(
      !this.selectedSurfaces[0].getVisibility()
    );
    const updatedSurfaces = [...this.selectedSurfaces];
    store.dispatch(SetSelectedSurfaces(updatedSurfaces));
  };

  function keyDownEvent(event: KeyboardEvent) {
    const charList = '123456789';
    const key = event.key;
    if (charList.indexOf(key) !== -1) {
      buffer = [parseFloat(key)];
    }

    if (scope.enabled || event.key === 'h') {
      switch (event.key) {
        case 'ArrowUp':
          scope.selectedItemList.forEach((item: Item): void => {
            if (item.arrowMove) {
              item.arrowMove(
                model.scene.collisionHandler.collisionItems,
                'up',
                controls.getAzimuthalAngle(),
                buffer[0]
              );
              event.stopPropagation();
              hud.update();
              scope.update();
            }
          });
          scope.updatePositionHistory(scope.selectedItemList);
          break;
        case 'ArrowDown':
          scope.selectedItemList.forEach((item: Item): void => {
            if (item.arrowMove) {
              item.arrowMove(
                model.scene.collisionHandler.collisionItems,
                'down',
                controls.getAzimuthalAngle(),
                buffer[0]
              );
              event.stopPropagation();
              hud.update();
              scope.update();
            }
          });
          scope.updatePositionHistory(scope.selectedItemList);
          break;
        case 'ArrowLeft':
          scope.selectedItemList.forEach((item: Item): void => {
            if (item.arrowMove) {
              item.arrowMove(
                model.scene.collisionHandler.collisionItems,
                'left',
                controls.getAzimuthalAngle(),
                buffer[0]
              );
              event.stopPropagation();
              hud.update();
              scope.update();
            }
          });
          scope.updatePositionHistory(scope.selectedItemList);
          break;
        case 'ArrowRight':
          scope.selectedItemList.forEach((item: Item): void => {
            if (item.arrowMove) {
              item.arrowMove(
                model.scene.collisionHandler.collisionItems,
                'right',
                controls.getAzimuthalAngle(),
                buffer[0]
              );
              event.stopPropagation();
              hud.update();
              scope.update();
            }
          });
          scope.updatePositionHistory(scope.selectedItemList);
          break;
        case 'Backspace':
        case 'Delete':
          if ((event.target as any).tagName !== 'INPUT') {
            scope.deleteSelectedItems(scope.selectedItemList, true);
            updateIntersections();
            updateMouseover();
          }
          break;
        case 'Escape':
          store.dispatch(ChangeCopiedAssetsState(undefined));
          scope.clearFootprint(footprint);
          break;
        case 'c':
          if (event.ctrlKey) {
            scope.copySelected();
          }
          break;

        case 'h':
          if (event.ctrlKey) {
            event.preventDefault();
            toggleWallsVisibility();
          }
          break;

        case 'v':
          if (event.ctrlKey) {
            scope.pasteItems(
              (store.getState() as ReduxState).blue.copiedAssets
            );
          }
          break;
        case 'z':
          if (event.ctrlKey) {
            if (this.blockUndoRedo) break;
            store.dispatch(UndoHistory());
          }
          break;
        case 'y':
          if (event.ctrlKey) {
            if (this.blockUndoRedo) break;
            store.dispatch(RedoHistory());
          }
          break;
        case 's':
          store.dispatch(Save());
          break;
      }
    }
  }

  function keyUpEvent(event: KeyboardEvent): void {
    const charList = '123456789';
    const key = event.key;
    if (charList.indexOf(key) !== -1) {
      buffer = [];
    }
  }

  function switchState(newState: states): void {
    if (newState !== state) {
      onExit(state);
      onEntry(newState);
    }
    state = newState;
    hud.setRotating(scope.isRotating());
  }

  function onEntry(state: states): void {
    switch (state) {
      case states.UNSELECTED:
      case states.SELECTED:
        controls.enabled = true;
        break;
      case states.ROTATING:
      case states.ROTATING_FREE:
        clickPressed();
        controls.enabled = false;
        break;
      case states.DRAGGING:
        scope.setCursorStyle('move');
        clickPressed();
        controls.enabled = false;
        break;
    }
  }

  function onExit(state: states): void {
    switch (state) {
      case states.UNSELECTED:
      case states.SELECTED:
        break;
      case states.DRAGGING:
        if (mouseoverObject) {
          scope.setCursorStyle('pointer');
        } else {
          scope.setCursorStyle('auto');
        }
        break;
      case states.ROTATING:
      case states.ROTATING_FREE:
        break;
    }
  }

  // updates the vector of the intersection with the plane of a given
  // mouse position, and the intersected object
  // both may be set to null if no intersection found
  function updateIntersections() {
    // clear intersections
    scope.intersectionType = undefined;
    scope.intersection = undefined;
    intersectedObject = null;

    // check the rotate arrow
    const hudObject = hud.getObject();
    if (hudObject != null) {
      const intersections = scope.getIntersections(mouse, [hudObject], [0, 7]);

      if (intersections.length > 0) {
        // this is where rotate intersection is set
        scope.intersectionType = ItemHandles.rotateItem;
        scope.intersection = intersections[0];
        return;
      }
    }

    // check objects
    const items = model.scene
      .getItems()
      .filter(
        (item) =>
          !(
            item.asset.extensionProperties &&
            item.asset.extensionProperties.fixed &&
            scope.ignoreFixed
          ) && item.visible
      );

    // TODO check items that can be stacked if of correct classtype

    const intersects = scope.getIntersections(mouse, items, [0, 7, 10, 13]);

    if (intersects.length > 0) {
      scope.intersectionType = ItemHandles.item;
      scope.intersection = intersects[0];
      intersectedObject = getItemFromIntersection(scope.intersection);
    }

    if (highlightMesh) {
      const batchIntersects = scope.getIntersections(
        mouse,
        [highlightMesh],
        [0]
      );
      if (batchIntersects[0]) {
        scope.intersection = batchIntersects[0];
        scope.intersectionType = batchIntersects[0].object.userData.name;
      }
    }
  }

  function getItemFromIntersection(intersection) {
    let ret = null;
    intersection.object.traverseAncestors((node) => {
      if (node instanceof Item && !(node.parent instanceof Item)) {
        ret = node;
      }
    });
    return ret;
  }

  // sets coords to -1 to 1
  function normalizeVector2(vec2: Vector2): Vector2 {
    const retVec = new Vector2();

    retVec.x = (vec2.x / element.clientWidth) * 2 - 1;
    retVec.y = -(vec2.y / element.clientHeight) * 2 + 1;

    return retVec;
  }

  this.getIntersectionPlanes = (item: Item): Object3D[] => {
    if (scene.sceneScan) {
      return [scene.sceneScan];
    } else if (isWallItem(item.asset.classType)) {
      return model.floorplan.wallEdgePlanes();
    } else if (this.keepInRoom && main?.floorplan?.floorPlaneMeshes()) {
      return main.floorplan.floorPlaneMeshes();
    } else {
      return [plane];
    }
  };

  // returns the first intersection object
  this.itemIntersection = (vec2: Vector2, item: Item): Intersection => {
    const customIntersections = this.getIntersectionPlanes(item);

    let intersections = null;

    const intersectableObjects = customIntersections.concat(
      model.scene.collisionHandler.intersectionItems
    );
    // This could be very large
    intersections = this.getIntersections(
      vec2,
      intersectableObjects,
      [0, 6, 7, 10, 13]
    );
    intersections = intersections.filter(
      (intersection: Intersection) => intersection.object.type !== 'Box3Helper'
    );

    if (intersections.length > 0) {
      return intersections[0];
    }
    return null;
  };

  // filter by normals will only return objects facing the camera
  // objects can be an array of objects or a single object
  this.getIntersections = (
    mouse: Vector2,
    objects: Object3D[],
    layers: number[]
  ): Intersection[] => {
    const raycaster = new Raycaster();
    raycaster.setFromCamera(normalizeVector2(mouse), scope.cameras.camera);
    raycaster.params.Line = { threshold: 10 };
    raycaster.params.Points = { threshold: 15 };

    (raycaster as any).layers.disableAll();
    layers.forEach((element) => {
      (raycaster as any).layers.enable(element);
    });

    let intersections: Intersection[];
    if (objects instanceof Array) {
      intersections = raycaster.intersectObjects(objects, true);
    }

    return filterByClippingPlanes(intersections.filter(isNotSprite));
  };

  function isNotSprite(value: Intersection): boolean {
    return !(value.object instanceof Sprite);
  }

  this.selectItems = (
    items: Item[],
    currentSelectedItems: Item[] = []
  ): void => {
    if (items.length === 0) {
      //TODO this should just update with the selected item list
      this.deselectItems(this.selectedItemList);
      return;
    }

    // const classType = currentSelectedItems?.[0]?.asset?.classType ?? items[0].asset.classType;
    const newItemsToSelect = [...new Set(items.concat(currentSelectedItems))];
    // .filter((item: Item) => item.asset.classType === classType);

    newItemsToSelect.forEach((item: Item) => {
      item.setSelected();
    });

    //TODO I have no memory of this
    // const newSelectedItems = produce<Item[]>(scope.selectedItemList, draft => {
    //   draft.splice(0, draft.length, ...newItemsToSelect);
    // });

    switchState(states.SELECTED);
    // store.dispatch(SetSelectedItems(newSelectedItems));
    store.dispatch(SetSelectedItems(newItemsToSelect));

    scope.update();
  };

  this.deselectItems = (items: Item[]): void => {
    if (items === undefined || items.length === 0) return;
    items.forEach((item: Item) => {
      item.setUnselected();
    });
    const selectedItemInstanceIds = items.map(
      (item: Item) => item.asset.instanceId
    );
    const newSelectedItems = scope.selectedItemList.filter(
      (item: Item) => !selectedItemInstanceIds.includes(item.asset.instanceId)
    );

    store.dispatch(SetSelectedItems(newSelectedItems));
    scope.update();
  };

  //todo this is deleteSelectedItem
  this.deleteSelectedItems = (items: Item[], updateHistory?: boolean): void => {
    if (updateHistory) {
      scene.removeItems(items, () => {
        scope.updateItemsList();
        scope.deselectItems(items);
      });
    } else {
      scene.removeItems(items, () => {
        scope.deselectItems(items);
      });
    }
    switchState(states.UNSELECTED);
  };

  this.copyCommonAsset = (asset: Asset): void => {
    if (scope.selectedItemList.length < 1) return;
    const itemIds = [];
    [...scope.selectedItemList]
      .filter((item: Item) => {
        return (
          item.asset.sku === asset.sku ||
          item.asset.extensionProperties?.progenitorId === asset.sku ||
          item.asset.sku === asset.extensionProperties?.progenitorId
        );
      })
      .forEach((item: Item) => {
        item.asset.modifiers = { ...asset.modifiers };
        item.asset.previewPath = asset.previewPath;
        item.build();
        itemIds.push(item.asset.instanceId);
      });
    this.updateItemsList(itemIds);
  };

  const projectionSortUp = (vec: Vector2) => (cornerA, cornerB) => {
    const cornerADot = cornerA.clone().dot(vec);
    const cornerBDot = cornerB.clone().dot(vec);
    return cornerBDot - cornerADot;
  };

  const projectionSortDown = (vec: Vector2) => (cornerA, cornerB) => {
    const cornerADot = cornerA.clone().dot(vec);
    const cornerBDot = cornerB.clone().dot(vec);
    return cornerADot - cornerBDot;
  };

  this.alignHorizontal = (
    modifier: HorizAlignModifiers = HorizAlignModifiers.top
  ) => {
    if (scope.selectedItemList.length < 2) return;
    const firstPosition: Vector3 = scope.selectedItemList[0].position.clone();
    if (isFloorItem(scope.selectedItemList[0].asset.classType)) {
      const firstCorners = scope.selectedItemList[0].getCorners();
      const vertVec = new Vector3(0, 0, 1).applyAxisAngle(
        new Vector3(0, 1, 0),
        scope.controls.getAzimuthalAngle()
      );
      const vertVec2 = new Vector2(0, 1).rotateAround(
        new Vector2(),
        -scope.controls.getAzimuthalAngle()
      );
      if (modifier === HorizAlignModifiers.center) {
        scope.selectedItemList.forEach((element) => {
          const relVec = new Vector3()
            .subVectors(firstPosition, element.position)
            .setY(0)
            .projectOnVector(vertVec);

          const newPosition = element.getNewPosition(element.position, relVec);
          if (
            element.isValidPosition(
              model.scene.collisionHandler.collisionItems,
              newPosition
            )
          ) {
            element.moveToPosition(newPosition);
          }
        });
      } else if (modifier === HorizAlignModifiers.bottom) {
        firstCorners.sort(projectionSortUp(vertVec2));
        scope.selectedItemList.forEach((element) => {
          const secondCorners = element.getCorners();
          secondCorners.sort(projectionSortUp(vertVec2));
          const diffVec = new Vector2().subVectors(
            firstCorners[0],
            secondCorners[0]
          );

          const relVec = new Vector3()
            .setX(diffVec.x)
            .setZ(diffVec.y)
            .setY(0)
            .projectOnVector(vertVec);

          const newPosition = element.getNewPosition(element.position, relVec);
          if (
            element.isValidPosition(
              model.scene.collisionHandler.collisionItems,
              newPosition
            )
          ) {
            element.moveToPosition(newPosition);
          }
        });
      } else if (modifier === HorizAlignModifiers.top) {
        firstCorners.sort(projectionSortDown(vertVec2));
        scope.selectedItemList.forEach((element) => {
          const secondCorners = element.getCorners();
          secondCorners.sort(projectionSortDown(vertVec2));
          const diffVec = new Vector2().subVectors(
            firstCorners[0],
            secondCorners[0]
          );

          const relVec = new Vector3()
            .setX(diffVec.x)
            .setZ(diffVec.y)
            .projectOnVector(vertVec)
            .setY(0);

          const newPosition = element.getNewPosition(element.position, relVec);
          if (
            element.isValidPosition(
              model.scene.collisionHandler.collisionItems,
              newPosition
            )
          ) {
            element.moveToPosition(newPosition);
          }
        });
      }
    } else if (scope.selectedItemList[0] instanceof WallItem) {
      scope.selectedItemList.forEach((element) => {
        const relVec = new Vector3()
          .subVectors(firstPosition, element.position)
          .setZ(0)
          .setX(0);
        const newPosition = element.getNewPosition(element.position, relVec);
        if (
          element.isValidPosition(
            model.scene.collisionHandler.collisionItems,
            newPosition
          )
        ) {
          element.moveToPosition(newPosition);
        }
      });
    }
    hud.update();
    scope.updatePositionHistory(scope.selectedItemList);
    scope.update();
  };

  this.alignVertical = (
    modifier: VertAlignModifiers = VertAlignModifiers.center
  ) => {
    if (scope.selectedItemList.length < 2) return;
    const firstPosition = scope.selectedItemList[0].position;
    if (isFloorItem(scope.selectedItemList[0].asset.classType)) {
      const firstCorners = scope.selectedItemList[0].getCorners();
      const horizVec = new Vector3(1, 0, 0).applyAxisAngle(
        new Vector3(0, 1, 0),
        scope.controls.getAzimuthalAngle()
      );
      const horizVec2 = new Vector2(1, 0).rotateAround(
        new Vector2(),
        -scope.controls.getAzimuthalAngle()
      );
      if (modifier === VertAlignModifiers.center) {
        scope.selectedItemList.forEach((element) => {
          const relVec = new Vector3()
            .subVectors(firstPosition, element.position)
            .projectOnVector(horizVec)
            .setY(0);
          const newPosition = element.getNewPosition(element.position, relVec);
          if (
            element.isValidPosition(
              model.scene.collisionHandler.collisionItems,
              newPosition
            )
          ) {
            element.moveToPosition(newPosition);
          }
        });
      } else if (modifier === VertAlignModifiers.right) {
        firstCorners.sort(projectionSortUp(horizVec2));
        scope.selectedItemList.forEach((element) => {
          const secondCorners = element.getCorners();
          secondCorners.sort(projectionSortUp(horizVec2));
          const diffVec = new Vector2().subVectors(
            firstCorners[0],
            secondCorners[0]
          );

          const relVec = new Vector3()
            .setX(diffVec.x)
            .setZ(diffVec.y)
            .projectOnVector(horizVec)
            .setY(0);

          const newPosition = element.getNewPosition(element.position, relVec);
          if (
            element.isValidPosition(
              model.scene.collisionHandler.collisionItems,
              newPosition
            )
          ) {
            element.moveToPosition(newPosition);
          }
        });
      } else if (modifier === VertAlignModifiers.left) {
        firstCorners.sort(projectionSortDown(horizVec2));
        scope.selectedItemList.forEach((element) => {
          const secondCorners = element.getCorners();
          secondCorners.sort(projectionSortDown(horizVec2));
          const diffVec = new Vector2().subVectors(
            firstCorners[0],
            secondCorners[0]
          );

          const relVec = new Vector3()
            .setX(diffVec.x)
            .setZ(diffVec.y)
            .projectOnVector(horizVec)
            .setY(0);

          const newPosition = element.getNewPosition(element.position, relVec);
          if (
            element.isValidPosition(
              model.scene.collisionHandler.collisionItems,
              newPosition
            )
          ) {
            element.moveToPosition(newPosition);
          }
        });
      }
    } else if (scope.selectedItemList[0] instanceof WallItem) {
      scope.selectedItemList.forEach((element) => {
        const relVec = new Vector3()
          .subVectors(firstPosition, element.position)
          .setY(0);
        const newPosition = element.getNewPosition(element.position, relVec);
        if (
          element.isValidPosition(
            model.scene.collisionHandler.collisionItems,
            newPosition
          )
        ) {
          element.moveToPosition(newPosition);
        }
      });
    }
    hud.update();
    scope.updatePositionHistory(scope.selectedItemList);
    scope.update();
  };

  // TODO: there MUST be simpler logic for expressing this
  function updateMouseover(): void {
    if (scope.intersection !== undefined) {
      scope.setCursorStyle('pointer');
      if (intersectedObject != null) {
        if (mouseoverObject != null) {
          if (mouseoverObject !== intersectedObject) {
            scope.mouseOffItem(mouseoverObject);
            mouseoverObject = intersectedObject;
            scope.mouseOverItem(mouseoverObject);
          } else {
            // do nothing, mouseover already set
          }
        } else {
          mouseoverObject = intersectedObject;
          scope.mouseOverItem(mouseoverObject);
        }
      } else if (mouseoverObject != null) {
        scope.mouseOffItem(mouseoverObject);
        mouseoverObject = null;
        scope.update();
      }
    } else {
      mouseoverObject = null;
      scope.setCursorStyle('auto');
    }
  }

  function filterByClippingPlanes(objs: Intersection[]): Intersection[] {
    if (main.getRenderer().clippingPlanes.length > 0) {
      return objs.filter((elem: Intersection) => {
        return main.getRenderer().clippingPlanes.every((elem2: Plane) => {
          return elem2.distanceToPoint(elem.point) > 0;
        });
      });
    }
    return objs;
  }

  this.mouseOverItem = (obj) => {
    if (obj.mouseOver) {
      obj.mouseOver();
      scope.update();
    } else if (obj.parent) {
      this.mouseOverItem(obj.parent);
    }
  };

  this.mouseOffItem = (obj) => {
    if (obj.mouseOff) {
      obj.mouseOff();
    } else if (obj.parent) {
      this.mouseOffItem(obj.parent);
    }
  };

  init();
};

export const createAssetGroupFromItems = function (
  items: Item[],
  label: string
): AssetGroup {
  let globalFlatCorners: Vector2[] = [];

  items.forEach((item: Item) => {
    globalFlatCorners = globalFlatCorners.concat(item.getCorners());
  });

  const globalMaxCorner = new Vector2().copy(globalFlatCorners[0]);
  const globalMinCorner = new Vector2().copy(globalFlatCorners[0]);
  globalFlatCorners.forEach((corner: Vector2) => {
    if (corner.x > globalMaxCorner.x) {
      globalMaxCorner.setX(corner.x);
    }
    if (corner.y > globalMaxCorner.y) {
      globalMaxCorner.setY(corner.y);
    }
    if (corner.x < globalMinCorner.x) {
      globalMinCorner.setX(corner.x);
    }
    if (corner.y < globalMinCorner.y) {
      globalMinCorner.setY(corner.y);
    }
  });
  const center = new Vector2();

  center.addVectors(globalMaxCorner, globalMinCorner).divideScalar(2);

  const footprint: { x: number; y: number }[][] = [];
  items.forEach((item: Item) => {
    const corners = item
      .getCorners()
      .map((corner: Vector2): { x: number; y: number } => {
        corner.sub(center);
        return {
          x: corner.x,
          y: corner.y,
        };
      });

    footprint.push(corners);
  });

  const assets: PlacedAsset[] = [];
  items.forEach((item: Item) => {
    assets.push(item.serialize());
  });

  const adjustedAssets = assets.map((asset: PlacedAsset) => {
    const newAsset = JSON.parse(JSON.stringify(asset));
    newAsset.id = 0;
    newAsset.groupId = undefined;
    newAsset.modifiers = AssetModifierHelper.clearAllModifierFields(
      asset.modifiers
    );
    newAsset.materialMask = asset.materialMask?.map((material) =>
      material
        ? {
            ...material,
            id: EmptyGuid,
            mediaAssetId: null,
            placedAssetId: null,
            organizationId: null,
          }
        : null
    );

    newAsset.transformation[12] -= center.x;
    newAsset.transformation[14] -= center.y;
    return newAsset;
  });

  return {
    id: EmptyGuid,
    assets: adjustedAssets,
    mask: footprint,
    name: label,
  };
};

export type ArrowDirection = 'up' | 'down' | 'left' | 'right';
