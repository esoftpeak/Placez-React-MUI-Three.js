import { Utils } from '../core/utils';
import { Model } from '../model/model';
import { Scene } from '../model/scene';
import { Asset, AssetModifierKeys, SkuType } from './asset';
import { ApplicationStateService } from '../model/state';
import { ArrowDirection } from '../three/controller';
import { mergeGeometries } from 'three/examples/jsm/utils/BufferGeometryUtils';
import { LoadingProgressEvent } from '../model/loading_progress';

import { ChairMod, SeatInstance } from '../itemModifiers/ChairMod';
import { CenterpieceMod } from '../itemModifiers/CenterpieceMod';
import { LinenMod } from '../itemModifiers/LinenMod';
import { PlaceSettingMod } from '../itemModifiers/PlaceSettingMod';
import { Modifier } from '../itemModifiers/Modifier';
import { CameraLayers } from '../../models/BlueState';
import {
  PlacezMaterial,
  PlacezEnvMap,
} from '../../api/placez/models/PlacezMaterial';
import { Subject } from 'rxjs';
import { UserSetting } from '../../api';
import { ArchitectureMod } from '../itemModifiers/ArchitectureMod';
import { OBB } from 'three/examples/jsm/math/OBB.js';
import {
  LocalStorageKey,
  localStorageObservable$,
} from '../../components/Hooks/useLocalStorageState';
import { distinctUntilChanged, map } from 'rxjs/operators';
import { uplightMod } from '../itemModifiers/UplightMod';
import {
  AdditiveBlending,
  Box3,
  Box3Helper,
  BoxGeometry,
  BufferGeometry,
  Color,
  Intersection,
  LineBasicMaterial,
  Material,
  Matrix4,
  Mesh,
  MeshBasicMaterial,
  MeshPhysicalMaterial,
  Object3D,
  Quaternion,
  Vector2,
  Vector3,
} from 'three';
import { getFromLocalStorage } from '../../sharing/utils/localStorageHelper';
import { CSS3DLabelMaker } from '../three/CSS3DlabelMaker';
import BlueLabel from '../model/blueLabel';
import PlacedAsset from '../../api/placez/models/PlacedAsset';

export enum FloorItems {
  FloorItem = 'FloorItem',
  OnFloorItem = 'OnFloorItem',
  TableItem = 'TableItem',
}

export enum WallItems {
  WallItem = 'WallItem',
  InWallItem = 'InWallItem',
  WallFloorItem = 'WallFloorItem',
  InWallFloorItem = 'InWallFloorItem',
}

export function isFloorItem(classType) {
  return (
    classType === FloorItems.FloorItem ||
    classType === FloorItems.OnFloorItem ||
    classType === FloorItems.TableItem
  );
}

export function isWallItem(classType) {
  return (
    classType === WallItems.WallItem ||
    classType === WallItems.InWallItem ||
    classType === WallItems.WallFloorItem ||
    classType === WallItems.InWallFloorItem
  );
}

/**
 * An Item is an abstract entity for all things placed in the scene,
 * e.g. at walls or on the floor.
 */
interface AssetCount {
  assetSku: string;
  qty: number;
}

const errorColor = new Color(0xaa0000);
const errorMaterial = new MeshBasicMaterial({
  color: errorColor,
  opacity: 0.5,
  transparent: true,
  depthTest: false,
  blending: AdditiveBlending,
});

const selectMaterial = new MeshBasicMaterial({
  opacity: 0.5,
  transparent: true,
  depthTest: false,
  // blending: AdditiveBlending,
});

export abstract class Item extends Object3D {
  /** */
  protected scene: Scene;
  protected model: Model;

  /** */
  private errorGlow: Mesh = undefined;
  // public selectGlow: Mesh = undefined;
  public selectGlow: any = undefined;

  /** */
  private hover: boolean = false;

  /** */
  private selected: boolean = false;

  /** */
  private highlighted: boolean = false;

  /** */
  private error: boolean = false;

  /** */
  private emissiveColor: number = 0x444444;

  /** */
  public selectColor: Color;
  public errorGlowNeedsUpdate: boolean = false;

  /** Show rotate option in context menu */
  public allowRotate: boolean = true;

  /** */
  public fixed: boolean = false;

  /** */
  public state: ApplicationStateService;

  /** dragging */
  public dragOffset: Vector3 = new Vector3();

  /** */
  protected halfSize: Vector3;

  protected bounds: Box3 = new Box3(); // used to construct selection box

  public callbacks: any[] = [];

  public boundingBox: Box3;
  public keepInRoom: boolean;
  public preventCollision: UserSetting;
  public detectCollision: UserSetting;

  public mods: { [modType: string]: Modifier };
  private label: CSS3DLabelMaker;
  private labelParams: BlueLabel;
  private numberLabel: CSS3DLabelMaker;
  private numberLabelParams: BlueLabel;
  private tableNumberLabel: CSS3DLabelMaker;
  private tableNumberLabelParams: BlueLabel;

  public childScale: THREE.Vector3 = new Vector3(1, 1, 1); // does not includ cm to m conversion 100

  public materialsBak: Material[];

  private unsubscribeStore = () => {};

  private itemLabelScale = 1;
  private tableNumberLabelScale;
  private chairNumberLabelSize;
  private itemInfoLabelScale;

