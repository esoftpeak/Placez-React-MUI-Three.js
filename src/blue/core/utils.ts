import {
  Vector3,
  MeshStandardMaterial,
  BufferGeometry,
  Mesh,
  Vector2,
  DoubleSide,
  Color,
  Group,
  Material,
  MeshPhysicalMaterial,
  LineCurve,
  Sprite,
  Matrix4,
  Float32BufferAttribute,
  Box3,
} from 'three';
import { Item } from '../items/item';
import { Corner } from '../model/corner';

import * as math from 'mathjs';
import { store } from '../..';
import { ReduxState } from '../../reducers';
import {
  ValidUnits,
} from '../../api/placez/models/UserSetting';
import { MaterialManager } from '../three/materialManager';
import {
  PlacezEnvMap,
  PlacezMaterial,
  TypesOfMaps,
} from '../../api/placez/models/PlacezMaterial';
import { Asset } from '../items';
import { GLTFExporter } from 'three/examples/jsm/exporters/GLTFExporter';
import { GLTF, GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader';
import { Factory } from '../items/factory';
import BlueLabel from '../model/blueLabel';
/** Collection of utility functions. */
import { getFromLocalStorage } from '../../sharing/utils/localStorageHelper';
import { TargetSpecs } from '../three/Cameras';
import { CameraLayers } from '../../models/BlueState';
import { mergeGeometries } from 'three/examples/jsm/utils/BufferGeometryUtils';
import { LocalStorageKey } from '../../components/Hooks/useLocalStorageState';
import { CSS3DLabelMaker } from '../three/CSS3DlabelMaker'

math.createUnit('ftin', '1 ft');
export class Utils {
  /** Determines the distance of a point from a line.
   * @param x Point's x coordinate.
   * @param y Point's y coordinate.
   * @param x1 Line-Point 1's x coordinate.
   * @param y1 Line-Point 1's y coordinate.
   * @param x2 Line-Point 2's x coordinate.
   * @param y2 Line-Point 2's y coordinate.
   * @returns The distance.
   */
  public static pointDistanceFromLine(
    x: number,
    y: number,
    x1: number,
    y1: number,
    x2: number,
    y2: number
  ): number {
    const tPoint = Utils.closestPointOnLine(x, y, x1, y1, x2, y2);
    const tDx = x - tPoint.x;
    const tDy = y - tPoint.y;
    return Math.sqrt(tDx * tDx + tDy * tDy);
  }

  /** Gets the projection of a point onto a line.
   * @param x Point's x coordinate.
   * @param y Point's y coordinate.
   * @param x1 Line-Point 1's x coordinate.
   * @param y1 Line-Point 1's y coordinate.
   * @param x2 Line-Point 2's x coordinate.
   * @param y2 Line-Point 2's y coordinate.
   * @returns The point.
   */
  static closestPointOnLine(
    x: number,
    y: number,
    x1: number,
    y1: number,
    x2: number,
    y2: number
  ): { x: number; y: number } {
    // Inspired by: http://stackoverflow.com/a/6853926
    const tA = x - x1;
    const tB = y - y1;
    const tC = x2 - x1;
    const tD = y2 - y1;

    const tDot = tA * tC + tB * tD;
    const tLenSq = tC * tC + tD * tD;
    const tParam = tDot / tLenSq;

    let tXx;
    let tYy;

    if (tParam < 0 || (x1 === x2 && y1 === y2)) {
      tXx = x1;
      tYy = y1;
    } else if (tParam > 1) {
      tXx = x2;
      tYy = y2;
    } else {
      tXx = x1 + tParam * tC;
      tYy = y1 + tParam * tD;
    }

    return {
      x: tXx,
      y: tYy,
    };
  }

  /** Gets the distance of two points.
   * @param x1 X part of first point.
   * @param y1 Y part of first point.
   * @param x2 X part of second point.
   * @param y2 Y part of second point.
   * @returns The distance.
   */
  static distance(x1: number, y1: number, x2: number, y2: number): number {
    return Math.sqrt(Math.pow(x2 - x1, 2) + Math.pow(y2 - y1, 2));
  }

  /**  Gets the angle between 0,0 -> x1,y1 and 0,0 -> x2,y2 (0 to 2pi)
   * @returns The angle.
   */
  static angle(x1: number, y1: number, x2: number, y2: number): number {
    const tDot = x1 * x2 + y1 * y2;
    const tDet = x1 * y2 - y1 * x2;
    let tAngle = -Math.atan2(tDet, tDot);
    tAngle = tAngle < 0 ? tAngle + 2 * Math.PI : tAngle;

    return tAngle;
  }

  /** shifts angle to be 0 to 2pi */
  static angle2pi(x1: number, y1: number, x2: number, y2: number) {
    let tTheta = Utils.angle(x1, y1, x2, y2);
    if (tTheta < 0) {
      tTheta += 2 * Math.PI;
    }
    return tTheta;
  }

  /** Checks if an array of points is clockwise.
   * @param points Is array of points with x,y attributes
   * @returns True if clockwise.
   */
  static isClockwise(points: Corner[]): boolean {
    // make positive
    const tSubX = Math.min(
      0,
      Math.min.apply(
        null,
        points.map((p: Corner) => {
          return p._position.x;
        })
      )
    );
    const tSubY = Math.min(
      0,
      Math.min.apply(
        null,
        points.map((p: Corner) => {
          return p._position.z;
        })
      )
    );

    const tNewPoints: Vector2[] = points.map((p: Corner) => {
      return new Vector2(p._position.x - tSubX, p._position.z - tSubY);
    });

    // determine CW/CCW, based on:
    // http://stackoverflow.com/questions/1165647
    let tSum = 0;
    for (let tI = 0; tI < tNewPoints.length; tI++) {
      // tslint:disable-line
      const tC1 = tNewPoints[tI];
      let tC2: any;
      if (tI === tNewPoints.length - 1) {
        tC2 = tNewPoints[0];
      } else {
        tC2 = tNewPoints[tI + 1];
      }
      tSum += (tC2.x - tC1.x) * (tC2.y + tC1.y);
    }
    return tSum >= 0;
  }

  /** Creates a Guid.
   * @returns A new Guid.
   */
  static guid(): /* () => */ string {
    const tS4 = function () {
      return Math.floor((1 + Math.random()) * 0x10000)
        .toString(16)
        .substring(1);
    };

    return `${tS4()}${tS4()}-${tS4()}-${tS4()}-${tS4()}-${tS4()}${tS4()}${tS4()}`;
  }

  /** both arguments are arrays of corners with x,y attributes */
  static polygonPolygonIntersect(
    firstCorners: THREE.Vector2[],
    secondCorners: Vector2[]
  ): boolean {
    for (let tI = 0; tI < firstCorners.length; tI++) {
      // tslint:disable-line
      const tFirstCorner = firstCorners[tI];
      let tSecondCorner;

      if (tI === firstCorners.length - 1) {
        tSecondCorner = firstCorners[0];
      } else {
        tSecondCorner = firstCorners[tI + 1];
      }

      if (
        Utils.linePolygonIntersect(
          tFirstCorner.x,
          tFirstCorner.y,
          tSecondCorner.x,
          tSecondCorner.y,
          secondCorners
        )
      ) {
        return true;
      }
    }
    return false;
  }

  /** Corners is an array of points with x,y attributes */
  static linePolygonIntersect(
    x1: number,
    y1: number,
    x2: number,
    y2: number,
    corners
  ): boolean {
    for (let tI = 0; tI < corners.length; tI++) {
      //tslint:disable-line
      const tFirstCorner = corners[tI];
      let tSecondCorner;
      if (tI === corners.length - 1) {
        tSecondCorner = corners[0];
      } else {
        tSecondCorner = corners[tI + 1];
      }

      if (
        Utils.lineLineIntersect(
          x1,
          y1,
          x2,
          y2,
          tFirstCorner.x,
          tFirstCorner.y,
          tSecondCorner.x,
          tSecondCorner.y
        )
      ) {
        return true;
      }
    }
    return false;
  }

  /** */
  static lineLineIntersect(
    x1: number,
    y1: number,
    x2: number,
    y2: number,
    x3: number,
    y3: number,
    x4: number,
    y4: number
  ): boolean {
    function tCCW(p1, p2, p3) {
      const tA = p1.x;
      const tB = p1.y;
      const tC = p2.x;
      const tD = p2.y;
      const tE = p3.x;
      const tF = p3.y;
      return (tF - tB) * (tC - tA) > (tD - tB) * (tE - tA);
    }

    const tP1 = { x: x1, y: y1 };
    const tP2 = { x: x2, y: y2 };
    const tP3 = { x: x3, y: y3 };
    const tP4 = { x: x4, y: y4 };
    return (
      tCCW(tP1, tP3, tP4) !== tCCW(tP2, tP3, tP4) &&
      tCCW(tP1, tP2, tP3) !== tCCW(tP1, tP2, tP4)
    );
  }

  /**
   @param corners Is an array of points with x,y attributes
    @param startX X start coord for raycast
    @param startY Y start coord for raycast
  */
  static pointInPolygon(
    x: number,
    y: number,
    corners: { x: number; y: number }[]
  ): boolean {
    // TODO algorithm may not be working properly
    // ensure that point(startX, startY) is outside the polygon consists of corners
    let tMinX = 0;
    let tMinY = 0;

    for (let tI = 0; tI < corners.length; tI++) {
      // tslint:disable-line
      tMinX = Math.min(tMinX, corners[tI].x);
      tMinY = Math.min(tMinX, corners[tI].y);
    }
    const localStartX = tMinX - 10;
    const localStartY = tMinY - 10;

    let tIntersects = 0;
    for (let tI = 0; tI < corners.length; tI++) {
      const tFirstCorner = corners[tI];
      let tSecondCorner;
      if (tI === corners.length - 1) {
        tSecondCorner = corners[0];
      } else {
        tSecondCorner = corners[tI + 1];
      }

      if (
        Utils.lineLineIntersect(
          localStartX,
          localStartY,
          x,
          y,
          tFirstCorner.x,
          tFirstCorner.y,
          tSecondCorner.x,
          tSecondCorner.y
        )
      ) {
        tIntersects++;
      }
    }
    // odd intersections means the point is in the polygon
    return tIntersects % 2 === 1;
  }

  static pointInPath(point: THREE.Vector2, path: THREE.Path) {
    // ensure that point(startX, startY) is outside the polygon consists of corners
    const corners: Vector2[] = [];
    corners.push(path.currentPoint);
    path.curves.forEach((curve) => {
      corners.push((curve as LineCurve).v1);
    });

    let tMinX = 0;
    let tMinY = 0;

    for (let tI = 0; tI < corners.length; tI++) {
      // tslint:disable-line
      tMinX = Math.min(tMinX, corners[tI].x);
      tMinY = Math.min(tMinX, corners[tI].y);
    }
    const localStartX = tMinX - 10;
    const localStartY = tMinY - 10;

    let tIntersects = 0;
    for (let tI = 0; tI < corners.length; tI++) {
      const tFirstCorner = corners[tI];
      let tSecondCorner;
      if (tI === corners.length - 1) {
        tSecondCorner = corners[0];
      } else {
        tSecondCorner = corners[tI + 1];
      }

      if (
        Utils.lineLineIntersect(
          localStartX,
          localStartY,
          point.x,
          point.y,
          tFirstCorner.x,
          tFirstCorner.y,
          tSecondCorner.x,
          tSecondCorner.y
        )
      ) {
        tIntersects++;
      }
    }
    // odd intersections means the point is in the polygon
    return tIntersects % 2 === 1;
  }

  static sortByAscending = (key: string) => (a: {}, b: {}) => {
    return a[key] - b[key];
  };

  static minMax = (corners: THREE.Vector2[]): THREE.Vector2[] => {
    const sortx = corners.sort(Utils.sortByAscending('x'));
    return sortx.sort(Utils.sortByAscending('y'));
  };

  static pointInRectangle(point: THREE.Vector2, corners: THREE.Vector2[]) {
    const minMax = Utils.minMax(corners);
    return (
      point.x > minMax[0].x &&
      point.y > minMax[0].y &&
      point.x < minMax[minMax.length - 1].x &&
      point.y < minMax[minMax.length - 1].y
    );
  }

  /** Checks if all corners of insideCorners are inside the polygon described by outsideCorners */
  static polygonInsidePolygon(
    insideCorners: Corner[],
    outsideCorners: Corner[]
  ): boolean {
    for (let tI = 0; tI < insideCorners.length; tI++) {
      if (
        !Utils.pointInPolygon(
          insideCorners[tI]._position.x,
          insideCorners[tI]._position.z,
          outsideCorners.map((corner: Corner) => ({
            x: corner._position.x,
            y: corner._position.z,
          }))
        )
      ) {
        return false;
      }
    }
    return true;
  }

  /** Checks if any corners of firstCorners is inside the polygon described by secondCorners */
  static polygonOutsidePolygon(
    insideCorners,
    outsideCorners,
    startX: number,
    startY: number
  ): boolean {
    for (let tI = 0; tI < insideCorners.length; tI++) {
      if (
        Utils.pointInPolygon(
          insideCorners[tI].x,
          insideCorners[tI].y,
          outsideCorners
        )
      ) {
        return false;
      }
    }
    return true;
  }

  /** Shift the items in an array by shift (positive integer) */
  static cycle(arr, shift) {
    const tReturn = arr.slice(0);
    for (let tI = 0; tI < shift; tI++) {
      const tmp = tReturn.shift();
      tReturn.push(tmp);
    }
    return tReturn;
  }

  static centerOfRectangel(rect: number[]): Vector3 {
    return new Vector3((rect[2] + rect[3]) / 2, 0, (rect[4] + rect[5]) / 2);
  }

  static midpoint(vec1, vec2) {
    const midpoint = new Vector3();
    return midpoint.addVectors(vec1, vec2).multiplyScalar(0.5);
  }

  /** This is not a good function.  does not assume non rectangles*/
  static lwOfRectangle(rec: Vector3[]) {
    let width = 0;
    let depth = 0;
    const xs: number[] = [];
    const ys: number[] = [];
    let minX = 0;
    let minY = 0;
    let maxX = 0;
    let maxY = 0;

    for (let i = 0; i < 4; i++) {
      // tslint:disable-line
      const x = rec[i].x;
      if (xs.indexOf(x) < 0) {
        xs.push(x);
      }
      const y = rec[i].z;
      if (ys.indexOf(y) < 0) {
        ys.push(y);
      }
    }

    if (xs[0] > xs[1]) {
      width = xs[0] - xs[1];
      minX = xs[1];
      maxX = xs[0];
    } else {
      width = xs[1] - xs[0];
      minX = xs[0];
      maxX = xs[1];
    }

    if (ys[0] > ys[1]) {
      depth = ys[0] - ys[1];
      minY = ys[1];
      maxY = ys[0];
    } else {
      depth = ys[1] - ys[0];
      minY = ys[0];
      maxY = ys[1];
    }

    return [width, depth, minX, maxX, minY, maxY];
  } // lw

  static mergeMeshes(meshes, toBufferGeometry) {
    let finalGeometry;
    const materials: MeshStandardMaterial[] = [];
    let mergedGeometry = new BufferGeometry();

    meshes.forEach((mesh, index) => {
      mesh.updateMatrix();
      mesh.geometry.faces.forEach((face) => {
        face.materialIndex = 0;
      });
      // mergedGeometry.merge(mesh.geometry, mesh.matrix, index);
      mergedGeometry = mergeGeometries([mesh.geometry, index]);
      materials.push(mesh.material);
    });

    // mergedGeometry.groupsNeedUpdate = true;

    if (toBufferGeometry) {
      finalGeometry = new BufferGeometry().copy(mergedGeometry);
    } else {
      finalGeometry = mergedGeometry;
    }

    const mergedMesh = new Mesh(finalGeometry, materials);
    mergedMesh.geometry.computeVertexNormals();

    return mergedMesh;
  }

  static camelize(str: string): string {
    return str
      .replace(/(?:^\w|[A-Z]|\b\w)/g, (word, index) => {
        return index === 0 ? word.toLowerCase() : word.toUpperCase();
      })
      .replace(/\s+/g, '');
  }

  static snap(snapTo: Vector3, point: Vector3, snapTolerance: number): Vector3 {
    const newPoint = new Vector3();
    const distance = snapTo.distanceTo(point);
    newPoint.setX(
      this.withinTolerance(snapTo.x, distance, snapTolerance, point.x)
        ? snapTo.x
        : point.x
    );
    newPoint.setY(
      this.withinTolerance(snapTo.y, distance, snapTolerance, point.y)
        ? snapTo.y
        : point.y
    );
    newPoint.setZ(
      this.withinTolerance(snapTo.z, distance, snapTolerance, point.z)
        ? snapTo.z
        : point.z
    );
    return newPoint;
  }

  static withinTolerance(
    initialNum: number,
    distance: number,
    angle: number,
    checkNum: number
  ): boolean {
    const tol = Math.sin((angle / 180) * Math.PI) * distance;
    return checkNum <= tol + initialNum && checkNum >= -tol + initialNum;
  }

  static approxeq(v1: number, v2: number, epsilon: number = 0.001): boolean {
    return Math.abs(v1 - v2) < epsilon;
  }

  static convertToCM(dimension) {
    const currentUnits = getFromLocalStorage<string>(LocalStorageKey.Units);

    if (dimension === 0 || isNaN(dimension)) {
      return 0;
    }
    return math.unit(dimension, currentUnits).toNumber('cm');
  }

  static convertToDegrees(radians: number) {
    const degreesOut = math.unit(radians, 'rad').toNumber('deg');
    return Math.round(this.convertAngle0To360(degreesOut) * 10) / 10;
  }

  static convertToRadians(degrees: number) {
    const radiansOut = math.unit(degrees, 'deg').toNumber('rad');
    return this.convertAngle0To2Pi(radiansOut);
  }

  static getUnit() {
    // // @ts-ignore
    // if(!math.Unit.isValuelessUnit('ftIn')) {
    //   math.createUnit('ftin', '1 ft');
    // }
    let currentUnits = getFromLocalStorage<string>(LocalStorageKey.Units);
    if (currentUnits === ValidUnits.ftIn) {
      currentUnits = ValidUnits.ft;
    }

    return currentUnits !== undefined ? currentUnits : 'ft';
  }

  static unitsOutString(dim, from?, to?, round?): string {
    const unitsIn = from ? from : 'cm';
    const dimension = math.unit(dim, unitsIn);
    const currentUnits = this.getUnit();
    switch (currentUnits) {
      case ValidUnits.ftIn:
        const split = dimension.splitUnit(['ft', 'in']);
        const ft = Math.ceil(split[0].toNumber('ft'));
        const inch = Math.floor(split[1].toNumber('in'));
        if (ft > 0) {
          if (inch > 0 && !round) {
            return `${ft}ft ${inch}in`;
          }
          return `${ft}ft`;
        } else {
          return `${inch}in`;
        }
      case ValidUnits.ft:
        return dimension
          .to('ft')
          .format({ notation: 'fixed', precision: round ?? 2 });
      case ValidUnits.in:
        return dimension
          .to('in')
          .format({ notation: 'fixed', precision: round ?? 0 });
      case ValidUnits.cm:
        return dimension
          .to('cm')
          .format({ notation: 'fixed', precision: round ?? 0 });
      default:
        return `${this.roundDigits(dimension.toNumber(currentUnits), round ?? 0)}${currentUnits}`;
    }
  }

  static unitsOutNumber(cmDim: number = 0, to?, round?): number {
    const currentUnits = this.getUnit();
    const dimension = math.unit(cmDim, 'cm');
    const number = dimension.toNumber(to ?? currentUnits);
    const roundedNumber = this.roundDigits(number, round ?? 0);
    return roundedNumber;
  }

  static convertUnitsFromTo(dim, from, to, round?): number {
    if (!dim) return 0;
    if (from === to) return dim;
    const dimension = math.unit(dim, from);
    return this.roundDigits(dimension.toNumber(to), round ? round : 2);
  }

  static roundDigits(dim: number, digits): number {
    return Math.round(dim * Math.pow(10, digits)) / Math.pow(10, digits);
  }

  static convertAngle0To2Pi(angle: number): number {
    const tolerance = 0.01;
    const modAngle = ((angle % (Math.PI * 2)) + Math.PI * 2) % (Math.PI * 2);
    if (
      modAngle < Math.PI * 2 + tolerance &&
      modAngle > Math.PI * 2 - tolerance
    ) {
      return 0;
    }
    return modAngle;
  }

  static convertAngle0To360(angle: number): number {
    const tolerance = 1;
    const modAngle = ((angle % 360) + 360) % 360;
    if (modAngle < 360 + 1 && modAngle > 360 - tolerance) {
      return 0;
    }
    return modAngle;
  }

  static firstMesh(group: Group): Mesh | undefined {
    let meshNode: THREE.Mesh | undefined = undefined;
    group.traverse((node) => {
      if (meshNode === undefined && node instanceof Mesh) {
        meshNode = node;
      }
    });
    return meshNode;
  }

  static applyCustomMaterials = (mesh: THREE.Mesh, mask: PlacezMaterial[]) => {
    return new Promise((resolve, reject) => {
      if (!mask || mask.length === 0) {
        resolve(undefined);
      } else {
        const materials = Array.isArray(mesh.material)
          ? mesh.material
          : [mesh.material];

        // Cleanup mask by filtering out invalid materials
        let cleanMask = mask.filter(
          (material) => material?.threeJSMaterial?.Type === undefined
        );

        // Adjust cleanMask to match the length of mesh.material
        const materialsLength = Array.isArray(mesh.material)
          ? mesh.material.length
          : 1;
        if (cleanMask.length > materialsLength) {
          // If cleanMask is longer, truncate it
          cleanMask = cleanMask.slice(0, materialsLength);
        } else if (cleanMask.length < materialsLength) {
          // If cleanMask is shorter, extend it by repeating elements
          while (cleanMask.length < materialsLength) {
            cleanMask = [
              ...cleanMask,
              ...mask.slice(0, materialsLength - cleanMask.length),
            ];
          }
        }

        if (cleanMask.length > 0) {
          const materialPromises: Promise<unknown>[] = [];
          cleanMask.forEach((element, index) => {
            if (element) {
              materialPromises.push(
                Utils.applyCustomMaterial(
                  materials[index] as MeshPhysicalMaterial,
                  cleanMask[index]
                )
              );
            }
          });
          Promise.all(materialPromises).then(resolve);
        } else {
          resolve(undefined);
        }
      }
    });
  };

  static applyCustomMaterial = (
    oldMaterial: THREE.MeshPhysicalMaterial,
    customMat: PlacezMaterial
  ) => {
    return new Promise((resolve, reject) => {
      Utils.loadMaterial(customMat, oldMaterial).then(
        (mat: THREE.MeshPhysicalMaterial) => {
          Utils.applyMaterialModifiers(mat, customMat.threeJSMaterial);
          oldMaterial.copy(mat);
          oldMaterial.needsUpdate = true;
          resolve(undefined);
        }
      );
    });
  };

  static loadMaterial = (
    customMat,
    originalMat
  ): Promise<MeshPhysicalMaterial> => {
    const materials = (store.getState() as ReduxState).material.byId;
    return new Promise((resolve, reject) => {
      if (customMat?.appliedMaterialId && materials[customMat.appliedMaterialId]) {
        new MaterialManager(materials[customMat.appliedMaterialId], (mat: THREE.MeshPhysicalMaterial) => {
          mat.depthTest = true;
          mat.side = DoubleSide;
          resolve(mat);
        });
      } else {
        if (originalMat instanceof MeshPhysicalMaterial) {
          resolve(originalMat); // This is bad
        } else {
          new MaterialManager(customMat, (mat: THREE.MeshPhysicalMaterial) => {
            mat.depthTest = true;
            mat.side = DoubleSide;
            resolve(mat);
          });
        }
      }
    });
  };

  static applyMaterialModifiers = (
    mat: THREE.MeshPhysicalMaterial,
    matModifiers
  ) => {
    if (matModifiers === undefined || matModifiers === null) return;

    if (matModifiers.color !== undefined && matModifiers.color !== null) {
      mat.color = new Color(matModifiers.color).convertSRGBToLinear();
    }
    if (matModifiers.opacity !== undefined && matModifiers.opacity !== null) {
      mat.opacity = !isNaN(matModifiers.opacity) ? matModifiers.opacity : 1.0;
      mat.transparent = matModifiers.opacity !== 1;
    }
    if (
      matModifiers.metalness !== undefined &&
      matModifiers.metalness !== null
    ) {
      mat.metalness = matModifiers.metalness;
    }
    if (
      matModifiers.roughness !== undefined &&
      matModifiers.roughness !== null
    ) {
      mat.roughness = matModifiers.roughness;
    }
    if (
      matModifiers.textures !== undefined &&
      matModifiers.textures !== null &&
      matModifiers.textures.length > 0
    ) {
      TypesOfMaps.forEach((map) => {
        if (mat[map]) {
          mat[map].repeat.set(
            matModifiers.textures[0].repeat[0],
            matModifiers.textures[0].repeat[1]
          );
        }
      });
    }
  };

  static setMaterialMask = (
    mesh: THREE.Mesh,
    asset: Asset,
    material: PlacezMaterial,
    index,
    fallbackMaterials: Material[]
  ) => {
    return new Promise((resolve, reject) => {
      asset.materialMask[index] = material;
      if (material) {
        Utils.applyCustomMaterial(
          mesh.material[index],
          asset.materialMask[index]
        ).then(resolve);
      } else {
        mesh.material[index] = fallbackMaterials[index]
          ? fallbackMaterials[index].clone()
          : undefined;
        resolve(undefined);
      }
    });
  };

  static setRepeatScale = (
    material: THREE.MeshPhysicalMaterial,
    uRepeat,
    vRepeat,
    scale,
    threeJSMaterial
  ) => {
    if (
      !scale ||
      !threeJSMaterial?.textures ||
      threeJSMaterial?.textures?.length < 1
    )
      return;
    materialMaps.forEach((texture) => {
      if (material[texture]) {
        material[texture].repeat.set(
          uRepeat / (threeJSMaterial.textures[0].repeat[0] * scale),
          vRepeat / (threeJSMaterial.textures[0].repeat[1] * scale)
        );
        material[texture].needsUpdate = true;
      }
    });
  };

  static decColorToHex = (color: number) => {
    return color ? '#'.concat(color.toString(16).padStart(6, '0')) : '';
  };

  static hexColorToDec = (color: string) => {
    return parseInt('0x'.concat(color.slice(1)), 16);
  };

  static cleanExport = (gltfGroup: THREE.Group, sku?: string): THREE.Mesh | undefined => {
    const meshes: Mesh[] = [];

    gltfGroup.traverse((child) => {
      child.updateMatrixWorld();

      if (child.children.length === 0 && child instanceof Mesh) {
        meshes.push(child);
      }
    });
    meshes.sort((a, b) => {
      const nameA = a.name.toUpperCase();
      const nameB = b.name.toUpperCase();
      if (nameA < nameB) {
        return -1;
      }
      if (nameA > nameB) {
        return 1;
      }

      // names must be equal
      console.warn(`${sku} has Duplicate Materials`);
      return 0;
    });
    const geometries = mergeGeometries(Utils.getFlattenedGeometries(meshes), true);
    if (geometries === null) {
      console.warn('Invalid Model', sku);
      return Utils.firstMesh(gltfGroup);
    }

    const materials = Utils.getFlattenedMaterials(meshes);

    // TODO iterate over meshes if similar clone from materials store else push to materials store
    // replace with lowest index common material

    geometries.groups.forEach((element) => {
      const materialUUID = materials[element.materialIndex].uuid;
      element.materialIndex = materials.findIndex((mat) => {
        return mat.uuid === materialUUID;
      });
    });

    // (mesh.geometry as BufferGeometry).groups.sort((a, b) => {
    //   return a.materialIndex - b.materialIndex;
    // });

    // mesh.material = [...new Set((mesh.material as []))];

    const newMaterials = materials
      .map((material, index) => {
        const found = geometries.groups.find((group) => {
          return group.materialIndex === index;
        });
        if (found) {
          return material;
        }
        return undefined;
      })
      .filter((material) => material !== undefined);

    geometries.groups.forEach((group) => {
      if (group.materialIndex > newMaterials.length - 1) {
        console.warn('Found bad Material in Asset', sku);
        group.materialIndex = newMaterials.length - 1;
      }
    });

    return new Mesh(geometries, newMaterials);
  };

  static getFlattenedGeometries = (entities: any[]): THREE.BufferGeometry[] => {
    return entities
      .map((entity: any) => {
        if (entity instanceof Mesh) {
          entity.updateMatrixWorld();
          const geometry = entity.geometry;
          geometry.applyMatrix4(entity.matrixWorld);
          return geometry as THREE.BufferGeometry;
        }
        // // if (entity instanceof THREE.Group) {
        // //   return this.getFlattenedGeometries(entity.children);
        // }
        return undefined;
      })
      .reduce((acc: BufferGeometry[], val) => {
        if (val) {
          return acc.concat(val);
        }
        return acc;
      }, []);
  };

  static getFlattenedMaterials = (entities: any[]): THREE.Material[] => {
    return entities
      .map((entity: any) => {
        if (entity instanceof Mesh) {
          if (entity.material instanceof Material) {
            return [entity.material];
          }
          return entity.material;
        }
        if (entity instanceof Group) {
          return Utils.getFlattenedMaterials(entity.children);
        }
        return [];
      })
      .reduce((acc, val) => {
        return acc.concat(val);
      }, []);
  };

  static exportGLB = (obj: THREE.Object3D, callback) => {
    const exporter = new GLTFExporter();
    exporter.parse(
      obj,
      (gltf: object) => {
        callback(Buffer.from(gltf as ArrayBuffer).toString('base64'));
      },
      () => {},
      { binary: true }
    );
  };

  static buildPath = (relativePath): string => {
    const host = import.meta.env.VITE_APP_PLACEZ_API_URL;
    let path = `/${relativePath}`;
    path = path.replace('//', '/');
    return `${host}${path}`;
  };
  static disposeMesh = (mesh: Mesh) => {
    mesh.traverse((node: Mesh) => {
      if (node instanceof Mesh) {
        node.geometry.dispose();
        if (Array.isArray(node.material)) {
          (node.material as Material[]).forEach((mat: Material) => {
            if (!mat) return;
            TypesOfMaps.forEach((map) => {
              if (mat[map]) {
                mat[map].dispose();
              }
            });
          });
        } else {
          TypesOfMaps.forEach((map) => {
            if (node.material[map]) {
              node.material[map].dispose();
            }
          });
        }
      }
      if (node instanceof Sprite) {
        node.geometry.dispose();
        node.material.dispose();
      }
    });
  };

  static camelToUpperCase = (convert: string) => {
    return convert
      .replace(/([A-Z])/g, ' $1')
      .replace(/^./, (str) => str.toUpperCase());
  };

  public static loader = new GLTFLoader();

  static snapRotation = (
    angle: number,
    snap: boolean,
    snapTolerance: number = Math.PI / 18,
    snapIncrement: number = Math.PI / 4,
    rotatedAngle: number = 0
  ): number => {
    let adjustedAngle =
      this.convertAngle0To2Pi(angle - (2 * Math.PI - rotatedAngle)) %
      (2 * Math.PI);

    if (!snap) return adjustedAngle;

    const modulusAdjustedAngle = adjustedAngle % snapIncrement;
    if (
      modulusAdjustedAngle < snapTolerance ||
      Math.abs(snapIncrement - modulusAdjustedAngle) < snapTolerance
    ) {
      adjustedAngle = Math.round(adjustedAngle / snapIncrement) * snapIncrement;
    }
    return adjustedAngle + (2 * Math.PI - rotatedAngle);
  };

  public static createItemFromAsset = (asset: Asset): Item => {
    let groupId;
    if (asset.groupId) {
      groupId = asset.groupId;
    } else {
      groupId = Utils.guid();
    }

    const item = new (Factory.getClass(asset.classType))({ ...asset, groupId });
    return item;
  };

  public static itemLoader = (
    onLoad: (gltf: GLTF) => void,
    onProgress: (event: ProgressEvent) => void,
    onError: (event: ErrorEvent) => void,
    asset: Asset,
    cb?: () => void
  ) => {
    if (cb) {
      cb();
    }
    const host = import.meta.env.VITE_APP_PLACEZ_API_URL;
    const orgId = (store.getState() as ReduxState).oidc.user.profile.organization_id;
    const mediaAssetUrl = `${host}/Organization/${orgId}/MediaAssetFile/${asset.sku}`;

    Utils.loader.load(mediaAssetUrl, onLoad, onProgress, onError);
  };

  public static preloadAsset = (asset: Asset) => {
    const loadPromises: Promise<unknown>[] = [];
    loadPromises.push(Utils.promiseLoad(asset));
    if (asset.modifiers) {
      if (
        asset.modifiers.centerpieceMod &&
        asset.modifiers.centerpieceMod.centerpieceAsset
      ) {
        loadPromises.push(
          Utils.promiseLoad(asset.modifiers.centerpieceMod.centerpieceAsset)
        );
      }
      if (asset.modifiers.chairMod && asset.modifiers.chairMod.chairAsset) {
        loadPromises.push(
          Utils.promiseLoad(asset.modifiers.chairMod.chairAsset)
        );
      }
      if (
        asset.modifiers.placeSettingMod &&
        asset.modifiers.placeSettingMod.placeSettingAsset
      ) {
        loadPromises.push(
          Utils.promiseLoad(asset.modifiers.placeSettingMod.placeSettingAsset)
        );
      }
      if (asset.modifiers.linenMod && asset.modifiers.linenMod.linenAsset) {
        loadPromises.push(
          Utils.promiseLoad(asset.modifiers.linenMod.linenAsset)
        );
      }
    }
    return (Promise as any).allSettled(loadPromises);
  };

  public static promiseLoad = (asset: Asset): Promise<Asset> => {
    return new Promise((resolve, reject) => {
      Utils.itemLoader(
        (gltf: GLTF) => {
          const cleanMesh = Utils.cleanExport(gltf.scene, asset.sku);
          Utils.applyCustomMaterials(cleanMesh, asset.materialMask)
            .then(() => {
              const mToCm = new Matrix4().makeScale(100, 100, 100);
              cleanMesh.applyMatrix4(mToCm);
              if (
                asset.extensionProperties &&
                asset.extensionProperties.enviromentMap
              ) {
                Utils.addEnvMap(cleanMesh);
              }

              asset.gltf = cleanMesh.clone();
              resolve(asset);
            })
            .catch((e) => {
              reject(`error applying custom material on ${asset.id}`);
            });
        },
        () => {},
        (event: ErrorEvent) => {
          reject(
            `error loading ${asset.name} for ${asset.id} because ${event}`
          );
        },
        asset
      );
    });
  };

  public static getGridCellSize(
    viewWidth: number = 500,
    units: string
  ): GridCell {
    const gridCellLocked = getFromLocalStorage('gridCellLocked');
    const gridCellSize = getFromLocalStorage('gridCellSize') as GridCell;

    if (gridCellLocked && gridCellSize !== undefined) return gridCellSize;

    const cellSize = {
      cmSize: 100,
      units,
    };

    if (units === 'cm') {
      switch (true) {
        case viewWidth <= 100:
          cellSize.cmSize = 10;
          cellSize.units = 'cm';
          break;
        case viewWidth <= 1000:
          cellSize.cmSize = 100;
          cellSize.units = 'm';
          break;
        case viewWidth <= 5000:
          cellSize.cmSize = 500;
          cellSize.units = 'cm';
          break;
        case viewWidth <= 20000:
          cellSize.cmSize = 1000;
          cellSize.units = 'm';
          break;
        case viewWidth <= 50000:
          cellSize.cmSize = 5000;
          cellSize.units = 'm';
          break;
        case viewWidth <= 100000:
          cellSize.cmSize = 10000;
          cellSize.units = 'm';
          break;
        case viewWidth <= 1000000:
          cellSize.cmSize = 100000;
          cellSize.units = 'km';
          break;
        default:
          cellSize.cmSize = 1000000;
          cellSize.units = 'km';
      }
    }

    if (
      [ValidUnits.ft, ValidUnits.ftIn, ValidUnits.in].includes(
        units as ValidUnits
      )
    ) {
      const viewWidthFt = Utils.convertUnitsFromTo(viewWidth, 'cm', 'ft');
      switch (true) {
        case viewWidthFt <= 20:
          cellSize.cmSize = Utils.convertUnitsFromTo(1, 'ft', 'cm');
          cellSize.units = 'ft';
          break;
        case viewWidthFt <= 60:
          cellSize.cmSize = Utils.convertUnitsFromTo(5, 'ft', 'cm');
          cellSize.units = 'ft';
          break;
        case viewWidthFt <= 140:
          cellSize.cmSize = Utils.convertUnitsFromTo(10, 'ft', 'cm');
          cellSize.units = 'ft';
          break;
        case viewWidthFt <= 300:
          cellSize.cmSize = Utils.convertUnitsFromTo(25, 'ft', 'cm');
          cellSize.units = 'ft';
          break;
        case viewWidthFt <= 500:
          cellSize.cmSize = Utils.convertUnitsFromTo(50, 'ft', 'cm');
          cellSize.units = 'ft';
          break;
        case viewWidthFt <= 1000:
          cellSize.cmSize = Utils.convertUnitsFromTo(100, 'ft', 'cm');
          cellSize.units = 'ft';
          break;
        default:
          cellSize.cmSize = Utils.convertUnitsFromTo(500, 'ft', 'cm');
          cellSize.units = 'ft';
      }
    }

    return cellSize;
  }

  public static roundTo(num, step) {
    return Math.floor(num / step + 0.5) * step;
  }

  public static assetsEqual = (asset1: Asset, asset2: Asset): boolean => {
    const assetIdsEqual = asset1.resourcePath === asset2.resourcePath;
    const materialMaskUndefined =
      asset1.materialMask === undefined && asset2.materialMask === undefined;
    const materialMaskEqual = materialMaskUndefined
      ? true
      : JSON.stringify(asset1.materialMask) ===
        JSON.stringify(asset2.materialMask);
    return assetIdsEqual && materialMaskEqual;
  };

  public static traverseMaterials(object, callback) {
    object.traverse((node) => {
      if (!node.isMesh) return;
      const materials = Array.isArray(node.material)
        ? node.material
        : [node.material];
      materials.forEach((material: THREE.MeshPhysicalMaterial) => {
        if (material) {
          callback(material);
        }
      });
    });
  }

  public static addEnvMap(mesh: THREE.Mesh): void {
    Utils.traverseMaterials(mesh, (material) => {
      if (
        material.isMeshStandardMaterial ||
        material.isGLTFSpecularGlossinessMaterial
      ) {
        material.envMap = PlacezEnvMap;
        material.needsUpdate = true;
      }
    });
  }

  public static addLabelSprite(label: BlueLabel, sprite: THREE.Sprite): void {
    labelSprites[Utils.hash(JSON.stringify(label))] = sprite;
  }

  public static getLabelSprite(label: BlueLabel): THREE.Sprite {
    return labelSprites[Utils.hash(JSON.stringify(label))];
  }

  private static hash(input: string): number {
    let hash = 0,
      i,
      chr;
    if (input.length === 0) return hash;
    for (i = 0; i < input.length; i++) {
      chr = input.charCodeAt(i);
      hash = (hash << 5) - hash + chr;
      hash |= 0; // Convert to 32bit integer
    }
    return hash;
  }

  public static positionBufferToVec3Corners(
    geometry: BufferGeometry,
    matrix?: Matrix4
  ): Vector3[] {
    const positions = [...geometry.getAttribute('position').array];
    const vec3Points = positions.reduce((acc, curr, index, arr) => {
      if (index % 3 !== 0) return acc;
      const newVec = new Vector3(arr[index], arr[index + 1], arr[index + 2]);
      if (matrix) {
        newVec.applyMatrix4(matrix);
      }
      acc.push(newVec);
      return acc;
    }, []);
    vec3Points.splice(3, 2);
    return vec3Points;
  }

  public static vec3ToBuffer(points: Vector3[]): Float32BufferAttribute {
    return new Float32BufferAttribute(
      points.reduce((acc, curr) => {
        acc.push(...curr.toArray());
        return acc;
      }, []),
      3
    );
  }

  public static cornersToRectPoints(points: Vector3[]): Vector3[] {
    return [
      new Vector3().copy(points[0]),
      new Vector3().copy(points[1]),
      new Vector3().copy(points[2]),

      new Vector3().copy(points[0]),
      new Vector3().copy(points[2]),
      new Vector3().copy(points[3]),
    ];
  }

  public static getAssetUrl = (window, asset: Asset): string => {
    return asset?.previewPath
      ? `${import.meta.env.VITE_APP_PLACEZ_API_URL}/${asset.previewPath}`
      : '';
  };

  public static getMeshTargetSpecs = (targetMesh: Mesh): TargetSpecs => {
    const bBox = new Box3().setFromObject(targetMesh);
    const sizeVec = new Vector3();
    bBox.getSize(sizeVec);
    const diagonal = sizeVec.length();
    const center = new Vector3();
    bBox.getCenter(center);
    const centerOffset = new Vector3().copy(center).setY(150);

    return {
      size: { x: sizeVec.x, z: sizeVec.z },
      center,
      centerOffset,
      diagonal,
    };
  };

  public static distanceAlongEllipse = (a, b, startAngle, endAngle): number => {
    const fixedStartAngle =
      startAngle < 0 ? startAngle + 2 * Math.PI : startAngle;
    let fixedEndAngle = endAngle < 0 ? endAngle + 2 * Math.PI : endAngle;
    if (fixedEndAngle < fixedStartAngle) {
      fixedEndAngle += 2 * Math.PI;
    }

    // start pi, pi / 8
    let d = 0;
    const arcAngle = fixedEndAngle - fixedStartAngle;
    let angle = fixedStartAngle;
    let progression = 0;
    let x, y;
    let x0 = a * Math.cos(angle);
    let y0 = b * Math.sin(angle);
    const h = 0.01;
    while (progression <= arcAngle) {
      x = a * Math.cos(angle);
      y = b * Math.sin(angle);
      d += this.distance(x0, y0, x, y);
      x0 = x;
      y0 = y;
      angle += h;
      progression += h;
    }

    return d;
  };

  public static anglesForEllipse = (
    b,
    a,
    startAngle,
    endAngle,
    width,
    evenSpacing = true,
    segments?: number
  ): number[] => {
    const fixedStartAngle =
      startAngle < 0 ? startAngle + 2 * Math.PI : startAngle;
    let fixedEndAngle = endAngle < 0 ? endAngle + 2 * Math.PI : endAngle;
    if (fixedEndAngle <= fixedStartAngle) {
      fixedEndAngle += 2 * Math.PI;
    }

    const angles = [];
    const circumference = Utils.distanceAlongEllipse(
      a,
      b,
      fixedStartAngle,
      fixedEndAngle
    );

    let angle = fixedStartAngle;

    let x, y;
    let theta;
    let slices = Math.floor(circumference / width);
    if (segments) slices = segments;
    const slice = circumference / slices;

    //start position
    let x0 = a * Math.cos(angle);
    let y0 = b * Math.sin(angle);
    if (evenSpacing) {
      angles.push(angle);
      for (let index = 1; index < slices; index++) {
        let dist = 0;
        while (dist < slice) {
          x = a * Math.cos(angle);
          y = b * Math.sin(angle);
          dist += this.distance(x0, y0, x, y);
          x0 = x;
          y0 = y;
          angle += 0.0001;
        }
        theta = Math.atan2(y, x);
        angles.push(theta);
      }
    } else {
      if (segments % 2 === 1) {
        //odd number of chairs
        angles.push(angle);
        for (let index = 1; index < segments; index += 2) {
          let dist = 0;
          while (dist < width) {
            x = a * Math.cos(angle);
            y = b * Math.sin(angle);
            dist += this.distance(x0, y0, x, y);
            x0 = x;
            y0 = y;
            angle += 0.0001;
          }
          theta = Math.atan2(y, x);
          angles.push(theta);
          angles.push(fixedStartAngle - (theta - fixedStartAngle));
        }
      } else {
        // even number of chairs
        for (let index = 0; index < segments; index += 2) {
          let dist = 0;
          if (index === 0) {
            while (dist < width / 2) {
              x = a * Math.cos(angle);
              y = b * Math.sin(angle);
              dist += this.distance(x0, y0, x, y);
              x0 = x;
              y0 = y;
              angle += 0.0001;
            }
            theta = Math.atan2(y, x);
            angles.push(theta);
            angles.push(fixedStartAngle - (theta - fixedStartAngle));
          } else {
            while (dist < width) {
              x = a * Math.cos(angle);
              y = b * Math.sin(angle);
              dist += this.distance(x0, y0, x, y);
              x0 = x;
              y0 = y;
              angle += 0.0001;
            }
            theta = Math.atan2(y, x);
            angles.push(theta);
            angles.push(fixedStartAngle - (theta - fixedStartAngle));
          }
        }
      }
    }
    return angles;
  };

  private static factor = (num) => {
    const factors = [];
    // for(let i = 1; i <= Math.sqrt(num); i++) {
    for (let i = 1; i <= num; i++) {
      // check if number is a factor
      if (num % i == 0) {
        factors.push([i, num / i]);
      }
    }
    return factors;
  };

  public static closestRowColShape = (
    minimumItems,
    maxCols,
    maxRows,
    aspect
  ): number[] => {
    let minFactorableItems = minimumItems;

    const factor = (minFactorableItems) =>
      Utils.factor(minFactorableItems).filter((factor) => {
        return factor[0] <= maxCols && factor[1] <= maxRows;
      });

    while (
      factor(minFactorableItems).length === 0 &&
      minFactorableItems < maxCols * maxRows
    ) {
      minFactorableItems++;
    }

    const factors = factor(minFactorableItems);

    if (factors.length === 0) return [maxCols, maxRows];

    const bestAspect = factors.reduce(
      (bestAspect, factor) => {
        const distance = Math.pow(aspect - bestAspect[0] / bestAspect[1], 2);
        const newDistance = Math.pow(aspect - factor[0] / factor[1], 2);
        if (newDistance <= distance) {
          bestAspect = factor;
        }
        return bestAspect;
      },
      [100, 1]
    );

    return bestAspect;
  };

  public static rgbaToRgb = (rgbaString: string) => {
    if (rgbaString.includes('rgba')) {
      const pieces = rgbaString
        .split('(')
        .join(',')
        .split(')')
        .join(',')
        .split(',');
      pieces.pop();
      pieces.pop();
      pieces.shift();
      return `rgb(${pieces.join(',')})`;
    }
    return rgbaString;
  };

  public static calculateLuminance(hexColor) {
    let r, g, b;

    // If hex color has hashtag, remove it
    if (hexColor.charAt(0) === '#') {
      hexColor = hexColor.substring(1);
    }

    r = parseInt(hexColor.substring(0, 2), 16) / 255;
    g = parseInt(hexColor.substring(2, 4), 16) / 255;
    b = parseInt(hexColor.substring(4, 6), 16) / 255;

    // Use gamma correct luminance
    const gammaCorrect = (color) => {
      if (color <= 0.03928) {
        return color / 12.92;
      } else {
        return Math.pow((color + 0.055) / 1.055, 2.4);
      }
    };

    r = gammaCorrect(r);
    g = gammaCorrect(g);
    b = gammaCorrect(b);

    return 0.2126 * r + 0.7152 * g + 0.0722 * b; // ITU-R BT.709
  }

  public static scaleFactor(scale: number, damping = 5): number {
    const dampenedScale = Math.abs(scale) / damping + 1;
    return Math.pow(dampenedScale, Math.sign(scale)) || 1;
  }

  public static scaleFactorFromScale(
    transformationScale: number,
    damping = 5
  ): number {
    if (transformationScale === 1) return 0;
    const sign = transformationScale < 1 ? -1 : 1;
    const dampenedScale = Math.pow(Math.abs(transformationScale), 1 / sign);
    const originalScale = (dampenedScale - 1) * damping * sign;
    return originalScale;
  }

  public static clamp = (value: number, min: number, max: number): number =>
    Math.min(Math.max(value, min), max);

  public static currencyFormat(amount: number): string {
    return '$' + amount.toFixed(2).replace(/(\d)(?=(\d{3})+(?!\d))/g, '$1,');
  }

  public static GetInitials(names: string): string {
    return names
      .split(' ')
      .map((n) => n[0].toUpperCase())
      .join('');
  }

  public static isLargeObjectEmpty(obj: object): boolean {
    for (const _ in obj) {
      console.log(_)
      return false; // If the loop runs, the object is not empty
    }
    return true; // If the loop never runs, the object is empty
  }
}


export enum BillingRate {
  PerDay = 24,
  PerHour = 1,
  FlatRate = 0,
}

export const billingRate = [
  {label: 'PerDay', value: 24},
  {label: 'PerHour', value: 1},
  {label: 'FlatRate', value: 0},
]
Object.freeze(billingRate);

export interface ThreeDimensionalPoint {
  x: number;
  y: number;
  z: number;
}

export interface GridCell {
  cmSize: number;
  units: string;
}

export const materialMaps = [
  'map',
  'alphaMap',
  'bumpMap',
  'displacementMap',
  'emissiveMap',
  'roughnessMap',
  'aoMap',
];

const labelSprites: { [key: number]: THREE.Sprite } = {};

// init chair number labels to 32
for (let i = 1; i <= 32; i++) {
  new CSS3DLabelMaker(
    {
      labelText: `${i}`,
      margin: 2,
      borderRadius: 5,
      borderThickness: 2,
    },
    CameraLayers.ChairNumberLabel
  );
}
