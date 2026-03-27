import { Observable } from 'rxjs';
import { BaseStateService } from './state';
import { map, distinctUntilChanged, share } from 'rxjs/operators';

export interface LoadingProgressEvent {
  [key: string]: ProgressEvent;
}

export interface LoadingProgressStateModel {
  progressEvents: LoadingProgressEvent;
  loaded: number;
  total: number;
}

const defaultState: LoadingProgressStateModel = {
  progressEvents: {},
  loaded: 0,
  total: 0,
};
export class LoadingProgressService extends BaseStateService<LoadingProgressStateModel> {
  private static instance: LoadingProgressService;

  private constructor() {
    super(defaultState);
  }

  static getInstance() {
    if (!LoadingProgressService.instance) {
      LoadingProgressService.instance = new LoadingProgressService();
    }
    return LoadingProgressService.instance;
  }

  get isLoading$(): Observable<boolean> {
    return this.state$.pipe(
      map((state: LoadingProgressStateModel) => {
        return Object.keys(state.progressEvents).length > 0;
      }),
      distinctUntilChanged(),
      share()
    );
  }

  get isLoadingSimple$(): Observable<boolean> {
    return this.state$.pipe(
      map((state: LoadingProgressStateModel) => {
        return state.loaded !== state.total;
      }),
      distinctUntilChanged(),
      share()
    );
  }

  get progress$(): Observable<number> {
    return this.state$.pipe(
      map((state: LoadingProgressStateModel) => {
        return Object.keys(state.progressEvents).reduce(
          (acc: any, key: string) => {
            return {
              loaded: state.progressEvents[key].loaded + acc.loaded,
              total: state.progressEvents[key].total + acc.total,
            };
            // tslint:disable-next-line:align
          },
          { loaded: 0, total: 0 }
        );
      }),
      map((progress: any) => {
        return (progress.loaded / progress.total) * 100.0;
      }),
      distinctUntilChanged(),
      share()
    );
  }

  get simpleProgress$(): Observable<number> {
    return this.state$.pipe(
      map((state: LoadingProgressStateModel) => {
        if (state.total) {
          return (state.loaded / state.total) * 100.0;
        }
        return 0;
      }),
      distinctUntilChanged(),
      share()
    );
  }

  $addProgressEvent(event: LoadingProgressEvent) {
    this.patchState({
      progressEvents: {
        ...this.getCurrentState().progressEvents,
        ...event,
      },
    });
  }

  $setSimpleProgressTotal(total: number) {
    this.patchState({
      total,
    });
  }

  $addSimpleProgressLoaded() {
    this.patchState({
      loaded: this.getCurrentState().loaded + 1,
    });
  }

  $removeProgressEvent(eventId: string) {
    const progressEvents = this.getCurrentState().progressEvents;
    delete progressEvents[eventId];
    this.patchState({ progressEvents });
  }

  $resetSimpleProgressEvent() {
    this.patchState({
      total: 0,
      loaded: 0,
    });
  }
}
