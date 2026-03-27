import { Matrix4, Mesh, Object3D, Quaternion, Vector2, Vector3 } from 'three';
import { store } from '../..';
import { SetBatchSettings } from '../../reducers/blue';
import { Utils } from '../core/utils';
import { Asset } from '../items';
import { Item } from '../items/item';
import { Model } from './model';
import { SeatInstance } from '../itemModifiers/ChairMod';
import { SkuType } from '../items/asset';
import { ToastMessage } from '../../reducers/ui'

export type BatchAddParams = GuestOrRowCol;

export interface GuestOrRowCol extends SpacingBatchAddParams {
  batchRows?: number;
  batchColumns?: number;
  maxGuest?: number;
}

export interface SpacingBatchAddParams extends AisleParams {
  asset: Asset;
  rowSpacing: number;
  colSpacing: number;
  batchType: BatchTypes;
  rotation: number;
  skew: number;
}

interface AisleParams {
  rowAisleSpacing: number;
  columnAisleSpacing: number;
  numberOfRowAisles: number;
  numberOfColumnAisles: number;
}

export enum BatchTypes {
  grid = 'Grid',
  family = 'Family',
  banquet = 'Banquet',
  uShape = 'U-Shape',
  hollowSquare = 'Square',
  theater = 'Theater',
  cabaret = 'Cabaret',
  circle = 'Circle',
  horseshoe = 'Horseshoe',
  linear = 'Linear',
  theaterRound = 'TheaterRound',

  random = 'random',
}

export const buildBatchItem = (
  tempItem,
  asset,
  position,
  localQuaternion = new Quaternion(),
  globalQuaternion,
  cb
) => {
  const globalRotation = new Matrix4().makeRotationFromQuaternion(
    globalQuaternion
  );
  const localRotation = new Matrix4().makeRotationFromQuaternion(
    localQuaternion
  );
  const transformation = new Matrix4()
    .fromArray(asset.transformation)
    .premultiply(localRotation)
    .premultiply(globalRotation)
    .setPosition(position.x, position.y, position.z);

  const newPosition = new Vector3();
  const newRotation = new Quaternion();
  const scale = new Vector3();
  transformation.decompose(newPosition, newRotation, scale);

  asset.instanceId = Utils.guid();
  asset.transformation = transformation.toArray();
  asset.gltf = tempItem.children[0].clone() as Mesh;
  asset.children = tempItem.children
    .slice(1)
    .filter((child) => child instanceof Object3D)
    .map((child) => {
      return child.clone() as Mesh;
    });
  // add asset, fixture, showCollision
  cb(asset, false, false);
};

const removeChildren = (item: Item) => {
  if (item.children && item.children.length > 1) {
    for (let i = item.children.length - 1; i > 0; i--) {
      item.remove(item.children[i]);
    }
  }
};

const localToWorld = (
  localPosition: Vector3,
  batchCenter: Vector3,
  batchQuaternion: Quaternion,
  batchPosition: Vector3
): Vector3 => {
  return localPosition
    .sub(batchCenter)
    .applyQuaternion(batchQuaternion)
    .add(batchPosition);
};

const buildGrid = (gridObject) => {
  let colOffset = gridObject.padX;
  for (let i = 1; i <= gridObject.colGroups; i++) {
    let zMin = gridObject.padY;
    let xMin;
    for (let j = 1; j <= gridObject.rowGroups; j++) {
      let rowGroup = 0;
      rowGroup = j - (gridObject.rowGroups + 0.25) / 2;
      const even = gridObject.rowGroups % 2 === 0;
      if (rowGroup < 0 || !even) {
        rowGroup = Math.floor(rowGroup);
      } else {
        rowGroup = Math.ceil(rowGroup);
      }

      let xAdjustFactor = 0;
      let zAdjustFactor = 1;
      let rowGroupAdjustment = 0;

      if (gridObject.skew !== 0) {
        gridObject.rowAngle =
          rowGroup === 0
            ? 0
            : (rowGroup / Math.floor(gridObject.rowGroups / 2)) *
              gridObject.skew;
        const localRotationAngle =
          gridObject.tempItem.asset.modifiers &&
          gridObject.tempItem.asset.skuType === 'TBL'
            ? -Math.PI / 2
            : 0;
        gridObject.localQuaternion.setFromAxisAngle(
          new Vector3(0, 1, 0),
          gridObject.rowAngle + localRotationAngle
        );
        xAdjustFactor =
          Math.sin(gridObject.rowAngle) === 0
            ? 1
            : Math.sin(Math.abs(gridObject.rowAngle)); // multiply * boundaryDepth
        zAdjustFactor = Math.cos(Math.abs(gridObject.rowAngle)); // multiply * boundaryDepth

        if (rowGroup !== 0) {
          for (let i = 0; i < Math.abs(rowGroup); i++) {
            rowGroupAdjustment +=
              (i / Math.abs(rowGroup)) *
              gridObject.boundaryDepth *
              xAdjustFactor *
              gridObject.rowsPerGroup;
          }
        }
      }

      for (let row = 0; row < gridObject.rowsPerGroup; row++) {
        xMin = 0;
        for (let col = 0; col < gridObject.columnsPerGroup; col++) {
          const asset: Asset = JSON.parse(
            JSON.stringify(gridObject.tempItem.asset)
          );
          asset.groupId = gridObject.groupId;

          let skew = 0;

          if (rowGroup > 0) {
            skew =
              rowGroupAdjustment +
              row * gridObject.boundaryDepth * xAdjustFactor;
          } else if (rowGroup === 0) {
            skew = 0;
          } else {
            skew =
              rowGroupAdjustment +
              (gridObject.rowsPerGroup - row - 1) *
                gridObject.boundaryDepth *
                xAdjustFactor;
          }

          const itemPosition = new Vector3(
            colOffset + xMin + skew - gridObject.boundaryHalfWidth,
            0,
            zMin - gridObject.boundaryHalfDepth * zAdjustFactor
          );
          buildBatchItem(
            gridObject.tempItem,
            asset,
            localToWorld(
              itemPosition,
              gridObject.center,
              gridObject.quaternion,
              gridObject.position
            ),
            gridObject.localQuaternion,
            gridObject.quaternion,
            gridObject.cb
          );
          xMin += gridObject.boundaryWidth;
        }
        zMin += gridObject.boundaryDepth * zAdjustFactor;
      }
      zMin += gridObject.adjustedRowAisleSpacing;
    }

    colOffset += gridObject.adjustedColumnAisleSpacing;
    colOffset += gridObject.columnsPerGroup * gridObject.boundaryWidth;
  }
};

