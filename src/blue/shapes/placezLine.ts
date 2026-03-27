import { CameraLayers } from '../../models/BlueState';
import DimensionParams from '../model/dimensionParams';

import { Line2 } from 'three/examples/jsm/lines/Line2.js';
import { LineMaterial } from 'three/examples/jsm/lines/LineMaterial.js';
import { LineGeometry } from 'three/examples/jsm/lines/LineGeometry.js';
import { ValidUnits } from '../../api/placez/models/UserSetting';
import { Utils } from '../core/utils';
import { getFromLocalStorage } from '../../sharing/utils/localStorageHelper';
import { LocalStorageKey } from '../../components/Hooks/useLocalStorageState';
import {
  BufferGeometry,
  Object3D,
  Points,
  PointsMaterial,
  Vector3,
} from 'three';
import { LineParams, ShapeParams } from '../model/shapeParams';
import { PlacezShape } from './placezShapes';
import { CSS3DLabelMaker } from '../three/CSS3DlabelMaker'

export class PlacezLine extends PlacezShape{
  public id: number = 0;

  private dimensionLabel: CSS3DLabelMaker;
  private dimensionText: string;
  public units: ValidUnits;

  constructor(
    parameters: LineParams,
    width: number,
    height: number,
    themeColor: string
  ) {
    super(parameters, width, height, themeColor);

    this.units = getFromLocalStorage<ValidUnits>(LocalStorageKey.Units);
    this.themeColor = themeColor;

    const pointsMaterial = new PointsMaterial({
      color: Utils.hexColorToDec(this.themeColor),
      size: 5.0,
    });

    this.positions = [
      new Vector3().fromArray(parameters.startPoint.position),
      new Vector3().fromArray(parameters.endPoint.position),
    ];

    this.positions.forEach((position) => {
      const pointGeometry = new BufferGeometry().setFromPoints([position]);
      const point = new Points(pointGeometry, pointsMaterial);
      point.userData = {
        shape: this,
        point: position,
      };
      this.points.push(point);
    });

    this.viewWidth = width;
    this.viewHeight = height;

    this.placezShapeObject = new Object3D();

    const line = this.createLine(
      this.positions[0],
      this.positions[1],
      parameters
    );
    line.userData = {
      shape: this,
      points: [this.positions[0], this.positions[1]],
    };
    this.lines.push(line);
    this.lines.forEach((line) => this.placezShapeObject.add(line));

    this.points.forEach((point) => {
      this.placezShapeObject.add(point);
    });

    this.createDimensionLabel();

    this.placezShapeObject.traverse((object) => {
      object.layers.set(CameraLayers.Measurments);
    });
  }

  public update = () => {
    // points have moved now update geom
    this.points[0].geometry.setFromPoints([this.positions[0]]);
    this.points[0].geometry.computeBoundingSphere();
    this.points[1].geometry.setFromPoints([this.positions[1]]);
    this.points[1].geometry.computeBoundingSphere();

    (this.lines[0].geometry as LineGeometry).setPositions([
      this.positions[0].x,
      this.positions[0].y,
      this.positions[0].z,
      this.positions[1].x,
      this.positions[1].y,
      this.positions[1].z,
    ]);

    this.updateDimensionLabel();
  };

  public createDimensionLabel = () => {
    const totalDistance = this.positions[0].distanceTo(this.positions[1]);
    this.dimensionText = Utils.unitsOutString(totalDistance);
    const fontScale = Utils.scaleFactor(
      getFromLocalStorage(LocalStorageKey.Dimensions) as number
    );

    this.dimensionLabel = new CSS3DLabelMaker(
      {
        labelText: this.dimensionText,
        fontSize: 32 * fontScale,
        margin: 5,
        borderRadius: 4,
        backgroundColor: '0xffffff'
      },
      CameraLayers.Measurments,
    );
    this.labels.forEach((label) =>
      this.placezShapeObject.remove(label.getObject())
    );
    this.labels = [];
    this.labels.push(this.dimensionLabel);

    const midPointVec = new Vector3();
    midPointVec
      .addVectors(this.positions[0], this.positions[1])
      .divideScalar(2);
    this.dimensionLabel.getObject().position.copy(midPointVec);

    this.labels.forEach((label) =>
      this.placezShapeObject.add(label.getObject())
    );
  };

  public updateDimensionLabel = () => {
    const totalDistance = this.positions[0].distanceTo(this.positions[1]);
    this.dimensionText = Utils.unitsOutString(totalDistance);
    const fontScale = Utils.scaleFactor(
      getFromLocalStorage(LocalStorageKey.Dimensions) as number
    );

    this.dimensionLabel.updateParameters({
      labelText: this.dimensionText,
      fontSize: 32 * fontScale,
      marginTop: 3,
      marginLeft: 3,
      marginRight: 3,
      borderRadius: 4,
    })

    const midPointVec = new Vector3();
    midPointVec
      .addVectors(this.positions[0], this.positions[1])
      .divideScalar(2);
    this.dimensionLabel.getObject().position.copy(midPointVec);
  };

  public createLine = (
    point1: Vector3,
    point2: THREE.Vector3,
    parameters: DimensionParams | ShapeParams
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
    // return {
    //   startPoint: {
    //     position: this.positions[0].toArray(),
    //   },
    //   endPoint: {
    //     position: this.positions[1].toArray(),
    //   },
    // };
    return {
      id: this.id,
      startPoint: this.positions[0].toArray(),
      endPoint: this.positions[1].toArray(),
    };
  };

  public updateDimensionResolution = (width, height) => {
    this.lines[0].material.resolution.set(width, height);
  };
}
