import { Model } from './model/model';
import { Main } from './three/main';
import { Theme } from '@mui/material';
import { ThreeFloorplanner } from './three/ThreeFloorplanner';

/** Startup options. */
export interface Options {
  /** */
  threeElement: string;

  /** */
  floorplannerElement: HTMLCanvasElement;
}

/** Blueprint3D core application. */
export class Blueprint3d {
  private model: Model;

  private three: any; // Three.Main;

  private floorplanner: any;

  /** Creates an instance.
   * @param options The initialization options.
   */
  constructor(options: Options) {
    this.model = new Model();
    this.three = new Main(this.model, options.threeElement);
    this.floorplanner = new ThreeFloorplanner(
      this.model,
      options.floorplannerElement
    );
  }
  public getModel(): Model {
    return this.model;
  }

  public setTheme(theme: Theme) {
    this.three.setTheme(theme);
    this.floorplanner.setTheme(theme);
  }

  public getMain(): any {
    return this.three;
  }

  public dispose(): any {
    this.three.dispose();
    this.floorplanner.dispose();
  }

  public getFloorPlan(): any {
    return this.floorplanner;
  }

  public setGridVisible(visible: boolean) {
    this.floorplanner.setGridVisible(visible);
  }
}
