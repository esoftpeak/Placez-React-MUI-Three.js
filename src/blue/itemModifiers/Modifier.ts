import { Item } from '../items/item';
import { Scene } from '../model/scene';
import { Utils } from '../core/utils';
import { LoadingProgressEvent } from '../model/loading_progress';
import { Object3D, Matrix4 } from 'three';
import { Asset } from '../items';
import { store } from '../..';
import { ReduxState } from '../../reducers';
import { GLTF } from 'three/examples/jsm/loaders/GLTFLoader';

export class Modifier {
  public item: Item;
  protected scene: Scene;
  public asset: Asset | undefined;

  public mesh: THREE.Mesh;
  public modifiers: Object3D;
  public previousAsset: Asset;
  public updateLabels;

  constructor(item) {
    this.item = item;
    this.mesh = undefined;
    this.scene = item.scene;
    this.modifiers = new Object3D();
    this.previousAsset = undefined;
  }

  public build(promise?): Promise<unknown> {
    return new Promise(() => {});
  }

  protected loadGLTF = (asset: Asset, onLoad, onError?) => {
    if (
      this.mesh !== undefined &&
      this.previousAsset &&
      this.previousAsset.id === this.asset.id &&
      this.previousAsset.materialMask === this.asset.materialMask
    ) {
      onLoad(this.mesh, this.onComplete);
    } else if (this.asset.gltf) {
      this.mesh = this.asset.gltf.clone();
      Utils.applyCustomMaterials(this.mesh, this.asset.materialMask).then(
        () => {
          this.scene?.update();
        }
      );
      onLoad(this.mesh, this.onComplete);
    } else {
      const eventId = Utils.guid();

      //TODO remove
      const host = import.meta.env.VITE_APP_PLACEZ_API_URL;
      const orgId = (store.getState() as ReduxState).oidc.user.profile.organization_id;
      const assetSku = asset?.extensionProperties?.progenitorId ?? asset.sku;
      const fileName = `${host}/Organization/${orgId}/MediaAssetFile/${assetSku}`;

      Utils.loader.load(
        fileName,
        (gltf: GLTF) => {
          const cleanMesh = Utils.cleanExport(gltf.scene, asset.sku);
          Utils.applyCustomMaterials(cleanMesh, asset.materialMask).then(() => {
            this.scene?.update();
          });
          if (this.scene) {
            this.scene.loadingProgressService.$removeProgressEvent(eventId);
          }
          const mToCm = new Matrix4().makeScale(100, 100, 100);
          cleanMesh.applyMatrix4(mToCm);
          this.item.setMaterialModifiers(cleanMesh, asset);
          this.mesh = cleanMesh.clone();
          this.previousAsset = this.asset;
          onLoad(cleanMesh, this.onComplete);
        },
        (xhr: ProgressEvent) => {
          const progressEvent: LoadingProgressEvent = {};
          progressEvent[eventId] = xhr;
          if (this.scene) {
            this.scene.loadingProgressService.$addProgressEvent(progressEvent);
          }
        },
        (e: ErrorEvent) => {
          console.log('failed to load:', asset.name);
          if (this.scene) {
            this.scene.loadingProgressService.$removeProgressEvent(eventId);
          }
          if (onError) {
            onError();
          }
        }
      );
    }
  };

  public onComplete = () => {
    this.item.updateItem();
  };

  public update() {}
}
