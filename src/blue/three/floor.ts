import { CameraLayers } from '../../models/BlueState';
import { Corner } from '../model/corner';
import { PlacezMaterial, DefaultFloorMaterial, DefaultMaterialIds, PlacedMaterial } from '../../api/placez/models/PlacezMaterial';
import { Utils } from '../core/utils';
import { RenderOrder } from '../../api/placez/models/UserSetting';
import {
  BackSide,
  FrontSide,
  Material,
  Mesh,
  MeshBasicMaterial,
  MeshPhysicalMaterial,
  Path,
  Shape,
  ShapeGeometry,
  Vector2,
} from 'three';

export class Floor {
  public room;
  public floorPlane;
  public roofPlane;
  public mat;
  public scene;

  constructor(scene, room) {
    this.room = room;
    this.scene = scene;

    this.room.fireOnFloorChange(this.updateFloor);
    this.updateFloor();
  }

  public updateFloor = () => {
    const textureSettings: PlacedMaterial = this.room.getTexture();

    if (this.floorPlane) {
      Utils.applyCustomMaterial(
        this.floorPlane.material,
        textureSettings ? textureSettings : DefaultFloorMaterial
      ).then(() => {
        this.scene.needsUpdate = true;
      });
    } else {
      if (textureSettings.appliedMaterialId === DefaultMaterialIds.defaultFloorMaterial && this.scene.model.floorplan.defaultWallMaterial !== undefined) {
        const mat = this.scene.model.floorplan.defaultFloorMaterial.clone();
        Utils.applyMaterialModifiers(mat, textureSettings.threeJSMaterial);
        mat.depthTest = false; // TODO still not working
        this.floorPlane = this.buildFloor(mat);
        this.addToScene();
        this.scene.needsUpdate = true;
      } else {
        Utils.loadMaterial(textureSettings, DefaultFloorMaterial).then(
          (mat: MeshPhysicalMaterial) => {
            Utils.applyMaterialModifiers(mat, textureSettings.threeJSMaterial);
            mat.depthTest = false; // TODO still not working
            this.floorPlane = this.buildFloor(mat);
            this.addToScene();
            this.scene.needsUpdate = true;
          }
        );
      }
    }
  };

  private buildFloor = (material: MeshPhysicalMaterial): Mesh => {
    const textureSettings: PlacezMaterial = this.room.getTexture();

    const floorMaterialTop = material;

    const textureScale = textureSettings.scale ? textureSettings.scale : 1;

    // scale down coords to fit 0 -> 1, then rescale

    const points = [];
    this.room.interiorCorners.forEach((corner: any) => {
      points.push(
        new Vector2(corner.x / textureScale, corner.y / textureScale)
      );
    });
    // points = moarPoints(points);

    const holePaths = [];
    this.room.holes.forEach((hole: Corner[]) => {
      const holePoints = [];
      hole.forEach((corner: Corner) => {
        holePoints.push(
          new Vector2(
            corner._position.x / textureScale,
            corner._position.z / textureScale
          )
        );
      });
      holePoints.push(holePoints[0].clone());

      holePaths.push(new Path(holePoints));
    });

    const shape = new Shape(points);

    holePaths.forEach((hole: Path) => {
      shape.holes.push(hole);
    });

    const geometry = new ShapeGeometry(shape);

    (<Material>floorMaterialTop).depthTest = false;
    (<Material>floorMaterialTop).side = BackSide;

    const floor = new Mesh(geometry, floorMaterialTop);

    floor.layers.set(CameraLayers.Floorplanes);
    floor.renderOrder = RenderOrder.Floorplane;

    floor.rotation.set(Math.PI / 2, 0, 0);
    floor.scale.set(textureScale, textureScale, textureScale);
    floor.receiveShadow = true;
    floor.castShadow = false;

    floor.userData = { room: this.room };

    return floor;
  };

  public moarPoints(points: Vector2[]): Vector2[] {
    const resolution = 6;
    const newPoints = [];

    for (let index = 0; index < points.length; index++) {
      const startPoint = points[index];
      newPoints.push(startPoint);
      let endPoint;
      if (index === points.length - 1) {
        endPoint = points[0];
      } else {
        endPoint = points[index + 1];
      }
      const dirVec = new Vector2()
        .subVectors(endPoint, startPoint)
        .divideScalar(resolution);

      for (let index = 1; index < resolution; index++) {
        const newVec = new Vector2().copy(dirVec).multiplyScalar(index);
        const newPoint = new Vector2().copy(startPoint).add(newVec);
        newPoints.push(newPoint);
      }
      if (index === points.length - 1) {
        newPoints.push(endPoint);
      }
    }

    return newPoints;
  }

  public buildRoof = () => {
    // setup texture
    const roofMaterial = new MeshBasicMaterial({
      side: FrontSide,
      color: 0xe5e5e5,
    });

    const points = [];
    this.room.interiorCorners.forEach((corner: any) => {
      points.push(new Vector2(corner.x, corner.y));
    });
    const shape = new Shape(points);
    const geometry = new ShapeGeometry(shape);
    const roof = new Mesh(geometry, roofMaterial);

    roof.rotation.set(Math.PI / 2, 0, 0);
    roof.position.y = 250;
    return roof;
  };

  public addToScene = () => {
    this.scene.add(this.floorPlane);
    // scene.add(roofPlane);
    // hack so we can do intersect testing
    // this.scene.add(this.room.floorPlane);
    this.scene.needsUpdate = true;
  };

  public removeFromScene = () => {
    this.scene.remove(this.floorPlane);
    // scene.remove(roofPlane);
    // this.scene.remove(this.room.floorPlane);

    // this.room.floorPlane.geometry.dispose();
    // this.room.floorPlane.material.dispose();

    if (this.floorPlane) {
      if (this.floorPlane.material && this.floorPlane.material.map) {
        this.floorPlane.material.map.dispose();
      }
      this.floorPlane.geometry.dispose();
      this.floorPlane.material.dispose();
    }
  };
}