  public events = {
    rotation: new Subject(),
  };

  public configureMode: boolean = false;

  private ItemLabelSizeSubscription;
  private ItemInfoLabelSizeSubscription;
  private TableNumberLabelSizeSubscription;
  private ChairNumberLabelSizeSubscription;
  private localStorageSubscriptions;

  /** Constructs an item.
   * @param model TODO
   * @param asset TODO
   * @param items TODO
   * @param position TODO
   * @param rotation TODO
   * @param scale TODO
   */
  constructor(public asset: PlacedAsset) {
    super();

    if (this.asset.transformation) {
      this.setFromTransformation(this.asset.transformation);
    }

    this.name = this.uuid;
    if (!this.asset.instanceId) {
      this.asset.instanceId = Utils.guid();
    }

    this.ItemLabelSizeSubscription = localStorageObservable$
      .pipe(
        map(
          (localStorageState) => localStorageState[LocalStorageKey.ItemLabel]
        ),
        distinctUntilChanged()
      )
      .subscribe((e: any) => {
        this.itemLabelScale = Utils.scaleFactor(e);
        this.label
          ?.getObject?.()
          .scale.set(this.itemLabelScale, this.itemLabelScale, 1);
        this.scene?.update();
      });

    this.ItemInfoLabelSizeSubscription = localStorageObservable$
      .pipe(
        map(
          (localStorageState) => localStorageState[LocalStorageKey.NumberLabel]
        ),
        distinctUntilChanged()
      )
      .subscribe((e: any) => {
        this.itemInfoLabelScale = Utils.scaleFactor(e);
        this.numberLabel
          ?.getObject?.()
          .scale.set(this.itemInfoLabelScale, this.itemInfoLabelScale, 1);
        this.scene?.update();
      });

    // this only need to be on tables
    this.TableNumberLabelSizeSubscription = localStorageObservable$
      .pipe(
        map(
          (localStorageState) => localStorageState[LocalStorageKey.TableNumber]
        ),
        distinctUntilChanged()
      )
      .subscribe((e: any) => {
        this.tableNumberLabelScale = Utils.scaleFactor(e);
        this.tableNumberLabel
          ?.getObject?.()
          ?.scale.set(
            this.tableNumberLabelScale,
            this.tableNumberLabelScale,
            1
          );
        this.scene?.update();
      });

    // this only needs to be on tables with chairs
    this.ChairNumberLabelSizeSubscription = localStorageObservable$
      .pipe(
        map(
          (localStorageState) => localStorageState[LocalStorageKey.ChairNumber]
        ),
        distinctUntilChanged()
      )
      .subscribe((e: any) => {
        this.chairNumberLabelSize = e;
        if (this.mods && this.mods.chairMod) {
          this.mods.chairMod.updateLabels();
        }
        this.scene?.update();
      });

    this.localStorageSubscriptions = [
      this.ItemLabelSizeSubscription,
      this.ItemInfoLabelSizeSubscription,
      this.ChairNumberLabelSizeSubscription,
      this.TableNumberLabelSizeSubscription,
    ];
  }

  public dispose() {
    this.children.forEach((child) => {
      Utils.disposeMesh(child as Mesh);
      this.removed();
    });
    this.clearGlows();
    this?.unsubscribeStore();
    this.localStorageSubscriptions.forEach((sub) => sub.unsubscribe());
  }

  public removed() {}

  public executeCallbacks = () => {
    this.callbacks.forEach((cb) => {
      cb();
    });
  };

  public onRegisterCallback(cb) {
    this.callbacks.push(cb);
  }

  public onDeregisterCallback(cb) {
    this.callbacks = this.callbacks.filter((el) => {
      return el !== cb;
    });
  }

