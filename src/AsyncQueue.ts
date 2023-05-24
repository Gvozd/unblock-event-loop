export class AsyncQueue<D extends any, R extends unknown> {
    constructor(private executor: (data: D) => Promise<R>) {
    }

    private promise: Promise<R> = Promise.resolve(void 0 as R);

    push(data: D): Promise<R> {
        this.promise = this.promise.then(
            () => {
                return this.executor(data);
            },
            () => {
                return this.executor(data);
            }
        );
        return this.promise;
    }
}
