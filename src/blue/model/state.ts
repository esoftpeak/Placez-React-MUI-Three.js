import { BehaviorSubject, Observable } from 'rxjs';
import { map, distinctUntilChanged, share } from 'rxjs/operators';
import { Asset, AssetSpeciesType } from '../items/asset';

export class BaseStateService<T extends object> {
  private subject$: BehaviorSubject<T>;

  constructor(protected defaultState: T) {
    this.subject$ = new BehaviorSubject<T>(this.defaultState);
  }

  public get state$(): Observable<T> {
    return this.subject$.asObservable();
  }

  protected getCurrentState(): T {
    return this.subject$.getValue();
  }

  protected setState(state: T): void {
    this.subject$.next(state);
  }

  protected patchState(state: Partial<T>): void {
    const currentState: T = this.getCurrentState();

    this.subject$.next({
      ...(currentState as T),
      ...(state as T),
    } as T);
  }
}

export type AssetStatistics = {
  [key in AssetSpeciesType]?: number;
};

export interface ApplicationStateModel {
  all: Asset[];
  selected: Asset[];
  added: Asset[];
  removed: Asset[];
  modified: Asset[];
}

const defaultState: ApplicationStateModel = {
  all: [],
  selected: [],
  added: [],
  removed: [],
  modified: [],
};
export class ApplicationStateService extends BaseStateService<ApplicationStateModel> {
  private static instance: ApplicationStateService;

  private constructor() {
    super(defaultState);
  }

  static getInstance() {
    if (!ApplicationStateService.instance) {
      ApplicationStateService.instance = new ApplicationStateService();
    }
    return ApplicationStateService.instance;
  }

  get all$(): Observable<Asset[]> {
    return this.state$.pipe(
      map((state: ApplicationStateModel) => {
        return state.all;
      }),
      distinctUntilChanged(),
      share()
    );
  }

  get selected$(): Observable<Asset[]> {
    return this.state$.pipe(
      map((state: ApplicationStateModel) => {
        return state.selected;
      }),
      distinctUntilChanged(),
      share()
    );
  }

  get added$(): Observable<Asset[]> {
    return this.state$.pipe(
      map((state: ApplicationStateModel) => {
        return state.added;
      }),
      distinctUntilChanged(),
      share()
    );
  }

  get removed$(): Observable<Asset[]> {
    return this.state$.pipe(
      map((state: ApplicationStateModel) => {
        return state.removed;
      }),
      distinctUntilChanged(),
      share()
    );
  }

  get modified$(): Observable<Asset[]> {
    return this.state$.pipe(
      map((state: ApplicationStateModel) => {
        return state.modified;
      }),
      distinctUntilChanged(),
      share()
    );
  }

  get statistics$(): Observable<AssetStatistics> {
    return this.state$.pipe(
      map((state: ApplicationStateModel) => {
        return state.all
          .map((asset: Asset) => {
            return asset.tags[0];
          })
          .reduce((acc: AssetStatistics, val: AssetSpeciesType) => {
            if (acc[val]) {
              acc[val]++;
            } else {
              acc[val] = 1;
            }
            return acc;
          }, {} as AssetStatistics);
      }),
      distinctUntilChanged(),
      share()
    );
  }

  public $select(selected: Asset[]): void {
    this.patchState({ selected });
  }
  public $add(added: Asset[]): void {
    const state = this.getCurrentState();
    this.patchState({ added, all: state.all.concat(added) });
  }
  public $remove(removed: Asset[]): void {
    const state = this.getCurrentState();
    this.patchState({
      removed,
      all: state.all.filter((asset: Asset) => {
        return true;
      }),
    });
  }
  public $modify(modified: Asset[]): void {
    this.patchState({ modified });
  }
}
