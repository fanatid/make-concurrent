function makeConcurrent (fn: Function, { concurrency }?: {
    concurrency?: number;
}): (...args: any[]) => Promise<any>;
declare namespace makeConcurrent {}
export = makeConcurrent;
