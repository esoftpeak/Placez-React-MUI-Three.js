import { Modifier } from './Modifier';
import { Asset } from '../items/asset';
import { Item } from '../items/item';
import { Matrix4, Object3D } from 'three';
import { SeatInstance } from './ChairMod';
import { CameraLayers } from '../../models/BlueState';
import { ModifierBase } from './ModifierBase';

export interface PlaceSettingParams extends ModifierBase{
  placeSettingAsset?: Asset;
  placeSettingAssetId?: number;
  distance?: number;
}

export const defaultPlaceSettingParams = {
  distance: 3,
};

export class PlaceSettingMod extends Modifier {
  public models: Object3D;
  public placeSettingAsset: Asset;
  public params: PlaceSettingParams;
  public distance: number;

  constructor(item: Item) {
    super(item);
    this.models = new Object3D();
  }

  public build = (chairBuildPromise?: any) => {
    return new Promise((resolve, reject) => {
      this.params = this.item.asset.modifiers.placeSettingMod;
      this.item.remove(this.modifiers);
      this.placeSettingAsset = this.params.placeSettingAsset
        ? this.params.placeSettingAsset
        : undefined;
      this.asset = this.placeSettingAsset;
      this.distance = this.params.distance ? this.params.distance : 0;
      chairBuildPromise.then((positions: SeatInstance) => {
        if (this.placeSettingAsset) {
          this.loadGLTF(
            this.placeSettingAsset,
            this.buildPlaceSetting(resolve, positions).bind(this),
            resolve
          );
        } else {
          resolve(undefined);
        }
      });
    });
  };

  private buildPlaceSetting =
    (resolve: Function, seatPositions: SeatInstance) =>
    (placeSetting: THREE.Mesh) => {
      this.models.remove(...this.models.children); // THIS is how children should be removed

      const chairMod = this.item.mods.chairMod;

      if (chairMod) {
        const depthMat = new Matrix4().setPosition(
          this.distance,
          this.item.getHeight() + 1,
          0
        );

        for (const seat in seatPositions) {
          if (seatPositions[seat].hidden) continue;
          const mat4 = new Matrix4().fromArray(seatPositions[seat].position);
          const singleSetting = placeSetting.clone();
          singleSetting.userData.type = 'placeSetting';
          singleSetting.applyMatrix4(depthMat);
          singleSetting.applyMatrix4(mat4);
          singleSetting.updateMatrix();
          singleSetting.layers.set(CameraLayers.Items);
          this.models.add(singleSetting);
        }
        this.modifiers.add(this.models);
        this.scene?.update();
        this.item.add(this.modifiers);
        resolve(this.modifiers);
      } else {
        console.warn('Could not find chairmod');
      }
    };
}
