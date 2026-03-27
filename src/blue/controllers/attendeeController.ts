import { Intersection, Raycaster, Vector2 } from 'three';
import { store } from '../..';
import { ReduxState } from '../../reducers';
import {
  Observable,
  Subject,
  combineLatest,
  from,
  fromEvent,
  merge,
} from 'rxjs';
import {
  distinctUntilChanged,
  filter,
  map,
  startWith,
  withLatestFrom,
} from 'rxjs/operators';
import { CameraLayers, ControllerType } from '../../models/BlueState';
import { Attendee } from '../../api';
import { Item, isFloorItem } from '../items/item';
import { SkuType } from '../items/asset';
import {
  SelectAttendee,
  SelectTable,
  UpdateAttendee,
  getSelectedAttendee,
  UpdateAttendees,
} from '../../reducers/attendee';
import { SeatInstance } from '../itemModifiers/ChairMod';

interface IntersectionData {
  chairNumber?: number;
  tableId?: string;
  tableInfo?: string;
  attendee?: Attendee;
}

export const AttendeeSkuTypes = [
  SkuType.BEN,
  SkuType.CCH,
  SkuType.CHR,
  SkuType.STL,
  SkuType.TBL,
];

function compareIntersectionData(
  prev: IntersectionData,
  curr: IntersectionData
): boolean {
  return (
    prev.tableId === curr.tableId &&
    prev.tableInfo === curr.tableInfo &&
    prev.chairNumber === curr.chairNumber &&
    prev.attendee === curr.attendee
  ); // Replace with a deeper equality check if attendee is an object
}

