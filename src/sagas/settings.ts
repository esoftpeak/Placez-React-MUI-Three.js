import { all, takeLatest, put, call } from 'redux-saga/effects';
import { SagaReady } from '../reducers/lifecycle';
import {
  types,
  GetSettingsAction,
  GetSettings,
  GetUserSettingsAction,
  GetUserSettings,
  UpdateSettingAction,
  UpdateUserSettingAction,
  AddPickListOptionAction,
} from '../reducers/settings';

// Api
import { placezApi, PickList, UserSetting } from '../api';

export default function* settingsSaga() {
  yield all([
    takeLatest(types.GET_SETTINGS, getSettings),
    takeLatest(types.UPDATE_SETTING, updateSetting),
    takeLatest(types.GET_USER_SETTINGS, getUserSettings),
    takeLatest(types.UPDATE_USER_SETTING, updateUserSetting),
    takeLatest(types.ADD_PICKLISTOPTION, createPickListOption),
  ]);
  yield put(GetSettings());
  yield put(GetUserSettings());
  yield put(SagaReady('settings'));
}

function* getSettings(action: GetSettingsAction) {
  try {
    const response = yield call(placezApi.getPickListAll);

    const pickLists = response.parsedBody as PickList[];

    yield put({
      type: types.GET_SETTINGS_SUCCESS,
      settings: {
        unit: 0,
        language: 0,
        type: 0,
        timeFormat: 0,
        dateFormat: 0,
        pickLists,
      },
    });
  } catch (error) {
    yield put({
      type: types.GET_SETTINGS_FAILURE,
      error,
    });
  }
}

function* getUserSettings(action: GetUserSettingsAction) {
  try {
    const response = yield call(placezApi.getUserSettings);
    yield put({
      type: types.GET_USER_SETTINGS_SUCCESS,
      userSettings: response.parsedBody as UserSetting[],
    });
  } catch (error) {
    yield put({ type: types.GET_SETTINGS_FAILURE, error });
  }
}

function* updateUserSetting(action: UpdateUserSettingAction) {
  try {
    const response = yield call(placezApi.putUserSetting, action.userSetting);
    yield put({
      type: types.UPDATE_USER_SETTING_SUCCESS,
      userSetting: response.parsedBody as UserSetting,
    });
  } catch (error) {
    yield put({ type: types.UPDATE_USER_SETTING_FAILURE, error });
  }
}

function* updateSetting(action: UpdateSettingAction) {
  try {
    const { setting } = action;
    // const response = yield call(placezApi.updateSetting, setting);
    yield put({
      type: types.UPDATE_SETTING_SUCCESS,
      // measurementUnits: response.parsedBody,
    });
  } catch (error) {
    yield put({
      type: types.UPDATE_SETTING_FAILURE,
      error,
    });
  }
}

function* createPickListOption(action: AddPickListOptionAction) {
  try {
    const { prevOptions, newOptions } = action;

    yield all(
      prevOptions.map((prevOption) => {
        const optionDeleted =
          newOptions.find((newOption) => newOption.id === prevOption.id) ===
          undefined;
        if (optionDeleted) {
          return call(placezApi.deletePickListOption, prevOption.id);
        }

        return undefined;
      })
    );

    yield all(
      newOptions.map((option) => {
        const isNewOption = !option.id || option.id < 0;
        if (isNewOption) {
          return call(placezApi.postPickListOption, option);
        }

        return call(placezApi.putPickListOption, option);
      })
    );

    yield put({ type: types.ADD_PICKLISTOPTION_SUCCESS, layout: null });
    yield put({ type: types.GET_SETTINGS });
  } catch (error) {
    yield put({ type: types.ADD_PICKLISTOPTION_FAILURE, error });
  }
}
