import { Utils } from '../core/utils';
import { Factory } from '../items/factory';
import { Model } from '../model/model';
import { Item } from '../items/item';
import { Asset, SkuType } from '../items/asset';
import { GLTF } from 'three/examples/jsm/loaders/GLTFLoader';
import { GLTFExporter } from 'three/examples/jsm/exporters/GLTFExporter';
import { LoadingProgressService } from './loading_progress';

import { store } from '../../index';
import { ReduxState } from '../../reducers';
import { CameraLayers } from '../../models/BlueState';
import { WallItem } from '../items/wall_item';
import PlacezFixturePlan from '../../api/placez/models/PlacezFixturePlan';
import PlacezLayoutPlan from '../../api/placez/models/PlacezLayoutPlan';
import PlacezCameraState from '../../api/placez/models/PlacezCameraState';
import { SetStats } from '../../reducers/blue';
import { SeatInstance } from '../../blue/itemModifiers/ChairMod';
import { Theme } from '@mui/material';
import * as BatchPatterns from './batchPatterns';
import { BatchTypes } from './batchPatterns';
import { debounce } from 'ts-debounce';
import {
  Box3,
  Cache,
  Color,
  Group,
  Layers,
  Matrix4,
  Mesh,
  Object3D,
  Scene as THREEScene,
  TextureLoader,
  Vector3,
} from 'three';
import { CollisionHandler } from '../core/CollisionHandler';
import { CSS3DObject } from 'three/examples/jsm/renderers/CSS3DRenderer';

/**
 * The Scene is a manager of Items and also links to a ThreeJS scene.
 */

export const getInventory = (
  items: Item[]
): { assetSku: string; count: number }[] => {
  // Flat Inventory

  const assetCountList = items.reduce((allItems, anItem) => {
    const assets = anItem.getAssets();
    assets.forEach((assetCount) => {
      const index = allItems.findIndex((aItem) => {
        return aItem.assetSku === assetCount.assetSku;
      });
      if (index >= 0) {
        allItems[index].count += assetCount.qty;
      } else {
        allItems.push({
          assetSku: assetCount.assetSku,
          count: assetCount.qty,
        });
      }
    });
    return allItems;
  }, []);
  return assetCountList;
};

export const countTablesAndChairs = (
  items: Item[]
): { tables: number; chairs: number } => {
  return items.reduce(
    (accumulator, item) => {
      if (
        item.asset.extensionProperties &&
        item.asset.extensionProperties.excludeFromChairCount
      ) {
        return accumulator;
      }
      if (SkuType[item.asset.skuType] === SkuType.TBL) {
        accumulator.tables++;
      }
      if (item.asset.modifiers?.chairMod?.seatPositions) {
        accumulator.chairs +=
          item.asset.modifiers.chairMod.seatPositions.filter(
            (chair: SeatInstance) => {
              return !chair.hidden && chair.position.length > 0;
            }
          ).length;
      }
      if (SkuType[item.asset.skuType] === SkuType.CHR) {
        accumulator.chairs++;
      }
      return accumulator;
    },
    { tables: 0, chairs: 0 }
  );
};
export class Scene {
  /** The associated ThreeJS scene. */
  private scene: THREE.Scene;
  public sceneScan: THREE.Mesh;

  /** */
  private items: Item[] = [];
  private fixtureItems: Item[] = [];

  public theme: Theme;
  public selectColor: THREE.Color = new Color(0x000000);

  /** */
  private needsUpdate = false;

  public update = () => {
    this.needsUpdate = true;
  };

  /** The Json loader. */
  public exporter: GLTFExporter;
  public hideWalls: boolean = false;

  public bboxHelper: THREE.Box3Helper;

  private showFloorTextureMap: boolean;

  private textureLoader: THREE.TextureLoader;

  public loadingProgressService: LoadingProgressService;

  private eventName: string;
  public distinctGLTF: [];
  public loadingItemList = [];
  public listener: any;
  public unsubscribeStore: any;

  private protectedLayers: THREE.Layers;

  public toastService: any;

  public tempBatchItem: Item;

  public collisionHandler: CollisionHandler;

