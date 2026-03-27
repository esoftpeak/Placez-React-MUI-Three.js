import { CameraLayers } from '../../models/BlueState';
import { store } from '../..';
import { ReduxState } from '../../reducers';
import { LayoutLabel } from '../../api';
import { GlobalViewState } from '../../models/GlobalState';
import {
  LocalStorageKey,
  localStorageObservable$,
} from '../../components/Hooks/useLocalStorageState';
import { distinctUntilChanged, map, takeUntil } from 'rxjs/operators';
import { Subject } from 'rxjs';
import { Utils } from '../core/utils';
import { CSS3DLabelMaker } from './CSS3DlabelMaker';
import { SetSelectedLabelId } from '../../reducers/blue';

export const Notes = function (scene) {
  const scope = this; // tslint:disable-line

  this.labels = new Map(); // To track labels by id
  this.staticLabels = new Map();
  this.labelObjects = new Map(); // To track 3D objects by id
  this.destroy$ = new Subject();
  this.noteScale = 1;

  const init = () => {
    this.listener = () => {
      const blueReady = (store.getState() as ReduxState).blue.blueInitialized;
      const globalViewState = (store.getState() as ReduxState).globalstate
        .globalViewState;

      let storeLabels: LayoutLabel[] = [];
      let backgroundLabels: LayoutLabel[] = [];
      if (globalViewState === GlobalViewState.Fixtures) {
        storeLabels = (store.getState() as ReduxState).designer?.floorPlan
          ?.floorplanLabels;
      } else {
        storeLabels = (store.getState() as ReduxState).designer?.layout
          ?.layoutLabels;
        backgroundLabels = (store.getState() as ReduxState).designer?.floorPlan
          ?.floorplanLabels;
      }

      if (storeLabels) {
        scope.updateLabels(
          scene,
          storeLabels,
          scope.labels,
          scope.labelObjects
        );
      }

      if (backgroundLabels) {
        scope.updateLabels(scene, backgroundLabels, scope.staticLabels);
      }

      scene?.update();
    };

    this.NotesSizeSubscription = localStorageObservable$
      .pipe(
        takeUntil(this.destroy$),
        map((localStorageState) => localStorageState[LocalStorageKey.Notes]),
        distinctUntilChanged()
      )
      .subscribe((e: any) => {
        scope.noteScale = e;
        // Adjust existing labels for new scale
        scope.labels.forEach((labelObj, id) => {
          labelObj.updateParameters({
            fontSize:
              labelObj.original.fontSize * Utils.scaleFactor(scope.noteScale),
          });
        });
        scene?.update();
      });

    scope.unsubscribeStore = store.subscribe(scope.listener);
  };

  const addOrUpdateSprite = (
    obj: LayoutLabel,
    labelsMap: Map<string, any>,
    addToLabelObjects?: boolean
  ) => {
    const existingLabel = labelsMap.get(obj.id);
    const params = {
      ...obj,
      fontSize: obj.fontSize * Utils.scaleFactor(scope.noteScale),
    };

    if (existingLabel) {
      // Update label if it already exists
      existingLabel.updateParameters(params);
    } else if (obj.position && obj.labelText) {
      // Create new label if it doesn't exist
      const label = new CSS3DLabelMaker(
        params,
        CameraLayers.LayoutLabels,
        (id) => {
          store.dispatch(SetSelectedLabelId(id));
        }
      );

      const sprite = label.getObject();
      sprite.userData = { id: obj.id };
      sprite.position.setX(obj.position[0]);
      sprite.position.setZ(obj.position[2]);

      labelsMap.set(obj.id, label); // Track by id
      if (addToLabelObjects) scope.labelObjects.set(obj.id, sprite);
      scene.add(sprite);
    }
  };

  this.updateLabels = (
    scene,
    newLabels: LayoutLabel[],
    labelsMap: Map<string, any>,
    labelObjectsMap?: Map<string, any>
  ) => {
    // Remove labels that are no longer in the new list
    labelsMap.forEach((label, id) => {
      if (!newLabels.some((l) => l.id === id)) {
        const sprite = labelObjectsMap?.get(id);
        if (sprite) scene.remove(sprite);
        labelObjectsMap?.delete(id);
        labelsMap.delete(id);
      }
    });

    // Add or update labels from the new list
    newLabels.forEach((obj: LayoutLabel) => {
      addOrUpdateSprite(obj, labelsMap, !!labelObjectsMap);
    });
  };

  init();

  this.dispose = () => {
    scope.unsubscribeStore();
    this.destroy$.next();
    this.destroy$.complete();
  };
};