const gridByMaxGuest = (
  baseWidth,
  depth,
  position,
  quaternion,
  itemUIConfg: BatchAddParams,
  tempItem: Item,
  groupId: string,
  model: Model,
  cb: (asset: Asset, fixture?: boolean, showCollision?: boolean) => any
) => {
  const center = new Vector3(baseWidth / 2, 0, depth / 2);
  const aspect = baseWidth / depth;
  const guest = itemUIConfg.maxGuest;

  const {
    colSpacing,
    numberOfRowAisles,
    rowAisleSpacing,
    numberOfColumnAisles,
    columnAisleSpacing,
    rotation,
    skew,
  } = itemUIConfg;
  const rowSpacing =
    itemUIConfg.batchType === BatchTypes.family ? 0 : itemUIConfg.rowSpacing;
  const adjustedRowAisleSpacing = rowAisleSpacing - rowSpacing * 2;
  const adjustedColumnAisleSpacing = columnAisleSpacing - colSpacing * 2;
  const diag1 = new Vector2(tempItem.getWidth(), tempItem.getDepth());
  const diag2 = new Vector2(tempItem.getWidth(), -tempItem.getDepth());
  const adjustedRotation = rotation;
  const rowAngle = skew;

  diag1.rotateAround(new Vector2(0, 0), adjustedRotation);
  diag2.rotateAround(new Vector2(0, 0), adjustedRotation);

  const localQuaternion = new Quaternion().setFromAxisAngle(
    new Vector3(0, 1, 0),
    adjustedRotation
  );

  const boundaryDepth =
    Math.max(Math.abs(diag1.y), Math.abs(diag2.y)) + 2 * rowSpacing + 0.00001;
  const boundaryHalfDepth = -boundaryDepth / 2.0;
  let maxRows = Math.ceil(
    (depth - numberOfRowAisles * adjustedRowAisleSpacing) / boundaryDepth - 1
  );
  let rowGroups = numberOfRowAisles + 1;
  let rowsPerGroup = Math.floor(maxRows / rowGroups);

  let widthAdjustment = 0;
  for (let i = 0; i <= Math.floor(rowGroups / 2); i++) {
    widthAdjustment +=
      (((i / Math.abs(Math.floor(rowGroups / 2))) * boundaryDepth) /
        Math.tan(Math.PI / 2 - skew)) *
      rowsPerGroup;
  }

  const width = rowAngle === 0 ? baseWidth : baseWidth - widthAdjustment;

  const boundaryWidth =
    Math.max(Math.abs(diag1.x), Math.abs(diag2.x)) + 2 * colSpacing + 0.00001;
  const boundaryHalfWidth = -boundaryWidth / 2.0;
  let maxCols = Math.ceil(
    (width - numberOfColumnAisles * adjustedColumnAisleSpacing) /
      boundaryWidth -
      1
  );

  const seats = tempItem?.asset?.modifiers?.chairMod?.seatPositions?.filter(
    (seat: SeatInstance) => !seat.hidden
  )?.length;

  const countPerItem = seats && seats !== 0 ? seats : 1;
  const maxPossibleGuest = maxCols * maxRows * countPerItem;

  if (maxPossibleGuest < itemUIConfg.maxGuest) {
    if (seats > 0) {
      store.dispatch(ToastMessage('Batch area is too small for Guest Count'));
    } else {
      store.dispatch(ToastMessage('Batch area is too small for Item Count'));
    }
  } else if (
    itemUIConfg.maxGuest !== 0 &&
    maxPossibleGuest &&
    maxPossibleGuest > itemUIConfg.maxGuest
  ) {
    // build
    //reduce to minimum tables adjust padding
    const minNumberAssets = Math.ceil(itemUIConfg.maxGuest / countPerItem);
    const shape = Utils.closestRowColShape(
      minNumberAssets,
      maxCols,
      maxRows,
      aspect
    );
    maxRows = shape[1];
    maxCols = shape[0];
  } else {
    // return;
  }

  const maxNumberOfColumnAisles =
    numberOfColumnAisles > maxCols - 1 ? maxCols - 1 : numberOfColumnAisles;
  const maxNumberOfRowAisles =
    numberOfRowAisles > maxRows - 1 ? maxRows - 1 : numberOfRowAisles;

  const colGroups = maxNumberOfColumnAisles + 1;
  const columnsPerGroup = Math.floor(maxCols / colGroups);

  rowGroups = maxNumberOfRowAisles + 1;
  rowsPerGroup = Math.floor(maxRows / rowGroups);

  const padX =
    (width -
      maxNumberOfColumnAisles * adjustedColumnAisleSpacing -
      colGroups * columnsPerGroup * boundaryWidth) /
    2.0;
  const padY =
    (depth -
      maxNumberOfRowAisles * adjustedRowAisleSpacing -
      rowGroups * boundaryDepth * rowsPerGroup) /
    2.0;

  if (maxCols === 0 || maxRows === 0) {
    store.dispatch(SetBatchSettings());
    store.dispatch(SetBatchSettings());
    store.dispatch(ToastMessage('Batch area too small'));
    return;
  }

  const gridParams = {
    ...itemUIConfg,
    rowAngle,
    skew,
    rowGroups,
    colGroups,
    rowsPerGroup,
    columnsPerGroup,
    boundaryWidth,
    boundaryDepth,
    adjustedColumnAisleSpacing,
    adjustedRowAisleSpacing,
    tempItem,
    groupId,
    padX,
    padY,
    center,
    quaternion,
    position,
    localQuaternion,
    cb,
    boundaryHalfDepth,
    boundaryHalfWidth,
  };
  buildGrid(gridParams);
};

