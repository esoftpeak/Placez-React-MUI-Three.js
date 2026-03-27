import { fromEvent, merge, of, iif } from 'rxjs';
import {
  distinctUntilChanged,
  filter,
  map,
  withLatestFrom,
  switchMap,
} from 'rxjs/operators';
import { CameraLayers } from '../../models/BlueState';
import { Item } from '../items/item';
import { Intersection, Raycaster, Vector2 } from 'three';

export const TablePreviewController = function (scene, cam, element, controls) {
  const state = {
    rect: element.getBoundingClientRect(),
    themeColor: 'purple',
    longPressTime: 500,
    raycaster: new Raycaster(),
  };

  state.raycaster.params.Line = { threshold: 10 };
  state.raycaster.params.Points = { threshold: 15 };

  const layers = [CameraLayers.Items];

  state.raycaster.layers.disableAll();
  layers.forEach((element) => {
    state.raycaster.layers.enable(element);
  });

  // const getIntersections = (
  //   objects: Object3D[],
  //   layers: number[] = [7],
  //   camera: any,
  // ) => (mouse: Vector2): Intersection[] => {
  //   state.raycaster.setFromCamera(mouse, camera);

  //   let intersections: THREE.Intersection[];
  //   if (objects instanceof Array) {
  //     intersections = state.raycaster.intersectObjects(objects, true);
  //   }
  //   return intersections.filter(isNotSprite);
  // };

  // const isNotSprite = (value: THREE.Intersection): boolean => {
  //   return !(value.object instanceof Sprite);
  // }

  this.setItem = (item: Item) => {
    this.item = item;
  };

  this.doOnChairClickSubscription = (cb: (chairIndex) => void) =>
    doOnChairClick$.subscribe((chairIndex: number) => {
      cb(chairIndex);
    });

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

  const mouseDown$ = fromEvent(element, 'mousedown').pipe(
    map(mouseEventToCoordinate)
  );
  const mouseMove$ = fromEvent<MouseEvent>(element, 'mousemove').pipe(
    filter((e) => e.buttons === 0),
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

  const normalizedVector$ = coordinate$.pipe(
    map((coord: { x: number; y: number }) => {
      const retVec = new Vector2();
      retVec.x = (coord.x / element.clientWidth) * 2 - 1;
      retVec.y = -(coord.y / element.clientHeight) * 2 + 1;
      return retVec;
    })
  );

  const intersectedChairIndex$ = normalizedVector$.pipe(
    map((screenVec: Vector2) => {
      state.raycaster.setFromCamera(screenVec, cam);
      // return state.raycaster.intersectObject(this.item, true);
      return state.raycaster.intersectObject(this.item, true)[0];
    }),
    switchMap((intersected: Intersection) => {
      return iif(
        () => {
          return intersected !== undefined;
        },
        of(intersected).pipe(
          map((intersected: Intersection) => {
            return intersected.object.userData;
          }),
          filter((userData: any) => {
            return userData.type === 'chair';
          }),
          map((userData: any) => {
            return userData.chairIndex;
          })
        ),
        of(undefined)
      );
    }),
    distinctUntilChanged()
  );

  const doOnChairClick$ = end$.pipe(
    withLatestFrom(start$),
    filter((obs: [{ x: number; y: number }, { x: number; y: number }]) => {
      return (
        Math.abs(obs[0].x - obs[1].x) < 3 && Math.abs(obs[0].y - obs[1].y) < 3
      );
    }),
    withLatestFrom(intersectedChairIndex$),
    filter(([mousePositions, intersectedChair]) => {
      return intersectedChair !== undefined;
    }),
    map(([mousePositions, intersectedChair]): number => {
      return intersectedChair;
    })
  );

  // const preventLongPress$ = merge(
  //   mouseMove$,
  //   mouseUp$
  // )

  // const longpress$ = mouseDown$.pipe(
  //   mergeMap((e) => {
  //     return of(e).pipe(
  //       delay(state.longPressTime),
  //       takeUntil(preventLongPress$),
  //     );
  //   }),
  // );
  this.resize = (element) => {
    state.rect = element.getBoundingClientRect();
  };
};
