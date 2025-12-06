// BaseViewModel.ts
export class BaseViewModel {
  private observers: (() => void)[] = [];

  protected isLoading = false;
  protected error: string | null = null;

  getIsLoading() {
    return this.isLoading;
  }

  getError() {
    return this.error;
  }

  protected setLoading(value: boolean) {
    this.isLoading = value;
    this.notifyObservers();
  }

  protected setError(value: string | null) {
    this.error = value;
    this.notifyObservers();
  }

  subscribe(callback: () => void) {
    this.observers.push(callback);
    return () => {
      this.observers = this.observers.filter(obs => obs !== callback);
    };
  }

  protected notifyObservers() {
    for (const obs of this.observers) obs();
  }
}
