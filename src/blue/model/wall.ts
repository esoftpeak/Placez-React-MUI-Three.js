import {
  Configuration,
  configWallThickness,
  configWallHeight,
} from '../core/configuration';
import { Item } from '../items/item';
import { Utils } from '../core/utils';
import { HalfEdge } from './half_edge';
import { Corner } from './corner';
import { MeshBasicMaterial, Object3D, Vector3 } from 'three';
import { Line2 } from 'three/examples/jsm/lines/Line2';
import { LineMaterial } from 'three/examples/jsm/lines/LineMaterial';
import { LineGeometry } from 'three/examples/jsm/lines/LineGeometry';
import { Theme } from '@mui/material';
import { FloorPlanModes } from '../../reducers/floorPlan';
import { Font, FontLoader } from 'three/examples/jsm/loaders/FontLoader';
import { store } from '../..';
import { ReduxState } from '../../reducers';
import { ViewState } from '../../models/GlobalState';
import { LocalStorageKey } from '../../components/Hooks/useLocalStorageState';
import { getFromLocalStorage } from '../../sharing/utils/localStorageHelper';
import { WallItem } from '../items/wall_item';
import { CallbackRegistry } from '../../helpers/Callback';
import { CSS3DLabelMaker } from '../three/CSS3DlabelMaker';

export const getUuid = (start, end): string => {
  return [start, end].join();
};

/**
 * A Wall is the basic element to create Rooms.
 *
 * Walls consists of two half edges.
 */

let defaultColor = '#00ffff';
let selectedColor = '#ffff00';
let intersectedColor = '#ff00ff';
const orphanColor = '#ff2700';
const deleteColor = '#aa0000';
// const outlineColor = '#777777'

// const _outlineMaterial: LineMaterial = new LineMaterial( {
//   // linewidth: 5,
//   worldUnits: true,
//   linewidth: 3,
//   color: 0x777777,
// }); //TODO this should clone common material

// const wallWidth = 3.5 * 2.54;
const wallWidth = 5;

const defaultMaterial: LineMaterial = new LineMaterial({
  linewidth: wallWidth, // in world units with size attenuation
});
defaultMaterial.depthTest = false; // Make sure the wireframe is visible through the mesh

// const deleteMaterial: LineMaterial = new LineMaterial({
//   linewidth: 0.005,
//   color: 0xaa0000,
// });

// const intersectedMaterial: LineMaterial = new LineMaterial({
//   linewidth: 0.005,
//   // linewidth: wallWidth,
//   // worldUnits: true,
// });

// const selectedMaterial: LineMaterial = new LineMaterial({
//   linewidth: 0.005,
//   // linewidth: wallWidth,
//   // worldUnits: true,
// });

// const orphanMaterial: LineMaterial = new LineMaterial({
//   linewidth: 0.005,
//   // linewidth: wallWidth,
//   // worldUnits: true,
//   color: 0xffa500,
// });

const textMaterial = new MeshBasicMaterial({
  color: 0xff0000,
  depthTest: false,
  depthWrite: false,
});

// export const setWallTheme = (theme: Theme) => {
//   defaultMaterial.color.setStyle(Utils.rgbaToRgb(theme.palette.text.secondary));
//   selectedMaterial.color.setStyle(Utils.rgbaToRgb(theme.palette.primary.main));
//   intersectedMaterial.color.setStyle(Utils.rgbaToRgb(theme.palette.secondary.main));
// }

export const setWallTheme = (theme: Theme) => {
  defaultColor = Utils.rgbaToRgb(theme.palette.text.secondary);
  selectedColor = Utils.rgbaToRgb(theme.palette.primary.main);
  
  intersectedColor = Utils.rgbaToRgb(theme.palette.secondary.main);
  textMaterial.color.setStyle(Utils.rgbaToRgb(theme.palette.primary.main));
};

let font: Font;

const loadFont = () => {
  const loader = new FontLoader();
  loader.load(`helvetiker_regular.typeface.json`, (loadedFont) => {
    font = loadedFont;
  });
};

