import { Modifier } from './Modifier';
import { Asset } from '../items/asset';
import { Item } from '../items/item';
import { Object3D } from 'three';
import { CameraLayers } from '../../models/BlueState';
import { ModifierBase } from './ModifierBase';

export interface ArchitectureParams extends ModifierBase{
  architectureAsset?: Asset;
}

export class ArchitectureMod extends Modifier {
  public models: Object3D;
  public architectureAsset: Asset; // : String -> linenAsset.id
  public asset: Asset;
  public params: ArchitectureParams;

  constructor(item: Item) {
    super(item);
    this.models = new Object3D();
    this.params = item.asset.modifiers.architectureMod;
  }

  public build() {
    return new Promise((resolve, reject) => {
      this.params = this.item.asset.modifiers.architectureMod;
      this.item.remove(this.modifiers);
      this.architectureAsset = this.params.architectureAsset
        ? this.params.architectureAsset
        : undefined;
      this.asset = this.architectureAsset;
      if (this.asset) {
        this.loadGLTF(
          this.params.architectureAsset,
          this.buildModifier(resolve).bind(this),
          resolve
        );
      } else {
        resolve(undefined);
      }
    });
  }

  private buildModifier = (resolve) => (architectureMesh) => {
    const modifier = architectureMesh.clone();
    modifier.userData.type = 'architectureModifier';
    this.models.remove(...this.models.children); // THIS is how children should be removed

    modifier.layers.set(CameraLayers.ArchitectureElement);
    modifier.scale.multiplyVectors(modifier.scale, this.item.childScale);

    this.models.add(modifier);
    this.models.position.setY(-this.item.position.y);
    this.modifiers.add(this.models);

    this.item.add(this.modifiers);

    this.scene?.update();

    resolve(); // Done building
  };

  public updatePosition = (height: number) => {
    this.modifiers.children.forEach((mesh) => {
      mesh.position.setY(-height);
    });
  };
}