  /**
   * Constructs a scene.
   * @param model The associated model.
   * @param textureDir The directory from which to load the textures.
   */
  constructor(private model: Model) {
    Cache.enabled = true;
    this.scene = new THREEScene();
    this.collisionHandler = new CollisionHandler(this);
    this.collisionHandler.setNumberOfRooms(
      this.model.floorplan.getRooms().length
    );

    // init item loader
    this.exporter = new GLTFExporter();
    // this.loader.crossOrigin = "";

    // init texture loader
    this.showFloorTextureMap = true;
    this.textureLoader = new TextureLoader();
    this.textureLoader.setCrossOrigin('');

    this.loadingProgressService = LoadingProgressService.getInstance();

    this.protectedLayers = new Layers();
    this.protectedLayers.set(CameraLayers.TitleLabel);
    this.protectedLayers.enable(CameraLayers.NumberLabel);
    this.protectedLayers.enable(CameraLayers.TableNumberLabel);
    this.protectedLayers.enable(CameraLayers.ChairNumberLabel);
  }

  /** Adds a non-item, basically a mesh, to the scene.
   * @param mesh The mesh to be added.
   */
  public add(item: any) {
    this.scene.add(item);
  }

  /** Removes a non-item, basically a mesh, from the scene.
   * @param mesh The mesh to be removed.
   */
  public remove(mesh: Mesh) {
    this.scene.remove(mesh);
  }

  /** Gets the scene.
   * @returns The scene.
   */
  public getScene(): THREEScene {
    return this.scene;
  }

  /** Gets the items.
   * @returns The items.
   */
  public getItems(): Item[] {
    return this.items;
  }

  public getBatchItems(groupId: string): Item[] {
    return this.items.filter((item: Item) => item.asset.groupId === groupId);
  }

  public getItemByInstanceId(instanceId: string): Item {
    const foundItems = this.items.filter((item: Item) => {
      return item.asset.instanceId === instanceId;
    });

    return foundItems[0];
  }

  /** Gets the fixture items.
   * @returns The items.
   */
  public getFixtureItems(): Item[] {
    return this.fixtureItems;
  }

  public rollUpPrice(items) {
    let totalPrice = 0;
    items.forEach((anItem) => {
      totalPrice += anItem.priceAsset();
    });
    return totalPrice;
  }

  /** loads an application state */
  public loadAsync(
    sceneLayout: PlacezFixturePlan | PlacezLayoutPlan,
    main: any
  ) {
    // Probably not the best way to handle this
    let state;
    if ((<PlacezFixturePlan>sceneLayout).fixtures) {
      state = (<PlacezFixturePlan>sceneLayout).fixtures;
    } else {
      state = (<PlacezLayoutPlan>sceneLayout).items;
      this.eventName = sceneLayout.name;
    }

    this.loadingProgressService.$resetSimpleProgressEvent();

    this.clearItems();
    const promise = this.distinctLoadAsync(state);
    main.initCameraAndControls(sceneLayout.cameraState);

    return promise;
  }

