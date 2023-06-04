export default class AsyncQueue<D, R> {
  private promise: Promise<R> = Promise.resolve(undefined as R);

  public constructor(private readonly executor: (data: D) => Promise<R>) {
  }

  public push(data: D): Promise<R> {
    this.promise = this.promise.then(
      () => this.executor(data),
      () => this.executor(data),
    );
    return this.promise;
  }
}