  public init(model?: Model, resolve?: Function, reject?: Function): void {
    if (model) {
      this.scene = model.scene;
      this.model = model;
      this.selectColor = this.scene.selectColor;
      selectMaterial.color.copy(this.scene.selectColor);
    }

    if (resolve) {
      this.onRegisterCallback(resolve);
    }
    const eventId = Utils.guid();

    this.children.forEach((child) => {
      this.remove(child);
    });

    this.boundingBox = new Box3();

    this.updateCollisionSettings(model);

    const onLoad = (gltf: any): void => {
      // this is from paste

      const cleanMesh = Utils.cleanExport(gltf.scene, this.asset.sku);

      cleanMesh.scale.copy(this.childScale).multiplyScalar(100);

      this.materialsBak = (cleanMesh.material as MeshPhysicalMaterial[]).map(
        (material: MeshPhysicalMaterial) => {
          if (material) {
            return material.clone();
          }
          return undefined;
        }
      );

      this.setMaterialModifiers(cleanMesh, this.asset);

      this.add(cleanMesh);

      this.boundingBox.copy(this.updateBoundingBox(this.boundingBox));
      this.bounds.copy(this.constructBounds());

      this.updateObjectHalfSize();
      this.update();

      if (model) {
        model.scene.update();
      }
      this.build(this.executeCallbacks);
      if (this.asset.materialMask === null) {
        this.asset.materialMask = (cleanMesh.material as Material[]).map(() => {
          return null;
        });
      }
      Utils.applyCustomMaterials(
        this.children[0] as Mesh,
        this.asset.materialMask
      ).then(() => {
        if (model) {
          model.scene.update();
        }
      });

      this.createLabels();

      if (model) {
        if (this.asset.fromScene) {
          // this.scene.loadingProgressService.$addSimpleProgressLoaded();
        } else {
          // this.scene.loadingProgressService.$removeProgressEvent(eventId);
        }
      }
    };

    const onSceneLoad = (asset: Asset): void => {
      // from scene load

      const cleanMesh: Mesh = asset.gltf;
      this.setMaterialModifiers(cleanMesh, this.asset);

      cleanMesh.scale.copy(this.childScale).multiplyScalar(100);
      this.add(cleanMesh);
      if (asset.children) {
        asset.children.forEach((child) => this.add(child));
      }

      this.materialsBak = (cleanMesh.material as Material[]).map(
        (material: MeshPhysicalMaterial) => {
          if (material) {
            return material.clone();
          }
          return undefined;
        }
      );

      this.boundingBox.copy(this.updateBoundingBox(this.boundingBox));
      this.bounds.copy(this.constructBounds());
      this.updateObjectHalfSize();

      this.scene?.update();
      this.build(this.executeCallbacks);
      if (this.asset.materialMask === null) {
        this.asset.materialMask = (this.asset.gltf.material as Material[]).map(
          () => {
            return null;
          }
        );
      }
      Utils.applyCustomMaterials(
        this.children[0] as Mesh,
        this.asset.materialMask
      ).then(() => {
        this.scene?.update();
      });

      this.createLabels();

      if (this.scene) {
        if (this.asset.fromScene) {
          // this.scene.loadingProgressService.$addSimpleProgressLoaded();
        } else {
          // this.scene.loadingProgressService.$removeProgressEvent(eventId);
        }
      }
    };

    const onProgress = (xhr: ProgressEvent): void => {
      const progressEvent: LoadingProgressEvent = {};
      progressEvent[eventId] = xhr;
      if (!this.asset.fromScene) {
        this.scene.loadingProgressService.$addProgressEvent(progressEvent);
      }
    };

    const onError = (e: ErrorEvent): void => {
      console.warn(e);
      reject(e);
      if (this.asset.fromScene) {
        // this.scene.loadingProgressService.$addSimpleProgressLoaded();
      } else {
        // this.scene.loadingProgressService.$removeProgressEvent(eventId);
      }
    };

    if (this.asset.gltf !== undefined) {
      onSceneLoad(this.asset);
    } else {
      Utils.itemLoader(onLoad, onProgress, onError, this.asset);
    }
  }

  public updateBoundingBox(boundingBox: Box3): Box3 {
    // FYI boundingBox is not centered on object and does not include spacing
    const mesh = this.children.find((child) => child instanceof Mesh) as Mesh;
    if (mesh) {
      const buffGeom = mesh.geometry.clone();
      const mToCm = new Matrix4().makeScale(100, 100, 100);
      const scaleMat = new Matrix4().makeScale(
        this.childScale.x,
        this.childScale.y,
        this.childScale.z
      );

      buffGeom.applyMatrix4(mToCm);
      buffGeom.computeBoundingBox();
      buffGeom.boundingBox.applyMatrix4(scaleMat);
      return buffGeom.boundingBox;
    }
    return boundingBox;
  }

  public constructBounds(): Box3 {
    // TODO rethink bounding box and bounds
    const invMat = new Matrix4();
    this.updateMatrixWorld();
    const matWorld = this.matrixWorld.clone();

    (invMat.copy(matWorld) as any).invert();
    this.applyMatrix4(invMat); // Have to rotate back to square so setFromObject Works it is always world aligned
    this.updateMatrixWorld(); // setfromObject needs updated matrix world

    const bounds = new Box3().setFromObject(this.children[0]);

    bounds.expandByVector(
      new Vector3(this.asset.spacing, 0, this.asset.spacing)
    );

    this.applyMatrix4(matWorld); // Now rotate object back
    this.updateMatrixWorld();
    this.updateSelectGlow();
    return bounds;
  }

  public updateLabel() {
    this.label?.updateParameters(this.labelParams);
    this.numberLabel?.updateParameters(this.numberLabelParams);
    this.tableNumberLabel?.updateParameters(this.tableNumberLabelParams);
  }

  // TODO redo run this after mods build and only when spacing changes
  public updateItem() {
    this.bounds.copy(this.constructBounds());
    this.updateSelectGlow();
    this.updateErrorGlow();
    this.updateLabel();
    this.scene?.update();

    if (this.mods) {
      Object.keys(this.mods).forEach((modType) => {
        this.mods[modType]?.update();
      });
    }
  }

  public update() {
    // this updates the item and the asset transformation based on changes
    this.updateMatrixWorld();
    this.updateMatrix();
    const matWorld = this.matrixWorld.clone();
    this.childScale =
      this.children && this.children[0]
        ? this.children[0].scale.clone().multiplyScalar(1 / 100)
        : this.childScale;
    matWorld.scale(this.childScale);

    this.asset.transformation = matWorld.toArray();
    if (this.mods) {
      Object.keys(this.mods).forEach((modType) => {
        this.mods[modType]?.update();
      });
    }
  }

  public resize(height: number, width: number, depth: number): void {
    let x: number = width / this.getWidth();
    let y: number = height / this.getHeight();
    let z: number = depth / this.getDepth();

    x = x !== 0 ? x : 1;
    y = y !== 0 ? y : 1;
    z = z !== 0 ? z : 1;

    this.setScale(x, y, z);
  }

