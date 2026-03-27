import { GridHelper, Scene } from 'three';
import { GridCell, Utils } from '../core/utils';
import { CameraLayers } from '../../models/BlueState';
import { getFromLocalStorage } from '../../sharing/utils/localStorageHelper';
import { store } from '../..';
import { SetGridCellSize } from '../../reducers/blue';

export class PlacezGrid {
  private scene: Scene;
  private controls;

  private gridHelper: GridHelper;
  private gridSize: GridCell;
  private isVisible = true;

  constructor(scene) {
    this.scene = scene;
  }

  public setGridVisible = (visible: boolean) => {
    this.isVisible = visible;

    if (this.gridHelper) {
      if (visible) {
        if (!this.scene.children.includes(this.gridHelper)) {
          this.scene.add(this.gridHelper);
        }
        this.gridHelper.visible = true;
      } else {
        this.scene.remove(this.gridHelper);
      }
    }
  };

  public update = (controls) => {
    if (!controls) return;
    if (!this.isVisible) return;

    const gridCellLocked = getFromLocalStorage('gridCellLocked');
    if (gridCellLocked !== undefined && gridCellLocked) return;

    if (!controls.getViewSize) return;
    const newGridSize = Utils.getGridCellSize(
      controls.getViewSize(),
      Utils.getUnit()
    );
    
    if (
      newGridSize?.cmSize &&
      (!this?.gridSize?.cmSize || newGridSize.cmSize !== this.gridSize.cmSize)
    ) {
      this.gridSize = newGridSize;
      store.dispatch(SetGridCellSize(newGridSize));
      this.setGrid(300000, newGridSize);
    }
  };

  private setGrid = (
    size: number,
    gridCell: GridCell = { cmSize: 100, units: 'cm' }
  ) => {
    this.scene.remove(this.gridHelper);
    const divisions = size / gridCell.cmSize;
    this.gridHelper = new GridHelper(size, divisions);
    this.gridHelper.layers.set(CameraLayers.Grid);
    this.scene.add(this.gridHelper);
  };
}
