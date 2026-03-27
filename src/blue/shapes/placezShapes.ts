import DimensionParams from '../model/dimensionParams';

import { Line2 } from 'three/examples/jsm/lines/Line2.js';


import { Utils } from '../core/utils';
import {
  Material,
  Object3D,
  Points,
  PointsMaterial,
  Vector3,
} from 'three';
import { ShapeParams } from '../model/shapeParams';
import { CSS3DLabelMaker } from '../three/CSS3DlabelMaker'

export class PlacezShape {
  public id: number = 0;

  public placezShapeObject: Object3D;

  public viewHeight: number;
  public viewWidth: number;
  public themeColor: string;

  public positions: Vector3[] = [];
  public points: Points[] = [];
  public lines: Line2[] = [];
  public labels: CSS3DLabelMaker[] = [];

  constructor(
    parameters: ShapeParams,
    width: number,
    height: number,
    themeColor: string
  ) {
    this.themeColor = themeColor;

    const pointsMaterial = new PointsMaterial({
      color: Utils.hexColorToDec(this.themeColor),
      size: 5.0,
    });

    this.placezShapeObject = new Object3D();
  }

  public lineMaterial: Material;
  public fillMaterial: Material;

  public update = () => {};

  public updateDimensionLabel = () => {};

  public serialize: () => DimensionParams;
  // public serialize: () => ShapeParams;

  public getShape = (): Object3D => {
    return this.placezShapeObject;
  };

  public delete = () => {
    this.points.forEach((point: Points) => {
      this.placezShapeObject.remove(point);
      point.geometry.dispose();
    });
    this.points = [];
    this.lines.forEach((line: Line2) => {
      this.placezShapeObject.remove(line);
      line.geometry.dispose();
    });
    this.lines = [];
    this.labels.forEach((label: CSS3DLabelMaker) => {
      this.placezShapeObject.remove(label.getObject());
    });
    this.labels = [];
  };
}