  public distinctLoadAsync(items: Asset[], fixture?: boolean) {
    return new Promise((distinctLoadResolve, distinctLoadReject) => {
      try {
        this.loadingProgressService.$setSimpleProgressTotal(items.length);
        const distinctAssets: Asset[] = [
          ...new Set(
            items.map((asset: Asset): string => {
              return `${asset.sku}`;
            })
          ),
        ].map((sku: string): Asset => {
          return items.find((asset: Asset): boolean => {
            return `${asset.sku}` === sku;
          });
        });

        const distinctAssetPromises: any[] = [];
        distinctAssets.forEach((distinctAsset) => {
          const distinctAssetPromise = new Promise(
            (distinctAssetResolve, distinctAssetReject) => {
              Utils.preloadAsset(distinctAsset)
                .then((values) => {
                  const eventId = Utils.guid();

                  // TODO push to gltf store
                  this.loadingProgressService.$removeProgressEvent(eventId);
                  const commonAssets = items.filter((asset: Asset): boolean => {
                    return `${asset.sku}` === `${distinctAsset.sku}`;
                  });

                  const addAssetPromises: any[] = [];
                  commonAssets.forEach((asset: Asset): void => {
                    if (distinctAsset.gltf) {
                      asset.gltf = distinctAsset.gltf.clone();
                    }
                    if (distinctAsset.modifiers) {
                      if (
                        distinctAsset.modifiers.chairMod?.chairAsset &&
                        asset.modifiers.chairMod?.chairAsset &&
                        Utils.assetsEqual(
                          distinctAsset.modifiers.chairMod.chairAsset,
                          asset.modifiers.chairMod.chairAsset
                        )
                      ) {
                        asset.modifiers.chairMod.chairAsset =
                          distinctAsset.modifiers.chairMod.chairAsset;
                      }
                      if (
                        distinctAsset.modifiers.linenMod?.linenAsset &&
                        asset.modifiers.linenMod?.linenAsset &&
                        Utils.assetsEqual(
                          distinctAsset.modifiers.linenMod.linenAsset,
                          asset.modifiers.linenMod.linenAsset
                        )
                      ) {
                        asset.modifiers.linenMod.linenAsset =
                          distinctAsset.modifiers.linenMod.linenAsset;
                      }
                      if (
                        distinctAsset.modifiers.placeSettingMod
                          ?.placeSettingAsset &&
                        asset.modifiers.placeSettingMod?.placeSettingAsset &&
                        Utils.assetsEqual(
                          distinctAsset.modifiers.placeSettingMod
                            .placeSettingAsset,
                          asset.modifiers.placeSettingMod.placeSettingAsset
                        )
                      ) {
                        asset.modifiers.placeSettingMod.placeSettingAsset =
                          distinctAsset.modifiers.placeSettingMod.placeSettingAsset;
                      }
                      if (
                        distinctAsset.modifiers.centerpieceMod
                          ?.centerpieceAsset &&
                        asset.modifiers.centerpieceMod?.centerpieceAsset &&
                        Utils.assetsEqual(
                          distinctAsset.modifiers.centerpieceMod
                            .centerpieceAsset,
                          asset.modifiers.centerpieceMod.centerpieceAsset
                        )
                      ) {
                        asset.modifiers.centerpieceMod.centerpieceAsset =
                          distinctAsset.modifiers.centerpieceMod.centerpieceAsset;
                      }
                    }

                    if (fixture) {
                      asset.fromScene = false;
                      addAssetPromises.push(
                        this.addAssetAsync(asset, true, true)
                      );
                    } else {
                      asset.fromScene = true;
                      addAssetPromises.push(
                        this.addAssetAsync(asset, false, true)
                      );
                    }
                  });

                  Promise.allSettled(addAssetPromises)
                    .then((vallues) => {
                      distinctAssetResolve(vallues);
                    })
                    .catch((error) => {
                      distinctAssetReject(error);
                    });
                })
                .catch((e) => {
                  console.log(
                    'error preloading',
                    distinctAsset.name,
                    'from',
                    e
                  );
                });
            }
          );
          distinctAssetPromises.push(distinctAssetPromise);
        });

        Promise.allSettled(distinctAssetPromises)
          .then((values) => {
            distinctLoadResolve(values);
            this.updateSceneStats();
          })
          .catch((error) => {
            distinctLoadReject(error);
          });
      } catch (error) {
        console.warn(error);
        distinctLoadResolve(error);
      }
    });
  }

  public getAssets = (main: any, getFixtureItems): Asset[] => {
    return this.items.map((item: Item) => {
      return item.serialize();
    });
  };

  public getCameraState = (main: any): PlacezCameraState => {
    main.cameras.pCamera.updateMatrixWorld();
    main.cameras.oCamera.updateMatrixWorld();
    main.cameras.pCamera.updateMatrix();
    main.cameras.oCamera.updateMatrix();
    return {
      perspectiveState: {
        transformation: main.cameras.pCamera.matrixWorld.toArray(),
        target: main.perspectiveControls.perspectiveState.target0.toArray(),
      },
      orthographicState: {
        target: main.orthographicControls.orthographicState.target0.toArray(),
        zoom: main.orthographicControls.orthographicState.zoom0,
        rotation: main.orthographicControls.orthographicState.rotation0,
      },
    };
  };

  private getEventItems() {
    const container = new Object3D();
    this.items.forEach((item: any) => {
      const cloneItem = new Object3D();
      cloneItem.applyMatrix4(item.matrix);

      item.traverse((child: Object3D) => {
        if (child instanceof Mesh) {
          const childCopy = child.clone();
          cloneItem.add(childCopy);
        }
      }, true);

      container.children.push(cloneItem);
    });

    const scaleMat = new Matrix4().makeScale(1 / 100, 1 / 100, 1 / 100);
    container.applyMatrix4(scaleMat);

    const boundingBox = new Box3().setFromObject(container);
    const center = new Vector3();
    boundingBox.getCenter(center);
    center.setY(0);

    container.children.forEach((obj) => {
      obj.position.sub(center);
    });

    return container;
  }

