import { store } from '../..';
import { ReduxState } from '../../reducers';
import { SetSelectedLabelId, NeedSaveAction } from '../../reducers/blue';
import { CameraLayers, ControllerType } from '../../models/BlueState';
import LayoutLabel from '../../api/placez/models/LayoutLabel';
import { GlobalViewState, ToolState } from '../../models/GlobalState';

import { from, fromEvent, merge, Observable } from 'rxjs';
import {
  distinctUntilChanged,
  filter,
  map,
  withLatestFrom,
  startWith,
} from 'rxjs/operators';
import {
  Mesh,
  MeshBasicMaterial,
  PlaneGeometry,
  Raycaster,
  Sprite,
  Vector2,
  Vector3,
} from 'three';
import { debounce } from 'ts-debounce';
import { SetFloorPlan, SetLayout } from '../../reducers/designer';
import { ChangeToolState } from '../../reducers/globalState';
import { Utils } from '../core/utils';

export const LabelController = function (
  scene,
  cameras,
  element,
  controls,
  labels
) {
  let plane; // ground plane used for intersection testing
  this.cameras = cameras;
  this.labels = labels;
  this.controllerType = ControllerType.Label;
  const scope = this;

  const state = {
    themeColor: 'purple',
    longPressTime: 500,
    raycaster: new Raycaster(),
  };

  this.selectedLabelId = undefined;
  this.placezLabels = undefined;

  function setGroundPlane() {
    // TODO dynamically size ground plane used to find intersections
    const size = 100000;
    plane = new Mesh(new PlaneGeometry(size, size), new MeshBasicMaterial());
    plane.rotation.x = -Math.PI / 2;
    plane.visible = true;
    plane.material.visible = false;
    scene.add(plane);
  }

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
      return state.blue.activeController === ControllerType.Label;
    }),
    distinctUntilChanged()
  );

  const labels$ = from(store as unknown as Observable<ReduxState>).pipe(
    map((state: ReduxState): LayoutLabel[] => {
      if (state.globalstate.globalViewState === GlobalViewState.Fixtures) {
        return state.designer?.floorPlan?.floorplanLabels ?? [];
      } else {
        return state.designer?.layout?.layoutLabels ?? [];
      }
    }),
    distinctUntilChanged()
  );

  const selectedLabelId$ = from(
    store as unknown as Observable<ReduxState>
  ).pipe(
    map((state: ReduxState): string => {
      return state.blue.selectedLabelId;
    }),
    distinctUntilChanged()
  );

  const mouseEventToCoordinate = (mouseEvent: MouseEvent) => {
    mouseEvent.preventDefault();
    const rect = element.getBoundingClientRect();
    return {
      x: mouseEvent.clientX - rect.x,
      y: mouseEvent.clientY - rect.y,
    };
  };

  const touchEventToCoordinate = (touchEvent: TouchEvent) => {
    touchEvent.preventDefault();
    const rect = element.getBoundingClientRect();
    return {
      x: touchEvent.changedTouches[0].clientX - rect.x,
      y: touchEvent.changedTouches[0].clientY - rect.y,
    };
  };

  const mouseIsDown$ = merge(
    fromEvent(element, 'mousedown'),
    fromEvent(element, 'mouseup'),
    fromEvent(element, 'touchstart'),
    fromEvent(element, 'touchend')
  ).pipe(
    map((event: MouseEvent | TouchEvent): boolean => {
      if (event.type === 'touchend' || event.type === 'mouseup') {
        controls.enabled = true;
      }
      return event.type === 'mousedown' || event.type === 'touchstart';
    }),
    distinctUntilChanged(),
    startWith(false)
  );

  const mouseDown$ = fromEvent(element, 'mousedown', { passive: false }).pipe(
    map(mouseEventToCoordinate)
  );
  const mouseMove$ = fromEvent<MouseEvent>(element, 'mousemove').pipe(
    filter((e) => e.buttons === 0),
    filter((e) => !(e.movementX === 0 && e.movementY === 0)),
    map(mouseEventToCoordinate)
  );
  const mouseDrag$ = fromEvent<MouseEvent>(element, 'mousemove').pipe(
    filter((e) => e.buttons === 1),
    filter((e) => !(e.movementX === 0 && e.movementY === 0)),
    map(mouseEventToCoordinate)
  );
  const mouseUp$ = fromEvent(element, 'mouseup').pipe(
    map(mouseEventToCoordinate)
  );

  const touchStart$ = fromEvent(element, 'touchstart', { passive: false }).pipe(
    map(touchEventToCoordinate)
  );
  const touchMove$ = fromEvent(window, 'touchmove').pipe(
    map(touchEventToCoordinate)
  );
  const touchEnd$ = fromEvent(element, 'touchend', { passive: false }).pipe(
    map(touchEventToCoordinate)
  );
  const drop$ = fromEvent(element, 'drop').pipe(map(mouseEventToCoordinate));
  const drag$ = fromEvent(window, 'drag').pipe(map(mouseEventToCoordinate));
  const keyDown$ = fromEvent<KeyboardEvent>(window, 'keydown');

  const start$ = merge(mouseDown$, touchStart$);
  const coordinate$ = merge(mouseMove$, touchStart$, drop$);
  const dragCoordinate$ = merge(mouseDrag$, touchMove$, drop$, drag$);
  const end$ = merge(mouseUp$, touchEnd$);

  const normalizedVector$ = coordinate$.pipe(
    filter((e) => element.clientWidth !== 0 && element.clientHeight !== 0),
    map((coord: { x: number; y: number }) => {
      const retVec = new Vector2();
      retVec.x = (coord.x / element.clientWidth) * 2 - 1;
      retVec.y = -(coord.y / element.clientHeight) * 2 + 1;
      return retVec;
    })
  );

  const normalizedDrag$ = dragCoordinate$.pipe(
    filter((e) => element.clientWidth !== 0 && element.clientHeight !== 0),
    map((coord: { x: number; y: number }) => {
      const retVec = new Vector2();
      retVec.x = (coord.x / element.clientWidth) * 2 - 1;
      retVec.y = -(coord.y / element.clientHeight) * 2 + 1;
      return retVec;
    })
  );

  const planeCoordinates$ = normalizedVector$.pipe(
    map((screenVec: Vector2) => {
      let intersections = [];
      state.raycaster.layers.set(CameraLayers.Default);
      state.raycaster.setFromCamera(screenVec, this.cameras.camera);

      intersections = intersections.concat(
        state.raycaster.intersectObjects([plane])
      );
      return intersections?.[0]?.point;
    }),
    distinctUntilChanged()
  );

  const planeDragCoordinates$ = normalizedDrag$.pipe(
    map((screenVec: Vector2) => {
      let intersections = [];
      state.raycaster.layers.set(CameraLayers.Default);
      state.raycaster.setFromCamera(screenVec, this.cameras.camera);

      intersections = intersections.concat(
        state.raycaster.intersectObjects([plane])
      );
      return intersections?.[0]?.point;
    }),
    distinctUntilChanged()
  );

  const intersectedLabelId$ = normalizedVector$.pipe(
    withLatestFrom(mouseIsDown$),
    map(([screenVec, mouseIsDown]): string => {
      let intersections = [];
      state.raycaster.layers.set(CameraLayers.LayoutLabels);
      state.raycaster.setFromCamera(screenVec, this.cameras.camera);
      intersections = intersections.concat(
        state.raycaster.intersectObjects(this.labels)
      );
      return intersections?.[0]?.object?.userData?.id;
    }),
    distinctUntilChanged()
  );

  const doOnIntersectedLabelId$ = intersectedLabelId$.pipe(
    distinctUntilChanged()
  );

  const doOnLabelClick$ = start$.pipe(
    withLatestFrom(intersectedLabelId$),
    map(([mousePositions, intersectedLabelId]): string => {
      if (intersectedLabelId !== undefined) {
        controls.enabled = false;
      }
      return intersectedLabelId;
    })
  );

  const localSelected$ = merge(doOnLabelClick$, selectedLabelId$);

  const selectedIntersected$ = localSelected$.pipe(
    withLatestFrom(intersectedLabelId$),
    map(([selectedId, intersectedId]): Sprite => {
      if (intersectedId === selectedId) {
        return scope.labels.find((label) => {
          return label.userData.id === selectedId;
        });
      }
      return undefined;
    }),
    distinctUntilChanged()
  );

  const doOnSelectedDrag$ = planeDragCoordinates$.pipe(
    withLatestFrom(selectedIntersected$),
    filter(([position, selectedLabel]) => {
      return selectedLabel !== undefined;
    })
  );

  const doOnDragEnd$ = end$.pipe(
    withLatestFrom(start$),
    filter((obs: [{ x: number; y: number }, { x: number; y: number }]) => {
      return (
        Math.abs(obs[0].x - obs[1].x) > 3 || Math.abs(obs[0].y - obs[1].y) > 3
      );
    }),
    withLatestFrom(selectedLabelId$),
    filter(([mousePositions, selectedLabel]) => {
      return selectedLabel !== undefined;
    }),
    map(([mousePositions, selectedLabel]): string => {
      return selectedLabel;
    }),
    withLatestFrom(labels$, selectedIntersected$)
  );

  let doOnKeyDownSubscription;
  let doOnLabelClickSubscription;
  let doOnLabelSelectedSubscription;
  let doOnSelectedDragSubscription;
  let doOnIntersectedLabelSubscription;
  let doOnLabelsChangedSubscription;
  let doOnDragEndSubscription;

  enabled$.subscribe((enabled: boolean) => {
    doOnKeyDownSubscription?.unsubscribe();
    doOnLabelClickSubscription?.unsubscribe();
    doOnLabelSelectedSubscription?.unsubscribe();
    doOnSelectedDragSubscription?.unsubscribe();
    doOnIntersectedLabelSubscription?.unsubscribe();
    doOnLabelsChangedSubscription?.unsubscribe();
    doOnDragEndSubscription?.unsubscribe();

    if (enabled) {
      doOnKeyDownSubscription = keyDown$
        .pipe(
          withLatestFrom(labels$, selectedLabelId$),
          filter(([keyDownEvent, labels, selectedLabelId]) => {
            return selectedLabelId !== undefined;
          })
        )
        .subscribe(([event, labels, selecteLabelId]) => {
          switch (event.key) {
            case 'Backspace':
            case 'Delete':
              const newLabels = labels
                .filter((label: LayoutLabel) => {
                  return label.id !== selecteLabelId;
                })
                .map((label, index) => ({
                  ...label,
                  id: Utils.guid(),
                }));
              setLabels(newLabels);
              store.dispatch(SetSelectedLabelId(undefined));
              break;
          }
        });

      doOnLabelClickSubscription = doOnLabelClick$.subscribe(
        (intersectedLabelId: string) => {
          store.dispatch(SetSelectedLabelId(intersectedLabelId));
          store.dispatch(ChangeToolState(ToolState.Default));
        }
      );

      doOnLabelSelectedSubscription = localSelected$.subscribe(
        (selectedLabelId: string) => {
          scope.labels.forEach((label) => {
            if (
              selectedLabelId !== undefined &&
              label.userData.id !== selectedLabelId
            ) {
              label.material.color.set(0x777777);
            } else {
              label.material.color.set(0xffffff);
            }
            scope.update();
          });
        }
      );

      const needSave = () => {
        store.dispatch(NeedSaveAction(true));
      };
      const needSaveDebounce = debounce(needSave, 200);

      doOnSelectedDragSubscription = doOnSelectedDrag$.subscribe(
        (dragData: [Vector3, Sprite]) => {
          dragData[1].position.copy(dragData[0]);
          this.needsUpdate = true;
          needSaveDebounce();
        }
      );

      doOnIntersectedLabelSubscription = doOnIntersectedLabelId$.subscribe(
        (e) => {
          if (e) {
            element.style.cursor = 'pointer';
          } else {
            element.style.cursor = 'auto';
          }
        }
      );

      doOnLabelsChangedSubscription = labels$
        .pipe(withLatestFrom(planeDragCoordinates$))
        .subscribe(([newLabels, dropCoord]: [LayoutLabel[], Vector3]) => {
          if (
            newLabels.every((label: LayoutLabel) => {
              return label.position;
            })
          ) {
            return;
          } else {
            const newLabelsWithDropPosition = newLabels.map(
              (label: LayoutLabel) => {
                if (label.position) return label;
                // label.position = [newLabelData[1].x, 0, newLabelData[1].y];
                label.position = dropCoord.toArray();
                return label;
              }
            );
            setLabels(newLabelsWithDropPosition);
          }
        });

      doOnDragEndSubscription = doOnDragEnd$.subscribe(
        (
          labelData: [
            selectedLabelId: string,
            labels: LayoutLabel[],
            selectedLabel: Sprite,
          ]
        ) => {
          if (labelData[2]) {
            const selecteLayoutLabelIndex = labelData[1].findIndex(
              (label: LayoutLabel) => {
                //             return label.id === scope.selectedLabelId;
                return label.id === labelData[0];
              }
            );
            const newLabels =
              labelData[1] !== undefined ? [...labelData[1]] : [];
            newLabels[selecteLayoutLabelIndex].position =
              labelData[2].position.toArray();
            setLabels(newLabels);
            store.dispatch(NeedSaveAction(true));
          }
        }
      );
    }
  });

  this.setCamera = (cam) => {
    this.camera = cam;
  };

  this.update = () => {
    this.needsUpdate = true;
  };

  function setLabels(newLabels: LayoutLabel[]) {
    const state = store.getState() as ReduxState;
    if (state.globalstate.globalViewState === GlobalViewState.Fixtures) {
      store.dispatch(
        SetFloorPlan({
          ...(store.getState() as ReduxState).designer?.floorPlan,
          floorplanLabels: newLabels,
        })
      );
    } else {
      store.dispatch(
        SetLayout({
          ...(store.getState() as ReduxState).designer?.layout,
          layoutLabels: newLabels,
        })
      );
    }
    store.dispatch(NeedSaveAction(true));
  }

  setGroundPlane();
};