loadFont();

export class Wall {
  private textMesh;
  private labelOffsetDistance = 60;

  private _lineMaterial: LineMaterial = defaultMaterial.clone();

  private _labelPosition: Vector3 = new Vector3();
  private _length: number = 0;

  private _geometry = new LineGeometry();
  private _line: Line2 = new Line2(this._geometry, this._lineMaterial);

  private intersected: boolean = false;

  public getLine = () => this._line;

  /** The unique id of each wall. */
  public id: number;

  public organizationId?: number;

  public hidden: boolean = false;

  /** Front is the plane from start to end. */
  public frontEdge: HalfEdge | null = null;

  /** Back is the plane from end to start. */
  public backEdge: HalfEdge | null = null;

  /** */
  private orphan = false;

  /** Items attached to this wall */
  public items: WallItem[] = [];

  /** */
  public onItems: Item[] = [];

  /** The front-side texture. */
  public frontMaterial = undefined;
  public frontMaterialId?: string;
  /** The back-side texture. */
  public backMaterial = undefined;
  public backMaterialId?: string;
  /** Wall thickness. */
  public thickness = Configuration.getNumericValue(configWallThickness);

  /** Wall height. */
  public height = Configuration.getNumericValue(configWallHeight);

  /** cut holes for wall items */
  public cutHoles = true;

  /** dimension cutoff */
  public dimensionCutoff = 0;
  public textScale = 1 / 0.3;
  public hideDimension = false;
  private dimensionLabel: CSS3DLabelMaker;

  /** Actions to be applied on removal. */
  private deletedCallbacks = new CallbackRegistry<Wall>();

  private outline: Object3D;
  private azimuth: number = 0;

  /**
   * Constructs a new wall.
   * @param start Start corner.
   * @param end End corner.
   */
  constructor(
    private start: Corner,
    private end: Corner
  ) {
    this.id = 0;
    this.start.attachStart(this);
    this.end.attachEnd(this);
    this._line.userData = {
      id: this.getIdentity(),
    };
    this.dimensionLabel = new CSS3DLabelMaker();
    this._line.add(this.dimensionLabel.getObject());
    this.update(start, end);
    const scope = this;

    start.fireOnAction(scope.updateDim);
    end.fireOnAction(scope.updateDim);
  }

  public getIdentity = () => {
    return getUuid(this.start.id, this.end.id);
  };

  public setColor = (color: number | string) => {
    //check if color is a string or number

    if (typeof color === 'string') {
      (this._line.material as LineMaterial).color.setStyle(color);
      (this._line.material as LineMaterial).needsUpdate = true;
    } else if (typeof color === 'number') {
      (this._line.material as LineMaterial).color.setHex(color);
      (this._line.material as LineMaterial).needsUpdate = true;
    }
  };

  public setAzimuth = (angle: number) => {
    this.azimuth = angle;
    this.updateDim();
  };

  public determineColor = (mode?: FloorPlanModes) => {
    if (this.intersected) {
      if (mode === FloorPlanModes.DELETE) {
        this.setColor(deleteColor);
      } else {
        this.setColor(intersectedColor);
      }
    } else if (this.getStart().selected && this.getEnd().selected) {
      this.setColor(selectedColor);
    } else if (this.orphan) {
      this.setColor(orphanColor);
    } else {
      this.setColor(defaultColor);
    }
  };

  // public determineColor = (mode?: FloorPlanModes) => {
  //   if (this.intersected) {
  //     if (mode === FloorPlanModes.DELETE) {
  //       this._line.material.copy(deleteMaterial)
  //     } else {

  //       this._line.material.copy(intersectedMaterial)
  //     }
  //   } else if (this.getStart().selected && this.getEnd().selected) {
  //     this._line.material.copy(selectedMaterial)
  //   } else if (this.orphan) {
  //     this._line.material.copy(orphanMaterial)
  //   } else {
  //     this._line.material.copy(defaultMaterial)
  //   }
  //   this._line.material.needsUpdate = true;
  // }