const gridByRowsColumns = (
  baseWidth,
  depth,
  position,
  quaternion,
  itemUIConfg: BatchAddParams,
  tempItem: Item,
  groupId: string,
  model: Model,
  cb: (asset: Asset, fixture?: boolean, showCollision?: boolean) => any
) => {
  const center = new Vector3(baseWidth / 2, 0, depth / 2);
  const {
    colSpacing,
    numberOfRowAisles,
    rowAisleSpacing,
    numberOfColumnAisles,
    columnAisleSpacing,
    rotation,
    skew,
  } = itemUIConfg;
  const rowSpacing =
    itemUIConfg.batchType === BatchTypes.family ? 0 : itemUIConfg.rowSpacing;
  const adjustedRowAisleSpacing = rowAisleSpacing - rowSpacing * 2;
  const adjustedColumnAisleSpacing = columnAisleSpacing - colSpacing * 2;
  const diag1 = new Vector2(tempItem.getWidth(), tempItem.getDepth());
  const diag2 = new Vector2(tempItem.getWidth(), -tempItem.getDepth());
  const adjustedRotation = rotation;
  const rowAngle = skew;

  diag1.rotateAround(new Vector2(0, 0), adjustedRotation);
  diag2.rotateAround(new Vector2(0, 0), adjustedRotation);

  const localQuaternion = new Quaternion().setFromAxisAngle(
    new Vector3(0, 1, 0),
    adjustedRotation
  );

  const boundaryDepth =
    Math.max(Math.abs(diag1.y), Math.abs(diag2.y)) + 2 * rowSpacing + 0.00001;
  const boundaryHalfDepth = -boundaryDepth / 2.0;
  let maxRows = Math.ceil(
    (depth - numberOfRowAisles * adjustedRowAisleSpacing) / boundaryDepth - 1
  );
  let rowGroups = numberOfRowAisles + 1;
  let rowsPerGroup = Math.floor(maxRows / rowGroups);

  let widthAdjustment = 0;
  for (let i = 0; i <= Math.floor(rowGroups / 2); i++) {
    widthAdjustment +=
      (((i / Math.abs(Math.floor(rowGroups / 2))) * boundaryDepth) /
        Math.tan(Math.PI / 2 - skew)) *
      rowsPerGroup;
  }

  const width = rowAngle === 0 ? baseWidth : baseWidth - widthAdjustment;

  const boundaryWidth =
    Math.max(Math.abs(diag1.x), Math.abs(diag2.x)) + 2 * colSpacing + 0.00001;
  const boundaryHalfWidth = -boundaryWidth / 2.0;
  let maxCols = Math.ceil(
    (width - numberOfColumnAisles * adjustedColumnAisleSpacing) /
      boundaryWidth -
      1
  );

  //ignore area max
  if (itemUIConfg.batchColumns > 0 && itemUIConfg.batchRows > 0) {
    maxCols = itemUIConfg.batchColumns;
    maxRows = itemUIConfg.batchRows;
  } else {
    maxCols = Math.min(itemUIConfg.batchColumns, maxCols);
    maxRows = Math.min(itemUIConfg.batchRows, maxRows);
  }


  const maxNumberOfColumnAisles =
    numberOfColumnAisles > maxCols - 1 ? maxCols - 1 : numberOfColumnAisles;
  const maxNumberOfRowAisles =
    numberOfRowAisles > maxRows - 1 ? maxRows - 1 : numberOfRowAisles;

  const colGroups = maxNumberOfColumnAisles + 1;
  const columnsPerGroup = Math.floor(maxCols / colGroups);

  rowGroups = maxNumberOfRowAisles + 1;
  rowsPerGroup = Math.floor(maxRows / rowGroups);

  const padX =
    (width -
      maxNumberOfColumnAisles * adjustedColumnAisleSpacing -
      colGroups * columnsPerGroup * boundaryWidth) /
    2.0;
  const padY =
    (depth -
      maxNumberOfRowAisles * adjustedRowAisleSpacing -
      rowGroups * boundaryDepth * rowsPerGroup) /
    2.0;

  if (maxCols === 0 || maxRows === 0) {
    store.dispatch(SetBatchSettings());
    store.dispatch(ToastMessage('Batch area too small'));
    return;
  }

  const gridParams = {
    ...itemUIConfg,
    rowAngle,
    skew,
    rowGroups,
    colGroups,
    rowsPerGroup,
    columnsPerGroup,
    boundaryWidth,
    boundaryDepth,
    adjustedColumnAisleSpacing,
    adjustedRowAisleSpacing,
    tempItem,
    groupId,
    padX,
    padY,
    center,
    quaternion,
    position,
    localQuaternion,
    cb,
    boundaryHalfDepth,
    boundaryHalfWidth,
  };
  buildGrid(gridParams);
};

export const grid = (
  baseWidth,
  depth,
  position,
  quaternion,
  itemUIConfg: BatchAddParams,
  tempItem: Item,
  groupId: string,
  model: Model,
  cb: (asset: Asset, fixture?: boolean, showCollision?: boolean) => any
) => {
  if (itemUIConfg.batchRows > 0 && itemUIConfg.batchColumns > 0) {
    gridByRowsColumns(
      baseWidth,
      depth,
      position,
      quaternion,
      itemUIConfg,
      tempItem,
      groupId,
      model,
      cb
    );
  } else {
    gridByMaxGuest(
      baseWidth,
      depth,
      position,
      quaternion,
      itemUIConfg,
      tempItem,
      groupId,
      model,
      cb
    );
  }
};

export const banquet = (
  width,
  depth,
  position,
  quaternion,
  itemUIConfg: BatchAddParams,
  tempItem: Item,
  groupId: string,
  model: Model,
  cb: (asset: Asset, fixture?: boolean, showCollision?: boolean) => any
) => {
  const aspect = width / depth;

  const center = new Vector3(width / 2, 0, depth / 2);
  const colSpacing = itemUIConfg.colSpacing;
  const rowSpacing = itemUIConfg.rowSpacing;
  const boundaryWidth = tempItem.getWidth() + 2 * colSpacing + 0.00001;
  const boundaryDepth = tempItem.getDepth() + 2 * rowSpacing + 0.00001;
  const boundaryHalfWidth = -boundaryWidth / 2.0;
  const boundaryHalfDepth = -boundaryDepth / 2.0;

  let maxCols = Math.ceil(width / boundaryWidth - 1);
  let maxRows = Math.ceil(depth / boundaryDepth - 1);
  if (itemUIConfg.batchColumns > 0 && itemUIConfg.batchRows > 0) {
    maxCols = itemUIConfg.batchColumns;
    maxRows = itemUIConfg.batchRows;
  }

  const seats = tempItem?.asset?.modifiers?.chairMod?.seatPositions?.filter(
    (seat: SeatInstance) => !seat.hidden
  )?.length;

  const countPerItem = seats && seats !== 0 ? seats : 1;
  const maxPossibleGuest = maxCols * maxRows * countPerItem;

  if (maxPossibleGuest < itemUIConfg.maxGuest) {
    if (seats > 0) {
      store.dispatch(ToastMessage('Batch area is too small for Guest Count'));
    } else {
      store.dispatch(ToastMessage('Batch area is too small for Item Count'));
    }
  } else if (
    itemUIConfg.maxGuest !== 0 &&
    maxPossibleGuest &&
    maxPossibleGuest > itemUIConfg.maxGuest
  ) {
    // build
    //reduce to minimum tables adjust padding
    const minNumberAssets = Math.ceil(itemUIConfg.maxGuest / countPerItem);
    const shape = Utils.closestRowColShape(
      minNumberAssets * 2,
      maxCols,
      maxRows,
      aspect
    );
    maxRows = shape[1];
    maxCols = shape[0];
  }

  const padX = (width - maxCols * boundaryWidth) / 2.0;
  const padY = (depth - maxRows * boundaryDepth) / 2.0;

  if (maxCols === 0 || maxRows === 0) {
    store.dispatch(SetBatchSettings());
    store.dispatch(ToastMessage('Batch area too small'));
    return;
  }
  for (let row = 0; row < maxRows; row++) {
    for (let col = 0; col < maxCols; col++) {
      if ((!(col % 2) && row % 2) || (col % 2 && !(row % 2))) {
        continue;
      }
      const asset: Asset = JSON.parse(JSON.stringify(tempItem.asset));
      asset.groupId = groupId;

      const xMin = col * boundaryWidth + padX;
      const zMin = row * boundaryDepth + padY;

      const itemPosition = new Vector3(
        xMin - boundaryHalfWidth,
        0,
        zMin - boundaryHalfDepth
      );

      buildBatchItem(
        tempItem,
        asset,
        localToWorld(itemPosition, center, quaternion, position),
        undefined,
        quaternion,
        cb
      );
    }
  }
};

