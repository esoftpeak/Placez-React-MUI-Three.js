import { Blueprint3d } from './blueprint3d';
import { store } from '../index';
import {
  InitDesigner,
  DisposeDesigner,
  SetSelectedItems,
} from '../reducers/blue';
import { HandlesFromBlue } from '../components/Blue/models';
import { Asset, Labels } from './items/asset';
import { Attendee, PlacezFixturePlan } from '../api';
import { Room } from './model/room';
import { Item } from './items/item';
import { Wall } from './model/wall';
import { Photosphere } from '../components/Blue/models/Photosphere';
import { Utils } from './core/utils';
import {
  ArrowDirection,
  HorizAlignModifiers,
  VertAlignModifiers,
} from './three/controller';
import { WallItem } from './items/wall_item';
import { WallFloorItem } from './items/wall_floor_item';
import { InWallFloorItem } from './items/in_wall_floor_item';
import { Theme } from '@mui/material';
import { CeilingItem } from './items/ceiling_item';
import { AssetGroup } from './items';
import { Vector3, Quaternion } from 'three';
import { getInventory } from './model/scene';
import PlacedAsset from '../api/placez/models/PlacedAsset';
import AssetModifierHelper from './itemModifiers/AssetModifierHelper';
import { ToastMessage } from '../reducers/ui';

const EmptyGuid = '00000000-0000-0000-0000-000000000000';

export class BlueJS {
  public dispose;
  public setTheme;
  public setGridVisible;
  public setFloorplanVisible;