  public intersect = (mode: FloorPlanModes) => {
    if (this.intersected) return;
    this.intersected = true;
    this.determineColor(mode);
  };

  public deIntersect = () => {
    if (!this.intersected) return;
    this.intersected = false;
    this.determineColor();
  };

  public update(newStart?, newEnd?) {
    const start = newStart ?? this.getStart();
    const end = newEnd ?? this.getEnd();

    this._geometry.setPositions(
      new Float32Array([
        start._position.x,
        start._position.y,
        start._position.z,
        end._position.x,
        end._position.y,
        end._position.z,
      ])
    );
    this._line.userData = {
      id: this.getIdentity(),
    };
  }

  // private createOutline(backEdge: HalfEdge, frontEdge: HalfEdge): Object3D {
  //   const outline = new Object3D();
  //   if (frontEdge?.corners()?.length > 0) {
  //     const _frontEdgeGeom = new LineGeometry();
  //     const _frontEdgePositions = [];

  //     frontEdge.corners().forEach(element => {
  //       _frontEdgePositions.push(element.x, 0, element.y);
  //     });
  //     _frontEdgeGeom.setPositions(new Float32Array(_frontEdgePositions))
  //     const frontEdgeLine = new Line2(_frontEdgeGeom, _outlineMaterial);
  //     outline.add(frontEdgeLine);
  //   }

  //   if (backEdge?.corners()?.length > 0) {
  //     const _backEdgeGeom = new LineGeometry();
  //     const _backEdgePositions = [];

  //     backEdge.corners().forEach(element => {
  //       _backEdgePositions.push(element.x, 0, element.y);
  //     });
  //     _backEdgeGeom.setPositions(new Float32Array(_backEdgePositions))

  //     const backEdgeLine = new Line2(_backEdgeGeom, _outlineMaterial);
  //     outline.add(backEdgeLine);
  //   }
  //   return outline;
  // }

  public resetFrontBack() {
    this.frontEdge = null;
    this.backEdge = null;
    this.setOrphan(false);
    this.updateDim();
  }

  public snapToAxis(tolerance: number) {
    // order here is important, but unfortunately arbitrary
    this.start.snapToAxis(tolerance);
    this.end.snapToAxis(tolerance);
  }

  public fireOnDelete(func) {
    this.deletedCallbacks.add(func);
  }

  public dontFireOnDelete(func) {
    this.deletedCallbacks.remove(func);
  }

  public relativeMove(dx: number, dy: number, tolerance: number) {
    this.start.relativeMove(new Vector3(dx, 0, dy), tolerance);
    this.end.relativeMove(new Vector3(dx, 0, dy), tolerance);
  }

  public fireMoved() {
    this.update(this.start, this.end);
  }

  public fireRedraw() {
    // this._line.remove(this.outline);
    // if (this.backEdge || this.frontEdge) {
    //   this.outline = this.createOutline(this.backEdge, this.frontEdge);
    //   this._line.add(this.outline);
    // }
    this.height =
      (store.getState() as ReduxState).designer?.floorPlan?.wallHeight ??
      this.height;
    this.cutHoles =
      (store.getState() as ReduxState).globalstate.viewState !==
      ViewState.PhotosphereView;

    if (this.frontEdge || this.backEdge) {
      this.updateDim();
    }
    if (this.frontEdge) {
      this.frontEdge.redrawCallbacks.fire();
    }
    if (this.backEdge) {
      this.backEdge.redrawCallbacks.fire();
    }
  }

  private getLength = (
    frontEdgeLength: number,
    backEdgeLength: number
  ): number => {
    let length = 0;
    if (frontEdgeLength === 0 && backEdgeLength !== 0) {
      length = backEdgeLength;
    } else if (frontEdgeLength !== 0 && backEdgeLength === 0) {
      length = frontEdgeLength;
    } else if (frontEdgeLength !== 0 && backEdgeLength !== 0) {
      if (frontEdgeLength < backEdgeLength) {
        length = frontEdgeLength;
      } else {
        length = backEdgeLength;
      }
    }
    return length;
  };