export const hollowSquare = (
  width,
  depth,
  position,
  quaternion,
  itemUIConfg: BatchAddParams,
  tempItem: Item,
  groupId: string,
  model: Model,
  cb: (asset: Asset, fixture?: boolean, showCollision?: boolean) => any
) => {
  const asset: Asset = JSON.parse(JSON.stringify(tempItem.asset));

  asset.groupId = groupId;
  asset.modifiers.chairMod.left = false;
  asset.modifiers.chairMod.right = false;
  asset.modifiers.chairMod.top = true;
  asset.modifiers.chairMod.bottom = false;

  const customTempItem = Utils.createItemFromAsset(asset);
  customTempItem.onRegisterCallback(() => {
    hollowBuild(
      width,
      depth,
      position,
      quaternion,
      itemUIConfg,
      customTempItem,
      groupId,
      model,
      cb
    );
  });
  customTempItem.init(model);
};

export const hollowBuild = (
  width,
  depth,
  position,
  quaternion,
  itemUIConfg: BatchAddParams,
  tempItem: Item,
  groupId: string,
  model: Model,
  cb: (asset: Asset, fixture?: boolean, showCollision?: boolean) => any
) => {
  const center = new Vector3(width / 2, 0, depth / 2);

  const boundaryWidth = tempItem.getWidth() + 0.00001;
  const boundaryDepth = tempItem.getDepth() + 0.00001;
  const boundaryHalfWidth = -boundaryWidth / 2.0;
  const boundaryHalfDepth = -boundaryDepth / 2.0;

  const rotateCorners = true;

  let maxCols;
  let maxRows;
  let padX;
  let padY;

  if (rotateCorners) {
    maxCols = Math.floor((width - boundaryDepth * 2) / boundaryWidth + 2);
    maxRows = Math.floor(depth / boundaryWidth);
    padX = ((width - 2 * boundaryDepth) % boundaryWidth) / 2.0;
    padY = (depth % boundaryWidth) / 2.0;
  } else {
    maxCols = Math.floor(width / boundaryWidth);
    maxRows = Math.floor((depth - boundaryDepth) / boundaryWidth) + 1;
    padX = (width % boundaryWidth) / 2.0;
    padY = ((depth - boundaryDepth) % boundaryWidth) / 2.0;
  }

  if (maxCols === 0 || maxRows === 0) {
    store.dispatch(SetBatchSettings());
    store.dispatch(ToastMessage('Batch area too small'));
    return;
  }

  const y = new Vector3(0, 1, 0);

  for (let row = 0; row < maxRows; row++) {
    for (let col = 0; col < maxCols; col++) {
      const asset: Asset = JSON.parse(JSON.stringify(tempItem.asset));
      asset.groupId = groupId;

      let itemPosition;

      if (rotateCorners) {
        if (row === 0) {
          let xMin =
            col === 0 || col === maxCols - 1
              ? (col > 0 ? 1 : 0) * boundaryDepth +
                (col > 0 ? (col - 1) * boundaryWidth : 0)
              : boundaryDepth + (col - 1) * boundaryWidth;
          xMin += padX;
          const zMin = padY;
          const width =
            col === 0 || col === maxCols - 1
              ? boundaryHalfDepth
              : boundaryHalfWidth;
          const depth =
            col === 0 || col === maxCols - 1
              ? boundaryHalfWidth
              : boundaryHalfDepth;
          itemPosition = new Vector3(xMin - width, 0, zMin - depth);
        } else if (row === maxRows - 1) {
          let xMin =
            col === 0 || col === maxCols - 1
              ? (col > 0 ? 1 : 0) * boundaryDepth +
                (col > 0 ? (col - 1) * boundaryWidth : 0)
              : boundaryDepth + (col - 1) * boundaryWidth;
          xMin += padX;
          const zMin =
            col === 0 || col === maxCols - 1
              ? row * boundaryWidth + padY
              : (row + 1) * boundaryWidth - boundaryDepth + padY;
          const width =
            col === 0 || col === maxCols - 1
              ? boundaryHalfDepth
              : boundaryHalfWidth;
          const depth =
            col === 0 || col === maxCols - 1
              ? boundaryHalfWidth
              : boundaryHalfDepth;
          itemPosition = new Vector3(xMin - width, 0, zMin - depth);
        } else {
          let xMin =
            col === 0 || col === maxCols - 1
              ? (col > 0 ? 1 : 0) * boundaryDepth +
                (col > 0 ? (col - 1) * boundaryWidth : 0)
              : boundaryDepth + (col - 2) * boundaryWidth;
          xMin += padX;
          const zMin = row * boundaryWidth + padY;
          itemPosition = new Vector3(
            xMin - boundaryHalfDepth,
            0,
            zMin - boundaryHalfWidth
          );
        }
      } else {
        if (row === 0) {
          let xMin = col * boundaryWidth;
          xMin += padX;
          const zMin = padY;
          itemPosition = new Vector3(
            xMin - boundaryHalfWidth,
            0,
            zMin - boundaryHalfDepth
          );
        } else {
          let xMin =
            col === 0 || col === maxCols - 1
              ? col * boundaryWidth +
                (col > 0 ? boundaryWidth - boundaryDepth : 0)
              : 0;
          xMin += padX;
          const zMin = (row - 1) * boundaryWidth + padY + boundaryDepth;
          itemPosition = new Vector3(
            xMin - boundaryHalfDepth,
            0,
            zMin - boundaryHalfWidth
          );
        }
      }

      const rotation = new Quaternion();

      // rotation defines U direction hard coded for now
      if (asset.modifiers && asset.modifiers.chairMod) {
        asset.modifiers.chairMod.left = false;
        asset.modifiers.chairMod.right = false;
        asset.modifiers.chairMod.top = false;
        asset.modifiers.chairMod.bottom = false;
        asset.modifiers.chairMod.seatPositions = [];
      }

      if (row === 0 && col === 0) {
        // Top left corner
        const leftCornerAsset: Asset = JSON.parse(
          JSON.stringify(tempItem.asset)
        );

        if (rotateCorners) {
          if (
            leftCornerAsset.modifiers != null &&
            leftCornerAsset.modifiers.chairMod !== undefined
          ) {
            leftCornerAsset.modifiers.chairMod.left = false;
            leftCornerAsset.modifiers.chairMod.bottom = false;
            leftCornerAsset.modifiers.chairMod.top = true;
            leftCornerAsset.modifiers.chairMod.right = true;
          }
          rotation.setFromAxisAngle(y, Math.PI / 2);
        } else {
          if (
            leftCornerAsset.modifiers != null &&
            leftCornerAsset.modifiers.chairMod !== undefined
          ) {
            leftCornerAsset.modifiers.chairMod.left = true;
            leftCornerAsset.modifiers.chairMod.bottom = false;
            leftCornerAsset.modifiers.chairMod.top = true;
            leftCornerAsset.modifiers.chairMod.right = false;
          }
        }
        const leftCornerItem = Utils.createItemFromAsset(leftCornerAsset);
        leftCornerItem.onRegisterCallback(() => {
          buildBatchItem(
            leftCornerItem,
            leftCornerAsset,
            localToWorld(itemPosition, center, quaternion, position),
            rotation,
            quaternion,
            cb
          );
        });
        leftCornerItem.init(model);
        continue;
      } else if (row === 0 && col === maxCols - 1) {
        // Top Right Corner
        const rightCornerAsset: Asset = JSON.parse(
          JSON.stringify(tempItem.asset)
        );

        if (rotateCorners) {
          if (
            rightCornerAsset.modifiers != null &&
            rightCornerAsset.modifiers.chairMod !== undefined
          ) {
            rightCornerAsset.modifiers.chairMod.left = true;
            rightCornerAsset.modifiers.chairMod.bottom = false;
            rightCornerAsset.modifiers.chairMod.top = true;
            rightCornerAsset.modifiers.chairMod.right = false;
          }
          rotation.setFromAxisAngle(y, -Math.PI / 2);
        } else {
          if (
            rightCornerAsset.modifiers != null &&
            rightCornerAsset.modifiers.chairMod !== undefined
          ) {
            rightCornerAsset.modifiers.chairMod.left = false;
            rightCornerAsset.modifiers.chairMod.bottom = false;
            rightCornerAsset.modifiers.chairMod.top = true;
            rightCornerAsset.modifiers.chairMod.right = true;
          }
        }
        const rightCornerItem = Utils.createItemFromAsset(rightCornerAsset);
        rightCornerItem.onRegisterCallback(() => {
          buildBatchItem(
            rightCornerItem,
            rightCornerAsset,
            localToWorld(itemPosition, center, quaternion, position),
            rotation,
            quaternion,
            cb
          );
        });
        rightCornerItem.init(model);
        continue;
      } else if (row === maxRows - 1 && col === 0) {
        // Bottom Side Left
        const rightCornerAsset: Asset = JSON.parse(
          JSON.stringify(tempItem.asset)
        );

        if (rotateCorners) {
          if (
            rightCornerAsset.modifiers != null &&
            rightCornerAsset.modifiers.chairMod !== undefined
          ) {
            rightCornerAsset.modifiers.chairMod.left = true;
            rightCornerAsset.modifiers.chairMod.bottom = false;
            rightCornerAsset.modifiers.chairMod.top = true;
            rightCornerAsset.modifiers.chairMod.right = false;
          }
          rotation.setFromAxisAngle(y, Math.PI / 2);
        } else {
          if (
            rightCornerAsset.modifiers != null &&
            rightCornerAsset.modifiers.chairMod !== undefined
          ) {
            rightCornerAsset.modifiers.chairMod.left = false;
            rightCornerAsset.modifiers.chairMod.bottom = false;
            rightCornerAsset.modifiers.chairMod.top = true;
            rightCornerAsset.modifiers.chairMod.right = true;
          }
        }
        const rightCornerItem = Utils.createItemFromAsset(rightCornerAsset);
        rightCornerItem.onRegisterCallback(() => {
          buildBatchItem(
            rightCornerItem,
            rightCornerAsset,
            localToWorld(itemPosition, center, quaternion, position),
            rotation,
            quaternion,
            cb
          );
        });
        rightCornerItem.init(model);
        continue;
      } else if (row === maxRows - 1 && col === maxCols - 1) {
        // Bottom Side Right
        const leftCornerAsset: Asset = JSON.parse(
          JSON.stringify(tempItem.asset)
        );

        if (rotateCorners) {
          if (
            leftCornerAsset.modifiers != null &&
            leftCornerAsset.modifiers.chairMod !== undefined
          ) {
            leftCornerAsset.modifiers.chairMod.left = false;
            leftCornerAsset.modifiers.chairMod.bottom = false;
            leftCornerAsset.modifiers.chairMod.top = true;
            leftCornerAsset.modifiers.chairMod.right = true;
          }
          rotation.setFromAxisAngle(y, -Math.PI / 2);
        } else {
          if (
            leftCornerAsset.modifiers != null &&
            leftCornerAsset.modifiers.chairMod !== undefined
          ) {
            leftCornerAsset.modifiers.chairMod.left = true;
            leftCornerAsset.modifiers.chairMod.bottom = false;
            leftCornerAsset.modifiers.chairMod.top = true;
            leftCornerAsset.modifiers.chairMod.right = false;
          }
        }
        const leftCornerItem = Utils.createItemFromAsset(leftCornerAsset);
        leftCornerItem.onRegisterCallback(() => {
          buildBatchItem(
            leftCornerItem,
            leftCornerAsset,
            localToWorld(itemPosition, center, quaternion, position),
            rotation,
            quaternion,
            cb
          );
        });
        leftCornerItem.init(model);
        continue;
      } else if (row === 0) {
        // Top Side
      } else if (col === 0) {
        // Left Side
        rotation.setFromAxisAngle(y, Math.PI / 2);
      } else if (col === maxCols - 1) {
        // Right Side
        rotation.setFromAxisAngle(y, -Math.PI / 2);
      } else if (row === maxRows - 1) {
        // Bottom Side
        if (rotateCorners) {
          rotation.setFromAxisAngle(y, Math.PI);
        } else {
        }
      }
      if (
        row !== 0 &&
        col !== 0 &&
        col !== maxCols - 1 &&
        row !== maxRows - 1
      ) {
        continue;
      }

      buildBatchItem(
        tempItem,
        asset,
        localToWorld(itemPosition, center, quaternion, position),
        rotation,
        quaternion,
        cb
      );
    }
  }
};

