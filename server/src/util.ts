export const pipe = (...fns: any[]) => (input?: any) =>
  fns.reduce((output, fn) => fn(output), input);