  public exportEvent(
    filetype: ExportFileType,
    callback: (blob: Blob) => void
  ): any {
    switch (filetype) {
      case 'gltf':
        return this.exportGLTF(callback);
      case 'glb':
        return this.exportGLB(callback);
      default:
        console.error('This is not a supported export filetype');
        return {};
    }
  }
  /** saves an application state */
  private exportGLTF(callback: (blob: Blob) => void) {
    this.exporter.parse(
      this.getEventItems(),
      (gltf: GLTF) => {
        const fileType = 'application/json';
        const blob = new Blob([JSON.stringify(gltf)], { type: fileType });
        callback(blob);
      },
      () => {}
    );
  }

  private exportGLB(callback: (blob: Blob) => void): any {
    this.exporter.parse(
      this.getEventItems(),
      (glb: ArrayBuffer) => {
        const blob = new Blob([glb], { type: 'application/octet-stream' });
        callback(blob);
      },
      () => {},
      { binary: true }
    );
  }

  /** Gets the count of items.
   * @returns The count.
   */
  public itemCount(): number {
    return this.items.length;
  }

  /** Removes all items. */
  public clearItems() {
    const scope = this; //tslint:disable-line
    const tempItems = scope.items.slice(0);
    scope.removeItems(tempItems);
    scope.items = [];
  }

  public clearFixtureItems() {
    const scope = this; //tslint:disable-line
    const tempFixtureItems = scope.fixtureItems.slice(0);
    tempFixtureItems.forEach((item: any) => {
      scope.removeFixtureItem(item);
    });
    scope.fixtureItems = [];
  }

  /** Removes all items. */
  public clearBatchItems(groupId) {
    const scope = this; //tslint:disable-line
    for (let tI = scope.items.length - 1; tI >= 0; tI--) {
      if (scope.items[tI].asset.groupId === groupId) {
        const itemToRemove = scope.items[tI];
        itemToRemove.hideError();

        itemToRemove.traverse((child) => {
          const childElement = child as CSS3DObject;
          if (childElement.element && childElement.element.parentNode) {
            childElement.element.parentNode.removeChild(childElement.element);
          }
          this.scene.remove(child);
          if (child instanceof Mesh && child.geometry) child.geometry.dispose();
        });

        this.scene.remove(itemToRemove);

        const removedItems = scope.items.splice(tI, 1);
        removedItems.forEach((item: Item) => {
          item.callbacks = [];
          const firstChild = item.children && (item.children[0] as Mesh);
          if (firstChild && firstChild.geometry) firstChild.geometry.dispose();
        });
      }
    }
    for (let tI = scope.scene.children.length - 1; tI >= 0; tI--) {
      const obj = scope.scene.children[tI] as any;
      if (obj.asset) {
        if (obj.asset.groupId === groupId) {
          obj.hideError();

          obj.traverse((child) => {
            const childElement = child as CSS3DObject;
            if (childElement.element && childElement.element.parentNode) {
              childElement.element.parentNode.removeChild(childElement.element);
            }
            this.scene.remove(child);
            if (child instanceof Mesh && child.geometry)
              child.geometry.dispose();
          });

          this.scene.remove(obj);
        }
      }
    }
    this.updateSceneStats();
  }

  public getBoundingBoxForItems(items: Object3D[]): Box3 {
    const bbox = new Box3();
    items.forEach((item: Object3D) => {
      bbox.expandByObject(item);
    });
    return bbox;
  }

  public setBatchGuid(itemsToInclude?: Item[]): string {
    const guid = Utils.guid();
    this.items.forEach((item: any) => {
      if (item.asset.groupId === 'temp') {
        item.asset.groupId = guid;
      }
      if (
        itemsToInclude.length > 0 &&
        item.asset.instanceId === itemsToInclude?.[0].asset.instanceId
      ) {
        item.asset.groupId = guid;
      }
    });
    return guid;
  }