  public addEnvMap(item: Mesh): void {
    this.setMaterials(item, (material) => {
      if (
        material.isMeshStandardMaterial ||
        material.isGLTFSpecularGlossinessMaterial
      ) {
        material.envMap = PlacezEnvMap;
        material.needsUpdate = true;
      }
    });
  }

  public setShadow(
    node: Mesh,
    castShadow: boolean,
    receiveShadow: boolean
  ): void {
    if (node instanceof Object3D) {
      node.castShadow = castShadow;
      node.receiveShadow = receiveShadow;
    }
  }

  /** */
  public setScale(x: number, y: number, z: number): void {
    const scaleVec = new Vector3(x, y, z);
    this.children[0].scale.multiply(scaleVec);

    this.updateObjectHalfSize();
    this.scene?.update();
    this.update();
    this.boundingBox.copy(this.updateBoundingBox(this.boundingBox));
    this.resized();

    this.updateItem();
    this.build();
  }

  /** */
  public setFixed(fixed: boolean): void {
    this.fixed = fixed;
  }

  public setMaterials(node: Mesh, callback: any): void {
    if (!node.isMesh) return;
    const materials = Array.isArray(node.material)
      ? node.material
      : [node.material];

    materials.forEach((material: MeshPhysicalMaterial) => {
      if (material) {
        callback(material);
      }
    });
  }

  public setMaterialMask = (material: PlacezMaterial, index, cb?) => {
    this.asset.materialMask[index] = material;
    if (material) {
      Utils.applyCustomMaterial(
        (this.children[0] as Mesh).material[index],
        this.asset.materialMask[index]
      ).then(() => {
        this.scene?.update();
        if (cb) cb();
      });
    } else {
      (this.children[0] as Mesh).material[index] = this.materialsBak[index]
        ? this.materialsBak[index].clone()
        : undefined;
      this.scene?.update();
      if (cb) cb();
    }
  };

  /** Subclass can define to take action after a resize. */
  protected abstract resized();

  /** */
  public getHeight = function (): number {
    const size = new Vector3();
    this.boundingBox.getSize(size);
    return size.y;
  };

  /** */
  public getWidth = function (): number {
    const size = new Vector3();
    this.boundingBox.getSize(size);
    return size.x;
  };

  /** */
  public getDepth = function (): number {
    const size = new Vector3();
    this.boundingBox.getSize(size);
    return size.z;
  };

  /** */
  public mouseOver(): void {
    this.hover = true;
  }

  /** */
  public mouseOff(): void {
    this.hover = false;
  }

  /** */
  public getSelected(): boolean {
    return this.selected;
  }

  /** */
  public setSelected(): void {
    this.selected = true;
    if (this.selectGlow) this.selectGlow.visible = this.selected;
  }

  /** */
  public setUnselected(): void {
    this.selected = false;
    if (this.selectGlow) this.selectGlow.visible = this.selected;
  }

  public clickPressed(intersection: Vector3): void {
    this.dragOffset.copy(intersection).sub(this.position);
  }

  public getNewPosition(
    currentPosition: Vector3,
    relVec: Vector3,
    snap?: boolean,
    intersection?: Intersection
  ): Vector3 {
    return new Vector3().addVectors(currentPosition, relVec);
  }

  public fireUpdateEvent(): void {
    this.events.rotation.next(this.rotation);
  }

  public rotateTo(rotateToQuat: Quaternion): void {
    this.rotation.setFromQuaternion(rotateToQuat);
    this.selectGlow.position.copy(this.position);
    this.selectGlow.rotation.copy(this.rotation);
    this.errorGlowNeedsUpdate = true;
    this.update();
  }

  /** */
  public moveToPosition(vec3: Vector3, normal?: Vector3) {
    this.visible = true;
    this.position.copy(vec3);
  }

  public setHeight(height: number) {
    this.position.setY(height);
  }

  public snapPosition(vec3: Vector3): Vector3 {
    const snappedVec = vec3.clone();
    const snapEvery = 1;
    const inToCm = 2.54;
    snappedVec.x =
      Math.round(vec3.x / (inToCm * snapEvery)) * inToCm * snapEvery;
    snappedVec.y =
      Math.round(vec3.y / (inToCm * snapEvery)) * inToCm * snapEvery;
    snappedVec.z =
      Math.round(vec3.z / (inToCm * snapEvery)) * inToCm * snapEvery;
    return snappedVec;
  }

  /** */
  public clickReleased(): void {
    if (this.error) {
      // only show error on move
      // this.hideError();
    }
  }