export const uShape = (
  width,
  depth,
  position,
  quaternion,
  itemUIConfg: BatchAddParams,
  tempItem: Item,
  groupId: string,
  model: Model,
  cb: (asset: Asset, fixture?: boolean, showCollision?: boolean) => any
) => {
  const asset: Asset = JSON.parse(JSON.stringify(tempItem.asset));

  asset.groupId = groupId;
  asset.modifiers.chairMod.left = false;
  asset.modifiers.chairMod.right = false;
  asset.modifiers.chairMod.top = true;
  asset.modifiers.chairMod.bottom = false;

  const tempUShapeItem = Utils.createItemFromAsset(asset);
  tempUShapeItem.onRegisterCallback(() => {
    uBuild(
      width,
      depth,
      position,
      quaternion,
      itemUIConfg,
      tempUShapeItem,
      groupId,
      model,
      cb
    );
  });
  tempUShapeItem.init(model);
};

export const uBuild = (
  width,
  depth,
  position,
  quaternion,
  itemUIConfg: BatchAddParams,
  tempItem: Item,
  groupId: string,
  model: Model,
  cb: (asset: Asset, fixture?: boolean, showCollision?: boolean) => any
) => {
  const center = new Vector3(width / 2, 0, depth / 2);

  const boundaryWidth = tempItem.getWidth() + 0.00001;
  const boundaryDepth = tempItem.getDepth() + 0.00001;
  const boundaryHalfWidth = -boundaryWidth / 2.0;
  const boundaryHalfDepth = -boundaryDepth / 2.0;

  const rotateCorners = true;

  let maxCols;
  let maxRows;
  let padX;
  let padY;

  if (rotateCorners) {
    maxCols = Math.floor((width - boundaryDepth * 2) / boundaryWidth + 2);
    maxRows = Math.floor(depth / boundaryWidth);
    padX = ((width - 2 * boundaryDepth) % boundaryWidth) / 2.0;
    padY = (depth % boundaryWidth) / 2.0;
  } else {
    maxCols = Math.floor(width / boundaryWidth);
    maxRows = Math.floor((depth - boundaryDepth) / boundaryWidth) + 1;
    padX = (width % boundaryWidth) / 2.0;
    padY = ((depth - boundaryDepth) % boundaryWidth) / 2.0;
  }

  if (maxCols === 0 || maxRows === 0) {
    store.dispatch(SetBatchSettings());
    store.dispatch(ToastMessage('Batch area too small'));
    return;
  }

  const y = new Vector3(0, 1, 0);

  for (let row = 0; row < maxRows; row++) {
    for (let col = 0; col < maxCols; col++) {
      const asset: Asset = JSON.parse(JSON.stringify(tempItem.asset));

      let itemPosition;

      if (rotateCorners) {
        if (row === 0) {
          let xMin =
            col === 0 || col === maxCols - 1
              ? (col > 0 ? 1 : 0) * boundaryDepth +
                (col > 0 ? (col - 1) * boundaryWidth : 0)
              : boundaryDepth + (col - 1) * boundaryWidth;
          xMin += padX;
          const zMin = padY;
          const width =
            col === 0 || col === maxCols - 1
              ? boundaryHalfDepth
              : boundaryHalfWidth;
          const depth =
            col === 0 || col === maxCols - 1
              ? boundaryHalfWidth
              : boundaryHalfDepth;
          itemPosition = new Vector3(xMin - width, 0, zMin - depth);
        } else {
          let xMin =
            col === 0 || col === maxCols - 1
              ? (col > 0 ? 1 : 0) * boundaryDepth +
                (col > 0 ? (col - 1) * boundaryWidth : 0)
              : boundaryDepth + (col - 2) * boundaryWidth;
          xMin += padX;
          const zMin = row * boundaryWidth + padY;
          itemPosition = new Vector3(
            xMin - boundaryHalfDepth,
            0,
            zMin - boundaryHalfWidth
          );
        }
      } else {
        if (row === 0) {
          let xMin = col * boundaryWidth;
          xMin += padX;
          const zMin = padY;
          itemPosition = new Vector3(
            xMin - boundaryHalfWidth,
            0,
            zMin - boundaryHalfDepth
          );
        } else {
          let xMin =
            col === 0 || col === maxCols - 1
              ? col * boundaryWidth +
                (col > 0 ? boundaryWidth - boundaryDepth : 0)
              : 0;
          xMin += padX;
          const zMin = (row - 1) * boundaryWidth + padY + boundaryDepth;
          itemPosition = new Vector3(
            xMin - boundaryHalfDepth,
            0,
            zMin - boundaryHalfWidth
          );
        }
      }

      const rotation = new Quaternion();

      if (row === 0 && col === 0) {
        // Top left corner
        const leftCornerAsset: Asset = JSON.parse(
          JSON.stringify(tempItem.asset)
        );

        if (rotateCorners) {
          if (
            leftCornerAsset.modifiers != null &&
            leftCornerAsset.modifiers.chairMod !== undefined
          ) {
            leftCornerAsset.modifiers.chairMod.left = false;
            leftCornerAsset.modifiers.chairMod.bottom = false;
            leftCornerAsset.modifiers.chairMod.top = true;
            leftCornerAsset.modifiers.chairMod.right = true;
          }
          rotation.setFromAxisAngle(y, Math.PI / 2);
        } else {
          if (
            leftCornerAsset.modifiers != null &&
            leftCornerAsset.modifiers.chairMod !== undefined
          ) {
            leftCornerAsset.modifiers.chairMod.left = true;
            leftCornerAsset.modifiers.chairMod.bottom = false;
            leftCornerAsset.modifiers.chairMod.top = true;
            leftCornerAsset.modifiers.chairMod.right = false;
          }
        }
        const leftCornerItem = Utils.createItemFromAsset(leftCornerAsset);
        leftCornerItem.onRegisterCallback(() => {
          buildBatchItem(
            leftCornerItem,
            leftCornerAsset,
            localToWorld(itemPosition, center, quaternion, position),
            rotation,
            quaternion,
            cb
          );
        });
        leftCornerItem.init(model);
        continue;
      } else if (row === 0 && col === maxCols - 1) {
        // Top Right Corner
        const rightCornerAsset: Asset = JSON.parse(
          JSON.stringify(tempItem.asset)
        );

        if (rotateCorners) {
          if (
            rightCornerAsset.modifiers != null &&
            rightCornerAsset.modifiers.chairMod !== undefined
          ) {
            rightCornerAsset.modifiers.chairMod.left = true;
            rightCornerAsset.modifiers.chairMod.bottom = false;
            rightCornerAsset.modifiers.chairMod.top = true;
            rightCornerAsset.modifiers.chairMod.right = false;
          }
          rotation.setFromAxisAngle(y, -Math.PI / 2);
        } else {
          if (
            rightCornerAsset.modifiers != null &&
            rightCornerAsset.modifiers.chairMod !== undefined
          ) {
            rightCornerAsset.modifiers.chairMod.left = false;
            rightCornerAsset.modifiers.chairMod.bottom = false;
            rightCornerAsset.modifiers.chairMod.top = true;
            rightCornerAsset.modifiers.chairMod.right = true;
          }
        }
        const rightCornerItem = Utils.createItemFromAsset(rightCornerAsset);
        rightCornerItem.onRegisterCallback(() => {
          buildBatchItem(
            rightCornerItem,
            rightCornerAsset,
            localToWorld(itemPosition, center, quaternion, position),
            rotation,
            quaternion,
            cb
          );
        });
        rightCornerItem.init(model);
        continue;
      } else if (row === 0) {
        // Top Side
      } else if (col === 0) {
        // Left Side
        rotation.setFromAxisAngle(y, Math.PI / 2);
      } else if (col === maxCols - 1) {
        // Right Side
        rotation.setFromAxisAngle(y, -Math.PI / 2);
      }
      if (row !== 0 && col !== 0 && col !== maxCols - 1) {
        continue;
      }

      buildBatchItem(
        tempItem,
        asset,
        localToWorld(itemPosition, center, quaternion, position),
        rotation,
        quaternion,
        cb
      );
    }
  }
};

