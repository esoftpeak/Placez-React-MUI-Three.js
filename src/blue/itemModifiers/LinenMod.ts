import { Modifier } from './Modifier';
import { Asset } from '../items/asset';
import { Item } from '../items/item';
import { Matrix4, Object3D, Vector3 } from 'three';
import { CameraLayers } from '../../models/BlueState';
import { ModifierBase } from './ModifierBase';

export interface LinenParams extends ModifierBase{
  linenAsset?: Asset;
  linenDefaultSku?: string;//Backwards Compatibility
  linenAssetId?: number;
  transformation?: number[];
}

export class LinenMod extends Modifier {
  public models: Object3D;
  public linenAsset: Asset; // : String -> linenAsset.id
  public asset: Asset;
  public params: LinenParams;

  constructor(item: Item) {
    super(item);
    this.models = new Object3D();
    this.params = item.asset.modifiers.linenMod;
  }

  public build() {
    return new Promise((resolve, reject) => {
      this.params = this.item.asset.modifiers.linenMod;
      this.item.remove(this.modifiers);
      this.linenAsset = this.params.linenAsset
        ? this.params.linenAsset
        : undefined;
      this.asset = this.linenAsset;
      if (this.asset) {
        this.loadGLTF(
          this.params.linenAsset,
          this.buildLinen(resolve).bind(this),
          resolve
        );
      } else {
        resolve(undefined);
      }
    });
  }

  private buildLinen = (resolve) => (linenMesh) => {
    const linen = linenMesh.clone();
    linen.userData.type = 'linen';
    this.models.remove(...this.models.children); // THIS is how children should be removed

    const mat4 = new Matrix4().setPosition(0, this.item.getHeight() + 0.5, 0);
    linen.castShadow = true;
    linen.applyMatrix4(mat4);
    linen.updateMatrix();
    linen.layers.set(CameraLayers.Linen);
    linen.scale.multiply(this.item.childScale);

    const height = this.item.getHeight();
    linen.geometry.computeBoundingBox();
    const linenSize = new Vector3();
    linen.geometry.boundingBox.getSize(linenSize);
    const scaledLinenHeight =
      this.params?.transformation?.[5] * linenSize.y * 100;

    if (scaledLinenHeight && scaledLinenHeight < height) {
      const mat4 = new Matrix4().fromArray(this.params.transformation);
      this.models.matrix.copy(mat4);

      const scale = new Vector3().setFromMatrixScale(mat4);
      linen.scale.multiply(scale);
    }

    this.models.add(linen);
    this.modifiers.add(this.models);

    this.item.add(this.modifiers);

    this.scene?.update();

    resolve(); // Done building
  };
}
