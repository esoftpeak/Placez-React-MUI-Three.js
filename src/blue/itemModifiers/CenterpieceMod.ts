import { Modifier } from './Modifier';
import { Asset } from '../items/asset';
import { Item } from '../items/item';
import { Box3, Vector3, Matrix4, Object3D } from 'three';
import { TableTypes } from './ChairMod';
import { CameraLayers } from '../../models/BlueState';
import { ModifierBase } from './ModifierBase';

export interface CenterpieceParams extends ModifierBase {
  tableType?: TableTypes;
  centerpieceAsset?: Asset;
  centerpieceAssetId?: number;
  numberOfCenterpieces?: number;
  centerpiecePositions?: number[];
  transformation?: number[];
}

export const defaultCenterPieceParams: CenterpieceParams = {
  tableType: TableTypes.Square,
  centerpieceAsset: undefined,
  centerpieceAssetId: null,
  numberOfCenterpieces: 1,
  centerpiecePositions: [],
};

export class CenterpieceMod extends Modifier {
  public tableType: TableTypes;
  public models: Object3D;
  public centerpieceAsset: Asset;
  public params: CenterpieceParams;
  public centerpiecePositions: any[];
  public numberOfCenterpieces: number;

  constructor(item: Item) {
    super(item);
    this.models = new Object3D();
    this.params = item.asset.modifiers.centerpieceMod;
  }

  public build() {
    return new Promise((resolve, reject) => {
      this.params = this.item.asset.modifiers.centerpieceMod;
      this.item.remove(this.modifiers);
      this.tableType = this.params.tableType
        ? this.params.tableType
        : TableTypes.Square;
      this.centerpieceAsset = this.params.centerpieceAsset
        ? this.params.centerpieceAsset
        : undefined;
      this.asset = this.centerpieceAsset;
      this.centerpiecePositions = this.params.centerpiecePositions
        ? this.params.centerpiecePositions
        : [];
      this.numberOfCenterpieces = this.params.numberOfCenterpieces
        ? this.params.numberOfCenterpieces
        : 0;
      if (this.asset) {
        this.loadGLTF(
          this.centerpieceAsset,
          this.buildCenterpiece(resolve).bind(this),
          resolve
        );
      } else {
        resolve(undefined); // TODO this should reject
      }
    });
  }

  private buildCenterpiece = (resolve) => (centerpiece) => {
    this.models.remove(...this.models.children); // THIS is how children should be removed
    if (this.centerpiecePositions.length === 0) {
      const bbox = new Box3().setFromObject(centerpiece);
      const size = new Vector3();
      bbox.getSize(size);
      if (
        this.tableType === TableTypes.Square ||
        this.tableType === TableTypes.Banquet
      ) {
        this.centerpiecePositions = this.computeRectCenterpiecePositions();
      } else if (
        this.tableType === TableTypes.Round ||
        this.tableType === TableTypes.Oval
      ) {
        this.centerpiecePositions = this.computeRoundSeatPositions();
      } else if (this.tableType === TableTypes.Sweetheart) {
        this.centerpiecePositions = this.computeHalfRoundPosition();
      } else if (this.tableType === TableTypes.Serpentine) {
        this.centerpiecePositions = this.computeRoundSeatPositions();
      }
    }

    for (const cp in this.centerpiecePositions) {
      const mat4 = new Matrix4().fromArray(this.centerpiecePositions[cp]);
      const singleCenterpiece = centerpiece.clone();
      singleCenterpiece.castShadow = true;
      singleCenterpiece.applyMatrix4(mat4);
      singleCenterpiece.updateMatrix();
      singleCenterpiece.name = 'chair';
      singleCenterpiece.layers.set(CameraLayers.Items);
      if (this.params?.transformation) {
        const mat4 = new Matrix4().fromArray(this.params.transformation);
        const scale = new Vector3().setFromMatrixScale(mat4);
        singleCenterpiece.scale.multiply(scale);
      }
      this.models.add(singleCenterpiece);
    }
    this.modifiers.add(this.models);

    this.item.add(this.modifiers);
    this.scene?.update();
    resolve();
  };

  public computeRectCenterpiecePositions(): number[][] {
    // let centerpiecesLeft = Math.floor(this.numberOfCenterpieces);

    if (this.numberOfCenterpieces === 0) {
      return [];
    }

    // Compute number of Centerpieces
    // this.maxSeats = table.reduce(
    //   (maxSeats: number, side: TableSideParams) => {
    //     return maxSeats + Math.floor(side.space / seatWidth);
    //   },
    //   0
    // );

    const out: number[][] = [];
    const mat = new Matrix4();
    for (let cp = 1; cp <= this.numberOfCenterpieces; cp++) {
      const pos = new Vector3();
      if (this.item.getWidth() > this.item.getDepth()) {
        pos.x =
          (cp * this.item.getWidth()) / (this.numberOfCenterpieces + 1) -
          this.item.getWidth() / 2;
      } else {
        pos.z =
          (cp * this.item.getDepth()) / (this.numberOfCenterpieces + 1) -
          this.item.getWidth() / 2;
      }
      pos.y = this.item.getHeight();
      mat.setPosition(pos);
      const result: Matrix4 = mat.clone();
      out.push(result.toArray());
    }

    return out;
  }

  public computeRoundSeatPositions(): number[][] {
    const out: number[][] = [];
    const pos = new Vector3();
    const mat = new Matrix4();
    pos.y = this.item.getHeight();
    mat.setPosition(pos);
    const result = mat.clone();
    out.push(result.toArray());
    return out;
  }

  public computeHalfRoundPosition(): number[][] {
    const out: number[][] = [];
    const pos = new Vector3();
    const mat = new Matrix4();
    pos.y = this.item.getHeight();
    pos.z = (2 / 3) * this.item.getDepth();
    mat.setPosition(pos);
    const result = mat.clone();
    out.push(result.toArray());
    return out;
  }
}
