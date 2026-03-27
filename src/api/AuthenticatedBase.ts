import { store } from '../../src';
import { ReduxState } from '../reducers';

export interface IHttpResponse<T> extends Response {
  parsedBody?: T;
  parsedError?: T;
}

const dateFormat = /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}Z$/;

function reviver(key: any, value: any) {
  if (typeof value === 'string' && dateFormat.test(value)) {
    return new Date(value);
  }

  return value;
}

export abstract class AuthenticatedBase {
  protected async get<T>(
    path: string,
    args: RequestInit = { method: 'get', headers: this.getHeader() },
    options?: any
  ): Promise<IHttpResponse<T>> {
    if (options?.headers) {
      args.headers = { ...args.headers, ...options.headers };
    }
    return await this.callApi<T>(new Request(path, args));
  }

  protected async post<T>(
    path: string,
    body: any,
    args: RequestInit = {
      method: 'post',
      headers: this.getHeader(),
      body: JSON.stringify(body),
    },
    options?: any
  ): Promise<IHttpResponse<T>> {
    if (options?.headers) {
      args.headers = { ...args.headers, ...options.headers };
    }
    return await this.callApi<T>(new Request(path, args));
  }

  protected async postFile<T>(
    path: string,
    body: any,
    args: RequestInit = {
      method: 'POST',
      headers: this.getHeaderMultipart(),
      body,
    }
  ): Promise<IHttpResponse<T>> {
    return await this.callApi<T>(new Request(path, args));
  }

  protected async postMediaAsset<T>(
    path: string,
    body: any,
    args: RequestInit = {
      method: 'POST',
      headers: this.getHeader(),
      body: JSON.stringify(body),
    }
  ): Promise<IHttpResponse<T>> {
    return await this.callApi<T>(new Request(path, args));
  }

  protected async put<T>(
    path: string,
    body: any,
    args: RequestInit = {
      method: 'put',
      headers: this.getHeader(),
      body: JSON.stringify(body),
    }
  ): Promise<IHttpResponse<T>> {
    return await this.callApi<T>(new Request(path, args));
  }

  protected async delete<T>(
    path: string,
    args: RequestInit = { method: 'delete', headers: this.getHeader() }
  ): Promise<IHttpResponse<T>> {
    return await this.callApi<T>(new Request(path, args));
  }

  protected getHeader(): Record<string, string> {
    const { oidc, dashboard } = store.getState() as ReduxState;
    if (!oidc.user) {
      return {};
    }

    return {
      Authorization: `${oidc.user.token_type} ${oidc.user.access_token}`,
      LocationId: dashboard.currentLocationKey,
      'Content-Type': 'application/json',
      'x-ms-max-item-count': '1000',
      Processor: '0',
    };
  }

  private getHeaderMultipart(): Record<string, string> {
    const { oidc } = store.getState() as ReduxState;
    if (!oidc.user) {
      return {};
    }
    return {
      Authorization: `${oidc.user.token_type} ${oidc.user.access_token}`,
    };
  }

  private async callApi<T>(request: RequestInfo): Promise<IHttpResponse<T>> {
    return new Promise((resolve, reject) => {
      let response: IHttpResponse<T>;
      fetch(request)
        .then((res) => {
          response = res;
          return res.json().catch(() => resolve(undefined));
        })
        .then((body) => {
          if (response.ok) {
            response.parsedBody = JSON.parse(
              JSON.stringify(body),
              reviver
            ) as T;
            resolve(response);
          } else {
            response.parsedError = JSON.parse(
              JSON.stringify(body),
              reviver
            ) as T;
            reject(response);
          }
        })
        .catch((err) => {
          reject(err);
        });
    });
  }
}
