import { store } from '../..';
import { ReduxState } from '../../reducers';
import { CameraLayers } from '../../models/BlueState';

import {
  combineLatest,
  from,
  fromEvent,
  merge,
  Observable,
  partition,
} from 'rxjs';
import {
  distinctUntilChanged,
  filter,
  map,
  startWith,
  tap,
  withLatestFrom,
} from 'rxjs/operators';
import {
  BufferGeometry,
  DoubleSide,
  Mesh,
  MeshBasicMaterial,
  Object3D,
  PlaneGeometry,
  Points,
  Raycaster,
  Vector2,
  Vector3,
} from 'three';
import { Utils } from '../core/utils';
import 'three/examples/fonts/helvetiker_regular.typeface.json';
import {
  FloorPlanModes,
  SelectCorners,
  SetFloorPlanMode,
  SetActiveCorner,
} from '../../reducers/floorPlan';
import { Corner } from '../model/corner';
import { Wall } from '../model/wall';
import { Line2 } from 'three/examples/jsm/lines/Line2';
import * as math from 'mathjs';
import {
  RedoHistory,
  SetFuture,
  SetPast,
  UndoHistory,
} from '../../reducers/undoRedo';
import { PlacezFixturePlan } from '../../api';
import produce from 'immer';
import { NeedSaveAction, Save } from '../../reducers/blue';
import { SetFloorPlan } from '../../reducers/designer';
import { debounce } from 'ts-debounce';

function createBoxGeometry(
  corners: { x: number; y: number }[],
  height?: number
): BufferGeometry {
  const vec3Corners = [
    new Vector3(corners[0].x, height ? height : 10.0, corners[0].y),
    new Vector3(corners[1].x, height ? height : 10.0, corners[1].y),
    new Vector3(corners[2].x, height ? height : 10.0, corners[2].y),
    new Vector3(corners[3].x, height ? height : 10.0, corners[3].y),
  ];

  const points = Utils.cornersToRectPoints(vec3Corners);

  const geom = new BufferGeometry().setFromPoints(points);
  return geom;
}

function getCorners(highlightMesh: THREE.Mesh): THREE.Vector2[] {
  const vec3 = Utils.positionBufferToVec3Corners(
    highlightMesh.geometry,
    highlightMesh.matrix
  );
  return vec3.map((vec: THREE.Vector3) => {
    return new Vector2(vec.x, vec.z);
  });
}

function boxSelectAll(
  corners: THREE.Vector2[],
  floorplanCorners: Corner[],
  selectedCorners: Corner[]
) {
  store.dispatch(
    SelectCorners(
      floorplanCorners
        .filter((corner: Corner) =>
          Utils.pointInPolygon(corner._position.x, corner._position.z, corners)
        )
        .concat(selectedCorners)
    )
  );
}

const highlightMaterial = new MeshBasicMaterial({
  color: 0xff0000,
  wireframe: false,
  side: DoubleSide,
  opacity: 0.3,
  transparent: true,
});
highlightMaterial.color.setStyle('purple');
highlightMaterial.needsUpdate = true;

const yVec = new Vector3(0, 1, 0);
const scaleSpeed = 3;