  public sceneStats() {
    const totalSeats = 0;
    const totalTables = 0;
    // console.warn('Scene.sceneStats() has not been implemented yet');
    // this.items.forEach((item) => {
    //   if (item.asset.eventItemType == 'table')
    //     if (item.asset.seats) {
    //       totalSeats += item.asset.seats;
    //     }
    //   totalTables++;
    // });
    return { seats: totalSeats, tables: totalTables };
  }

  /**
   * Removes an item.
   * @param item The item to be removed.
   * @param dontRemove If not set, also remove the item from the items list.
   */
  public removeItems(removeTheseItems: Item[], cb?) {
    const uuids = removeTheseItems.map((item: Item): string => item.uuid);
    const itemsToRemove = this.items.filter((e: Item) =>
      uuids.includes(e.uuid)
    );

    itemsToRemove.forEach((e) => {
      // Traverse all descendants, including CSS3DObjects
      e.traverse((child) => {
        // Check if the child is a CSS3DObject and remove its element from the DOM

        const childElement = child as CSS3DObject;
        if (childElement.element && childElement.element.parentNode) {
          childElement.element.parentNode.removeChild(childElement.element);
        }
        // Remove child from the scene
        this.scene.remove(childElement);
        // Dispose of any geometry to free up memory
        if (childElement instanceof Mesh && childElement.geometry)
          childElement.geometry.dispose();
      });
      // Remove the parent object from the scene and dispose if possible
      this.scene.remove(e);
      if (e.dispose) e.dispose(); // Ensure the item has a dispose method before calling it
    });

    // Deselect remaining items
    this.items.forEach((item) => item.setUnselected());

    // Update items list to exclude removed ones
    this.items = this.items.filter((e: Item) => !uuids.includes(e.uuid));

    // Callback and scene stats update
    if (cb) {
      cb();
      this.updateSceneStats();
    }
  }

  /**
   * Removes an item.
   * @param item The item to be removed.
   * @param dontRemove If not set, also remove the item from the items list.
   */
  public removeFixtureItem(item: Item, deleteBatch?: boolean, cb?) {
    this.getFixtureItems().forEach((e: Item) => {
      this.scene.remove(e);
      e.dispose();
      this.fixtureItems = this.fixtureItems.filter((fixtureItem: Item) => {
        return fixtureItem !== e;
      });
      e.setUnselected();
    });
    if (cb) {
      cb();
    }
  }

  /**
   *
   * @param entities Returns a flattened list of
   */
  private flattenHierarchy(entities: any[]) {
    return entities
      .map((entity: any) => {
        if (entity instanceof Mesh) {
          return entity;
        }
        if (entity instanceof Group) {
          return this.flattenHierarchy(entity.children);
        }
        return undefined;
      })
      .reduce((acc, val) => {
        return acc.concat(val);
      }, []);
  }

  private attachEntities(entities: any[], parent: Object3D) {
    entities.forEach((entity: any) => {
      if (entity instanceof Mesh) {
        parent.attach(entity);
      } else if (entity instanceof Group) {
        parent.remove(entity);
      }
    });
  }

  private removeChildren(entity: Object3D) {
    for (let i = entity.children.length - 1; i >= 0; i--) {
      const obj = entity.children[i];
      entity.remove(obj);
    }
  }

  public setNumberOfChairs(tableId: string, nbChairs: number) {
    const table = this.scene.getObjectByName(tableId);
    let numberOfChairs = nbChairs;

    if (nbChairs < 0) {
      numberOfChairs = 0;
    }
    if (nbChairs > table.children.length) {
      numberOfChairs = table.children.length;
    }

    table.children.forEach((child: Mesh) => {
      child.visible = false;
    });
    for (let i = 0; i < numberOfChairs; i++) {
      table.children[i].visible = true;
    }

    this.needsUpdate = true;
  }