export const family = (
  width,
  depth,
  position,
  quaternion,
  itemUIConfg: BatchAddParams,
  tempItem: Item,
  groupId: string,
  model: Model,
  cb: (asset: Asset, fixture?: boolean, showCollision?: boolean) => any
) => {
  const asset: Asset = JSON.parse(JSON.stringify(tempItem.asset));

  asset.modifiers.chairMod.left = false;
  asset.modifiers.chairMod.right = false;
  asset.modifiers.chairMod.top = true;
  asset.modifiers.chairMod.bottom = true;
  itemUIConfg.rowSpacing = 0;
  itemUIConfg.rotation = Math.PI / 2;
  itemUIConfg.skew = 0;
  itemUIConfg.numberOfRowAisles = 0;

  const tempFamilyItem = Utils.createItemFromAsset(asset);
  tempFamilyItem.onRegisterCallback(() => {
    grid(
      width,
      depth,
      position,
      quaternion,
      itemUIConfg,
      tempFamilyItem,
      groupId,
      model,
      cb
    );
  });
  tempFamilyItem.init(model);
};

export const theater = (
  width,
  depth,
  position,
  quaternion,
  itemUIConfg: BatchAddParams,
  tempItem: Item,
  groupId: string,
  model: Model,
  cb: (asset: Asset, fixture?: boolean, showCollision?: boolean) => any
) => {
  const asset: Asset = JSON.parse(JSON.stringify(tempItem.asset));
  if (SkuType[asset.skuType] === SkuType.TBL) {
    asset.modifiers.chairMod.right = false;
    asset.modifiers.chairMod.top = false;
    asset.modifiers.chairMod.left = false;
    asset.modifiers.chairMod.bottom = true;
    itemUIConfg.rotation = -Math.PI / 2;

    const tempTheaterItem = Utils.createItemFromAsset(asset);
    tempTheaterItem.onRegisterCallback(() => {
      grid(
        width,
        depth,
        position,
        quaternion,
        itemUIConfg,
        tempTheaterItem,
        groupId,
        model,
        cb
      );
    });
    tempTheaterItem.init(model);
  } else {
    grid(
      width,
      depth,
      position,
      quaternion,
      itemUIConfg,
      tempItem,
      groupId,
      model,
      cb
    );
  }
};