  // Function to create or update TextMesh based on new length
  updateDimensionLabel = (newLength: number): void => {
    const storedWidth = getFromLocalStorage(
      LocalStorageKey.DimensionLabelWidth
    );
    let labelWidth: number | undefined;

    if (typeof storedWidth === 'number') {
      labelWidth = storedWidth;
    } else if (typeof storedWidth === 'string') {
      const parsed = parseFloat(storedWidth);
      if (!isNaN(parsed)) {
        labelWidth = parsed;
      }
    }

    const params: any = {
      labelText: Utils.unitsOutString(newLength),
      backgroundColor: '0xffffffbf',
      // borderColor: '0x000000',
      // borderThickness: 2,
      margin: 5,
      borderRadius: 5,
    };

    // Only pass labelWidth if we actually have a value
    if (labelWidth !== undefined) {
      params.labelWidth = labelWidth;
    }

    this.dimensionLabel.updateParameters(params);
  };

  updateDim = (force?: boolean) => {
    if (!this.start || !this.end || !this.dimensionLabel) {
      return;
    }

    const newDimensionCutoff = this.calculateDimensionCutoff();
    const hideFloorplanDimensions: boolean = getFromLocalStorage(
      LocalStorageKey.HideFloorplanDimensions
    );
    const newLength = this.calculateLength();
    const hideDimensionChanged = this.hideDimension !== hideFloorplanDimensions;
    const lengthChanged = this._length !== newLength;
    this._length = newLength;
    const dimensionCutoffChanged = this.dimensionCutoff !== newDimensionCutoff;

    if (
      lengthChanged ||
      dimensionCutoffChanged ||
      hideDimensionChanged ||
      force
    ) {
      this.dimensionCutoff = newDimensionCutoff;
      this.hideDimension = hideFloorplanDimensions;

      if (lengthChanged || force) {
        this.updateDimensionLabel(newLength);
        this.updateTextMeshGeometry();
      }

      // Toggle visibility of the CSS3D label object instead of old textMesh
      if (this.hideDimension) {
        if (this.dimensionLabel) {
          this.dimensionLabel.getObject().visible = false;
        }
        return;
      }

      if (this.dimensionLabel) {
        this.dimensionLabel.getObject().visible =
          newLength > this.dimensionCutoff;
      }
    }
  };

  calculateDimensionCutoff = (): number => {
    return getFromLocalStorage(LocalStorageKey.DimensionCutoff) ?? 0;
  };

  calculateLength = () => {
    const frontEdgeLength = this.frontEdge?.interiorDistance() ?? 0;
    const backEdgeLength = this.backEdge?.interiorDistance() ?? 0;
    const length = this.getLength(frontEdgeLength, backEdgeLength);
    return length;
  };

