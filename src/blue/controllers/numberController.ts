import { combineLatest, from, fromEvent, merge, Observable } from 'rxjs';
import {
  distinctUntilChanged,
  filter,
  map,
  withLatestFrom,
} from 'rxjs/operators';
import { Item } from '../items/item';
import { store } from '../..';
import { ReduxState } from '../../reducers';
import { IncrementNextTableNumber, NeedSaveAction } from '../../reducers/blue';
import { CameraLayers, ControllerType } from '../../models/BlueState';
import { Intersection, Raycaster, Vector2 } from 'three';
import { SkuType } from '../items/asset';

export const NumberController = function (
  scene,
  cam,
  element,
  controls,
  labels
) {
  const scope = this; //tslint:disable-line
  this.tableItems = [];

  const state = {
    rect: element.getBoundingClientRect(),
    themeColor: 'purple',
    longPressTime: 500,
    raycaster: new Raycaster(),
  };

  state.raycaster.layers.set(CameraLayers.Items);

  this.controllerType = ControllerType.Number;

  const mouseEventToCoordinate = (mouseEvent: MouseEvent) => {
    mouseEvent.preventDefault();
    return {
      x: mouseEvent.clientX - state.rect.x,
      y: mouseEvent.clientY - state.rect.y,
    };
  };

  const touchEventToCoordinate = (touchEvent: TouchEvent) => {
    touchEvent.preventDefault();
    return {
      x: touchEvent.changedTouches[0].clientX - state.rect.x,
      y: touchEvent.changedTouches[0].clientY - state.rect.y,
    };
  };

  const mouseIsDown$ = merge(
    fromEvent(element, 'mousedown'),
    fromEvent(element, 'mouseup'),
    fromEvent(element, 'touchmove')
  ).pipe(
    map((downEvent: MouseEvent | TouchEvent): boolean => {
      return downEvent.type === 'mousedown' || downEvent.type === 'touchmove';
    }),
    distinctUntilChanged()
  );

  const mouseDown$ = fromEvent(element, 'mousedown').pipe(
    map(mouseEventToCoordinate)
  );
  const mouseMove$ = fromEvent<MouseEvent>(element, 'mousemove').pipe(
    // filter(e => e.buttons === 0),
    filter((e) => !(e.movementX === 0 && e.movementY === 0)),
    map(mouseEventToCoordinate)
  );
  const mouseUp$ = fromEvent(element, 'mouseup').pipe(
    map(mouseEventToCoordinate)
  );

  const touchStart$ = fromEvent(element, 'touchstart').pipe(
    map(touchEventToCoordinate)
  );
  const touchMove$ = fromEvent(element, 'touchmove').pipe(
    map(touchEventToCoordinate)
  );
  const touchEnd$ = fromEvent(element, 'touchend').pipe(
    map(touchEventToCoordinate)
  );

  const start$ = merge(mouseDown$, touchStart$);
  const coordinate$ = merge(mouseMove$, touchMove$, touchEnd$);
  const end$ = merge(mouseUp$, touchEnd$);

  const blueInitialized$ = from(
    store as unknown as Observable<ReduxState>
  ).pipe(
    map((state: ReduxState): boolean => {
      return state.blue.blueInitialized;
    }),
    distinctUntilChanged()
  );

  const enabled$ = from(store as unknown as Observable<ReduxState>).pipe(
    map((state: ReduxState): boolean => {
      return state.blue.activeController === ControllerType.Number;
    }),
    distinctUntilChanged()
  );

  const nextTableNumber$ = from(
    store as unknown as Observable<ReduxState>
  ).pipe(
    map((state: ReduxState): number => {
      return state.blue.nextTableNumber;
    }),
    distinctUntilChanged()
  );

  const deleteTables$ = from(store as unknown as Observable<ReduxState>).pipe(
    map((state: ReduxState): boolean => {
      return state.blue.deleteTableNumber;
    }),
    distinctUntilChanged()
  );

  const normalizedVector$ = coordinate$.pipe(
    map((coord: { x: number; y: number }) => {
      const retVec = new Vector2();
      retVec.x = (coord.x / element.clientWidth) * 2 - 1;
      retVec.y = -(coord.y / element.clientHeight) * 2 + 1;
      return retVec;
    })
  );

  const intersectedTable$ = normalizedVector$.pipe(
    map((screenVec: Vector2) => {
      state.raycaster.setFromCamera(screenVec, this.cameras.camera);
      return state.raycaster.intersectObjects(scope.tableItems, true)[0];
    }),
    // distinctUntilChanged(),
    map((intersected: Intersection): string => {
      let table: Item = undefined;
      intersected?.object?.traverseAncestors((node) => {
        if (node instanceof Item) {
          if (SkuType[node?.asset?.skuType] === SkuType.TBL) {
            table = node;
          }
        }
      });
      return table?.asset?.instanceId;
    }),
    distinctUntilChanged()
  );

  let doOnTableClickSubscription;
  let doOnMouseOverSubscription;
  let tableIntersectionSubscription;

  this.lastIncrementedTable = '';

  this.cameras = cam;
  this.itemUIConfg = {};

  enum states {
    DEFAULT, // no object selected SELECTED
    COUNTING, // performing an action while mouse depressed
    DELETING,
  }

  this.needsUpdate = true;

  this.update = () => {
    this.needsUpdate = true;
  };

  this.setCursorStyle = function (cursorStyle) {
    element.style.cursor = cursorStyle;
  };

  function updateTable(
    tableInstanceId: string,
    deleteMode: boolean,
    nextTableNumber: number,
    preventDuplicateIncrement: boolean = true
  ) {
    const intersectedObject = scope.tableItems.find(
      (item: Item) => item.asset.instanceId === tableInstanceId
    );
    const allTableNumber = scope.tableItems.map(
      (tableItem) => tableItem.asset.labels.tableNumberLabel
    );
    if (deleteMode) {
      if (intersectedObject) {
        intersectedObject.asset.labels.tableNumberLabel = undefined;
        intersectedObject.buildLabel();
        scope.needsUpdate = true;
      }
    } else {
      if (allTableNumber.includes(nextTableNumber.toString())) {
        store.dispatch(IncrementNextTableNumber());
        return;
      }
      if (intersectedObject?.asset?.labels) {
        if (
          preventDuplicateIncrement &&
          tableInstanceId === scope.lastIncrementedTable
        )
          return;
        scope.lastIncrementedTable = tableInstanceId;
        intersectedObject.asset.labels.tableNumberLabel = `${nextTableNumber}`;
        intersectedObject.buildLabel();
        store.dispatch(IncrementNextTableNumber());
        scope.needsUpdate = true;
      }
    }

    store.dispatch(NeedSaveAction(true));
  }

  const doOnTableClick$ = end$.pipe(
    withLatestFrom(start$),
    filter((obs: [{ x: number; y: number }, { x: number; y: number }]) => {
      return (
        Math.abs(obs[0].x - obs[1].x) < 3 && Math.abs(obs[0].y - obs[1].y) < 3
      );
    }),
    withLatestFrom(intersectedTable$),
    filter(([mousePositions, intersectedTable]) => {
      return intersectedTable !== undefined;
    }),
    map(([mousePositions, intersectedTable]): string => {
      return intersectedTable;
    }),
    withLatestFrom(deleteTables$, nextTableNumber$)
  );

  const doOnMouseOver$ = intersectedTable$.pipe(
    withLatestFrom(mouseIsDown$),
    filter(([intersectedTable, mouseIsDown]) => {
      return intersectedTable !== undefined && mouseIsDown;
    }),
    map(([intersectedTable, mouseIsDown]): string => {
      return intersectedTable;
    }),
    withLatestFrom(deleteTables$, nextTableNumber$)
  );

  const ready$ = combineLatest([blueInitialized$, enabled$]);

  ready$.subscribe((ready: [boolean, boolean]) => {
    doOnTableClickSubscription?.unsubscribe();
    doOnMouseOverSubscription?.unsubscribe();
    tableIntersectionSubscription?.unsubscribe();
    if (ready[1]) {
      scope.tableItems = scene.getItems().filter((item: Item) => {
        return SkuType[item?.asset?.skuType] === SkuType.TBL;
      });

      doOnTableClickSubscription = doOnTableClick$.subscribe(
        ([table, deleteMode, nextTableNumber]) => {
          updateTable(table, deleteMode, nextTableNumber);
        }
      );
      doOnMouseOverSubscription = doOnMouseOver$.subscribe(
        ([table, deleteMode, nextTableNumber]) => {
          updateTable(table, deleteMode, nextTableNumber);
        }
      );
      tableIntersectionSubscription = intersectedTable$.subscribe(
        (intersectedTable) => {
          if (intersectedTable) {
            scope.setCursorStyle('pointer');
          } else {
            scope.setCursorStyle('auto');
          }
        }
      );
    }
  });
};
