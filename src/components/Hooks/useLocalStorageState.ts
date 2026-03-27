import { useState, useEffect, useRef } from 'react';
import { Subject } from 'rxjs';
import { startWith } from 'rxjs/operators';
import { ValidUnits } from '../../api/placez/models/UserSetting';
import { initLocalStorage } from '../../sharing/utils/localStorageHelper';

export type ThemeType = 'light' | 'dark';

export enum LocalStorageKey {
  ItemLabel = 'Item Name',
  NumberLabel = 'Item Info',
  TableNumber = 'Table Number',
  ChairNumber = 'Chair Number',
  Notes = 'Notes',
  Dimensions = 'Dimensions',
  Grid = 'Grid',
  MaskObjects = 'Mask Objects',
  ArchitectureObjects = 'Architecture Objects',
  WallObjects = 'Wall Objects',
  PhotosphereCameras = 'Photosphere Cameras',
  FloorplanImage = 'Floorplan Image',
  SelectedCatalogName = 'selectedCatalogName',
  CategorySecondSelected = 'categorySecondSelected',
  SceneViewSelection = 'sceneViewSelection',

  // Settings
  GridCellLocked = 'gridCellLocked',
  DimensionCutoff = 'Dimension Cutoff',
  DimensionLabelWidth = 'Dimension Label Width',
  HideFloorplanDimensions = 'hideFloorplanDimensions',
  Units = 'Units',
  CollisionPrevention = 'CollisionPrevention',
  CollisionDetection = 'CollisionDetection',
  KeepInRoom = 'KeepInRoom',
  SnapPosition = 'SnapPosition',

  TwentyFourHourTime = 'TwentyFourHourTime',
  ThemeType = 'ThemeType',

  PaymentTermsNet = 'PaymentTermsNet',
  GPUNotification = 'GPUNotification',

  HideHelp = 'HideHelp',
  HideHelpIndividaully = 'HideHelpIndividaully',
}

initLocalStorage(LocalStorageKey.DimensionCutoff, 3);
initLocalStorage(LocalStorageKey.DimensionLabelWidth, 120);
initLocalStorage(LocalStorageKey.Units, ValidUnits.ftIn);
initLocalStorage(LocalStorageKey.CollisionPrevention, false);
initLocalStorage(LocalStorageKey.CollisionDetection, false);
initLocalStorage(LocalStorageKey.KeepInRoom, false);
initLocalStorage(LocalStorageKey.SnapPosition, true);
initLocalStorage(LocalStorageKey.TwentyFourHourTime, false);
initLocalStorage(LocalStorageKey.ThemeType, 'light');
initLocalStorage(LocalStorageKey.GridCellLocked, false);
initLocalStorage(LocalStorageKey.PaymentTermsNet, 30);
initLocalStorage(LocalStorageKey.GPUNotification, true);
initLocalStorage(LocalStorageKey.HideHelp, false);
initLocalStorage(LocalStorageKey.HideHelpIndividaully, {});

interface LocalStorageEvent {
  [key: string]: any;
}

const localStorageSubject = new Subject<LocalStorageEvent>();

export const localStorageObservable$ = localStorageSubject
  .asObservable()
  .pipe(startWith(getObservableLocalStorage(window.localStorage)));

// Convert the entire window.localStorage to a plain object and filter by allowed keys
function getObservableLocalStorage(storage: Storage): {
  [key in LocalStorageKey]?: any;
} {
  const storageObject: { [key in LocalStorageKey]?: any } = {};
  Object.values(LocalStorageKey).forEach((key) => {
    const value = storage.getItem(key);
    if (value) {
      storageObject[key as LocalStorageKey] =
        value !== 'undefined' && value !== 'null'
          ? JSON.parse(value)
          : undefined;
    }
  });
  return storageObject;
}

export function useLocalStorageState<T>(
  key: LocalStorageKey,
  defaultValue?: T
) {
  const [state, setState] = useState(() => {
    try {
      const storedValue = localStorage.getItem(key);
      return storedValue !== 'undefined' && storedValue !== null
        ? JSON.parse(storedValue)
        : defaultValue;
    } catch (e) {
      console.error('Could not read from local storage', e);
      return defaultValue;
    }
  });

  useEffect(() => {
    try {
      localStorage.setItem(key, JSON.stringify(state));
      const nextState = getObservableLocalStorage(window.localStorage);
      localStorageSubject.next(nextState); // Emit the change
    } catch (e) {
      console.error('Could not write to local storage', e);
    }
  }, [key, state]);

  return [state, setState];
}

export function useLocalStorageSelector<T>(
  key: LocalStorageKey,
  defaultValue?: T
): T {
  const [value, setValue] = useState<T>(() => {
    const storedValue = localStorage.getItem(key);
    return storedValue !== null ? JSON.parse(storedValue) : defaultValue;
  });

  const valueRef = useRef(value);

  useEffect(() => {
    valueRef.current = value;
  }, [value]);

  useEffect(() => {
    const subscription = localStorageObservable$.subscribe(
      (localStorageData) => {
        const newValue = localStorageData[key];

        if (newValue !== undefined && newValue !== valueRef.current) {
          setValue(newValue);
        }
      }
    );

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  return value;
}