  public abstract arrowMove(
    collisionItems: Item[],
    dir: ArrowDirection,
    angle: number,
    speedIncrease: number
  );
  // returns the 2d corners of the bounding polygon
  public getCorners(
    newPosition?: Vector3,
    newRotation?: Quaternion
  ): Vector2[] {
    const box = this.getBounds();
    const position = new Vector3();
    const rotation = new Quaternion();
    const scale = new Vector3();
    const newTransformation = new Matrix4();
    this.matrixWorld.decompose(position, rotation, scale);

    newTransformation.compose(
      newPosition ? newPosition : position,
      newRotation ? newRotation : rotation,
      scale
    );

    const minCorner = box.min.clone();
    const maxCorner = box.max.clone();

    const c1 = new Vector3(minCorner.x, 0, minCorner.z);
    const c2 = new Vector3(maxCorner.x, 0, minCorner.z);
    const c3 = new Vector3(maxCorner.x, 0, maxCorner.z);
    const c4 = new Vector3(minCorner.x, 0, maxCorner.z);

    c1.applyMatrix4(newTransformation);
    c2.applyMatrix4(newTransformation);
    c3.applyMatrix4(newTransformation);
    c4.applyMatrix4(newTransformation);

    c1.setY(0);
    c2.setY(0);
    c3.setY(0);
    c4.setY(0);

    const corners = [
      new Vector2(c1.x, c1.z),
      new Vector2(c2.x, c2.z),
      new Vector2(c3.x, c3.z),
      new Vector2(c4.x, c4.z),
    ];

    return corners;
  }

  /** */
  public isValidPosition(
    collisionItems: Item[],
    vec3: Vector3,
    rotQuat?: Quaternion
  ): boolean {
    this.hideError();
    if (this.collides(collisionItems, vec3, rotQuat)) {
      if (this.detectCollision) {
        this.showError(vec3);
      } else {
        this.hideError();
      }
      if (this.preventCollision) {
        return false;
      }
    }
    this.selectGlow.position.copy(this.position);
    this.selectGlow.rotation.copy(this.rotation);
    return true;
  }

  public collides(
    collisionItems: Item[],
    newPosition: Vector3,
    newRotation?: Quaternion
  ): boolean {
    const current = this.position.clone();
    this.position.copy(newPosition);
    this.matrixWorldNeedsUpdate = true;
    this.updateMatrixWorld();
    const position = new Vector3();
    const rotation = new Quaternion();
    const scale = new Vector3();
    const newTransformation = new Matrix4();
    this.matrixWorld.decompose(position, rotation, scale);

    newTransformation.compose(
      newPosition ?? position,
      newRotation ?? rotation,
      scale
    );

    const OBB1 = new OBB();
    OBB1.fromBox3(this.bounds.clone());
    OBB1.applyMatrix4(newTransformation);

    for (const item in collisionItems) {
      const OBB2 = new OBB();
      OBB2.fromBox3(collisionItems[item].bounds.clone());
      OBB2.applyMatrix4(collisionItems[item].matrixWorld);
      const hit = OBB1.intersectsOBB(OBB2);

      if (hit) {
        // this errors other object hit
        // this.collisionItems[item].showError(this.collisionItems[item].position);
        this.position.copy(current);
        this.updateMatrixWorld();
        return true;
      }
    }
    this.position.copy(current);
    this.updateMatrixWorld();
    return false;
  }

  public updateErrorGlow(): void {
    if (this.errorGlow && this.scene) this.scene.remove(this.errorGlow);
    this.remove(this.errorGlow);
    this.errorGlow = this.createBoxGlow(errorMaterial);
    this.errorGlow.visible = this.error;
    if (this.scene) {
      this.scene.add(this.errorGlow);
      this.scene?.update();
    }
  }

  /** */
  public showError(vec3: Vector3): void {
    this.error = true;
    if (this.errorGlow === undefined) this.updateErrorGlow();
    this.errorGlow.visible = this.error;
    this.errorGlow.position.copy(vec3 || this.position);
    this.errorGlow.rotation.copy(this.rotation);
    this.scene?.update();
  }

  /** */
  public hideError(): void {
    this.error = false;
    if (this.errorGlow) this.errorGlow.visible = this.error;
    this.scene?.update();
  }
  /** */
  public clearGlows(): void {
    this.scene.remove(this.selectGlow);
    this.selectGlow?.dispose?.();
    this.selectGlow = undefined;

    if (this.errorGlow) this.scene.remove(this.errorGlow);
    this.errorGlow = undefined;
  }

  /** */
  private updateObjectHalfSize(): void {
    // this is probably not working for rotated items
    const objectBox = new Box3();
    objectBox
      .setFromObject(this)
      // gets pre rotation halfsize
      // Don't think this is working
      .applyMatrix4(new Matrix4().makeRotationY(-this.rotation.y));
    this.halfSize = objectBox.max
      .clone()
      .sub(objectBox.min)
      .divideScalar(2)
      .add(new Vector3(this.asset.spacing, 0, this.asset.spacing));
  }

  /** */
  public createMeshGlow(
    color: Color,
    opacity: number,
    ignoreDepth: boolean
  ): Mesh {
    const glowMaterial = new MeshBasicMaterial({
      color,
      blending: AdditiveBlending,
      opacity,
      transparent: true,
      depthTest: false,
    });
    const geoms = [];
    const traverse = false;
    let geom;
    if (traverse) {
      this.traverse((child) => {
        // TODO determine why this fails on plant3 centerpiece
        if (child instanceof Mesh) {
          child.updateMatrix();
          child.updateMatrixWorld();

          geoms.push(child.geometry.clone().applyMatrix4(child.matrix));
        }
      });
      geom = mergeGeometries(geoms);
    }
    if (!geom) {
      geom = (this.children[0] as Mesh).geometry.clone() as BufferGeometry;
      geom.applyMatrix4(this.children[0].matrix);
      console.warn('failed compression', this.asset);
    }
    const glow = new Mesh(geom, glowMaterial);
    glow.renderOrder = 999;
    glow.applyMatrix4(this.matrix);
    return glow;
  }