  /**
   * Adds a single asset to the scene
   * @param asset - The asset
   */
  public addAssetAsync(
    asset: Asset,
    fixture?: boolean,
    ignoreValid?: boolean
  ): any {
    return new Promise((resolve, reject) => {
      // this.registerItemTrackerThing

      // TODO legacy remove
      asset.showLabel = asset.showLabel !== undefined ? asset.showLabel : true;
      //

      const item = Utils.createItemFromAsset(asset);
      if (fixture) {
        this.fixtureItems.push(item);
      } else {
        this.items.push(item);
      }

      item.onRegisterCallback(() => {
        this.add(item);
        if (fixture) {
          item.fixed = true;
          item.updateItem();
          if (asset.extensionProperties && asset.extensionProperties.mask) {
            item.traverse((child) => {
              child.layers.set(CameraLayers.Mask);
              if (child instanceof Mesh) {
                if (child.material[0]) {
                  child.material[0].depthWrite = true;
                  child.material[0].depthTest = true;
                }
              }
            });
            item.layers.set(CameraLayers.Mask);
          } else if (item instanceof WallItem) {
            item.traverse((child) => {
              if (
                child.userData &&
                child.userData.type === 'architectureModifier'
              )
                return;
              child.layers.set(CameraLayers.WallFixtures);
            });
            item.layers.set(CameraLayers.WallFixtures);
          } else {
            item.traverse((child) => {
              if (
                child.userData &&
                child.userData.type === 'architectureModifier'
              )
                return;
              child.layers.set(CameraLayers.Fixtures);
            });
            item.layers.set(CameraLayers.Fixtures);
          }
        } else {
          if (asset.extensionProperties && asset.extensionProperties.mask) {
            item.traverse((child) => {
              if (!this.protectedLayers.test(child.layers)) {
                child.layers.set(CameraLayers.Mask);
              }
            });
            item.layers.set(CameraLayers.Mask);
          } else {
            if (item instanceof WallItem) {
              item.traverse((child) => {
                if (
                  child.userData &&
                  child.userData.type === 'architectureModifier'
                )
                  return;
                if (!this.protectedLayers.test(child.layers)) {
                  child.layers.set(CameraLayers.WallItems);
                }
              });
              item.layers.set(CameraLayers.WallItems);
            } else {
              item.traverse((child) => {
                if (!this.protectedLayers.test(child.layers)) {
                  if (child.userData && child.userData.type === 'linen') return;
                  if (
                    child.userData &&
                    child.userData.type === 'architectureModifier'
                  )
                    return;
                  child.layers.set(CameraLayers.Items);
                }
              });
              item.layers.set(CameraLayers.Items);
            }
            // this needs to update collision Items
            const collisionItems = this.getItems()
              .filter(
                (otherItem) =>
                  !(
                    (otherItem.asset.extensionProperties &&
                      otherItem.asset.extensionProperties.fixed &&
                      (store.getState() as ReduxState).blue.ignoreFixed) ||
                    item.asset.groupId === otherItem.asset.groupId
                  )
              )
              .filter((otherItem) => {
                //TODO fix this filters similar assets whether collsion prevention is on or not
                if (item.asset.groupId === 'temp') {
                  return otherItem.asset.sku !== item.asset.sku;
                }
                return true;
              });
            this.collisionHandler.getCollisionItemsForSelected([item]);

            if (
              !item.isValidPosition(
                this.collisionHandler.collisionItems,
                item.position
              ) &&
              !ignoreValid
            ) {
              this.removeItems([item]);
            }
          }
        }
      });
      item.init(this.model, resolve, reject);
    });
  }

  public initBatchItem(asset: Asset, cb?: () => void) {
    if (this.tempBatchItem) {
      this.tempBatchItem.dispose();
    }
    const tempItemAsset = JSON.parse(JSON.stringify(asset));
    this.tempBatchItem = Utils.createItemFromAsset(tempItemAsset);
    this.tempBatchItem.onRegisterCallback(() => {
      cb?.();
    });
    this.tempBatchItem.init(this.model);

    this.collisionHandler.getCollisionItemsForSelected([this.tempBatchItem]);
  }