export const AttendeeController = function (
  scene,
  cameras,
  element,
  controls,
  labels,
  main
) {
  this.cameras = cameras;
  this.labels = labels;
  this.controllerType = ControllerType.Attendee;
  this.needsUpdate = true;
  this.main = main;

  this.update = () => {
    this.needsUpdate = true;
  };

  // const dropAttendeeSubject = new Subject<[{x: number, y: number}, Attendee]>();
  const dropAttendeeSubject = new Subject<Attendee>();
  const dropAttendees$ = dropAttendeeSubject.asObservable();

  this.dropAttendee = (attendee: Attendee) => {
    // dropAttendeeSubject.next([normalizeCoordinate(mouseEventToCoordinate(event)), attendee]);
    dropAttendeeSubject.next(attendee);
  };

  const findAttendee = (
    attendees: Attendee[],
    chairNumber: number,
    tableId: string
  ): Attendee => {
    return attendees?.find((attendee: Attendee) => {
      return (
        attendee.tableId === tableId && attendee.chairNumber === chairNumber
      );
    });
  };

  const state = {
    themeColor: 'purple',
    longPressTime: 500,
    raycaster: new Raycaster(),
  };

  const getIntersectionItems = () =>
    scene.getItems().filter((item: Item) => {
      return (
        isFloorItem(item.asset.classType) &&
        AttendeeSkuTypes.includes(SkuType[item.asset.skuType])
      );
    });

  const enabled$ = from(store as unknown as Observable<ReduxState>).pipe(
    map((state: ReduxState): boolean => {
      return state.blue.activeController === ControllerType.Attendee;
    }),
    distinctUntilChanged()
  );

  const attendees$ = from(store as unknown as Observable<ReduxState>).pipe(
    map((state: ReduxState): Attendee[] => {
      return state.attendee.attendees;
    }),
    distinctUntilChanged()
  );

  const selectedAttendee$ = from(
    store as unknown as Observable<ReduxState>
  ).pipe(
    map((state: ReduxState): Attendee => {
      return getSelectedAttendee(
        state.attendee.attendees,
        state.attendee.selectedId
      );
    }),
    distinctUntilChanged()
  );

  const selectedTableId$ = from(
    store as unknown as Observable<ReduxState>
  ).pipe(
    map((state: ReduxState): string => {
      return state.attendee.selectedTableId;
    }),
    distinctUntilChanged()
  );

  const mouseEventToCoordinate = (
    mouseEvent: MouseEvent
  ): { x: number; y: number } => {
    mouseEvent.preventDefault();
    const rect = element.getBoundingClientRect();
    return {
      x: mouseEvent.clientX - rect.x,
      y: mouseEvent.clientY - rect.y,
    };
  };

  const normalizeCoordinate = (coordinate: {
    x: number;
    y: number;
  }): Vector2 => {
    const retVec = new Vector2();
    retVec.x = (coordinate.x / element.clientWidth) * 2 - 1;
    retVec.y = -(coordinate.y / element.clientHeight) * 2 + 1;
    return retVec;
  };

  const touchEventToCoordinate = (
    touchEvent: TouchEvent
  ): { x: number; y: number } => {
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
  const end$ = merge(mouseUp$, touchEnd$);

  const normalizedVector$ = coordinate$.pipe(
    filter((e) => element.clientWidth !== 0 && element.clientHeight !== 0),
    map(normalizeCoordinate)
  );

  const tableChairIntersection$ = normalizedVector$.pipe(
    map((screenVec: Vector2): Intersection | undefined => {
      state.raycaster.layers.set(CameraLayers.Items);
      state.raycaster.setFromCamera(screenVec, this.cameras.camera);
      return state.raycaster.intersectObjects(getIntersectionItems()).shift();
    }),
    withLatestFrom(attendees$),
    distinctUntilChanged(),
    map(
      ([intersection, attendees]: [
        Intersection,
        Attendee[],
      ]): IntersectionData => {
        if (intersection === undefined) {
          return {
            chairNumber: undefined,
            tableId: undefined,
            tableInfo: undefined,
            attendee: undefined,
          };
        }
        let table;
        intersection?.object?.traverseAncestors((obj: Item) => {
          if (
            obj.asset &&
            AttendeeSkuTypes.includes(SkuType[obj.asset.skuType])
          ) {
            table = obj;
          }
        });

        let chairNumber = intersection?.object?.userData?.chairNumber;
        //If dropped on a table place in the first available seat
        if (chairNumber === undefined) {
          const seats = table.asset?.modifiers?.chairMod?.seatPositions
            ?.filter((seat: SeatInstance) => {
              return !seat.hidden;
            })
            .filter((seat: SeatInstance) => {
              return !attendees.some((attendee: Attendee) => {
                return (
                  attendee.tableId === table?.asset?.instanceId &&
                  attendee.chairNumber === seat.chairNumber
                );
              });
            })
            .sort((a, b) => {
              return a.chairNumber - b.chairNumber;
            });
          if (seats?.length > 0) {
            chairNumber = seats[0].chairNumber;
          }
        }
        const attendee = findAttendee(
          attendees,
          chairNumber,
          table?.asset?.instanceId
        );
        return {
          tableId: table?.asset?.instanceId,
          tableInfo: table.asset.labels
            ? table.asset.labels.tableNumberLabel
            : '',
          chairNumber,
          attendee,
        };
      }
    ),
    distinctUntilChanged(compareIntersectionData)
  );

  const dragEnd$ = end$.pipe(
    withLatestFrom(start$),
    filter((obs: [{ x: number; y: number }, { x: number; y: number }]) => {
      return (
        Math.abs(obs[0].x - obs[1].x) > 3 || Math.abs(obs[0].y - obs[1].y) > 3
      );
    }),
    map(
      ([end, start]: [{ x: number; y: number }, { x: number; y: number }]) =>
        end
    ),
    withLatestFrom(selectedAttendee$),
    map(([mousePositions, selectedAttendee]) => selectedAttendee),
    filter((selectedAttendee) => {
      return selectedAttendee !== undefined;
    }),
    distinctUntilChanged()
  );

  const doOnSelectTable$ = start$.pipe(
    withLatestFrom(tableChairIntersection$),
    filter(
      ([mousePositions, intersectionData]) =>
        intersectionData.tableId !== undefined &&
        intersectionData.attendee === undefined
    ),
    distinctUntilChanged()
  );

  const doOnUnselect$ = start$.pipe(
    withLatestFrom(tableChairIntersection$),
    filter(
      ([mousePositions, intersectionData]) =>
        intersectionData.tableId === undefined
    ),
    distinctUntilChanged()
  );

  const doOnSelectAttendee$ = start$.pipe(
    withLatestFrom(tableChairIntersection$),
    filter(
      ([mousePositions, intersectionData]) =>
        intersectionData.attendee === undefined &&
        intersectionData.tableId !== undefined
    ),
    distinctUntilChanged()
  );

  const placeAttendee$: Observable<Attendee> = merge(dragEnd$, dropAttendees$);

  const doOnDragEndChair$ = placeAttendee$.pipe(
    withLatestFrom(tableChairIntersection$),
    filter(
      ([attendee, intersectionData]) =>
        intersectionData.chairNumber !== undefined
    ),
    distinctUntilChanged()
  );

  const doOnDragEndTable$ = placeAttendee$.pipe(
    withLatestFrom(tableChairIntersection$),
    filter(
      ([attendee, intersectionData]) =>
        intersectionData.tableId !== undefined &&
        intersectionData.chairNumber === undefined
    ),
    distinctUntilChanged()
  );

  const doOnDragEndEmpty$ = placeAttendee$.pipe(
    withLatestFrom(tableChairIntersection$),
    filter(
      ([attendee, intersectionData]) =>
        intersectionData.tableId === undefined &&
        intersectionData.chairNumber === undefined
    ),
    distinctUntilChanged()
  );

  const doOnUpdateCursor$ = combineLatest([
    tableChairIntersection$,
    mouseIsDown$,
    selectedAttendee$,
  ]);

  let doOnDragEndChairSubscription;
  let doOnDragEndTableSubscription;
  let doOnDragEndEmptySubscription;
  let doOnSelectAttendeeSubscription;
  let doOnSelectTableSubscription;
  let doOnUnselectSubscription;
  let doOnUpdateCursorSubscription;

  enabled$.subscribe((enabled: boolean) => {
    doOnDragEndChairSubscription?.unsubscribe();
    doOnDragEndTableSubscription?.unsubscribe();
    doOnDragEndEmptySubscription?.unsubscribe();
    doOnSelectAttendeeSubscription?.unsubscribe();
    doOnSelectTableSubscription?.unsubscribe();
    doOnUnselectSubscription?.unsubscribe();
    doOnUpdateCursorSubscription?.unsubscribe();

    if (enabled) {
      doOnDragEndChairSubscription = doOnDragEndChair$
        .pipe(withLatestFrom(attendees$))
        .subscribe(([[attendee, intersectionData], attendees]) => {
          const updatedAttendees = [...attendees];

          if (attendee.tableId && attendee.chairNumber) {
            const index = updatedAttendees.findIndex(
              (a) => a.id === attendee.id
            );
            if (index !== -1) {
              updatedAttendees[index] = {
                ...updatedAttendees[index],
                chairNumber: undefined,
                tableId: undefined,
                tableInfo: undefined,
              };
            }
          }

          const existingAttendeeIndex = updatedAttendees.findIndex(
            (existingAtt) =>
              existingAtt.tableId === intersectionData.tableId &&
              existingAtt.chairNumber === intersectionData.chairNumber &&
              existingAtt.id !== attendee.id
          );

          if (existingAttendeeIndex !== -1) {
            updatedAttendees[existingAttendeeIndex] = {
              ...updatedAttendees[existingAttendeeIndex],
              chairNumber: undefined,
              tableId: undefined,
              tableInfo: undefined,
            };
          }

          const draggedAttendeeIndex = updatedAttendees.findIndex(
            (a) => a.id === attendee.id
          );
          if (draggedAttendeeIndex !== -1) {
            updatedAttendees[draggedAttendeeIndex] = {
              ...updatedAttendees[draggedAttendeeIndex],
              chairNumber: intersectionData.chairNumber,
              tableId: intersectionData.tableId,
              tableInfo: intersectionData.tableInfo,
            };
          }

          store.dispatch(UpdateAttendees(updatedAttendees));
          this.main.buildAttendeeLocations(updatedAttendees);
          this.update();
        });

      doOnDragEndTableSubscription = doOnDragEndTable$.subscribe(
        ([attendee, intersectionData]) => {
          const updatedAttendee: Attendee = {
            ...attendee,
            chairNumber: intersectionData.chairNumber,
            tableId: intersectionData.tableId,
            tableInfo: intersectionData.tableInfo,
          };
          store.dispatch(UpdateAttendee(updatedAttendee));
          this.update();
        }
      );

      doOnDragEndEmptySubscription = doOnDragEndEmpty$.subscribe(
        ([attendee, intersectionData]) => {
          const updatedAttendee: Attendee = {
            ...attendee,
            chairNumber: undefined,
            tableId: undefined,
            tableInfo: undefined,
          };
          store.dispatch(UpdateAttendee(updatedAttendee));
          store.dispatch(SelectAttendee(undefined));
        }
      );

      doOnSelectAttendeeSubscription = doOnSelectAttendee$
        .pipe(withLatestFrom(selectedTableId$))
        .subscribe(([[attendee, intersectionData], tableId]) => {
          store.dispatch(SelectAttendee(intersectionData.attendee.id));
          if (tableId) {
            store.dispatch(SelectTable(undefined));
          }
        });

      doOnSelectTableSubscription = doOnSelectTable$.subscribe(
        ([attendee, intersectionData]) => {
          store.dispatch(SelectTable(intersectionData.tableId));
          store.dispatch(SelectAttendee(undefined));
        }
      );
      doOnUnselectSubscription = doOnUnselect$.subscribe(
        ([attendee, intersectionData]) => {
          store.dispatch(SelectTable(undefined));
          store.dispatch(SelectAttendee(undefined));
        }
      );
      doOnUpdateCursorSubscription = doOnUpdateCursor$.subscribe(
        ([intersectionData, mouseDown, selectedAttendee]) => {
          if (mouseDown && selectedAttendee) {
            element.style.cursor = 'grabbing';
          } else if (intersectionData.attendee) {
            element.style.cursor = 'grab';
          } else if (intersectionData.tableId) {
            element.style.cursor = 'pointer';
          } else {
            element.style.cursor = 'default';
          }
        }
      );
    }
  });
};