  public createBoxGlow(material): Mesh {
    const sizeVec = new Vector3().subVectors(
      this.getBounds().max,
      this.getBounds().min
    );
    const geom = new BoxGeometry(sizeVec.x, sizeVec.y, sizeVec.z);
    const center = new Vector3();
    this.boundingBox.getCenter(center);
    geom.translate(center.x, center.y, center.z);

    const glow = new Mesh(geom, material);
    glow.renderOrder = 999;
    glow.applyMatrix4(this.matrix);
    return glow;
  }

  public createBox(color): Box3Helper {
    const box = this.getBounds();

    const helper: Box3Helper = new Box3Helper(box, color);
    (helper.material as LineBasicMaterial).depthTest = false;
    helper.renderOrder = 999;

    return helper;
  }

  public build(cb?) {
    if (this.asset.modifiers) {
      this.buildModifiers()
        .then(() => {
          this.cleanup();
          const newPositions: SeatInstance[] = (
            this.mods?.chairMod as ChairMod
          )?.getSeatPositions();
          if (newPositions !== undefined) {
            this.asset.modifiers.chairMod = {
              ...this.asset.modifiers.chairMod,
              seatPositions: newPositions,
            };
          }
          if (cb) cb();
        })
        .catch((e) => {
          this.cleanup();
          if (cb) cb();
          console.warn('Build Modifiers Failed On', this.asset.sku, e);
        });
    } else {
      this.cleanup();
      if (cb) cb();
    }
  }

  public updateSelectGlow() {
    if (this.selectGlow && this.scene) this.scene.remove(this.selectGlow);
    this.selectGlow = this.createBoxGlow(selectMaterial);
    this.selectGlow.visible = this.selected;
    if (this.scene) {
      this.scene.add(this.selectGlow);
      this.scene?.update();
    }
  }

  public cleanup() {
    this.updateMatrixWorld();
    this.updateItem();
    if (this.scene) {
      this.scene?.update();
      if (
        SkuType[this.asset.skuType] === SkuType.TBL ||
        SkuType[this.asset.skuType] === SkuType.CHR
      ) {
        this.scene.updateSceneStats();
      }
    }
    this.updateErrorGlow();
  }

  public hasModChildren(): boolean {
    return (
      this.children.filter(
        (child) => child?.userData?.name !== 'LabelContainer'
      ).length > 1
    );
  }

  public buildModifiers() {
    if (this.mods === undefined && this.hasModChildren()) {
      this.mods = {};
      return Promise.all([]);
    }

    if (!this.mods) {
      this.mods = {};
    }
    if (
      Object.keys(this.mods).length === 0 &&
      this.hasModChildren() &&
      this.children.length > 1
    ) {
      this.children
        .slice(1)
        .filter((child) => child?.userData?.name !== 'LabelContainer')
        .forEach((child, index) => {
          this.remove(child);
        });
    }
    const buildPromises: Promise<unknown>[] = [];
    let chairBuildPromise;
    if (this.asset.modifiers) {
      Object.keys(this.asset.modifiers).forEach((key) => {
        switch (key) {
          case AssetModifierKeys.chairMod:
            if (this.asset.modifiers.chairMod === null) break;
            const chairs = this.mods.chairMod
              ? this.mods.chairMod
              : new ChairMod(this);
            chairBuildPromise = chairs.build(this.asset.modifiers.chairMod);
            buildPromises.push(chairBuildPromise);
            this.mods.chairMod = chairs;
            break;
          case AssetModifierKeys.centerpieceMod:
            if (this.asset.modifiers.centerpieceMod === null) break;
            const centerpiece = this.mods.centerpieceMod
              ? this.mods.centerpieceMod
              : new CenterpieceMod(this);
            const centerPieceBuildPromise = centerpiece.build();
            buildPromises.push(centerPieceBuildPromise);
            this.mods.centerpieceMod = centerpiece;
            break;
          case AssetModifierKeys.linenMod:
            if (this.asset.modifiers.linenMod === null) break;
            const linen = this.mods.linenMod
              ? this.mods.linenMod
              : new LinenMod(this);
            const linenBuildPromise = linen.build();
            buildPromises.push(linenBuildPromise);
            this.mods.linenMod = linen;
            break;
          case AssetModifierKeys.placeSettingMod:
            if (this.asset.modifiers.placeSettingMod === null) break;
            const placeSettings = this.mods.placeSettingMod
              ? this.mods.placeSettingMod
              : new PlaceSettingMod(this);
            const placeSettingBuildPromise =
              placeSettings.build(chairBuildPromise);
            buildPromises.push(placeSettingBuildPromise);
            this.mods.placeSettingMod = placeSettings;
            break;
          case AssetModifierKeys.architectureMod:
            if (this.asset.modifiers.architectureMod === null) break;
            const architectureElement = this.mods.architectureMod
              ? this.mods.architectureMod
              : new ArchitectureMod(this);
            const architectureBuildPromise = architectureElement.build();
            buildPromises.push(architectureBuildPromise);
            this.mods.architectureMod = architectureElement;
            break;
          case AssetModifierKeys.uplightMod:
            if (this.asset.modifiers.uplightMod === null) break;
            const uplight = this?.mods?.uplightMod ?? new uplightMod(this);
            const uplightBuildPromise = uplight.build();
            buildPromises.push(uplightBuildPromise);
            this.mods.uplightMod = uplight;
            break;
          default:
            break;
        }
      }, this);
    }
    return Promise.all(buildPromises);
  }

