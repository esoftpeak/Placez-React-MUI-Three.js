import { Modifier } from './Modifier';
import { Item } from '../items/item';
import { Matrix4, SpotLight,  TextureLoader, Vector3 } from 'three';
import { ModifierBase } from './ModifierBase';

export interface UplightParams extends ModifierBase{
  color?: string;
  angle?: number;
  map?: string;
  intensity?: number;
  tilt?: number;
}

const zAxis = new Vector3(0, 0, 1);

const textureLoader = new TextureLoader();

export class uplightMod extends Modifier {
  public light: SpotLight;

  public color: string;
  public angle: number;
  public map: string;
  public intensity: number;

  public params: UplightParams;
  public transformation: Matrix4 = new Matrix4();

  constructor(item: Item) {
    super(item);
    this.light = new SpotLight(0x78ff00, 1000, 1000, Math.PI * 0.2, 0.25, 1);
    this.light.position.y = 20;

    this.params = item.asset.modifiers.uplightMod ?? {
      color: '#ffffff',
      angle: 0.3,
      map: undefined,
      intensity: 1000,
    };
  }

  public build() {
    return new Promise((resolve, reject) => {
      this.params = this.item.asset.modifiers.uplightMod;
      this.item.remove(this.modifiers);
      this.item.add(this.modifiers);

      // if (this.map) {
      //   textureLoader.load(this.map, (texture) => {
      //     // this.light.map = texture;
      //     resolve(undefined);
      //   },
      //   undefined,
      //     resolve
      //   );
      // } else {
      //   resolve(undefined);
      //}

      resolve(undefined);
      this.modifiers.add(this.light);
      this.modifiers.add(this.light.target);
      this.update();
    });
  }

  public update() {
    this.light.target.position
      .set(0, 100, 0)
      .applyAxisAngle(
        zAxis,
        ((this.item.asset?.modifiers?.uplightMod?.tilt ?? 0) * Math.PI) / 180
      )
      .applyQuaternion(this.item.quaternion);
    this.light.target.position.add(new Vector3(0, 10, 0));
    this.light.target.updateMatrixWorld();

    this.light.angle =
      ((this.item.asset?.modifiers?.uplightMod?.angle ?? 45) * Math.PI) / 180;
    this.light.color.setStyle(
      this.item.asset?.modifiers?.uplightMod?.color ?? '#5C236F'
    );
    this.light.intensity =
      this.item.asset?.modifiers?.uplightMod?.intensity ?? 1000;
  }
}