  updateTextMeshGeometry = () => {
    const frontEdgeLength = this.frontEdge?.interiorDistance() ?? 0;
    const backEdgeLength = this.backEdge?.interiorDistance() ?? 0;

    //Can Disable / Adjust lable offset distance here
    // const xMid = -0.5 * (rect.width);
    // const yMid = -0.5 * (rect.height);
    // this.labelOffsetDistance = Math.hypot(xMid, yMid);

    this.labelOffsetDistance = 0;

    if (frontEdgeLength === 0 && backEdgeLength !== 0) {
      this._labelPosition
        .set(
          this.backEdge.interiorCenter().x,
          0,
          this.backEdge.interiorCenter().y
        )
        .add(
          this.backEdge.labelOffset(
            this.backEdge.interiorEnd(),
            this.backEdge.interiorStart(),
            this.azimuth,
            this.labelOffsetDistance
          )
        );
    } else if (frontEdgeLength !== 0 && backEdgeLength === 0) {
      this._labelPosition
        .set(
          this.frontEdge.interiorCenter().x,
          0,
          this.frontEdge.interiorCenter().y
        )
        .add(
          this.frontEdge.labelOffset(
            this.frontEdge.interiorEnd(),
            this.frontEdge.interiorStart(),
            this.azimuth,
            this.labelOffsetDistance
          )
        );
    } else if (frontEdgeLength !== 0 && backEdgeLength !== 0) {
      if (this.orphan) {
        this._labelPosition
          .set(
            this.frontEdge.interiorCenter().x,
            0,
            this.frontEdge.interiorCenter().y
          )
          .add(
            this.frontEdge.labelOffset(
              this.frontEdge.interiorEnd(),
              this.frontEdge.interiorStart(),
              this.azimuth,
              this.labelOffsetDistance
            )
          );
      } else if (frontEdgeLength < backEdgeLength) {
        this._labelPosition
          .set(
            this.frontEdge.interiorCenter().x,
            0,
            this.frontEdge.interiorCenter().y
          )
          .add(
            this.frontEdge.labelOffset(
              this.frontEdge.interiorEnd(),
              this.frontEdge.interiorStart(),
              this.azimuth,
              this.labelOffsetDistance
            )
          );
      } else {
        this._labelPosition
          .set(
            this.backEdge.interiorCenter().x,
            0,
            this.backEdge.interiorCenter().y
          )
          .add(
            this.backEdge.labelOffset(
              this.backEdge.interiorEnd(),
              this.backEdge.interiorStart(),
              this.azimuth,
              this.labelOffsetDistance
            )
          );
      }
    } else {
      return;
    }
    this.dimensionLabel.getObject().position.copy(this._labelPosition);
  };

  public getStart(): Corner {
    return this.start;
  }

  public getEnd(): Corner {
    return this.end;
  }

  public getStartX(): number {
    return this.start._position.x;
  }

  public getEndX(): number {
    return this.end._position.x;
  }

  public getStartY(): number {
    return this.start._position.y;
  }

  public getEndY(): number {
    return this.end._position.y;
  }

  public dispose() {
    if (this.dimensionLabel) {
      if (this._line) {
        this._line.remove(this.dimensionLabel.getObject());
      }

      const labelDiv = this.dimensionLabel.getLabelDiv();
      if (labelDiv && labelDiv.parentNode) {
        labelDiv.parentNode.removeChild(labelDiv);
      }

      this.dimensionLabel = null;
    }

    if (this._geometry) {
      this._geometry.dispose();
    }

    if (this._lineMaterial) {
      this._lineMaterial.dispose();
    }

    if (this._line) {
      if (this._line.parent) {
        this._line.parent.remove(this._line);
      }
      this._line = null;
    }
  }

  public remove() {
    this.start.removefireOnAction(this.updateDim);
    this.end.removefireOnAction(this.updateDim);

    this.start.detachWall(this);
    this.end.detachWall(this);

    this.dispose();

    this.start = null;
    this.end = null;

    this.deletedCallbacks.fire(this);
  }

  public setStart(corner: Corner) {
    this.start.detachWall(this);
    corner.attachStart(this);
    this.start = corner;
    corner.fireOnAction(this.updateDim);
    this.fireMoved();
  }

  public setEnd(corner: Corner) {
    this.end.detachWall(this);
    corner.attachEnd(this);
    this.end = corner;
    corner.fireOnAction(this.updateDim);
    this.fireMoved();
  }

  public distanceFrom(x: number, z: number): number {
    return Utils.pointDistanceFromLine(
      x,
      z,
      this.start._position.x,
      this.start._position.z,
      this.end._position.x,
      this.end._position.z
    );
  }

  /** Return the corner opposite of the one provided.
   * @param corner The given corner.
   * @returns The opposite corner.
   */
  private oppositeCorner(corner: Corner): Corner {
    if (this.start === corner) {
      return this.end;
    }
    if (this.end === corner) {
      return this.start;
    }
    console.warn('Wall does not connect to corner');
    return this.start;
  }

  public setOrphan(orphan: boolean) {
    this.orphan = orphan;
    this.determineColor();
  }
}
