export class AsyncQueue<D, R> {
  constructor (private readonly executor: (data: D) => Promise<R>) {
  }

  private promise: Promise<R> = Promise.resolve(undefined as R);

  push (data: D): Promise<R> {
    this.promise = this.promise.then(
      () => {
        return this.executor(data);
      },
      () => {
        return this.executor(data);
      },
    );
    return this.promise;
  }
}