  public serialize(): Asset {
    this.update();
    this.asset.gltf = undefined;
    this.asset.children = undefined;
    if (
      this.asset.modifiers &&
      this.asset.modifiers.chairMod &&
      this.asset.modifiers.chairMod.chairAsset &&
      this.asset.modifiers.chairMod.chairAsset.gltf
    ) {
      this.asset.modifiers.chairMod.chairAsset.gltf = undefined;
    }
    if (
      this.asset.modifiers &&
      this.asset.modifiers.linenMod &&
      this.asset.modifiers.linenMod.linenAsset &&
      this.asset.modifiers.linenMod.linenAsset.gltf
    ) {
      this.asset.modifiers.linenMod.linenAsset.gltf = undefined;
    }
    if (
      this.asset.modifiers &&
      this.asset.modifiers.centerpieceMod &&
      this.asset.modifiers.centerpieceMod.centerpieceAsset &&
      this.asset.modifiers.centerpieceMod.centerpieceAsset.gltf
    ) {
      this.asset.modifiers.centerpieceMod.centerpieceAsset.gltf = undefined;
    }
    if (
      this.asset.modifiers &&
      this.asset.modifiers.placeSettingMod &&
      this.asset.modifiers.placeSettingMod.placeSettingAsset &&
      this.asset.modifiers.placeSettingMod.placeSettingAsset.gltf
    ) {
      this.asset.modifiers.placeSettingMod.placeSettingAsset.gltf = undefined;
    }
    // this is where materials would be saved
    return this.asset;
  }

  public getBounds() {
    return this.bounds.clone();
  }

  public setMaterialModifiers(mesh: Mesh, asset: Asset) {
    this.setShadow(mesh, this.castShadow, this.receiveShadow);
    if (asset.extensionProperties) {
      if (asset.extensionProperties.enviromentMap) {
        this.addEnvMap(mesh);
      }
    }
  }

  private createLabels() {
    const labelContainer = new Object3D();
    labelContainer.userData = {
      name: 'LabelContainer',
    };

    // Remove all existing labels first
    this.removeLabel();

    if (this.asset.name && !this.fixed) {
      if (this.asset.name) {
        const defaultItemTitleLabelSize = 32;
        this.labelParams = {
          labelText: `${this.asset.name}`,
          margin: 4,
          borderRadius: 5,
          borderThickness: 2,
          fontSize:
            this.asset.extensionProperties?.fontSize ??
            defaultItemTitleLabelSize,
          labelPosition: 'top',
          backgroundColor: '0xffffff',
        };

        this.label = new CSS3DLabelMaker(
          this.labelParams,
          CameraLayers.TitleLabel
        );
        const labelObj = this.label.getObject();
        labelContainer.add(labelObj);
      }
    }

    if (
      this.asset.labels.titleLabel &&
      !this.fixed &&
      !this.asset.extensionProperties?.enviromentMap
    ) {
      if (this.asset.labels.titleLabel) {
        const defaultItemTitleLabelSize = 32;
        this.labelParams = {
          labelText: `${this.asset.labels.titleLabel}`,
          margin: 4,
          borderRadius: 5,
          borderThickness: 2,
          fontSize:
            this.asset.extensionProperties?.fontSize ??
            defaultItemTitleLabelSize,
          labelPosition: 'top',
          backgroundColor: '0xffffff',
        };

        this.label = new CSS3DLabelMaker(
          this.labelParams,
          CameraLayers.NumberLabel
        );
        const labelObj = this.label.getObject();
        labelContainer.add(labelObj);
      }
    }

    if (this.asset.labels?.numberLabel && !this.asset.labels.titleLabel) {
      const defaultItemInfoLabelSize = 32;
      this.numberLabelParams = {
        labelText: `${this.asset.labels ? this.asset.labels.numberLabel : ''}`,
        margin: 4,
        borderRadius: 5,
        borderThickness: 2,
        fontSize:
          this.asset.extensionProperties?.fontSize ?? defaultItemInfoLabelSize,
        labelPosition: 'top',
      };
      this.numberLabel = new CSS3DLabelMaker(
        this.numberLabelParams,
        CameraLayers.NumberLabel
      );
      labelContainer.add(this.numberLabel.getObject());
    }

    if (this.asset.labels?.tableNumberLabel) {
      const defaultTableNumberLabelSize = 32;
      this.tableNumberLabelParams = {
        labelText: `${this.asset.labels ? this.asset.labels.tableNumberLabel : ''}`,
        margin: 2,
        borderRadius: 5,
        borderThickness: 2,
        fontSize:
          this.asset.extensionProperties?.fontSize ??
          defaultTableNumberLabelSize,
        labelPosition: 'bottom',
      };
      this.tableNumberLabel = new CSS3DLabelMaker(
        this.tableNumberLabelParams,
        CameraLayers.TableNumberLabel
      );
      labelContainer.add(this.tableNumberLabel.getObject());
    }
    this.add(labelContainer);
  }

