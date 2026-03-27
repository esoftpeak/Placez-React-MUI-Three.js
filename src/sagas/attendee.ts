import {
  all,
  take,
  takeLatest,
  put,
  call,
  select,
  race,
} from 'redux-saga/effects';
import {
  types,
  GetAttendeesByLayoutIdAction,
  GetAttendeesByLayoutIdSuccess,
  GetAttendeesByLayoutIdFailure,
  CreateAttendeeAction,
  CreateAttendeeSuccess,
  CreateAttendeeFailure,
  UpdateAttendeeAction,
  UpdateAttendeeSuccess,
  UpdateAttendeeFailure,
  UpdateAttendeesAction,
  UpdateAttendeesSuccess,
  UpdateAttendeesFailure,
  DeleteAttendeeAction,
  DeleteAttendeeSuccess,
  DeleteAttendeeFailure,
  SelectAttendee,
  UnseatAttendeeAction,
} from '../reducers/attendee';
import {
  types as layoutTypes,
  UpdateLayoutSuccessAction,
} from '../reducers/layouts';
import { ReduxState } from '../reducers/index';

import { SagaReady } from '../reducers/lifecycle';

import { placezApi, Attendee } from '../api';
import { Asset } from '../blue/items';
import { SeatInstance } from '../blue/itemModifiers/ChairMod';
import { SkuType } from '../blue/items/asset';
import { AttendeeSkuTypes } from '../blue/controllers/attendeeController';

export default function* attendeeSaga() {
  yield all([
    takeLatest(types.GET_ATTENDEES_BY_LAYOUT_ID, getAttendeesByLayoutId),
    takeLatest(types.CREATE_ATTENDEE, createAttendee),
    takeLatest(types.UPDATE_ATTENDEE, updateAttendee),
    takeLatest(types.UPDATE_ATTENDEES, updateAttendees),
    takeLatest(types.DELETE_ATTENDEE, deleteAttendee),
    takeLatest(layoutTypes.UPDATE_LAYOUT_SUCCESS, fixAttendees),
    takeLatest(types.UNSEAT_ATTENDEE, unseatAttendee),
  ]);
  yield put(SagaReady('attendee'));
}

function* getAttendeesByLayoutId(action: GetAttendeesByLayoutIdAction) {
  try {
    const response = yield call(
      placezApi.getAttendeeByLayoutId,
      action.layoutId
    );
    const attendees = response.parsedBody as Attendee[];

    yield put(GetAttendeesByLayoutIdSuccess(attendees));
  } catch (error) {
    yield put(GetAttendeesByLayoutIdFailure(error));
  }
}

function* createAttendee(action: CreateAttendeeAction) {
  try {
    const layoutId: number = yield select(
      (state: ReduxState) => state.designer.layout.id
    );
    const newAttendee = { ...action.attendee, layoutId };
    const response = yield call(placezApi.postAttendee, newAttendee);
    const attendee = response.parsedBody as Attendee;

    yield put(CreateAttendeeSuccess(attendee));
  } catch (error) {
    yield put(CreateAttendeeFailure(error));
  }
}

function* updateAttendee(action: UpdateAttendeeAction) {
  try {
    const updatedAttendee = action.attendee;
    const checkIfSeatOccupied =
      updatedAttendee.tableId && updatedAttendee.chairNumber;

    if (checkIfSeatOccupied) {
      const currentAttendees: Attendee[] = yield select(
        (state: ReduxState) => state.attendee.attendees
      );
      const sameSeatAttendees = currentAttendees.filter(
        (attendee) =>
          attendee.tableId === updatedAttendee.tableId &&
          attendee.chairNumber === updatedAttendee.chairNumber &&
          attendee.id !== updatedAttendee.id
      );

      if (sameSeatAttendees.length) {
        const updatedAttendees = currentAttendees.map((attendee) => {
          const needResetSeat = sameSeatAttendees.find(
            (sameSeatAttendee) => sameSeatAttendee.id === attendee.id
          );
          if (!needResetSeat) {
            return attendee;
          }

          return {
            ...attendee,
            tableId: undefined,
            chairNumber: undefined,
            tableInfo: undefined,
          };
        });

        yield put({
          type: types.UPDATE_ATTENDEES,
          attendees: updatedAttendees,
        });
        yield race([
          take(types.UPDATE_ATTENDEES_SUCCESS),
          take(types.UPDATE_ATTENDEES_FAILURE),
        ]);
        return;
      } else {
        const response = yield call(placezApi.putAttendee, updatedAttendee);
        const attendee = response.parsedBody as Attendee;
        yield put(UpdateAttendeeSuccess(attendee));
      }
    } else {
      const response = yield call(placezApi.putAttendee, updatedAttendee);
      const attendee = response.parsedBody as Attendee;
      yield put(UpdateAttendeeSuccess(attendee));
    }
  } catch (error) {
    yield put(UpdateAttendeeFailure(error));
  }
}

