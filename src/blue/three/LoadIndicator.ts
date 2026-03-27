import {
  BoxGeometry,
  Mesh,
  MeshBasicMaterial,
  MeshStandardMaterial,
  Scene,
  Vector3,
} from 'three';

export class LoadIndicator {
  private scene: Scene;
  private gaugeBox: Mesh;
  private loaderBox: Mesh;

  private loaderMaterial: MeshStandardMaterial = new MeshStandardMaterial({
    color: 0x5c236f,
    opacity: 0.2,
    transparent: true,
  });
  private gaugeMaterial: MeshBasicMaterial = new MeshBasicMaterial({
    color: 0x5c236f,
  });

  private fullLength: number = 250;

  constructor(scene: Scene) {
    this.scene = scene;

    this.loaderBox = new Mesh(
      new BoxGeometry(this.fullLength, 48, 48),
      this.loaderMaterial
    );
    this.gaugeBox = new Mesh(new BoxGeometry(1, 50, 50), this.gaugeMaterial);

    this.scene.add(this.loaderBox);
    this.scene.add(this.gaugeBox);
  }

  public setPosition(pos: Vector3) {
    this.loaderBox.position.copy(pos);
    this.gaugeBox.position.copy(pos);
  }

  public update(percent: number) {
    this.scene.remove(this.gaugeBox);
    this.gaugeBox = new Mesh(
      new BoxGeometry(percent * this.fullLength, 50, 50),
      this.gaugeMaterial
    );
    this.scene.add(this.gaugeBox);
  }

  public dispose() {
    this.scene.remove(this.gaugeBox);
    this.scene.remove(this.loaderBox);
  }
}