export const cabaret = (
  width,
  depth,
  position,
  quaternion,
  itemUIConfg: BatchAddParams,
  tempItem: Item,
  groupId: string,
  model: Model,
  cb: (asset: Asset, fixture?: boolean, showCollision?: boolean) => any
) => {
  const asset: Asset = JSON.parse(JSON.stringify(tempItem.asset));

  asset.modifiers.chairMod.equalSpacing = false;

  const tempBanquetItem = Utils.createItemFromAsset(asset);
  tempBanquetItem.onRegisterCallback(() => {
    banquet(
      width,
      depth,
      position,
      quaternion,
      itemUIConfg,
      tempBanquetItem,
      groupId,
      model,
      cb
    );
  });
  tempBanquetItem.init(model);
};

export const circle = (
  width: number,
  depth: number,
  position: THREE.Vector3,
  quaternion: THREE.Quaternion,
  itemUIConfg: BatchAddParams,
  tempItem: Item,
  groupId: string,
  model: Model,
  cb: (asset: Asset, fixture?: boolean, showCollision?: boolean) => any
) => {
  const center: Vector3 = new Vector3(width / 2, 0, depth / 2);
  if (tempItem.asset.modifiers && tempItem.asset.modifiers.chairMod) {
    // custom temp item
    const tempCircleAsset: Asset = JSON.parse(JSON.stringify(tempItem.asset));
    tempCircleAsset.groupId = groupId;
    tempCircleAsset.modifiers.chairMod.top = true;
    tempCircleAsset.modifiers.chairMod.bottom = false;
    tempCircleAsset.modifiers.chairMod.left = false;
    tempCircleAsset.modifiers.chairMod.right = false;
    tempCircleAsset.groupId = groupId;

    const tempCircleItem = Utils.createItemFromAsset(tempCircleAsset);
    tempCircleItem.onRegisterCallback(() => {
      const boundaryWidth = tempCircleItem.getWidth() + itemUIConfg.rowSpacing;
      const boundaryDepth = tempCircleItem.getDepth() + itemUIConfg.rowSpacing;

      const a = (width - tempCircleItem.getDepth()) / 2;
      const b = (depth - tempCircleItem.getDepth()) / 2;
      const angles = Utils.anglesForEllipse(
        a,
        b,
        0,
        2 * Math.PI,
        boundaryWidth
      );

      const localQuaternion = new Quaternion();
      const itemPosition = new Vector3();
      for (let i = 0; i < angles.length; i++) {
        const angle = angles[i];
        const rotMat = new Matrix4();
        const x = a * Math.cos(angle);
        const z = b * Math.sin(angle);
        rotMat.makeRotationY(
          Math.PI -
            Math.atan2(a * Math.sin(angle), b * Math.cos(angle)) +
            Math.PI / 2
        );
        const relativePosition = new Vector3(x, 0, z);
        itemPosition.addVectors(center, relativePosition);

        const asset: Asset = JSON.parse(JSON.stringify(tempCircleAsset));
        localQuaternion.setFromRotationMatrix(rotMat);
        buildBatchItem(
          tempCircleItem,
          asset,
          localToWorld(itemPosition, center, quaternion, position),
          localQuaternion,
          quaternion,
          cb
        );
      }
    });
    tempCircleItem.init(model);
  } else {
    const boundaryWidth = tempItem.getWidth();
    const boundaryDepth = tempItem.getDepth() + itemUIConfg.rowSpacing;

    const a = (width - tempItem.getDepth() * 2) / 2;
    const b = (depth - tempItem.getDepth() * 2) / 2;
    const angles = Utils.anglesForEllipse(
      a,
      b,
      0,
      2 * Math.PI,
      boundaryWidth + itemUIConfg.rowSpacing
    );

    const localQuaternion = new Quaternion();
    const itemPosition = new Vector3();
    for (let i = 0; i < angles.length; i++) {
      const angle = angles[i];
      const rotMat = new Matrix4();
      const x = a * Math.cos(angle);
      const z = b * Math.sin(angle);
      rotMat.makeRotationY(
        Math.PI - Math.atan2(a * Math.sin(angle), b * Math.cos(angle))
      );
      const relativePosition = new Vector3(x, 0, z);
      itemPosition.addVectors(center, relativePosition);

      const asset: Asset = JSON.parse(JSON.stringify(tempItem.asset));
      asset.groupId = groupId;
      localQuaternion.setFromRotationMatrix(rotMat);
      buildBatchItem(
        tempItem,
        asset,
        localToWorld(itemPosition, center, quaternion, position),
        localQuaternion,
        quaternion,
        cb
      );
    }
  }
};