function* updateAttendees(action: UpdateAttendeesAction) {
  try {
    const layoutId: number = yield select(
      (state: ReduxState) => state.designer.layout.id
    );

    let response;
    if (action.attendees) {
      const cleanAttendees = action.attendees.map((attendee: Attendee) => {
        // map attendee.phone to undefined if it is no 10 numerical digits
        const goodPhoneNumber = new RegExp(
          /^(\+\d{1,2}\s)?\(?\d{3}\)?[\s.-]\d{3}[\s.-]\d{4}$/
        );
        if (!goodPhoneNumber.test(attendee.phone)) {
          attendee.badNumber = attendee.phone;
          attendee.phone = undefined;
        }
        return attendee;
      });
      response = yield call(
        placezApi.updateAttendeeByLayoutId,
        layoutId.toString(),
        cleanAttendees
      );
    } else {
      response = yield call(
        placezApi.getAttendeeByLayoutId,
        layoutId.toString()
      );
    }
    const attendees = response.parsedBody as Attendee[];

    yield put(UpdateAttendeesSuccess(attendees));
    yield take(['UPDATE_ATTENDEES_SUCCESS']);
    yield put(SelectAttendee(undefined));
  } catch (error) {
    yield put(UpdateAttendeesFailure(error));
  }
}

function* deleteAttendee(action: DeleteAttendeeAction) {
  try {
    yield call(placezApi.deleteAttendee, action.attendee.id);
    yield put(DeleteAttendeeSuccess(action.attendee));
  } catch (error) {
    yield put(DeleteAttendeeFailure(error));
  }
}

function* fixAttendees(action: UpdateLayoutSuccessAction) {
  try {
    const currentAttendees: Attendee[] = yield select(
      (state: ReduxState) => state.attendee.attendees
    );
    const attendeeItems = action.layout.items.filter((asset: Asset) => {
      return AttendeeSkuTypes.includes(SkuType[asset?.skuType]);
    });
    const fixedAttendees = currentAttendees.map(
      (attendee: Attendee): Attendee => {
        if (
          attendeeItems.find((asset: Asset): boolean => {
            const tableExists = asset?.instanceId === attendee.tableId;
            if (!tableExists) return false;
            const isNotTable = !asset?.modifiers?.chairMod;
            const chairExists =
              isNotTable ||
              asset?.modifiers?.chairMod?.seatPositions.find(
                (chair: SeatInstance): boolean => {
                  return chair.chairNumber === attendee.chairNumber;
                }
              );
            return chairExists;
          })
        ) {
          return attendee;
        }
        return {
          ...attendee,
          chairNumber: undefined,
          tableId: undefined,
          tableInfo: undefined,
        };
      }
    );
    yield put({ type: types.UPDATE_ATTENDEES, attendees: fixedAttendees });
  } catch (error) {
    yield put(UpdateAttendeesFailure(error));
  }
}

export function* unseatAttendee(action: UnseatAttendeeAction) {
  const { chairNumber, tableInstanceId, shiftSeats } = action;
  const attendees: Attendee[] = yield select(
    (state: ReduxState) => state.attendee.attendees
  );
  const unseatedAttendee = attendees.find((attendee: Attendee) => {
    return (
      attendee.chairNumber === chairNumber &&
      attendee.tableId === tableInstanceId
    );
  });

  const modifiedAttendees = attendees.map((attendeeInstance: Attendee) => {
    if (attendeeInstance.tableId === tableInstanceId) {
      if (attendeeInstance.id === unseatedAttendee.id) {
        return {
          ...attendeeInstance,
          chairNumber: undefined,
          tableId: undefined,
          tableInfo: undefined,
        };
      } else if (shiftSeats) {
        return {
          ...attendeeInstance,
          chairNumber:
            attendeeInstance.chairNumber > chairNumber
              ? attendeeInstance.chairNumber - 1
              : attendeeInstance.chairNumber,
        };
      } else {
        return attendeeInstance;
      }
    } else {
      return attendeeInstance;
    }
  });

  yield put({ type: types.UPDATE_ATTENDEES, attendees: modifiedAttendees });
}