  public addBatchItem(
    mesh: Mesh,
    groupId: string,
    itemUIConfg: any
  ): Promise<void> {
    return new Promise((resolve, reject) => {
      //TODO should not be called with mesh undefined
      if (mesh === undefined) {
        reject(new Error('Mesh is undefined'));
        return;
      }

      const position = mesh.position.clone();
      const quaternion = mesh.quaternion.clone();
      const corners = Utils.positionBufferToVec3Corners(mesh.geometry);
      const width = corners[0].distanceTo(corners[1]);
      const depth = corners[0].distanceTo(corners[3]);

      const tempItem = this.tempBatchItem;

      const batchType = itemUIConfg.batchType;
      // Only check interference with items already in the scene

      const addAssetAsyncWrapper = async (asset, fixture, ignoreValid) => {
        try {
          await this.addAssetAsync(asset, fixture, ignoreValid);
          resolve();
        } catch (error) {
          reject(error);
        }
      };

      switch (batchType) {
        case BatchTypes.family:
          BatchPatterns.family(
            width,
            depth,
            position,
            quaternion,
            itemUIConfg,
            tempItem,
            groupId,
            this.model,
            addAssetAsyncWrapper
          );
          break;
        case BatchTypes.banquet:
          BatchPatterns.banquet(
            width,
            depth,
            position,
            quaternion,
            itemUIConfg,
            tempItem,
            groupId,
            this.model,
            addAssetAsyncWrapper
          );
          break;
        case BatchTypes.theater:
          BatchPatterns.theater(
            width,
            depth,
            position,
            quaternion,
            itemUIConfg,
            tempItem,
            groupId,
            this.model,
            addAssetAsyncWrapper
          );
          break;
        case BatchTypes.hollowSquare:
          BatchPatterns.hollowSquare(
            width,
            depth,
            position,
            quaternion,
            itemUIConfg,
            tempItem,
            groupId,
            this.model,
            addAssetAsyncWrapper
          );
          break;
        case BatchTypes.uShape:
          BatchPatterns.uShape(
            width,
            depth,
            position,
            quaternion,
            itemUIConfg,
            tempItem,
            groupId,
            this.model,
            addAssetAsyncWrapper
          );
          break;
        case BatchTypes.cabaret:
          BatchPatterns.cabaret(
            width,
            depth,
            position,
            quaternion,
            itemUIConfg,
            tempItem,
            groupId,
            this.model,
            addAssetAsyncWrapper
          );
          break;
        case BatchTypes.circle:
          BatchPatterns.circle(
            width,
            depth,
            position,
            quaternion,
            itemUIConfg,
            tempItem,
            groupId,
            this.model,
            addAssetAsyncWrapper
          );
          break;
        case BatchTypes.horseshoe:
          BatchPatterns.horseshoe(
            width,
            depth,
            position,
            quaternion,
            itemUIConfg,
            tempItem,
            groupId,
            this.model,
            addAssetAsyncWrapper
          );
          break;
        default:
          BatchPatterns.grid(
            width,
            depth,
            position,
            quaternion,
            itemUIConfg,
            tempItem,
            groupId,
            this.model,
            addAssetAsyncWrapper
          );
          break;
      }

      this.needsUpdate = true;
    });
  }

  public getWallHeight = () => {
    return this.model.floorplan.wallHeight;
  };

  private debounceUpdateSceneStats = () => {
    const tablesAndChairs = countTablesAndChairs(this.items);
    store.dispatch(
      SetStats({
        chairs: tablesAndChairs.chairs,
        tables: tablesAndChairs.tables,
        price: this.rollUpPrice(this.items),
      })
    );
  };

  public updateSceneStats = debounce(this.debounceUpdateSceneStats, 50);

  public setTheme = (theme: Theme) => {
    this.theme = theme;
    this.selectColor.copy(new Color(this.theme.palette.primary.main));
  };

  public updateItemModifiers = (asset: Asset) => {
    const item = this.getItemByInstanceId(asset.instanceId);
    // Update Item Asset Here
    item.asset = asset;

    item.build();
    this.updateSceneStats();
  };
}
export const createItemFromAsset = (asset: Asset): Item => {
  let groupId;
  if (asset.groupId) {
    groupId = asset.groupId;
  } else {
    groupId = Utils.guid();
  }

  const item = new (Factory.getClass(asset.classType))({ ...asset, groupId });
  return item;
};

export const itemLoader = (
  onLoad: (gltf: GLTF) => void,
  onProgress: (event: ProgressEvent) => void,
  onError: (event: ErrorEvent) => void,
  asset: Asset,
  cb?: () => void
) => {
  if (cb) {
    cb();
  }
  const host = import.meta.env.VITE_APP_PLACEZ_API_URL;
  const orgId = (store.getState() as ReduxState).oidc.user.profile
    .organization_id;
  const mediaAssetUrl = `${host}/Organization/${orgId}/MediaAssetFile/${asset.sku}`;

  Utils.loader.load(mediaAssetUrl, onLoad, onProgress, onError);
};

export type ExportFileType = 'gltf' | 'glb';
