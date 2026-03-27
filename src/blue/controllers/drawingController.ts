import { store } from '../..';
import { ReduxState } from '../../reducers';
import {
  CameraLayers,
  ControllerMode,
  ControllerType,
  DrawingMode,
} from '../../models/BlueState';

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
  Sprite,
  Vector2,
  Vector3,
} from 'three';
import { Utils } from '../core/utils';
import 'three/examples/fonts/helvetiker_regular.typeface.json';
import {
  FloorPlanModes,
  SelectCorners,
  SetFloorPlanMode,
} from '../../reducers/floorPlan';
import { Corner } from '../model/corner';
import { Line2 } from 'three/examples/jsm/lines/Line2';
import * as math from 'mathjs';
import { SetFuture, SetPast } from '../../reducers/undoRedo';
import { NeedSaveAction, SetSelectedPoints } from '../../reducers/blue';
import { debounce } from 'ts-debounce';
import { DimensionMaker } from '../three/dimensionMaker';
import { PlacezLine } from '../shapes/placezLine';
import { PlacezShape } from '../shapes/placezShapes';
import {
  LocalStorageKey,
  localStorageObservable$,
} from '../../components/Hooks/useLocalStorageState';

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

export const DrawingController = function (
  scene,
  cameras,
  element,
  controls,
  main
) {
  this.controllerType = ControllerType.Drawing;
  const cam = cameras;

  const snapTolerance = 50;
  const clickTolerance = 3;

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
  };

  state.raycaster.params.Line = { threshold: 10 };
  state.raycaster.params.Points = { threshold: 15 };

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

  this.updateHistory = () => {
    // store.dispatch(SetFuture([]));
    // const currentHistoryState =
    // // const currentHistoryState = floorplan.saveFixturePlan();
    // const currentHistoryState = produce(
    //   historyState,
    //   draftState => {
    //     return currentHistoryState;
    //   },
    //   (patches, inversePatches) => {
    //     const past = (store.getState() as ReduxState).undoRedo.past;
    //     const newPast = [...past];
    //     newPast.push({floorplan: { redo: { ...patches }, undo: { ...inversePatches }, }});
    //     store.dispatch(SetPast(newPast));
    //   }
    // );
    // store.dispatch(NeedSaveAction(true));
  };

  this.onZoomUpdate = (
    dimensions: DimensionMaker[] = main.getDimension(),
    zoom: number = this.cameras.camera.zoom
  ) => {
    dimensions.forEach((dimension: DimensionMaker) => {
      // Update Dimensions
      // if (zoom > 0.3) {
      //   wall.textScale = 1 / zoom;
      // } else {
      //   if (wall.textScale !== 1 / 0.3) {
      //     wall.textScale = 1 / 0.3;
      //   }
      // }
      // wall.updateDim(true);
    });

    state.raycaster.params.Line.threshold = (1 * 10) / zoom;
    state.raycaster.params.Points.threshold = (10 * 10) / zoom;
  };

  const updateLabels = () => {
    // this.onZoomUpdate(main.getDimension(), this.cameras.camera.zoom);
    this.needsUpdate = true;
  };

  const debounceOnZoomUpdate = debounce(updateLabels, 200);
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

  // const activeCorner = new Subject<Corner>();
  // const activeCorner$ = .pipe(
  //   map((state: ReduxState): Corner => {
  //     return state.floorPlan.activeCorner;
  //   }),
  //   distinctUntilChanged(),
  //   startWith(undefined),
  // )

  const selectedPoints$ = from(store as unknown as Observable<ReduxState>).pipe(
    map((state: ReduxState): Points[] => {
      return state.blue.selectedPoints;
    }),
    startWith([])
  );

  const mode$ = from(store as unknown as Observable<ReduxState>).pipe(
    map((state: ReduxState): ControllerMode => {
      return state.blue.controllerMode;
    }),
    distinctUntilChanged(),
    startWith(ControllerMode.MOVE)
  );

  const drawingType$ = from(store as unknown as Observable<ReduxState>).pipe(
    map((state: ReduxState): DrawingMode => {
      return state.blue.drawingMode;
    }),
    distinctUntilChanged(),
    startWith(DrawingMode.DIMENSION)
  );

  const enabled$ = from(store as unknown as Observable<ReduxState>).pipe(
    map((state: ReduxState): boolean => {
      return state.blue.activeController === this.controllerType;
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

  const intersectedEntity$ = merge(normalizedMove$, normalizedDrag$).pipe(
    withLatestFrom(mode$),
    tap(([screenVec, mode]) => {
      if (mode === ControllerMode.CREATE) {
        element.style.cursor = 'crosshair';
      }
    }),
    filter(([screenVec, mode]) => mode !== ControllerMode.CREATE),
    map(([screenVec, mode]) => {
      const shapes = main.shapes.map((shape: PlacezLine) => {
        return shape.getShape();
      });

      let intersections = [];
      state.raycaster.layers.set(CameraLayers.Measurments);
      state.raycaster.setFromCamera(screenVec, this.cameras.camera);
      intersections = intersections.concat(
        state.raycaster.intersectObjects(shapes)
      );
      return intersections?.map((intersection) => intersection.object);
    }),
    distinctUntilChanged(),
    tap((intersectedObjects) => {
      if (intersectedObjects?.length > 0) {
        element.style.cursor = 'pointer';
      } else {
        element.style.cursor = 'auto';
      }
    })
  );

  const intersectedPoints$ = intersectedEntity$.pipe(
    map((intersectionObjects) => {
      return intersectionObjects?.filter((object) => object instanceof Points);
    })
  );

  const intersectedLine$ = intersectedEntity$.pipe(
    map((intersectionObjects) => {
      return intersectionObjects?.filter(
        (object) => object instanceof Line2
      )[0];
    })
  );

  const intersectedShape$ = intersectedEntity$.pipe(
    map((intersectionObjects) => {
      return intersectionObjects?.map((object) =>
        object instanceof Line2 || object instanceof Sprite ? object : undefined
      )[0];
    })
  );

  const selectPoint$ = start$.pipe(
    withLatestFrom(mode$, drawingType$, intersectedPoints$),
    filter(
      ([start, mode, drawingType, points]) =>
        points?.length > 0 && mode === ControllerMode.MOVE
    ),
    map(([start, mode, drawingType, points]) => points)
  );

  const selectLine$ = start$.pipe(
    withLatestFrom(mode$, drawingType$, intersectedLine$),
    filter(
      ([start, mode, drawingType, intersectedLine]) =>
        intersectedLine !== undefined && mode === ControllerMode.MOVE
    ),
    map(([start, mode, drawingType, intersectedLine]) => intersectedLine)
  );

  const selectShape$ = start$.pipe(
    withLatestFrom(mode$, drawingType$, intersectedShape$),
    filter(
      ([start, mode, drawingType, intersectedShape]) =>
        intersectedShape !== undefined && mode === ControllerMode.MOVE
    ),
    map(
      ([start, mode, drawingType, intersectedShape]) =>
        intersectedShape.userData.shape
    )
  );

  const startCoordinates$ = start$.pipe(
    map(getNormalized),
    map(getPlaneCoordinates),
    filter((position) => position !== undefined),
    distinctUntilChanged()
  );

  const draggingCoordinates$ = normalizedDrag$.pipe(
    map(getPlaneCoordinates),
    filter((position) => position !== undefined),
    distinctUntilChanged()
  );

  const draggingDelta$ = normalizedDrag$.pipe(
    map(getPlaneCoordinates),
    filter((position) => position !== undefined),
    withLatestFrom(startCoordinates$),
    map(([current, start]) => {
      return current.sub(start);
    }),
    distinctUntilChanged()
  );

  const planeCoordinates$ = normalizedMove$.pipe(
    map(getPlaneCoordinates),
    filter((position) => position !== undefined),
    distinctUntilChanged()
  );

  const startDrawingLine$ = start$.pipe(
    withLatestFrom(mode$, drawingType$, planeCoordinates$),
    filter(
      ([start, mode, drawingType, coordinates]) =>
        mode === ControllerMode.CREATE && drawingType === DrawingMode.DIMENSION
    ),
    map(([start, mode, drawingType, coordinates]) => coordinates)
  );

  const deleteIntersected$ = start$.pipe(
    withLatestFrom(mode$, drawingType$, intersectedEntity$),
    filter(
      ([start, mode, drawingType, intersectedEntity]) =>
        mode === ControllerMode.DELETE && intersectedEntity.length > 0
    ),
    map(
      ([start, mode, drawingType, intersectedEntity]) => intersectedEntity[0]
    ),
    tap((e) => console.log(e))
  );

  const dragPoints$ = draggingDelta$.pipe(withLatestFrom(selectedPoints$));

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

  const dragEndPoints$ = dragEnd$.pipe(
    withLatestFrom(selectedPoints$),
    filter(([end, points]) => points.length > 0)
  );

  const dragDelete$ = drag$.pipe(
    withLatestFrom(mode$, intersectedEntity$),
    filter(
      ([end, mode, intersection]) =>
        mode === ControllerMode.DELETE && intersection.length > 0
    ),
    map(([end, mode, intersection]) => intersection[0])
  );

  let doOnIntersectedSubscription;
  let doOnSelectShapeSubscription;
  let doOnDragSubscription;
  let doOnDragEndSubscription;
  let doOnStartDrawingLineSubscription;
  let doOnEndSubscription;
  let doOnKeyDownSubscription;
  let doOnDragPointsSubscription;
  let doOnSelectPointSubscription;
  let doOnDragEndPointsSubscription;
  let doOnDeleteIntersectedSubscription;

  enabled$.subscribe((enabled: boolean) => {
    doOnIntersectedSubscription?.unsubscribe();
    doOnSelectShapeSubscription?.unsubscribe();
    doOnStartDrawingLineSubscription?.unsubscribe();
    doOnEndSubscription?.unsubscribe();
    doOnDragSubscription?.unsubscribe();
    doOnDragEndSubscription?.unsubscribe();
    doOnKeyDownSubscription?.unsubscribe();
    doOnDragPointsSubscription?.unsubscribe();
    doOnSelectPointSubscription?.unsubscribe();
    doOnDragEndPointsSubscription?.unsubscribe();
    doOnDeleteIntersectedSubscription?.unsubscribe();

    controls.setEnabled(true);

    if (enabled) {
      makeFloorIntersectionPlane();

      doOnStartDrawingLineSubscription = startDrawingLine$.subscribe(
        (position) => {
          // create line
          const line: PlacezLine = main.createLine(position);

          // select point
          store.dispatch(SetSelectedPoints([line.points[1]]));
          this.pointsBak = [line.points[1].userData.point.clone()];
        }
      );

      doOnDragEndPointsSubscription = dragEndPoints$.subscribe(() => {
        store.dispatch(SetSelectedPoints([]));
        store.dispatch(NeedSaveAction(true));
      });

      doOnDragPointsSubscription = dragPoints$.subscribe(([delta, points]) => {
        points.forEach((point: Points, index: number) => {
          point.userData.point.copy(this.pointsBak[index]);
          point.userData.point.add(delta);
          point.userData.shape.update();
        });
        this.needsUpdate = true;
      });

      doOnSelectPointSubscription = selectPoint$.subscribe(
        (points: Points[]) => {
          this.pointsBak = points.map((point: Points) =>
            point.userData.point.clone()
          );
          store.dispatch(SetSelectedPoints(points));
        }
      );

      doOnSelectShapeSubscription = selectShape$.subscribe(
        (intersectedShape) => {
          const points = intersectedShape.points;
          this.pointsBak = points.map((point: Points) =>
            point.userData.point.clone()
          );
          store.dispatch(SetSelectedPoints(points));
        }
      );

      doOnDeleteIntersectedSubscription = merge(
        deleteIntersected$,
        dragDelete$
      ).subscribe((intersection) => {
        main.removeShape(intersection.userData.shape);
        store.dispatch(NeedSaveAction(true));
      });
    }
  });

  this.dimensionLabelSubscription = localStorageObservable$
    .pipe(
      map((localStorageState) => localStorageState[LocalStorageKey.Dimensions]),
      distinctUntilChanged()
    )
    .subscribe((e: any) => {
      main.shapes.forEach((shape: PlacezShape) => {
        shape.updateDimensionLabel();
      });
      this.needsUpdate = true;
    });

  this.initHistory = () => {
    store.dispatch(SetPast([]));
    store.dispatch(SetFuture([]));
  };
  this.initHistory();

  this.dispose = () => {
    store.dispatch(SetFloorPlanMode(FloorPlanModes.NONE));
  };
};
