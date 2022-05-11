declare function makeConcurrent (fn: Function, { concurrency }?: {
    concurrency?: number;
}): (...args: any[]) => Promise<any>;
declare namespace makeConcurrent {
  function byArguments(fn: Function, createKey?: Function): (...args: any[]) => Promise<any>;
}
export = makeConcurrent;