export const FloorplanController = function (floorplanner, element) {
  const floorplan = floorplanner.floorplan;
  const scene = floorplanner.scene;
  const cam = floorplanner.cameras;
  const controls = floorplanner.controls;

  const snapTolerance = 50;
  const clickTolerance = 3;

  let floorplanState: PlacezFixturePlan = undefined;
  floorplan.fireOnRoomLoaded(() => {
    floorplanState = floorplan.saveFixturePlan();
  });

  let plane; // ground plane used for intersection testing
  let floorIntersectionPlane;
  this.cameras = cam;
  this.font = undefined;

  const corner = new Vector3();

  const uiControls = new Object3D();
  // const corners;
  // const walls;

  interface State {
    themeColor: string;
    raycaster: Raycaster;
    firstHighlightCorner: Vector3;
    secondHighlightCorner: Vector3;
    highlightMesh: Mesh;
    prevPosition: Vector2;
    multiselectState: 'drag' | 'highlight';
    tempScale: number;
  }

  const state: State = {
    themeColor: 'purple',
    raycaster: new Raycaster(),
    firstHighlightCorner: new Vector3(),
    secondHighlightCorner: new Vector3(),
    highlightMesh: new Mesh(
      new BufferGeometry().copy(
        createBoxGeometry([
          { x: 0, y: 0 },
          { x: 0, y: 0 },
          { x: 0, y: 0 },
          { x: 0, y: 0 },
        ])
      ),
      highlightMaterial
    ),
    prevPosition: new Vector2(),
    multiselectState: 'highlight',
    tempScale: 1,
  };

  function updateHighlight(
    highlightMesh: Mesh,
    startPoint: Vector3,
    endPoint: THREE.Vector3
  ): void {
    //make points from drag in whatever angle
    //rotate points by angle
    //rotate back mesh by opposite of angle

    // Make Points Global
    const x = new Vector3(1, 0, 0);
    const z = new Vector3(0, 0, 1);
    x.applyAxisAngle(yVec, controls.getAzimuthalAngle());
    z.applyAxisAngle(yVec, controls.getAzimuthalAngle());

    const vertices = Utils.positionBufferToVec3Corners(highlightMesh.geometry);
    vertices.forEach((vertex: THREE.Vector3) => {
      vertex.y = 0;
      vertex.applyAxisAngle(yVec, controls.getAzimuthalAngle());
    });

    const A = math.matrix([
      [x.x, z.x],
      [x.z, z.z],
    ]);
    const newRelativePoint = new Vector3().subVectors(endPoint, startPoint);
    const b = math.matrix([newRelativePoint.x, newRelativePoint.z]);
    const scalars = math.lusolve(A, b) as any;
    x.multiplyScalar(scalars.get([0, 0]));
    x.setY(0);
    z.multiplyScalar(scalars.get([1, 0]));
    z.setY(0);

    const globalMidPoint = Utils.midpoint(startPoint, endPoint);

    vertices[0].copy(startPoint);
    vertices[1].addVectors(startPoint, x);
    vertices[2].copy(endPoint);
    vertices[3].addVectors(startPoint, z);

    vertices.forEach((vertex: THREE.Vector3) => {
      vertex.sub(globalMidPoint);
      vertex.y = 0;
      vertex.applyAxisAngle(yVec, -controls.getAzimuthalAngle());
    });

    const newPoints = Utils.cornersToRectPoints(vertices);
    highlightMesh.geometry.setFromPoints(newPoints);
    highlightMesh.position.set(0, 0, 0);
    highlightMesh.setRotationFromAxisAngle(yVec, controls.getAzimuthalAngle());
    highlightMesh.position.copy(globalMidPoint);
  }

  this.updateFloorplanHistory = () => {
    store.dispatch(SetFuture([]));
    const currentFloorPlanState = floorplan.saveFixturePlan();
    floorplanState = produce(
      floorplanState,
      (draftState) => {
        return currentFloorPlanState;
      },
      (patches, inversePatches) => {
        const past = (store.getState() as ReduxState).undoRedo.past;
        const newPast = [...past];
        newPast.push({
          floorplan: { redo: { ...patches }, undo: { ...inversePatches } },
        });
        store.dispatch(SetPast(newPast));
      }
    );
    store.dispatch(NeedSaveAction(true));
  };

  this.onZoomUpdate = (
    walls: Wall[] = floorplan.getWalls(),
    zoom: number = this.cameras.camera.zoom
  ) => {
    walls.forEach((wall: Wall) => {
      if (zoom > 0.3) {
        wall.textScale = 1 / zoom;
      } else {
        if (wall.textScale !== 1 / 0.3) {
          wall.textScale = 1 / 0.3;
        }
      }
      wall.updateDim(true);
    });

    state.raycaster.params.Line.threshold = (1 * 10) / zoom;
    state.raycaster.params.Points.threshold = (10 * 10) / zoom;
  };

  this.updateWallLabels = () => {
    this.onZoomUpdate(floorplan.getWalls(), this.cameras.camera.zoom);
    this.needsUpdate = true;
  };

  const debounceOnZoomUpdate = debounce(this.updateWallLabels, 200);
  controls.addEventListener('zoom', debounceOnZoomUpdate);
  state.raycaster.layers.set(CameraLayers.Default);

  scene.add(state.highlightMesh);

  function resetHighlight() {
    state.firstHighlightCorner.set(0, 0, 0);
    state.secondHighlightCorner.set(0, 0, 0);
    updateHighlight(
      state.highlightMesh,
      state.firstHighlightCorner,
      state.secondHighlightCorner
    );
  }

  function makeFloorIntersectionPlane() {
    // TODO dynamically size ground plane used to find intersections
    const size = 100000;
    plane = new Mesh(new PlaneGeometry(size, size), new MeshBasicMaterial());
    plane.rotation.x = -Math.PI / 2;
    plane.visible = true;
    plane.material.visible = false;
    scene.add(plane);
    return plane;
  }

  const activeCorner$ = from(store as unknown as Observable<ReduxState>).pipe(
    map((state: ReduxState): Corner => {
      return state.floorPlan.activeCorner;
    }),
    distinctUntilChanged(),
    startWith(undefined)
  );

  const selectedCorners$ = from(
    store as unknown as Observable<ReduxState>
  ).pipe(
    map((state: ReduxState): Corner[] => {
      return state.floorPlan.selectedCorners;
    }),
    startWith([])
  );

  const mode$ = from(store as unknown as Observable<ReduxState>).pipe(
    map((state: ReduxState): FloorPlanModes => {
      return state.floorPlan.mode;
    }),
    distinctUntilChanged(),
    startWith(FloorPlanModes.NONE)
  );

  // const corners$ = from(store as unknown as Observable<ReduxState>).pipe(
  //   map((state: ReduxState): Item[] => {
  //     return state.floorplan.corners;
  //   }),
  //   distinctUntilChanged(),
  // )

  // const lines$ = from(store as unknown as Observable<ReduxState>).pipe(
  //   map((state: ReduxState): Item[] => {
  //     return state.floorplan.lines;
  //   }),
  //   distinctUntilChanged(),
  // )

  // const rooms$ = from(store as unknown as Observable<ReduxState>).pipe(
  //   map((state: ReduxState): Item[] => {
  //     return state.floorplan.rooms;
  //   }),
  //   distinctUntilChanged(),
  // )

  const enabled$ = mode$.pipe(
    map((mode: FloorPlanModes): boolean => {
      // TODO return state.floorplanner.activeController === ControllerType.Floorplan;
      return mode !== FloorPlanModes.NONE;
    }),
    distinctUntilChanged()
  );

  const mouseEventToCoordinate = (mouseEvent: MouseEvent) => {
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

  const mouseDown$ = fromEvent<MouseEvent>(element, 'mousedown').pipe(
    filter((e) => e.button !== 2)
  );

  const mousemove$ = fromEvent<MouseEvent>(element, 'mousemove').pipe(
    withLatestFrom(enabled$),
    filter(([e, enabled]) => enabled),
    map(([e, enabled$]): MouseEvent => e),
    filter(
      (e: MouseEvent) => Math.abs(e.movementX) > 0 || Math.abs(e.movementY) > 0
    ),
    filter((e) => e.buttons !== 2 && e.shiftKey === false)
  );

  const [mouseMove$, mouseDrag$] = partition(
    mousemove$,
    (e: MouseEvent) => e.buttons !== 1
  );

  const mouseUp$ = fromEvent<MouseEvent>(element, 'mouseup').pipe(
    filter((e) => e.button !== 2)
  );
  const keyDown$ = fromEvent<KeyboardEvent>(window, 'keydown');
  const keyUp$ = fromEvent<KeyboardEvent>(window, 'keyup');

  const key$ = merge(keyDown$, keyUp$).pipe(
    map((e) => (e.type === 'keydown' ? e : undefined)),
    startWith(undefined)
  );

  //intersect and drag

  const touchStart$ = fromEvent<TouchEvent>(element, 'touchstart');
  const touchMove$ = fromEvent<TouchEvent>(element, 'touchmove');
  const touchEnd$ = fromEvent<TouchEvent>(element, 'touchend');
  const drop$ = fromEvent(window, 'drop');

  const multiSelectMode$ = from(
    store as unknown as Observable<ReduxState>
  ).pipe(
    map((state: ReduxState): boolean => {
      return state.blue.multiSelect;
    }),
    distinctUntilChanged()
  );

  const multiSelect$ = combineLatest([
    mouseMove$.pipe(
      map((key) => key.ctrlKey || key.metaKey),
      distinctUntilChanged()
    ),
    mouseDown$.pipe(
      map((key) => key.ctrlKey || key.metaKey),
      distinctUntilChanged()
    ),
    multiSelectMode$,
  ]).pipe(
    map(([a, b, c]: [boolean, boolean, boolean]) => {
      return a || b || c;
    }),
    startWith(false)
  );

  const start$ = merge(
    mouseDown$.pipe(map(mouseEventToCoordinate)),
    touchStart$.pipe(map(touchEventToCoordinate))
  );
  const end$ = merge(
    mouseUp$.pipe(map(mouseEventToCoordinate)),
    touchEnd$.pipe(map(touchEventToCoordinate))
  );
  const moveCoordinate$ = merge(
    mouseMove$.pipe(map(mouseEventToCoordinate)),
    touchMove$.pipe(map(touchEventToCoordinate)),
    drop$.pipe(map(mouseEventToCoordinate))
    // end$,
    // start$
  );

  const move$ = merge(mouseMove$, touchEnd$);

  const getNormalized = (coord: { x: number; y: number }) => {
    const retVec = new Vector2();
    retVec.x = (coord.x / element.clientWidth) * 2 - 1;
    retVec.y = -(coord.y / element.clientHeight) * 2 + 1;
    return retVec;
  };

  const getPlaneCoordinates = (screenVec): Vector3 => {
    let intersections = [];
    state.raycaster.layers.set(CameraLayers.Default);
    state.raycaster.setFromCamera(screenVec, this.cameras.camera);
    const intersects = [plane];
    intersections = intersections.concat(
      state.raycaster.intersectObjects(intersects)
    );

    return intersections?.[0]?.point;
  };

  const drag$ = merge(
    mouseDrag$.pipe(map(mouseEventToCoordinate)),
    touchMove$.pipe(map(touchEventToCoordinate))
  );

  const normalizedDrag$ = drag$.pipe(map(getNormalized));

  const normalizedMove$ = moveCoordinate$.pipe(map(getNormalized));

  const intersectedWallOrCorner$ = merge(normalizedMove$, normalizedDrag$).pipe(
    withLatestFrom(selectedCorners$, mode$, multiSelect$, activeCorner$),
    map(
      ([screenVec, selectedCorners, mode, multiSelect, activeCorner]): [
        Corner | Wall,
        Corner[],
        FloorPlanModes,
      ] => {
        state.raycaster.setFromCamera(screenVec, this.cameras.camera);
        // this sets the handles to intersect

        const intersectable = [];
        switch (mode) {
          case FloorPlanModes.DRAW:
            floorplan
              .getCorners()
              .filter((corner: Corner) => corner !== activeCorner)
              .map((corner) => corner.getPoint())
              .forEach((point) => intersectable.push(point));
            floorplan
              .getWalls()
              .filter(
                (wall: Wall) =>
                  !(
                    selectedCorners.includes(wall.getStart()) ||
                    selectedCorners.includes(wall.getEnd())
                  )
              )
              .map((wall) => wall.getLine())
              .forEach((line) => intersectable.push(line));
            break;
          case FloorPlanModes.MOVE:
            floorplan
              .getCorners()
              .map((corner) => corner.getPoint())
              .forEach((point) => intersectable.push(point));
            floorplan
              .getWalls()
              .map((wall) => wall.getLine())
              .forEach((line) => intersectable.push(line));
            break;
          default:
            floorplan
              .getCorners()
              .map((corner) => corner.getPoint())
              .forEach((point) => intersectable.push(point));
            floorplan
              .getWalls()
              .map((wall) => wall.getLine())
              .forEach((line) => intersectable.push(line));
            break;
        }
        const intersections = state.raycaster
          .intersectObjects(intersectable)
          // .filter((intersection) => intersection.object instanceof Points || intersection.object instanceof Line2);
          .sort((a, b) => (a.object instanceof Points ? -1 : 1));
        if (intersections.length > 0) {
          if (intersections[0].object instanceof Points) {
            const corner = floorplan.getCorners().find((corner: Corner) => {
              return corner.id === intersections[0].object.userData.id;
            });
            if (corner) {
              return [corner, selectedCorners, mode];
            }
          } else if (intersections[0].object instanceof Line2) {
            const wall = floorplan.getWalls().find((wall: Wall) => {
              return wall.getIdentity() === intersections[0].object.userData.id;
            });
            if (wall) {
              return [wall, selectedCorners, mode];
            }
          } else {
            return [undefined, selectedCorners, mode];
          }
        }
        return [undefined, selectedCorners, mode];
      }
    ),
    distinctUntilChanged(
      ([prev, preveSel, prevMode], [curr, curSel, curMode]) =>
        prev?.id === curr?.id
    ),
    tap(([wallOrCorner, selectedCorners, mode]) => {
      floorplan.getCorners().forEach((corner) => corner.deIntersect());
      floorplan.getWalls().forEach((wall) => wall.deIntersect());
      if (wallOrCorner) wallOrCorner.intersect(mode);
      this.needsUpdate = true;
    }),
    map(
      ([wallCorner, selectedCorners, mode]): [
        Corner | Wall,
        FloorPlanModes,
      ] => [wallCorner, mode]
    )
  );

  const intersectedCorner$ = intersectedWallOrCorner$.pipe(
    map(([wallOrCorner, mode]) => {
      if (wallOrCorner instanceof Corner) {
        return wallOrCorner;
      } else {
        return undefined;
      }
    }),
    distinctUntilChanged((prev, curr) => prev?.id === curr?.id),
    startWith(undefined)
  );

  const intersectedWall$ = intersectedWallOrCorner$.pipe(
    map(([wallOrCorner, mode]) => {
      if (wallOrCorner instanceof Wall) {
        return wallOrCorner;
      } else {
        return undefined;
      }
    }),
    distinctUntilChanged((prev, curr) => prev?.id === curr?.id),
    startWith(undefined)
  );

  const draggingCoordinates$ = normalizedDrag$.pipe(
    map(getPlaneCoordinates),
    filter((position) => position !== undefined),
    distinctUntilChanged()
  );

  const planeCoordinates$ = normalizedMove$.pipe(
    map(getPlaneCoordinates),
    filter((position) => position !== undefined),
    distinctUntilChanged()
  );

  const startVec2$ = start$.pipe(
    withLatestFrom(normalizedMove$),
    map(([start, normal]) => normal)
  );

  const startCoordinates$ = startVec2$.pipe(map(getPlaneCoordinates));

  const dragging$ = draggingCoordinates$.pipe(
    withLatestFrom(startCoordinates$)
  );

  const click$ = end$.pipe(
    withLatestFrom(start$),
    filter((obs: [{ x: number; y: number }, { x: number; y: number }]) => {
      return (
        Math.abs(obs[0].x - obs[1].x) < clickTolerance &&
        Math.abs(obs[0].y - obs[1].y) < clickTolerance
      );
    }),
    map(([start, end]) => start)
  );

  const clickCoordinates$ = click$.pipe(
    map(getNormalized),
    map(getPlaneCoordinates)
  );

  const dragEnd$ = end$.pipe(
    withLatestFrom(start$),
    filter((obs: [{ x: number; y: number }, { x: number; y: number }]) => {
      return (
        Math.abs(obs[0].x - obs[1].x) > clickTolerance ||
        Math.abs(obs[0].y - obs[1].y) > clickTolerance
      );
    }),
    map(([end, start]) => end)
  );

  const dragEndCoordinates$ = dragEnd$.pipe(
    map(getNormalized),
    map(getPlaneCoordinates)
  );

  const setInitialZoom = () => {
    const initialHeight = 1000;
    const initialZoom = 10;
    this.cameras.camera.position.set(0, initialHeight, 0);
    controls.target.set(0, 0, 0);
    if (this.cameras.camera.isOrthographicCamera) {
      this.cameras.camera.zoom = initialZoom;
      this.cameras.camera.updateProjectionMatrix();
    }

    controls.update();
    this.needsUpdate = true;
  };

  let doOnIntersectedSubscription;
  let doOnClickSubscription;
  let doOnDragSubscription;
  let doOnDragEndSubscription;
  let doOnStartSubscription;
  let doOnEndSubscription;
  let doOnKeyDownSubscription;

  this.observers = mode$
    .pipe(withLatestFrom(activeCorner$, selectedCorners$))
    .subscribe(
      ([mode, activeCorner, selectedCorners]: [
        FloorPlanModes,
        Corner,
        Corner[],
      ]) => {
        if (selectedCorners && selectedCorners?.length > 0) {
          store.dispatch(SelectCorners([]));
        }

        doOnIntersectedSubscription?.unsubscribe();
        doOnClickSubscription?.unsubscribe();
        doOnStartSubscription?.unsubscribe();
        doOnEndSubscription?.unsubscribe();
        doOnDragSubscription?.unsubscribe();
        doOnDragEndSubscription?.unsubscribe();
        doOnKeyDownSubscription?.unsubscribe();

        controls.setEnabled(true);

        makeFloorIntersectionPlane();

        if (activeCorner) {
          activeCorner.removeAll();
          store.dispatch(SetActiveCorner(undefined));
          this.needsUpdate = true;
        }

        if (
          mode === FloorPlanModes.DRAW &&
          floorplan.getCorners().length === 0
        ) {
          setInitialZoom();
        }

        if (mode !== FloorPlanModes.NONE) {
          doOnKeyDownSubscription = key$
            .pipe(
              withLatestFrom(
                intersectedCorner$,
                selectedCorners$,
                intersectedWall$,
                planeCoordinates$,
                activeCorner$
              )
            )
            .subscribe(
              ([
                key,
                intersectedCorner,
                selectedCorners,
                intersectedWall,
                coord,
                activeCorner,
              ]) => {
                switch (key?.code) {
                  case 'Delete':
                  case 'Backspace':
                    if (selectedCorners.length === 0) {
                      if (intersectedCorner) {
                        intersectedCorner.removeAll();
                        this.updateFloorplan();
                      } else if (intersectedWall) {
                        intersectedWall.remove();
                        this.updateFloorplan();
                      }
                    }
                    if (selectedCorners.length === 1) {
                      floorplan.removeCorners(selectedCorners);
                      this.updateFloorplan();
                    }
                    if (selectedCorners.length > 1) {
                      const wallsToRemove = floorplan
                        .getWalls()
                        .filter((wall: Wall) => {
                          return (
                            selectedCorners.includes(wall.getStart()) &&
                            selectedCorners.includes(wall.getEnd())
                          );
                        });
                      wallsToRemove.forEach((wall: Wall) => wall.remove());
                      this.updateFloorplan();
                    }

                    key.stopPropagation();
                    key.preventDefault();
                    break;
                  case 'Escape':
                    store.dispatch(SetFloorPlanMode(FloorPlanModes.MOVE));
                    store.dispatch(SelectCorners([]));
                    key.stopPropagation();
                    key.preventDefault();
                    break;
                  case 'KeyS':
                    store.dispatch(Save());
                    key.stopPropagation();
                    key.preventDefault();
                    break;
                  case 'KeyL':
                    console.log(scene.children);
                    break;
                  case 'z':
                    if (key.ctrlKey) {
                      if (this.blockUndoRedo) break;
                      store.dispatch(UndoHistory());
                    }
                    break;
                  case 'y':
                    if (key.ctrlKey) {
                      if (this.blockUndoRedo) break;
                      store.dispatch(RedoHistory());
                    }
                    break;
                  default:
                    break;
                }
              }
            );
          doOnIntersectedSubscription = intersectedWallOrCorner$
            .pipe(map(([intersected, mode]) => [intersected?.id, mode]))
            .subscribe(([intersected, mode]) => {
              switch (mode) {
                case FloorPlanModes.DRAW:
                  element.style.cursor = 'crosshair';
                  break;
                case FloorPlanModes.MOVE:
                  if (intersected) {
                    element.style.cursor = 'pointer';
                  } else {
                    element.style.cursor = 'auto';
                  }
                  break;
                default:
                  break;
              }
            });
        }

        switch (mode) {
          case FloorPlanModes.MOVE:
            doOnStartSubscription = start$
              .pipe(
                map(getNormalized),
                map(getPlaneCoordinates),
                withLatestFrom(
                  intersectedCorner$,
                  intersectedWall$,
                  selectedCorners$,
                  multiSelect$
                )
              )
              .subscribe(
                ([
                  position,
                  intersectedCorner,
                  intersectedWall,
                  selectedCorners,
                  multiSelect,
                ]: [Vector3, Corner, Wall, Corner[], boolean]) => {
                  if (intersectedCorner) {
                    if (multiSelect) {
                      if (intersectedCorner.selected) {
                        //Deselect on click
                        // store.dispatch(SelectCorners(
                        //   selectedCorners.filter((corner) => corner !== intersectedCorner)
                        // ))
                      } else {
                        store.dispatch(
                          SelectCorners(
                            [intersectedCorner].concat(selectedCorners)
                          )
                        );
                      }
                    } else {
                      store.dispatch(SelectCorners([intersectedCorner]));
                    }
                    state.multiselectState = 'drag';
                  } else if (intersectedWall) {
                    const acc = [];
                    if (multiSelect) acc.push(...selectedCorners);
                    store.dispatch(
                      SelectCorners(
                        [intersectedWall].reduce((acc, current) => {
                          if (
                            selectedCorners.includes(current.getStart()) &&
                            selectedCorners.includes(current.getEnd())
                          ) {
                            //deselect line
                            // acc = acc.filter((corner: Corner) => corner !== current.getStart() && corner !== current.getEnd());
                          } else {
                            if (!selectedCorners.includes(current.getStart())) {
                              acc.push(current.getStart());
                              if (!multiSelect) acc.push(current.getEnd());
                            }
                            if (!selectedCorners.includes(current.getEnd())) {
                              acc.push(current.getEnd());
                              if (!multiSelect) acc.push(current.getStart());
                            }
                          }

                          return acc;
                        }, acc)
                      )
                    );
                    state.multiselectState = 'drag';
                  } else {
                    // if (!multiSelect) store.dispatch(SelectCorners([]))
                    // start highlight box
                    state.firstHighlightCorner.copy(position);
                    state.secondHighlightCorner.copy(position);
                    state.multiselectState = 'highlight';
                  }
                  controls.setEnabled(true);
                }
              );

            doOnDragEndSubscription = dragEndCoordinates$
              .pipe(
                withLatestFrom(
                  multiSelect$,
                  selectedCorners$,
                  intersectedCorner$,
                  intersectedWall$
                )
              )
              .subscribe(
                ([
                  end,
                  multiSelect,
                  selectedCorners,
                  intersectedCorner,
                  intersectedWall,
                ]: [Vector3, boolean, Corner[], Corner, Wall]) => {
                  if (multiSelect) {
                    if (
                      !state.firstHighlightCorner.equals(
                        state.secondHighlightCorner
                      )
                    ) {
                      boxSelectAll(
                        getCorners(state.highlightMesh),
                        floorplan.getCorners(),
                        selectedCorners
                      );
                      resetHighlight();
                      this.needsUpdate = true;
                    }
                  } else {
                    if (selectedCorners.length > 0) {
                      if (intersectedCorner) {
                        if (selectedCorners.length === 1) {
                          selectedCorners[0].mergeWithIntersected(
                            intersectedCorner
                          );
                        }
                      } else if (intersectedWall) {
                        if (selectedCorners[0]) {
                          const newWalls =
                            selectedCorners[0].mergeWithIntersected(
                              intersectedWall
                            );
                          newWalls?.forEach((wall: Wall) =>
                            wall.setAzimuth(controls.getAzimuthalAngle())
                          );
                          this.onZoomUpdate(newWalls, this.cameras.camera.zoom);
                        }
                      }
                      selectedCorners.forEach((corner) =>
                        corner.set_positionBak()
                      );
                      this.updateFloorplanHistory();
                      if (selectedCorners.length <= 2) {
                        store.dispatch(SelectCorners([]));
                      }
                    }
                  }
                  floorplan
                    .getCorners()
                    .forEach((corner) => corner.set_positionBak());

                  controls.setEnabled(true);
                }
              );

            doOnDragSubscription = dragging$
              .pipe(
                withLatestFrom(selectedCorners$, multiSelect$)
                // filter(([drag, corners]) => corners.length > 0),
                // debounce(i => interval(20)),
              )
              .subscribe(
                ([[newPosition, startVec], corners, multiSelect]: [
                  [Vector3, Vector3],
                  Corner[],
                  boolean,
                ]) => {
                  if (controls.enabled) controls.setEnabled(false);
                  if (multiSelect && state.multiselectState === 'highlight') {
                    state.secondHighlightCorner.copy(newPosition);
                    if (corners.length === 0 || multiSelect) {
                      updateHighlight(
                        state.highlightMesh,
                        state.firstHighlightCorner,
                        state.secondHighlightCorner
                      );
                      this.needsUpdate = true;
                    } else {
                      resetHighlight();
                      this.needsUpdate = true;
                    }
                  } else {
                    //else if corners.length > 0
                    const relMoveVec = new Vector3().subVectors(
                      newPosition,
                      startVec
                    );
                    if (corners.length === 1) {
                      corners[0].move(newPosition, snapTolerance);
                      corners[0].snapToAxis(controls.getAzimuthalAngle());
                      corners[0].fireAction(corners[0]);
                    } else {
                      corners.forEach((corner) =>
                        corner.relativeMove(relMoveVec, snapTolerance)
                      );
                      corners.forEach((corner: Corner) =>
                        corner.snapToAxis(controls.getAzimuthalAngle())
                      );
                      corners.forEach((corner) => corner.fireAction(corner));
                    }
                    this.needsUpdate = true;
                  }
                }
              );

            doOnClickSubscription = clickCoordinates$
              .pipe(
                withLatestFrom(
                  intersectedCorner$,
                  intersectedWall$,
                  multiSelect$
                )
              )
              .subscribe(
                ([Coords, corner, wall, multiSelect]: [
                  Vector3,
                  Corner,
                  Wall,
                  boolean,
                ]) => {
                  if (corner || wall) {
                  } else {
                    store.dispatch(SelectCorners([]));
                  }
                  resetHighlight();
                }
              );

            break;
          case FloorPlanModes.DELETE:
            doOnClickSubscription = clickCoordinates$
              .pipe(
                withLatestFrom(intersectedCorner$, intersectedWall$),
                map(([coords, intersectedCorner, intersectedWall]) => [
                  intersectedCorner,
                  intersectedWall,
                ])
              )
              .subscribe(
                ([intersectedCorner, intersectedWall]: [Corner, Wall]) => {
                  if (intersectedCorner) {
                    intersectedCorner.removeAll();
                    this.updateFloorplan();
                  } else if (intersectedWall) {
                    intersectedWall.remove();
                    this.updateFloorplan();
                  }
                }
              );
            doOnDragSubscription = dragging$
              .pipe(
                withLatestFrom(intersectedWall$),
                filter(([drag, wall]) => wall !== undefined)
              )
              .subscribe(
                ([[newPosition, startVec], intersectedWall]: [
                  [Vector3, Vector3],
                  Wall,
                ]) => {
                  intersectedWall.remove();
                  this.updateFloorplan();
                }
              );

            break;
          case FloorPlanModes.DRAW:
            doOnStartSubscription = startCoordinates$
              .pipe(
                withLatestFrom(
                  intersectedCorner$,
                  intersectedWall$,
                  selectedCorners$
                )
              )
              .subscribe(
                ([
                  startCoord,
                  intersectedCorner,
                  intersectedWall,
                  selectedCorners,
                ]) => {
                  floorplan
                    .getCorners()
                    .forEach((corner) => corner.set_positionBak());
                  if (!startCoord) {
                    const cameraPos = this.cameras.camera.position.clone();
                    startCoord = new Vector3(cameraPos.x, 0, cameraPos.z);
                  }
                  if (intersectedCorner) {
                    if (selectedCorners[0]) {
                      selectedCorners[0].mergeWithIntersected(
                        intersectedCorner
                      );
                      store.dispatch(SetActiveCorner(undefined));
                      this.updateFloorplan();
                    } else {
                      store.dispatch(SetActiveCorner(intersectedCorner));
                    }
                  } else if (intersectedWall) {
                    if (selectedCorners[0]) {
                      const newWalls =
                        selectedCorners[0].mergeWithIntersected(
                          intersectedWall
                        );
                      newWalls.forEach((wall: Wall) =>
                        wall.setAzimuth(controls.getAzimuthalAngle())
                      );
                      this.onZoomUpdate(newWalls, this.cameras.camera.zoom);
                      store.dispatch(SetActiveCorner(undefined));
                    } else {
                      const newCorner = floorplan.newCorner(
                        startCoord.toArray()
                      );
                      const newWalls =
                        newCorner.mergeWithIntersected(intersectedWall);
                      newWalls.forEach((wall: Wall) =>
                        wall.setAzimuth(controls.getAzimuthalAngle())
                      );
                      this.onZoomUpdate(newWalls, this.cameras.camera.zoom);
                      store.dispatch(SetActiveCorner(newCorner));
                    }
                    this.updateFloorplan();
                  } else {
                    if (selectedCorners[0]) {
                      // this is chain should be toggled
                      store.dispatch(SetActiveCorner(selectedCorners[0]));
                      this.updateFloorplanHistory();
                    } else {
                      //new corner
                      store.dispatch(
                        SetActiveCorner(
                          floorplan.newCorner(startCoord.toArray())
                        )
                      );
                    }
                  }
                  store.dispatch(SelectCorners([]));
                }
              );

            doOnDragSubscription = planeCoordinates$
              .pipe(
                withLatestFrom(
                  startCoordinates$,
                  activeCorner$,
                  selectedCorners$
                )
              )
              .subscribe(
                ([newPosition, startCoord, activeCorner, selectedCorners]) => {
                  if (selectedCorners.length === 1) {
                    selectedCorners[0].move(newPosition, snapTolerance);
                    selectedCorners[0].snapToAxis(controls.getAzimuthalAngle());
                    selectedCorners[0].fireAction(selectedCorners[0]);
                    this.needsUpdate = true;
                  } else if (activeCorner) {
                    const endCorner = floorplan.newCorner(
                      newPosition.toArray()
                    );
                    const newWall = floorplan.newWall(activeCorner, endCorner);
                    newWall.setAzimuth(controls.getAzimuthalAngle());
                    this.onZoomUpdate([newWall], this.cameras.camera.zoom);
                    store.dispatch(SetActiveCorner(endCorner));
                    store.dispatch(SelectCorners([endCorner]));
                  }
                }
              );
            doOnDragEndSubscription = dragEndCoordinates$.subscribe((end) => {
              store.dispatch(SetActiveCorner(undefined));
            });
            break;
          case FloorPlanModes.SCALE:
            //Scale by direction left right
            doOnStartSubscription = start$.subscribe(() => {
              state.tempScale =
                (store.getState() as ReduxState).designer.floorPlan
                  .floorplanImageScale ?? 1;
            });
            doOnDragSubscription = drag$
              .pipe(withLatestFrom(key$))
              .subscribe(([newPosition, key]: [Vector2, any]) => {
                let change = 1;
                if (state.prevPosition.x !== 0) {
                  change +=
                    ((newPosition.x - state.prevPosition.x) * scaleSpeed) /
                    element.clientWidth /
                    this.cameras.camera.zoom;
                }
                change = Utils.clamp(change, 0.96, 1.04);

                state.prevPosition.copy(newPosition);
                if (key?.code !== 'KeyF') {
                  state.tempScale = change * state.tempScale;
                  floorplanner.scaleImage(state.tempScale);
                }
                if (key?.code !== 'KeyI') {
                  floorplan.scale(change);
                }
                this.needsUpdate = true;
              });
            doOnDragEndSubscription = dragEnd$.subscribe(() => {
              state.prevPosition.set(0, 0);
              store.dispatch(
                SetFloorPlan({
                  floorplanImageScale: state.tempScale,
                })
              );
              store.dispatch(Save());
            });
            doOnClickSubscription = click$.subscribe(() => {
              state.prevPosition.set(0, 0);
            });
            break;
          case FloorPlanModes.NONE:
          default:
            if (uiControls.children.length > 0) {
              uiControls.clear();
              scene.remove(uiControls);
              scene.remove(plane);

              this.updateFloorplan();
            }
            break;
        }
      }
    );

  this.updateFloorplan = () => {
    floorplan.update();
    this.updateFloorplanHistory();
    this.needsUpdate = true;
  };

  this.initHistory = () => {
    store.dispatch(SetPast([]));
    store.dispatch(SetFuture([]));
  };
  this.initHistory();

  this.dispose = () => {
    store.dispatch(SetFloorPlanMode(FloorPlanModes.NONE));
    this.observers?.unsubscribe();
  };
};
