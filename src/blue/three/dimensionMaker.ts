import { CameraLayers } from '../../models/BlueState';
import DimensionParams from '../model/dimensionParams';

import { Line2 } from 'three/examples/jsm/lines/Line2.js';
import { LineMaterial } from 'three/examples/jsm/lines/LineMaterial.js';
import { LineGeometry } from 'three/examples/jsm/lines/LineGeometry.js';
import {
  ValidUnits,
} from '../../api/placez/models/UserSetting';
import { Utils } from '../core/utils';
import { getFromLocalStorage } from '../../sharing/utils/localStorageHelper';
import { LocalStorageKey } from '../../components/Hooks/useLocalStorageState';
import {
  BufferGeometry,
  Object3D,
  Points,
  PointsMaterial,
  Sprite,
  Vector3,
} from 'three';
import { CSS3DLabelMaker } from './CSS3DlabelMaker'

export enum SelectedDimensionHandle {
  Start = 'Start',
  End = 'End',
  Line = 'Line',
}

export class DimensionMaker {
  public id: number;

  public Dimension: Object3D;

  public startPoint: Points;
  public endPoint: Points;

  public point1: Vector3;
  public point2: Vector3;

  public line: Line2;

  public dimensionLabel: CSS3DLabelMaker;
  public dimensionSprite: Object3D;
  private dimensionText: string;
  private viewHeight: number;
  private viewWidth: number;
  public units: ValidUnits;
  private themeColor: string;

  constructor(
    parameters: DimensionParams,
    width: number,
    height: number,
    themeColor: string
  ) {
    this.units = getFromLocalStorage<ValidUnits>(LocalStorageKey.Units);
    this.themeColor = themeColor;

    this.id = parameters.id;
    const pointsMaterial = new PointsMaterial({
      color: Utils.hexColorToDec(this.themeColor),
      size: 5.0,
    });

    this.point1 = new Vector3().fromArray(parameters.startPoint);
    this.point2 = new Vector3().fromArray(parameters.endPoint);
    const point1Geometry = new BufferGeometry().setFromPoints([this.point1]);
    const point2Geometry = new BufferGeometry().setFromPoints([this.point2]);
    this.viewWidth = width;
    this.viewHeight = height;

    this.startPoint = new Points(point1Geometry, pointsMaterial);
    this.startPoint.userData = {
      id: this.id,
      name: SelectedDimensionHandle.Start,
    };
    this.endPoint = new Points(point2Geometry, pointsMaterial);
    this.endPoint.userData = {
      id: this.id,
      name: SelectedDimensionHandle.End,
    };

    this.Dimension = new Object3D();

    this.line = this.createLine(this.point1, this.point2, parameters);
    this.line.userData = {
      id: this.id,
      name: SelectedDimensionHandle.Line,
    };
    this.Dimension.add(this.line);
    this.Dimension.add(this.startPoint);
    this.Dimension.add(this.endPoint);

    this.createDimensionLabel();

    this.Dimension.traverse((object) => {
      object.layers.set(CameraLayers.Measurments);
    });
  }

  public updateEndPoint = (
    selectedHandle: SelectedDimensionHandle,
    position: Vector3
  ) => {
    switch (selectedHandle) {
      case SelectedDimensionHandle.Start:
        this.point1.copy(position);
        this.startPoint.geometry.setFromPoints([this.point1]);
        this.startPoint.geometry.computeBoundingSphere();

        (this.line.geometry as LineGeometry).setPositions([
          this.point1.x,
          this.point1.y,
          this.point1.z,
          this.point2.x,
          this.point2.y,
          this.point2.z,
        ]);

        this.updateDimensionLabel();
        break;
      case SelectedDimensionHandle.End:
        this.point2.copy(position);
        this.endPoint.geometry.setFromPoints([this.point2]);
        this.endPoint.geometry.computeBoundingSphere();

        (this.line.geometry as LineGeometry).setPositions([
          this.point1.x,
          this.point1.y,
          this.point1.z,
          this.point2.x,
          this.point2.y,
          this.point2.z,
        ]);

        this.updateDimensionLabel();
        break;
      default:
        break;
    }
  };

  public updatePosition = (
    initialPosition: Vector3,
    newPosition: THREE.Vector3
  ) => {
    const transformation = new Vector3().subVectors(
      newPosition,
      initialPosition
    );
    const newStartPoint = new Vector3().addVectors(this.point1, transformation);
    const newEndPoint = new Vector3().addVectors(this.point2, transformation);

    this.updateEndPoint(SelectedDimensionHandle.Start, newStartPoint);
    this.updateEndPoint(SelectedDimensionHandle.End, newEndPoint);
  };

  public createDimensionLabel = () => {
    const totalDistance = this.point1.distanceTo(this.point2);
    this.dimensionText = Utils.unitsOutString(totalDistance);
    const fontScale = Utils.scaleFactor(
      getFromLocalStorage(LocalStorageKey.Dimensions) as number
    );

    this.dimensionLabel = new CSS3DLabelMaker(
      {
        labelText: this.dimensionText,
        fontSize: 32 * fontScale,
        marginTop: 3,
        marginLeft: 3,
        marginRight: 3,
        borderRadius: 4,
      },
      CameraLayers.Measurments
    );
    this.Dimension.remove(this.dimensionSprite);
    this.dimensionSprite = this.dimensionLabel.getObject();

    const midPointVec = new Vector3();
    midPointVec.addVectors(this.point1, this.point2).divideScalar(2);
    this.dimensionSprite.position.copy(midPointVec);
    this.Dimension.add(this.dimensionSprite);
  };

  public updateDimensionLabel = () => {
    const totalDistance = this.point1.distanceTo(this.point2);
    this.dimensionText = Utils.unitsOutString(totalDistance);
    const fontScale = Utils.scaleFactor(
      getFromLocalStorage(LocalStorageKey.Dimensions) as number
    );

    this.dimensionLabel.updateParameters(
      {
        labelText: this.dimensionText,
        fontSize: 32 * fontScale,
        marginTop: 3,
        marginLeft: 3,
        marginRight: 3,
        borderRadius: 4,
      }
    );

    this.dimensionSprite = this.dimensionLabel.getObject();
    const midPointVec = new Vector3();
    midPointVec.addVectors(this.point1, this.point2).divideScalar(2);
    this.dimensionSprite.position.copy(midPointVec);
  };

  public createLine = (
    point1: Vector3,
    point2: THREE.Vector3,
    parameters: DimensionParams
  ): Line2 => {
    const material = new LineMaterial({
      color: Utils.hexColorToDec(this.themeColor),
      linewidth: 3,
    });
    material.resolution.set(this.viewWidth, this.viewHeight);

    const points = [];
    points.push(point1);
    points.push(point2);

    // geometry
    const geometry = new LineGeometry();

    // attributes
    const positions = new Float32Array([
      point1.x,
      point1.y,
      point1.z,
      point2.x,
      point2.y,
      point2.z,
    ]);

    geometry.setPositions(positions);

    const line2 = new Line2(geometry, material);
    line2.computeLineDistances();
    line2.scale.set(1, 1, 1);
    return line2;
  };

  public serialize = (): DimensionParams => {
    return {
      id: this.id,
      startPoint: this.point1.toArray(),
      endPoint: this.point2.toArray(),
    };
  };

  public getDimension = () => {
    return this.Dimension;
  };

  public updateDimensionResolution = (width, height) => {
    this.line.material.resolution.set(width, height);
  };
}
