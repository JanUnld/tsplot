import { Injector } from 'injection-js';
import { setCurrentInjector } from 'injection-js/injector_compatibility';

// todo: remove this utility as soon as https://github.com/mgechev/injection-js/pull/66 is merged
export function runInInjectionContext<R>(injector: Injector, fn: () => R): R {
  const prevInjector = setCurrentInjector(injector);
  try {
    return fn();
  } finally {
    setCurrentInjector(prevInjector);
  }
}