  constructor(containerElement: any, bluejsCallbacks: HandlesFromBlue) {
    const unsubscribeStore = store.subscribe(() => {
      // On redux dispatch
    });

    const viewerDiv = containerElement.querySelector('#viewer');
    const floorplanDiv = containerElement.querySelector('#floorplan');

    const opts = {
      floorplannerElement: floorplanDiv,
      threeElement: viewerDiv,
    };

    const blueprint3d = new Blueprint3d(opts);
    
    this.dispose = function () {
      unsubscribeStore();
      blueprint3d.dispose();
      store.dispatch(DisposeDesigner());
    };

    this.setTheme = (theme: Theme) => {
      blueprint3d.setTheme(theme);
    };

    store.dispatch(InitDesigner(blueprint3d));

    bluejsCallbacks.onDragAndDrop = (e: any, asset: Asset, state: string) => {
      let assetToUse = asset;
      if (asset.custom && asset.extensionProperties?.progenitorId) {
        const state = store.getState();
        const originalAsset =
          state.asset.bySku[asset.extensionProperties.progenitorId];

        if (originalAsset) {
          assetToUse = originalAsset;
        }
      }

      const intersects = blueprint3d
        .getMain()
        .getController()
        .dragAndDrop(e, assetToUse);

      const assetCopy: PlacedAsset = {
        ...JSON.parse(JSON.stringify(assetToUse)),
        id: 0,
        mediaAssetId: asset.id,
        groupId: undefined,
        fromScene: true,
        name: asset.name,
        labels: {
          titleLabel: asset.labels.titleLabel,
        },
        price: asset.price,
        priceRateInHours: asset.priceRateInHours,
        modifiers: AssetModifierHelper.clearAllModifierFields(asset.modifiers),
        materialMask: asset.materialMask
          ? asset.materialMask.map((material) =>
            material
              ? {
                ...material,
                id: EmptyGuid,
                mediaAssetId: null,
                placedAssetId: null,
                organizationId: null,
              }
              : null
          )
          : [],
      };

      if (intersects) {
        assetCopy.groupId = undefined;
        if (assetToUse.gltf) {
          assetCopy.gltf = assetToUse.gltf.clone();
        }

        assetCopy.instanceId = Utils.guid();
        blueprint3d
          .getModel()
          .scene.addAssetAsync(assetCopy, false)
          .then(() => {
            blueprint3d.getModel().scene.updateSceneStats();
            blueprint3d.getMain().getController().updateItemsList();
          });
      } else {
        store.dispatch(
          ToastMessage(
            'Could not position item. Try dragging to a different location.'
          )
        );
      }
    };

    bluejsCallbacks.onDragAndDropAssetGroup = (
      e: any,
      assetGroup: AssetGroup,
      state: string
    ) => {
      if (state === 'dragging') {
        blueprint3d
          .getMain()
          .getController()
          .drawAttendeeGroupFootprints(e, assetGroup);
      } else if (state === 'stop') {
        blueprint3d.getMain().getController().pasteItems(assetGroup);
      }
    };

    bluejsCallbacks.onDragAttendee = (attendee: Attendee) => {
      blueprint3d.getMain().getController().dropAttendee(attendee);
    };

    bluejsCallbacks.onDragCoordinates = (
      e: any
    ): { normal: Vector3; position: Vector3 } => {
      const controller = blueprint3d.getMain().getController();
      controller.setMouseFromEvent(e);
      return controller.dragAndDropCoordinates(72 * 2.54);
    };

    bluejsCallbacks.onLoadFloorplanImg = (src: any) => {
      blueprint3d.getFloorPlan().setImage(src);
    };

    bluejsCallbacks.getFloorPlan = (): PlacezFixturePlan => {
      return blueprint3d.getModel().exportFloorPlan();
    };

    bluejsCallbacks.onScreenshot = (download?: boolean) => {
      return blueprint3d.getMain().screenCapture(download);
    };

    bluejsCallbacks.onExport = (callback: (blob: Blob) => void) => {
      blueprint3d.getModel().scene.exportEvent('gltf', callback);
    };

    bluejsCallbacks.setWallSettings = (wallSettings: {
      hide: boolean;
      height: number;
    }) => {
      blueprint3d.getFloorPlan().floorplan.setWallSettings(wallSettings);
    };

    bluejsCallbacks.deleteFloorplan = (clearImages?: boolean) => {
      blueprint3d.getFloorPlan().deleteAndReset(clearImages);
    };

    bluejsCallbacks.removeItems = (items: Item[]) => {
      blueprint3d.getMain().getController().deleteSelectedItems(items, true);
    };

    bluejsCallbacks.getInventory = () => {
      return getInventory(blueprint3d.getModel().scene.getItems());
    };

    bluejsCallbacks.setAllWalls = (material) => {
      const walls = blueprint3d.getModel().floorplan.getWalls();

      walls.forEach((wall: Wall) => {
        if (wall.frontEdge && wall.frontMaterial) {
          const preservedId = wall.frontMaterial.id;
          const clonedMaterial = {
            ...JSON.parse(JSON.stringify(material)),
            id: preservedId,
          };
          wall.frontEdge.setMaterial(clonedMaterial);
          wall.frontMaterialId = preservedId;
        }
        if (wall.backEdge && wall.backMaterial) {
          const preservedId = wall.backMaterial.id;
          const clonedMaterial = {
            ...JSON.parse(JSON.stringify(material)),
            id: preservedId,
          };

          wall.backEdge.setMaterial(clonedMaterial);
          wall.backMaterialId = preservedId;
        }
      });
    };

    bluejsCallbacks.setAllFloors = (material) => {
      const rooms = blueprint3d.getModel().floorplan.getRooms();

      rooms.forEach((room: Room) => {
        room.setMaterial(material);
      });
    };

    bluejsCallbacks.setRoom = (room: Room, material) => {
      room.getEdges().forEach((edge: any) => {
        const wall: Wall | undefined = edge.wall;
        if (!wall) return;

        const currentMat = edge.getMaterial
          ? edge.getMaterial()
          : wall.frontMaterial;

        const preservedId = currentMat?.id || wall.frontMaterialId;

        const clonedMaterial = {
          ...JSON.parse(JSON.stringify(material)),
          id: preservedId,
        };

        edge.setMaterial(clonedMaterial);
        wall.frontMaterialId = preservedId;
      });
    };

    bluejsCallbacks.copyCommonAsset = (asset: Asset) => {
      blueprint3d.getMain().getController().copyCommonAsset(asset);
    };

    bluejsCallbacks.setItemHeight = (selectedList: Item[], height: number) => {
      selectedList
        .filter((item: Item) => {
          return (
            (item instanceof WallItem &&
              !(item instanceof WallFloorItem) &&
              !(item instanceof InWallFloorItem)) ||
            item instanceof CeilingItem
          );
        })
        .forEach((item: Item, index: number) => {
          if (index !== 0) return;
          item.setHeight(height);
          item.updateItem();
        });
    };

    bluejsCallbacks.setLabelSize = (selectedList: Item[], size: number) => {
      selectedList.forEach((item: Item) => {
        item.asset.extensionProperties.fontSize = size;
        item.buildLabel();
        blueprint3d.getMain().needsUpdate();
      });
    };

    bluejsCallbacks.setItemLabel = (
      selectedList: Item[],
      label: keyof Labels,
      value: string
    ) => {
      selectedList.forEach((item: Item) => {
        if (item.asset.labels) {
          item.asset.labels[label] = value;
        } else {
          item.asset.labels = { titleLabel: '' };
          item.asset.labels[label] = value;
        }
        item.updateItem();
      });
      store.dispatch(SetSelectedItems([...selectedList]));
    };

    bluejsCallbacks.setAssetProp = (
      selectedList: Item[],
      assetProperty,
      value
    ) => {
      selectedList.forEach((item: Item) => {
        if (Object.keys(item.asset).includes(assetProperty)) {
          item.asset[assetProperty] = value;
        } else {
          item.asset.extensionProperties[assetProperty] = value;
          if (assetProperty === 'excludeFromChairCount') {
            blueprint3d.getModel().scene.updateSceneStats();
          }
        }
        item.updateItem();
        item.update();
      });
      store.dispatch(SetSelectedItems([...selectedList]));
    };

    bluejsCallbacks.setExtensionProp = (
      selectedList: Item[],
      extensionProperty,
      value
    ) => {
      selectedList.forEach((item: Item) => {
        item.asset.extensionProperties[extensionProperty] = value;
        item.updateItem();
      });
      store.dispatch(SetSelectedItems([...selectedList]));
    };

    bluejsCallbacks.getCameraFar = (): number => {
      const fpSize =
        blueprint3d.getFloorPlan().floorplan.getSpecs().diagonal * 2;
      return fpSize;
    };

    bluejsCallbacks.getPhotosphere = (): Photosphere => {
      const photosphereMesh: THREE.Mesh = blueprint3d
        .getMain()
        .getPhotosphereMesh();
      const direction: THREE.Vector3 = blueprint3d
        .getMain()
        .getPhotosphereDirection();
      const photosphere: Photosphere = photosphereMesh.userData as Photosphere;
      photosphere.transformation = photosphereMesh.matrix.toArray();
      photosphere.direction = direction.toArray();
      return photosphere;
    };

    bluejsCallbacks.drawPhotosphereLocations = (photos: Photosphere[]) => {
      blueprint3d.getMain().buildPhotosphereLocations(photos);
    };

    bluejsCallbacks.copyItems = () => {
      blueprint3d.getMain().getController().copySelected();
    };

    bluejsCallbacks.alignHorizontal = (modifier: HorizAlignModifiers) => {
      blueprint3d.getMain().getController().alignHorizontal(modifier);
    };

    bluejsCallbacks.alignVertical = (modifier: VertAlignModifiers) => {
      blueprint3d.getMain().getController().alignVertical(modifier);
    };

    bluejsCallbacks.updateItemsList = (itemIDs?: Item[]) => {
      blueprint3d.getMain().getController().updateItemsList(itemIDs);
    };

    bluejsCallbacks.fixItems = (selectedList: Item[], fixed: boolean) => {
      selectedList.forEach((item: Item) => {
        item.asset.extensionProperties.fixed = fixed;
      });
      store.dispatch(SetSelectedItems([...selectedList]));
    };

    bluejsCallbacks.rotateControlsTo = (degreeAngle: number) => {
      const newAngle = isNaN(degreeAngle) ? 0 : degreeAngle;
      blueprint3d
        .getMain()
        .controls.setCameraRotation(Utils.convertToRadians(-newAngle % 360));
    };

    bluejsCallbacks.rotateItemTo = (
      selectedList: Item[],
      radianAngle: number
    ) => {
      const newAngle = isNaN(radianAngle) ? 0 : radianAngle;
      const rotateToQuat = new Quaternion().setFromAxisAngle(
        new Vector3(0, 1, 0),
        newAngle
      );
      selectedList.forEach((item: Item) => {
        item.rotateTo(rotateToQuat);
      });
      blueprint3d.getMain().needsUpdate();
    };

    bluejsCallbacks.rotateItemBy = (
      selectedList: Item[],
      radianAngle: number
    ) => {
      const newAngle = isNaN(radianAngle) ? 0 : radianAngle;
      const rotateByQuat = new Quaternion().setFromAxisAngle(
        new Vector3(0, 1, 0),
        newAngle
      );
      const controller = blueprint3d.getMain().getController();
      controller.rotateItemBy(rotateByQuat);
    };

    bluejsCallbacks.movePointerLockCamera = (direction: ArrowDirection) => {
      blueprint3d.getMain().firstPersonControls.onMove(direction);
    };

    bluejsCallbacks.rotatePointerLockCamera = (direction: ArrowDirection) => {
      blueprint3d.getMain().firstPersonControls.onRotate(direction);
    };
  }
}
