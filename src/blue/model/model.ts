import { Floorplan } from './floorplan';
import { Scene } from './scene';
import { Asset } from '../items/asset';
import PlacezFixturePlan from '../../api/placez/models/PlacezFixturePlan';
import { MeshPhysicalMaterial } from 'three';
import {
  FallbackWallMaterial,
  FallbackFloorMaterial,
} from '../../api/placez/models/PlacezMaterial';

/**
 * A Model connects a Floorplan and a Scene.
 */
export class Model {
  /** */
  public floorplan: Floorplan;

  /** */
  public scene: Scene;
  public placezFixturePlan: PlacezFixturePlan;

  /** Constructs a new model.
   * @param textureDir The directory containing the textures.
   */
  constructor() {
    this.floorplan = new Floorplan();
    this.scene = new Scene(this);
  }

  // New Function
  public loadFloorplan(
    floorPlan: PlacezFixturePlan,
    defaultWallMaterial = new MeshPhysicalMaterial({}),
    defaultFloorMaterial = new MeshPhysicalMaterial({})
  ) {
    this.scene.clearItems();
    this.floorplan.defaultWallMaterial = defaultWallMaterial;
    this.floorplan.defaultFloorMaterial = defaultFloorMaterial;
    this.floorplan.loadFloorplan(floorPlan);
    this.placezFixturePlan = floorPlan;
  }

  public exportFloorPlan(): PlacezFixturePlan {
    return this.floorplan.saveFixturePlan();
  }

  public exportFloorPlanImage(): string {
    if (this.floorplan.layoutImage[0]) {
      return this.floorplan.layoutImage[0].src;
    }
    return '';
  }

  public importFixturesAsync(fixtures: Asset[]) {
    const scope = this; // tslint:disable-line
    scope.scene.clearFixtureItems();
    const promise = scope.scene.distinctLoadAsync(fixtures, true);
    return promise;
  }
}
