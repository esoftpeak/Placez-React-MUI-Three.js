import { store } from '../..';
import { ReduxState } from '../../reducers';
import { CameraLayers } from '../../models/BlueState';

import { from, fromEvent, merge, Observable } from 'rxjs';
import {
  distinctUntilChanged,
  filter,
  map,
  tap,
  withLatestFrom,
} from 'rxjs/operators';
import {
  BufferGeometry,
  Float32BufferAttribute,
  LineBasicMaterial,
  Matrix4,
  Mesh,
  MeshBasicMaterial,
  Object3D,
  PlaneGeometry,
  Quaternion,
  Raycaster,
  Vector2,
  Vector3,
} from 'three';
import { Item, isFloorItem } from '../items/item';
import { Utils } from '../core/utils';
import { FontLoader } from 'three/examples/jsm/loaders/FontLoader';
import 'three/examples/fonts/helvetiker_regular.typeface.json';

const loadFont = (font) => {
  const loader = new FontLoader();
  loader.load(`helvetiker_regular.typeface.json`, (loadedFont) => {
    font = loadedFont;
  });
};

export const MultiSelectController = function (
  scene,
  cam,
  element,
  hud,
  controls
) {
  let plane; // ground plane used for intersection testing
  this.cameras = cam;
  this.font = undefined;
  loadFont(this.font);
  this.lengthVec = new Vector3();

  const uiControls = new Object3D();

  const material = new LineBasicMaterial({
    depthTest: false,
    depthWrite: false,
    color: 0x5c236f,
    linewidth: 3,
  });

  const state = {
    themeColor: 'purple',
    raycaster: new Raycaster(),
    offsetAngle: 0,
    rotationAngleBak: 0,
    rotationAngleTemp: 0,
    transformationsBak: {},
    rotationsBak: {},
    previousPositionVec: new Vector3(),
  };
  state.raycaster.params.Line.threshold = 30;
  state.raycaster.layers.set(CameraLayers.Default);

  enum IntersectionTypes {
    GlobalRotationHandle = 'GlobalRotationHandle',
    CenterDragHandle = 'CenterDragHandle',
    Item = 'Item',
    Wall = 'Wall',
    Floor = 'Floor',
  }

  let centerDrag = undefined;
  let globalRotationHandle = undefined;

  function setGroundPlane() {
    // TODO dynamically size ground plane used to find intersections
    const size = 100000;
    plane = new Mesh(new PlaneGeometry(size, size), new MeshBasicMaterial());
    plane.rotation.x = -Math.PI / 2;
    plane.visible = true;
    plane.material.visible = false;
    scene.add(plane);
  }

  const buildTransformsBak = (items: Item[]): { [key: string]: Matrix4 } => {
    return items.reduce((acc, item: Item) => {
      acc[item.asset.instanceId] = item.matrixWorld.clone();
      return acc;
    }, {});
  };

  const buildRotationsBak = (items: Item[]): { [key: string]: Matrix4 } => {
    return items.reduce((acc, item: Item) => {
      acc[item.asset.instanceId] = item.rotation.y;
      return acc;
    }, {});
  };

  const selectedItems$ = from(store as unknown as Observable<ReduxState>).pipe(
    map((state: ReduxState): Item[] => {
      return state.blue.selectedItems;
    }),
    distinctUntilChanged()
  );

  const enabled$ = selectedItems$.pipe(
    map((items: Item[]) => items.length > 0),
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
    tap((e) => {
      e.stopPropagation();
    }),
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

  //intersect and drag

  const touchStart$ = fromEvent(element, 'touchstart').pipe(
    map(touchEventToCoordinate)
  );
  const touchMove$ = fromEvent(element, 'touchmove').pipe(
    map(touchEventToCoordinate)
  );
  const touchEnd$ = fromEvent(element, 'touchend').pipe(
    map(touchEventToCoordinate)
  );
  const drop$ = fromEvent(window, 'drop').pipe(map(mouseEventToCoordinate));
  const keyDown$ = fromEvent<KeyboardEvent>(window, 'keydown');

  const start$ = merge(mouseDown$, touchStart$);
  const end$ = merge(mouseUp$, touchEnd$);
  const coordinate$ = merge(mouseMove$, touchEnd$, drop$, end$, start$);

  const getNormalized = (coord: { x: number; y: number }) => {
    const retVec = new Vector2();
    retVec.x = (coord.x / element.clientWidth) * 2 - 1;
    retVec.y = -(coord.y / element.clientHeight) * 2 + 1;
    return retVec;
  };

  const getPlaneCoordinates = ([screenVec, items]): Vector3 => {
    let intersections = [];
    const ignoreFixed = (store.getState() as ReduxState).blue.ignoreFixed;
    state.raycaster.layers.set(CameraLayers.Default);
    state.raycaster.setFromCamera(screenVec, this.cameras.camera);

    const asset = items[0].asset;
    let intersects = [];
    if (isFloorItem(asset.classType)) {
      const floorItems = scene
        .getItems()
        .filter((item: Item) => {
          return isFloorItem(item.asset.classType);
        })
        .filter(
          (item) =>
            !(
              item.asset.extensionProperties &&
              item.asset.extensionProperties.fixed &&
              ignoreFixed
            )
        );
      if (scene.sceneScan) {
        intersects = intersects.concat(scene.sceneScan);
      } else {
        intersects = intersects.concat([plane]);
      }
      intersects = intersects.concat(floorItems);
    } else if (asset.classType === 'CeilingItem') {
      intersects = intersects.concat([plane]);
    } else {
      if (scene.sceneScan) {
        intersects = intersects.concat(scene.sceneScan);
      } else {
        intersects = intersects.concat(scene.model.floorplan.wallEdgePlanes());
        console.log('intersects', intersects);
      }
    }
    intersections = intersections.concat(
      state.raycaster.intersectObjects(intersects)
    );

    return intersections?.[0]?.point;
  };

  const normalizedDrag$ = merge(mouseDrag$, touchMove$).pipe(
    map(getNormalized)
  );

  const normalizedMove$ = coordinate$.pipe(map(getNormalized));

  const intersectedObject$ = normalizedMove$.pipe(
    map((screenVec): IntersectionTypes => {
      state.raycaster.setFromCamera(screenVec, this.cameras.camera);
      // this sets the handles to intersect
      const intersections = state.raycaster.intersectObjects([uiControls]);

      if (
        intersections.length > 0 &&
        intersections[0].object.userData.type !== undefined
      ) {
        return intersections[0].object.userData.type;
      }
      return undefined;
    })
  );

  const draggingCoordinates$ = normalizedDrag$.pipe(
    withLatestFrom(selectedItems$),
    map(getPlaneCoordinates),
    filter((position) => position !== undefined),
    distinctUntilChanged()
  );

  const startCoordinates$ = start$.pipe(
    withLatestFrom(normalizedMove$),
    map(([start, normal]) => normal),
    withLatestFrom(selectedItems$),
    map(getPlaneCoordinates),
    distinctUntilChanged()
  );

  const yAxis = new Vector3(0, 1, 0);

  const draggingGlobalRotation$ = draggingCoordinates$.pipe(
    withLatestFrom(intersectedObject$),
    filter(([position, intersected]) => {
      return intersected === IntersectionTypes.GlobalRotationHandle;
    }),
    map(([newPosition, userData]) => newPosition)
  );

  const draggingCenter$ = draggingCoordinates$.pipe(
    withLatestFrom(intersectedObject$),
    filter(([position, intersected]) => {
      return intersected === IntersectionTypes.CenterDragHandle;
    }),
    map(([newPosition, userData]) => newPosition),
    withLatestFrom(startCoordinates$)
  );

  let doOnIntersectedHandleSubscription;
  let doOnSelectedItemsSubscription;
  let doOnClickSubscription;
  let doOnDragGlobalRotationSubscription;
  let doOnDragCenterSubscription;
  let doOnDragEndSubscription;
  let doOnDragStartSubscription;
  let doOnSettingsChangeSubscription;

  this.observers = enabled$
    .pipe(withLatestFrom(selectedItems$))
    .subscribe(([enabled, items]) => {
      doOnIntersectedHandleSubscription?.unsubscribe();
      doOnSelectedItemsSubscription?.unsubscribe();
      doOnClickSubscription?.unsubscribe();
      doOnDragGlobalRotationSubscription?.unsubscribe();
      doOnDragCenterSubscription?.unsubscribe();
      doOnDragEndSubscription?.unsubscribe();
      doOnDragStartSubscription?.unsubscribe();
      doOnSettingsChangeSubscription?.unsubscribe();

      if (enabled) {
        doOnDragGlobalRotationSubscription = draggingGlobalRotation$
          .pipe(withLatestFrom(selectedItems$))
          .subscribe(([newPosition, items]) => {
            const currentAngleVec = new Vector3().subVectors(
              newPosition,
              uiControls.position
            );

            const currentAngle = Utils.angle(
              0,
              1,
              currentAngleVec.x,
              currentAngleVec.z
            );
            const newAngle = Utils.snapRotation(
              Utils.convertAngle0To2Pi(currentAngle - state.offsetAngle),
              true
            );

            const positionBakVec = new Vector3();

            const transformations = items.map((item: Item, index) => {
              const relAngle =
                newAngle -
                state.rotationAngleBak +
                state.rotationsBak[item.asset.instanceId];

              const relPositionAngle = newAngle - state.rotationAngleBak;

              const newPosition = positionBakVec
                .setFromMatrixPosition(
                  state.transformationsBak[item.asset.instanceId]
                )
                .sub(uiControls.position)
                .applyAxisAngle(yAxis, relPositionAngle)
                .add(uiControls.position)
                .clone();

              const newRotation = new Quaternion().setFromAxisAngle(
                yAxis,
                relAngle
              );

              // calculating validity like this is wrong

              return {
                item,
                newPosition,
                newRotation,
                valid: item.isValidPosition(
                  scene.collisionHandler.collisionItems,
                  newPosition,
                  newRotation
                ),
              };
            });
            if (
              transformations.every((el) => {
                // return el.valid;
                return true;
              })
            ) {
              uiControls.quaternion.copy(
                new Quaternion().setFromAxisAngle(yAxis, newAngle)
              );
              state.rotationAngleTemp = newAngle;
              transformations.forEach((el, index) => {
                el.item.moveToPosition(el.newPosition);
                el.item.rotateTo(el.newRotation);
                el.item.updateMatrix();
              });
            }
            ////

            this.update();

            this.update();
          });

        doOnDragStartSubscription = start$
          .pipe(
            map(getNormalized),
            withLatestFrom(selectedItems$),
            map(getPlaneCoordinates),
            withLatestFrom(intersectedObject$)
          )
          .subscribe(([start, handleType]) => {
            console.log(controls);

            controls.enable = false;
            const currentAngleVec = new Vector3().subVectors(
              start,
              uiControls.position
            );
            const currentAngle = Utils.angle(
              0,
              1,
              currentAngleVec.x,
              currentAngleVec.z
            );

            state.rotationAngleBak = state.rotationAngleTemp;
            state.offsetAngle = Utils.convertAngle0To2Pi(
              currentAngle - state.rotationAngleBak
            );
          });

        doOnDragEndSubscription = end$
          .pipe(
            withLatestFrom(selectedItems$),
            map(([end, items]) => items)
          )
          .subscribe((items) => {
            state.rotationAngleTemp = 0;
            state.transformationsBak = buildTransformsBak(items);
            state.rotationsBak = buildRotationsBak(items);
            controls.enable = true;
            state.previousPositionVec.set(0, 0, 0);
          });

        doOnDragCenterSubscription = draggingCenter$
          .pipe(
            withLatestFrom(selectedItems$)
            // debounce(i => interval(20))
          )
          .subscribe(([[newPosition, startVec], items]) => {
            const relMoveVec = new Vector3().subVectors(newPosition, startVec);
            //TODO just drag items
            const newPositionVec = new Vector3();
            const currentPositionVec = new Vector3();

            // if (items.every((item: Item) => {
            //   return true;
            //   newPositionVec.addVectors(currentPositionVec.setFromMatrixPosition(state.transformationsBak[item.asset.instanceId]), relMoveVec);
            //   return item.isValidPosition(scene.collisionHandler.collisionItems, newPositionVec);
            // })) {
            //   items.forEach((item: Item) => {
            //     newPositionVec.addVectors(currentPositionVec.setFromMatrixPosition(state.transformationsBak[item.asset.instanceId]), relMoveVec);
            //     item.position.copy(newPositionVec);
            //   })
            //   uiControls.position.copy(newPosition);
            //   this.update();
            // }
            items.forEach((item: Item) => {
              newPositionVec.addVectors(
                currentPositionVec.setFromMatrixPosition(
                  state.transformationsBak[item.asset.instanceId]
                ),
                relMoveVec
              );
              item.moveToPosition(newPositionVec);
              // const newPosition = item.getNewPosition(item.position, relMoveVec)
              // item.moveToPosition(newPosition);
            });
            if (
              items.every((item: Item) => {
                return true;
                return item.isValidPosition(
                  scene.collisionHandler.collisionItems,
                  item.position
                );
              })
            ) {
              state.previousPositionVec.copy(relMoveVec);
              uiControls.position.copy(newPosition);
            } else {
              items.forEach((item: Item) => {
                newPositionVec.addVectors(
                  currentPositionVec.setFromMatrixPosition(
                    state.transformationsBak[item.asset.instanceId]
                  ),
                  state.previousPositionVec
                );
                item.position.copy(newPositionVec);
                item.moveToPosition(newPositionVec);
              });
            }

            this.update();
          });

        doOnIntersectedHandleSubscription = intersectedObject$.subscribe(
          (e) => {
            if (e) {
              element.style.cursor = 'pointer';
            } else {
              element.style.cursor = 'auto';
            }
          }
        );

        doOnSelectedItemsSubscription = selectedItems$.subscribe(
          (items: Item[]) => {
            if (items[0] === undefined) return;
            setGroundPlane();
            state.transformationsBak = buildTransformsBak(items);
            state.rotationsBak = buildRotationsBak(items);
            state.rotationAngleBak = 0;
            uiControls.quaternion.copy(new Quaternion());
            drawHandles(items);
          }
        );
      } else {
        if (uiControls.children.length > 0) {
          uiControls.clear();
          scene.remove(uiControls);
          scene.remove(plane);

          this.update();
        }
      }
    });

  const drawHandles = (items: Item[]) => {
    uiControls.clear();
    const positionsGeom = new BufferGeometry();
    const positions = items
      .map((item) =>
        new Vector3().setFromMatrixPosition(item.matrixWorld).toArray()
      )
      .flat();
    positionsGeom.setAttribute(
      'position',
      new Float32BufferAttribute(positions, 3)
    );

    positionsGeom.computeBoundingSphere();

    const radius =
      items.length === 1
        ? Math.max(items[0].getWidth(), items[0].getDepth()) / 2
        : positionsGeom.boundingSphere.radius;

    //Center Handle
    const centerHandle = {
      type: IntersectionTypes.CenterDragHandle,
    };

    centerDrag = hud.makeCenterDrag(centerHandle);
    hud.updateCenterDrag(centerDrag, new Vector3(), undefined, radius);
    uiControls.position.copy(positionsGeom.boundingSphere.center);

    uiControls.add(centerDrag);

    //Rotation Handle
    const rotationHandle = {
      type: IntersectionTypes.GlobalRotationHandle,
    };
    globalRotationHandle = hud.makeGlobalRotation(rotationHandle, radius);
    uiControls.add(globalRotationHandle);

    scene.add(uiControls);
  };

  this.update = () => {
    this.needsUpdate = true;
  };

  this.dispose = () => this.observers?.unsubscribe();
};