export const horseshoe = (
  width: number,
  depth: number,
  position: THREE.Vector3,
  quaternion: THREE.Quaternion,
  itemUIConfg: BatchAddParams,
  tempItem: Item,
  groupId: string,
  model: Model,
  cb: (asset: Asset, fixture?: boolean, showCollision?: boolean) => any
) => {
  const center: Vector3 = new Vector3(width / 2, 0, depth / 2);

  if (tempItem.asset.modifiers && tempItem.asset.modifiers.chairMod) {
    // custom temp item
    const tempCircleAsset: Asset = JSON.parse(JSON.stringify(tempItem.asset));
    tempCircleAsset.groupId = groupId;
    tempCircleAsset.modifiers.chairMod.top = true;
    tempCircleAsset.modifiers.chairMod.bottom = false;
    tempCircleAsset.modifiers.chairMod.left = false;
    tempCircleAsset.modifiers.chairMod.right = false;
    tempCircleAsset.groupId = groupId;

    const tempCircleItem = Utils.createItemFromAsset(tempCircleAsset);
    tempCircleItem.onRegisterCallback(() => {
      const boundaryWidth = tempCircleItem.getWidth() + itemUIConfg.rowSpacing;
      const boundaryDepth = tempCircleItem.getDepth();

      const a = (width - boundaryDepth) / 2;
      const b = (depth - boundaryDepth) / 2;
      const angles = Utils.anglesForEllipse(a, b, Math.PI, 0, boundaryWidth);

      const y = new Vector3(0, 1, 0);

      const localQuaternion = new Quaternion();
      const itemPosition = new Vector3();
      for (let i = 1; i < angles.length; i++) {
        const angle = angles[i];
        const rotMat = new Matrix4();
        const x = a * Math.cos(angle);
        const z = b * Math.sin(angle);
        rotMat.makeRotationY(
          Math.PI -
            Math.atan2(a * Math.sin(angle), b * Math.cos(angle)) +
            Math.PI / 2
        );
        const relativePosition = new Vector3(x, 0, z);
        itemPosition.addVectors(center, relativePosition);

        const asset: Asset = JSON.parse(JSON.stringify(tempCircleAsset));
        localQuaternion.setFromRotationMatrix(rotMat);
        buildBatchItem(
          tempCircleItem,
          asset,
          localToWorld(itemPosition, center, quaternion, position),
          localQuaternion,
          quaternion,
          cb
        );
      }
      for (let i = 0; i < depth / boundaryWidth / 2; i++) {
        const asset: Asset = JSON.parse(JSON.stringify(tempCircleAsset));
        asset.groupId = groupId;
        localQuaternion.setFromAxisAngle(y, Math.PI / 2);
        itemPosition.set(
          center.x - new Vector3(a, 0, 0).x,
          0,
          center.z + i * boundaryWidth
        );
        buildBatchItem(
          tempCircleItem,
          asset,
          localToWorld(itemPosition, center, quaternion, position),
          localQuaternion,
          quaternion,
          cb
        );
      }
      for (let i = 0; i < depth / boundaryWidth / 2; i++) {
        const asset: Asset = JSON.parse(JSON.stringify(tempCircleAsset));
        asset.groupId = groupId;
        localQuaternion.setFromAxisAngle(y, -Math.PI / 2);
        itemPosition.set(
          center.x + new Vector3(a, 0, 0).x,
          0,
          center.z + i * boundaryWidth
        );
        buildBatchItem(
          tempCircleItem,
          asset,
          localToWorld(itemPosition, center, quaternion, position),
          localQuaternion,
          quaternion,
          cb
        );
      }
    });
    tempCircleItem.init(model);
  } else {
    const boundaryWidth = tempItem.getDepth() + itemUIConfg.rowSpacing;
    const boundaryDepth = tempItem.getWidth();

    const a = (width - boundaryDepth * 2) / 2;
    const b = (depth - boundaryDepth * 2) / 2;
    const angles = Utils.anglesForEllipse(a, b, Math.PI, 0, boundaryWidth);

    const y = new Vector3(0, 1, 0);

    const localQuaternion = new Quaternion();
    const itemPosition = new Vector3();
    for (let i = 1; i < angles.length; i++) {
      const angle = angles[i];
      const rotMat = new Matrix4();
      const x = a * Math.cos(angle);
      const z = b * Math.sin(angle);
      rotMat.makeRotationY(
        Math.PI - Math.atan2(a * Math.sin(angle), b * Math.cos(angle))
      );
      const relativePosition = new Vector3(x, 0, z);
      itemPosition.addVectors(center, relativePosition);

      const asset: Asset = JSON.parse(JSON.stringify(tempItem.asset));
      asset.groupId = groupId;
      localQuaternion.setFromRotationMatrix(rotMat);
      buildBatchItem(
        tempItem,
        asset,
        localToWorld(itemPosition, center, quaternion, position),
        localQuaternion,
        quaternion,
        cb
      );
    }

    for (let i = 0; i < depth / boundaryWidth / 2; i++) {
      const asset: Asset = JSON.parse(JSON.stringify(tempItem.asset));
      asset.groupId = groupId;
      localQuaternion.setFromAxisAngle(y, 0);
      itemPosition.set(
        center.x - new Vector3(a, 0, 0).x,
        0,
        center.z + i * boundaryWidth
      );
      buildBatchItem(
        tempItem,
        asset,
        localToWorld(itemPosition, center, quaternion, position),
        localQuaternion,
        quaternion,
        cb
      );
    }

    for (let i = 0; i < depth / boundaryWidth / 2; i++) {
      const asset: Asset = JSON.parse(JSON.stringify(tempItem.asset));
      asset.groupId = groupId;
      localQuaternion.setFromAxisAngle(y, Math.PI);
      itemPosition.set(
        center.x + new Vector3(a, 0, 0).x,
        0,
        center.z + i * boundaryWidth
      );
      buildBatchItem(
        tempItem,
        asset,
        localToWorld(itemPosition, center, quaternion, position),
        localQuaternion,
        quaternion,
        cb
      );
    }
  }
};
