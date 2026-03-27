export class CallbackRegistry<T = void> {
  private callbacks: Set<(arg: T) => void> = new Set();

  public add(callback: (arg: T) => void): void {
    this.callbacks.add(callback);
  }

  public remove(callback: (arg: T) => void): void {
    this.callbacks.delete(callback);
  }

  public fire(arg: T): void {
    this.callbacks.forEach(callback => callback(arg));
  }
}
