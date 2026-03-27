import { Observable } from 'rxjs';
import {
  map,
  share,
} from 'rxjs/operators';
import { BaseStateService } from '../../../../blue/model/state';

export interface ToastStateModel {
  message: string;
  duration: number;
}

const defaultState: ToastStateModel = {
  message: '',
  duration: 3000,
};

export class ToastStateService extends BaseStateService<ToastStateModel> {
  private static instance: ToastStateService;

  private constructor() {
    super(defaultState);
  }

  static getInstance() {
    if (!ToastStateService.instance) {
      ToastStateService.instance = new ToastStateService();
    }
    return ToastStateService.instance;
  }

  get message$(): Observable<{ message: string; duration: number }> {
    return this.state$.pipe(
      map((state: ToastStateModel) => {
        return {
          message: state.message,
          duration: state.duration,
        };
      }),
      share()
    );
  }

  $createMessage(message: string, duration = 3000) {
    this.patchState({ message, duration });
  }
}
