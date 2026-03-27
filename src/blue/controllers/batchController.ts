import { store } from '../..';
import { ReduxState } from '../../reducers';
import { CameraLayers, ControllerType } from '../../models/BlueState';

import { from, fromEvent, merge, Observable } from 'rxjs';
import {
  distinctUntilChanged,
  filter,
  map,
  tap,
  withLatestFrom,
} from 'rxjs/operators';
import {
  LineBasicMaterial,
  Mesh,
  MeshBasicMaterial,
  Object3D,
  PlaneGeometry,
  Quaternion,
  Raycaster,
  Vector2,
  Vector3,
} from 'three';
import { Item } from '../items/item';
import { Utils } from '../core/utils';
import { BatchTypes, buildBatchItem } from '../model/batchPatterns';
import { Asset } from '../items';
import { FontLoader } from 'three/examples/jsm/loaders/FontLoader';
import 'three/examples/fonts/helvetiker_regular.typeface.json';

const loadFont = (font) => {
  const loader = new FontLoader();
  loader.load(`helvetiker_regular.typeface.json`, (loadedFont) => {
    font = loadedFont;
  });
};

export const BatchController = function (
  scene,
  cam,
  element,
  hud,
  main,
  controls
) {
  this.controllerType = ControllerType.Batch;
  this.controls = controls;

  this.setControls = function (newControls) {
    this.controls = newControls;
  };

  let plane; // ground plane used for intersection testing
  let batchType;
  this.cameras = cam;
  this.font = undefined;
  loadFont(this.font);
  this.lengthVec = new Vector3();
  const clickTolerance = 3;

  const uiControls = new Object3D();

  const material = new LineBasicMaterial({
    depthTest: false,
    depthWrite: false,
    color: 0x5c236f,
    linewidth: 3,
  });
  const spacingMaterial = new LineBasicMaterial({
    depthTest: false,
    depthWrite: false,
    color: 0xafa0b3,
  });

  const state = {
    groupId: 'temp',
    themeColor: 'purple',
    longPressTime: 500,
    raycaster: new Raycaster(),
  };
  state.raycaster.params.Line.threshold = 30;
  state.raycaster.layers.set(CameraLayers.Default);

  interface Handle {
    patternTo: Vector3;
    spacing: number;
    lineControl: Object3D;
    spacingControl: Object3D;
    count: number;
    width?: number;
    depth?: number;
  }

  const defaultPositionVectors = [
    [1, 0, 0],
    [0, 0, 1],
  ];

  let positionVectors: Handle[] = [];

  let centerDrag = undefined;

  function setGroundPlane() {
    // TODO dynamically size ground plane used to find intersections
    const size = 100000;
    plane = new Mesh(new PlaneGeometry(size, size), new MeshBasicMaterial());
    plane.rotation.x = -Math.PI / 2;
    plane.visible = true;
    plane.material.visible = false;
    scene.add(plane);
  }

  const selectedItems$ = from(store as unknown as Observable<ReduxState>).pipe(
    map((state: ReduxState): Item[] => {
      return state.blue.selectedItems;
    }),
    distinctUntilChanged()
  );

  const enabled$ = from(store as unknown as Observable<ReduxState>).pipe(
    map((state: ReduxState): boolean => {
      return state.blue.activeController === ControllerType.Batch;
    }),
    distinctUntilChanged()
  );

  const settings$ = from(store as unknown as Observable<ReduxState>).pipe(
    map((state: ReduxState) => {
      return state.blue.batchSettings;
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
    const rect = element.getBoundingClientRect();
    return {
      x: touchEvent.changedTouches[0].clientX - rect.x,
      y: touchEvent.changedTouches[0].clientY - rect.y,
    };
  };

  const mouseDown$ = fromEvent(element, 'mousedown').pipe(
    map(mouseEventToCoordinate)
  );
  const mouseMove$ = fromEvent<MouseEvent>(element, 'mousemove').pipe(
    tap((e) => e.stopPropagation()),
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

  const getPlaneCoordinates = (screenVec: Vector2): Vector3 => {
    let intersections = [];
    state.raycaster.layers.set(CameraLayers.Default);
    state.raycaster.setFromCamera(screenVec, this.cameras.camera);

    intersections = intersections.concat(
      state.raycaster.intersectObjects([plane])
    );
    return intersections?.[0]?.point;
  };

  const normalizedDrag$ = merge(mouseDrag$, touchMove$).pipe(
    map(getNormalized)
  );

  const normalizedMove$ = coordinate$.pipe(map(getNormalized));

  const intersectedHandle$ = normalizedMove$.pipe(
    map((screenVec): { type: string; index: number } => {
      state.raycaster.setFromCamera(screenVec, this.cameras.camera);
      // this sets the handles to intersect
      const intersections = state.raycaster
        .intersectObjects([uiControls])
        .sort((a, b) => (a.object.userData.type === 'spacingControl' ? -1 : 1));

      if (
        intersections.length > 0 &&
        intersections[0].object.userData.type !== undefined
      ) {
        return {
          type: intersections[0].object.userData.type,
          index: intersections[0].object.userData.index,
        };
      }
      return undefined;
    })
  );

  const doOnIntersectedHandle$ = intersectedHandle$.pipe(
    // this is stupid
    distinctUntilChanged((a, b) => JSON.stringify(a) === JSON.stringify(b))
  );

  const draggingCoordinates$ = normalizedDrag$.pipe(
    map(getPlaneCoordinates),
    filter((position) => position !== undefined),
    distinctUntilChanged()
  );

  const startCoordinates$ = start$.pipe(
    withLatestFrom(normalizedMove$),
    map(([start, normal]) => getPlaneCoordinates(normal)),
    withLatestFrom(selectedItems$),
    map(([planeCoordinates, items]: [Vector3, Item[]]) => {
      const batchItems = scene.getBatchItems('temp');
      const tempBatchItemPositions = {};
      batchItems.forEach((item) => {
        tempBatchItemPositions[item.asset.instanceId] = item.position.clone();
      });
      tempBatchItemPositions[items[0].asset.instanceId] =
        items[0].position.clone();

      return {
        tempBatchItemPositions,
        startVec: planeCoordinates,
      };
    }),
    distinctUntilChanged()
  );

  const yAxis = new Vector3(0, 1, 0);

  const snapAtAngle =
    (snapAngle: number) =>
    ([position, intersected]) => {
      const currentAngleVec = new Vector3().subVectors(
        position,
        scene.tempBatchItem.position
      );
      const currentAngle = Math.atan2(currentAngleVec.z, currentAngleVec.x);

      const newAngle = Utils.snapRotation(currentAngle, true);

      return [
        new Vector3(1, 0, 0)
          .multiplyScalar(currentAngleVec.length())
          .applyAxisAngle(yAxis, -newAngle)
          .add(scene.tempBatchItem.position),
        intersected,
      ];
    };

  const draggingSpacing$ = draggingCoordinates$.pipe(
    withLatestFrom(intersectedHandle$),
    filter(([position, intersected]) => {
      return (
        intersected?.type === 'spacingControl' &&
        scene?.tempBatchItem?.position !== undefined
      );
    }),
    tap((e) => (this.controls.enabled = false))
  );

  const draggingLineEnd$ = draggingCoordinates$.pipe(
    withLatestFrom(intersectedHandle$),
    filter(([position, intersected]) => {
      return (
        intersected?.type === 'extentControl' &&
        scene?.tempBatchItem?.position !== undefined
      );
    }),
    map(snapAtAngle(Math.PI / 4)),
    tap((e) => (this.controls.enabled = false))
  );

  const draggingCenter$ = draggingCoordinates$.pipe(
    withLatestFrom(intersectedHandle$),
    filter(([position, intersected]) => {
      return (
        intersected?.type === 'centerControl' &&
        scene?.tempBatchItem?.position !== undefined
      );
    }),
    map(([newPosition, userData]) => newPosition),
    tap((e) => (this.controls.enabled = false))
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

  let doOnIntersectedHandleSubscription;
  let doOnSelectedItemsSubscription;
  let doOnClickSubscription;
  let doOnDragSpacingSubscription;
  let doOnDragLineEndSubscription;
  let doOnDragCenterSubscription;
  let doOnSettingsChangeSubscription;
  let doOnDragEndSubscription;

  const doOnSpacingControlDrag = (position: Vector3, index: number) => {
    const handle = positionVectors[index];
    const spacingVec = new Vector3()
      .subVectors(position, scene.tempBatchItem.position)
      .projectOnVector(handle.patternTo);
    handle.spacing =
      Math.max(spacingVec.length(), Math.min(handle.width, handle.depth)) + 1;
    spacingVec.normalize().multiplyScalar(handle.spacing);
    handle.count = Math.floor(handle.patternTo.length() / handle.spacing);
  };

  const doOnExtentControlDrag = (position: Vector3, index: number) => {
    const handle = positionVectors[index];
    this.lengthVec.set(0, 0, 0);
    this.lengthVec.subVectors(position, scene.tempBatchItem.position);
    handle.patternTo.subVectors(position, scene.tempBatchItem.position);

    //linear Pattern ?????????????????????
    // const positionVec = new Vector3().copy(handle.patternTo)
    //   .normalize()
    //   .multiplyScalar(handle.spacing)
    // const newPositionVec = new Vector3();

    // handle.count = Math.floor(handle.patternTo.length() / positionVec.length() + 1);
    // //update spacing vec
    // hud.updateLineEnd(handle.lineControl, newPositionVec.subVectors(position, scene.tempBatchItem.position), handle.count.toString());
    // const spacing = Utils.unitsOutString(handle.spacing);
    // hud.updateLineMid(handle.spacingControl, positionVec, spacing, positionVectors.filter((handle, arrIndex) => index !== arrIndex));

    //linear Pattern ?????????????????????

    //Grid Pattern !!!!!!!!!!!!!!!!!!!!!!!
    // const positionXVec = new Vector3(handle.patternTo.x, 0, 0)
    //   .normalize()
    //   .multiplyScalar(handle.spacing)
    // const positionZVec = new Vector3(0, 0, handle.patternTo.z)
    //   .normalize()
    //   .multiplyScalar(handle.spacing)
    // const xPositionInPattern = new Vector3();
    // const zPositionInPattern = new Vector3();

    // const newPositionVec = new Vector3();

    // while (xPositionInPattern.length() < Math.abs(positionVectors[0].patternTo.x)) {
    //   while (zPositionInPattern.length() < Math.abs(positionVectors[0].patternTo.z)) {
    //     // this will duplicate position 1
    //     const asset: Asset = JSON.parse(JSON.stringify(scene.tempBatchItem.asset));
    //     asset.groupId = state.groupId;
    //     buildBatchItem(scene.tempBatchItem, asset, newPositionVec.addVectors(zPositionInPattern,newPositionVec.addVectors(xPositionInPattern, scene.tempBatchItem.position)), undefined, new Quaternion(), scene.addAssetAsync.bind(scene));
    //     zPositionInPattern.add(positionZVec)
    //   }
    //   xPositionInPattern.add(positionXVec)
    //   zPositionInPattern.set(0, 0, 0);
    // }
    //Grid Pattern !!!!!!!!!!!!!!!!!!!
  };

  this.clearBatch = () => {
    scene.clearBatchItems('temp');
  };

  const redraw = (tempBatchItem: Item, positionVectors) => {
    //TODO redraw handle

    if (
      batchType === BatchTypes.linear ||
      batchType === BatchTypes.grid ||
      batchType === BatchTypes.banquet
    ) {
      positionVectors.forEach((handle, index) => {
        const positionVec = new Vector3()
          .copy(handle.patternTo)
          .normalize()
          .multiplyScalar(handle.spacing);
        handle.count = Math.floor(
          handle.patternTo.length() / positionVec.length() + 1
        );
        //update spacing vec
        hud.updateLineEnd(
          handle.lineControl,
          handle.patternTo,
          handle.count.toString()
        );
        const spacing = Utils.unitsOutString(handle.spacing);
        hud.updateLineMid(
          handle.spacingControl,
          positionVec,
          spacing,
          positionVectors.filter((handle, arrIndex) => index !== arrIndex)
        );
      });

      this.clearBatch();
      const newPositionVec = new Vector3();
      if (tempBatchItem.children.length > 0) {
        const pattern = positionVectors.map((handle) => {
          const unitVector = new Vector3()
            .copy(handle.patternTo)
            .normalize()
            .multiplyScalar(handle.spacing);
          return {
            unitVector,
            count: 0,
            maxCount: Math.floor(
              handle.patternTo.length() / unitVector.length()
            ),
            patternTo: handle.patternTo,
          };
        });
        const dimension = pattern.length;
        // This is end condition
        let count = 0;
        if (positionVectors[0].length % 2 === 0) count++;
        while (
          pattern.some(
            (positionVec, index) => positionVec.count < positionVec.maxCount
          )
        ) {
          pattern[0].count++;

          for (let index = dimension - 1; index >= 0; index--) {
            if (pattern[index].count > pattern[index].maxCount) {
              pattern[index].count = 0;
              pattern[index + 1].count++;
            }
          }

          const asset: Asset = JSON.parse(JSON.stringify(tempBatchItem.asset));
          asset.groupId = state.groupId;
          newPositionVec.set(0, 0, 0);
          newPositionVec.add(tempBatchItem.position);
          pattern.forEach((handle) => {
            newPositionVec.add(
              handle.unitVector.clone().multiplyScalar(handle.count)
            );
          });
          try {
            if (
              batchType === BatchTypes.grid ||
              batchType === BatchTypes.linear
            ) {
              buildBatchItem(
                tempBatchItem,
                asset,
                newPositionVec,
                undefined,
                new Quaternion(),
                scene.addAssetAsync.bind(scene)
              );
            } else if (batchType === BatchTypes.banquet && count % 2 === 1) {
              buildBatchItem(
                tempBatchItem,
                asset,
                newPositionVec,
                undefined,
                new Quaternion(),
                scene.addAssetAsync.bind(scene)
              );
            }
          } catch (error) {
            console.log(error);
          }
          count++;
        }
        const centerAndCount =
          centerAndCountFromPositionVectors(positionVectors);

        const radVec = new Vector3();
        tempBatchItem.boundingBox.getSize(radVec);
        const radius = radVec.length() * 3;
        hud.updateCenterDrag(
          centerDrag,
          centerAndCount.center,
          centerAndCount.count,
          radius
        );
      }
    }
    if (batchType === BatchTypes.theaterRound) {
    }
  };

  this.observers = enabled$
    .pipe(withLatestFrom(selectedItems$))
    .subscribe(([enabled, items]) => {
      doOnIntersectedHandleSubscription?.unsubscribe();
      doOnSelectedItemsSubscription?.unsubscribe();
      doOnClickSubscription?.unsubscribe();
      doOnDragSpacingSubscription?.unsubscribe();
      doOnDragLineEndSubscription?.unsubscribe();
      doOnDragCenterSubscription?.unsubscribe();
      doOnSettingsChangeSubscription?.unsubscribe();
      doOnDragEndSubscription?.unsubscribe();

      if (enabled) {
        doOnDragSpacingSubscription = draggingSpacing$.subscribe(
          ([position, intersected]) => {
            doOnSpacingControlDrag(position, intersected.index);
            redraw(scene.tempBatchItem, positionVectors);
            this.update();
          }
        );

        doOnDragLineEndSubscription = draggingLineEnd$.subscribe(
          ([position, intersected]) => {
            doOnExtentControlDrag(position, intersected.index);
            redraw(scene.tempBatchItem, positionVectors);
            this.update();
          }
        );

        doOnDragCenterSubscription = draggingCenter$
          .pipe(withLatestFrom(startCoordinates$, selectedItems$))
          .subscribe(([newPosition, startCoords, items]) => {
            const { tempBatchItemPositions, startVec } = startCoords;
            const batchItems = scene.getBatchItems('temp').concat(items[0]);
            const relMoveVec = new Vector3().subVectors(newPosition, startVec);
            if (
              batchItems.every((element) => {
                const initialPos =
                  tempBatchItemPositions[element.asset.instanceId];
                const newPosition = new Vector3().addVectors(
                  initialPos,
                  relMoveVec
                );
                return element.isValidPosition(
                  scene.collisionHandler.collisionItems,
                  newPosition
                );
              })
            ) {
              batchItems.forEach((element) => {
                const initialPos =
                  tempBatchItemPositions[element.asset.instanceId];
                const newPosition = new Vector3().addVectors(
                  initialPos,
                  relMoveVec
                );
                element.position.copy(newPosition);
                if (element.asset.instanceId === items[0].asset.instanceId) {
                  scene.tempBatchItem.position.copy(newPosition);
                }
              });
            }
            const newControlsPosition = new Vector3().addVectors(
              tempBatchItemPositions[items[0].asset.instanceId],
              relMoveVec
            );
            uiControls.position.copy(newControlsPosition);
          });

        doOnIntersectedHandleSubscription = doOnIntersectedHandle$.subscribe(
          (e) => {
            if (e) {
              element.style.cursor = 'pointer';
            } else {
              element.style.cursor = 'auto';
            }
          }
        );

        doOnSelectedItemsSubscription = selectedItems$
          .pipe(
            filter((items: Item[]) => items.length > 0),
            map((items: Item[]) => items[0]),
            withLatestFrom(settings$)
          )
          .subscribe(([item, settings]) => {
            setGroundPlane();
            updateHandles(settings, item);
          });

        doOnSettingsChangeSubscription = settings$
          .pipe(withLatestFrom(selectedItems$))
          .subscribe(([settings, items]) => {
            updateHandles(settings, items[0]);
            redraw(scene.tempBatchItem, positionVectors);
          });
        doOnDragEndSubscription = dragEnd$.subscribe(() => {
          this.controls.enabled = true;
        });
      } else {
        if (uiControls.children.length > 0) {
          uiControls.clear();
          scene.remove(uiControls);
          scene.remove(plane);

          this.update();
        }
      }
    });

  const centerAndCountFromPositionVectors = (positionVectors: Handle[]) => {
    const centerPosition = new Vector3();
    positionVectors.forEach((handle) => {
      centerPosition.add(handle.patternTo);
    });
    centerPosition.multiplyScalar(0.5);

    const centerCount = Math.floor(
      positionVectors.reduce((acc, handle) => {
        if (acc === 0) {
          acc += handle.count;
        } else {
          acc *= handle.count;
        }
        return acc;
      }, 0)
    ).toString();

    return { center: centerPosition, count: centerCount };
  };

  const updateHandles = (settings: any, item: Item) => {
    uiControls.clear();
    positionVectors = [];
    const box = new Vector3();
    item.getBounds().getSize(box);
    const initSpacing = 2 * Math.max(box.x, box.z);

    switch (settings.batchType) {
      case BatchTypes.grid:
        batchType = BatchTypes.grid;
        for (let index = 0; index < 2; index++) {
          positionVectors.push({
            patternTo: new Vector3().fromArray(defaultPositionVectors[index]),
            spacing: initSpacing,
            lineControl: undefined,
            spacingControl: undefined,
            count: 0,
          });
        }
        break;
      case BatchTypes.banquet:
        batchType = BatchTypes.banquet;
        for (let index = 0; index < 2; index++) {
          positionVectors.push({
            patternTo: new Vector3().fromArray(defaultPositionVectors[index]),
            spacing: initSpacing,
            lineControl: undefined,
            spacingControl: undefined,
            count: 0,
          });
        }
        break;
      case BatchTypes.linear:
        batchType = BatchTypes.linear;
        for (let index = 0; index < 1; index++) {
          positionVectors.push({
            patternTo: new Vector3().fromArray(defaultPositionVectors[index]),
            spacing: initSpacing,
            lineControl: undefined,
            spacingControl: undefined,
            count: 0,
          });
        }
        break;
      case BatchTypes.random:
        // position
        const targetSpecs = main.targetSpecs;
        const number = 20;
        console.log(targetSpecs);

        // buildBatchItem(scene.tempBatchItem, asset, position, undefined, new Quaternion(), scene.addAssetAsync.bind(scene));
        break;

      default:
        break;
    }

    const centerHandle = {
      type: 'centerControl',
    };
    positionVectors = positionVectors.map((handle: Handle) => {
      handle.width = item.getWidth();
      handle.depth = item.getDepth();
      return handle;
    });
    positionVectors.forEach((handle, index) => {
      if (handle.lineControl) {
        scene.remove(handle.lineControl);
      }
      const extentHandle = {
        type: 'extentControl',
        index,
      };
      const spacingHandle = {
        type: 'spacingControl',
        index,
      };
      handle.lineControl = hud.makeLineControl(
        item.position,
        material,
        extentHandle
      );
      handle.spacingControl = hud.makeLineControl(
        item.position,
        spacingMaterial,
        spacingHandle
      );

      uiControls.add(handle.lineControl);
      uiControls.add(handle.spacingControl);

      uiControls.position.copy(item.position);
      scene.tempBatchItem.position.copy(item.position);
      scene.add(uiControls);

      const startingVec = new Vector3();
      handle.patternTo.multiplyScalar(handle.spacing * 4);
      doOnExtentControlDrag(
        startingVec.addVectors(item.position, handle.patternTo),
        index
      );
    });

    const centerAndCount = centerAndCountFromPositionVectors(positionVectors);
    centerDrag = hud.makeCenterDrag(centerHandle);
    hud.updateCenterDrag(
      centerDrag,
      centerAndCount.center,
      centerAndCount.count
    );
    uiControls.add(centerDrag);
  };

  this.update = () => {
    this.needsUpdate = true;
  };

  this.dispose = () => this.observers?.unsubscribe();
};