  private removeLabel() {
    // Remove existing label container
    const existingLabels = this.children.filter(
      (child) => child?.userData?.name === 'LabelContainer'
    );

    existingLabels.forEach((label) => {
      // Remove all children first
      while (label.children.length > 0) {
        const child = label.children[0];
        child.removeFromParent();
      }
      // Then remove the container itself
      label.removeFromParent();
      this.remove(label);
    });

    // Clear references
    this.label = null;
    this.numberLabel = null;
    this.tableNumberLabel = null;
  }

  public buildLabel() {
    this.removeLabel();
    if (this.asset.showLabel && !this.fixed) {
      this.createLabels();
    }
    this.scene?.update();
  }

  public getAssets() {
    const assetSkus: AssetCount[] = [];
    assetSkus.push({ assetSku: this.asset.sku, qty: 1 });
    if (this.asset.modifiers) {
      if (
        this.asset.modifiers.chairMod &&
        this.asset.modifiers.chairMod.chairAsset
      ) {
        assetSkus.push({
          assetSku: this.asset.modifiers.chairMod.chairAsset.sku,
          qty: this.asset.modifiers.chairMod.seats,
        });
      }
      if (
        this.asset.modifiers.placeSettingMod &&
        this.asset.modifiers.placeSettingMod.placeSettingAsset
      ) {
        assetSkus.push({
          assetSku: this.asset.modifiers.placeSettingMod.placeSettingAsset.sku,
          qty: this.asset.modifiers.chairMod.seats,
        });
      }
      if (
        this.asset.modifiers.centerpieceMod &&
        this.asset.modifiers.centerpieceMod.centerpieceAsset
      ) {
        assetSkus.push({
          assetSku: this.asset.modifiers.centerpieceMod.centerpieceAsset.sku,
          qty: this.asset.modifiers.centerpieceMod.numberOfCenterpieces,
        });
      }
      if (
        this.asset.modifiers.linenMod &&
        this.asset.modifiers.linenMod.linenAsset
      ) {
        assetSkus.push({
          assetSku: this.asset.modifiers.linenMod.linenAsset.sku,
          qty: 1,
        });
      }
    }
    return assetSkus;
  }

  public priceAsset(): number {
    let assetPrice = this.asset?.price ?? 0;
    if (this.asset.modifiers) {
      if (
        this.asset.modifiers.chairMod &&
        this.asset.modifiers.chairMod.chairAsset
      ) {
        assetPrice +=
          (this.asset.modifiers.chairMod.chairAsset.price ?? 0) *
          this.asset.modifiers.chairMod.seats;
      }
      if (
        this.asset.modifiers.placeSettingMod &&
        this.asset.modifiers.placeSettingMod.placeSettingAsset
      ) {
        assetPrice +=
          (this.asset.modifiers.placeSettingMod.placeSettingAsset.price ?? 0) *
          this.asset.modifiers.chairMod.seats;
      }
      if (
        this.asset.modifiers.centerpieceMod &&
        this.asset.modifiers.centerpieceMod.centerpieceAsset
      ) {
        assetPrice +=
          (this.asset.modifiers.centerpieceMod.centerpieceAsset.price ?? 0) *
          (this.asset.modifiers.centerpieceMod.numberOfCenterpieces ?? 1);
      }
      if (
        this.asset.modifiers.linenMod &&
        this.asset.modifiers.linenMod.linenAsset
      ) {
        assetPrice += this.asset.modifiers.linenMod.linenAsset.price ?? 0;
      }
    }
    return assetPrice;
  }

  public setFromTransformation(trans) {
    const pos = new Vector3();
    const quat = new Quaternion();
    const scale = new Vector3();
    // this.childScale = scale;

    const transMat = new Matrix4().fromArray(trans);
    transMat.decompose(pos, quat, scale);

    this.position.copy(pos);
    if (isNaN(quat.x) || isNaN(quat.y) || isNaN(quat.z) || isNaN(quat.w)) {
      quat.set(0, 0, 0, 1);
    }
    this.setRotationFromQuaternion(quat);
    this.rotation.reorder('YXZ');
    this.rotation.x = 0;
    this.rotation.z = 0;

    scale.setX(scale.x === 0 ? 1 : scale.x);
    scale.setY(scale.y === 0 ? 1 : scale.y);
    scale.setZ(scale.z === 0 ? 1 : scale.z);

    this.matrixWorldNeedsUpdate = true;

    // TODO: Rework item to use setFromTransformation everywhere
    // scale.multiplyScalar(100);
    // if (this.children && this.children[0]) {
    //   this.children[0].scale.copy(scale);
    // }
  }

  public updateCollisionSettings(model) {
    const numberOfRooms = model?.floorplan?.getRooms()?.length;
    if (numberOfRooms > 0) {
      this.keepInRoom = getFromLocalStorage(LocalStorageKey.KeepInRoom);
    } else {
      this.keepInRoom = false;
    }
    this.preventCollision = getFromLocalStorage(
      LocalStorageKey.CollisionPrevention
    );
    this.detectCollision = getFromLocalStorage(
      LocalStorageKey.CollisionDetection
    );
  }

  getMaterials = (): Material[] => {
    // maybe should return a setable material
    /*
    {
      material: Material use uuid
      cb:
    }
    */
    return (this.children[0] as Mesh).material as [];
  };

  getRotation = (): number => {
    return this.rotation.y;
  };
}
