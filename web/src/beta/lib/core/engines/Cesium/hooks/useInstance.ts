/**
 * ref: https://github.com/takram-design-engineering/plateau-view/blob/main/libs/cesium/src/useInstance.ts
 */

import { useEffect, useRef, useState } from "react";
import invariant from "tiny-invariant";

type DelegationEffect<T, Owner> = (instance: T, owner: Owner) => () => void;

type InstanceDescriptor<
  T,
  CreatorFunction extends () => T | Promise<T>,
  Keys extends unknown[],
  Owner,
> = {
  keys: Keys;
  create: CreatorFunction;
} & (
  | {
      owner: Owner;
      transferOwnership: DelegationEffect<T, Owner>;
      destroy?: never;
    }
  | {
      owner?: never;
      transferOwnership?: never;
      destroy?: ((instance: T) => void) | null;
    }
);

type DisallowPromise<T> = T extends Promise<unknown> ? never : T;

const hasMethod =
  <K extends string | symbol>(name: K) =>
  <R, T = unknown>(instance: T): instance is T & object & Record<K, R> =>
    instance != null &&
    typeof instance === "object" &&
    name in instance &&
    typeof instance[name as unknown as keyof typeof instance] === "function";

function createDestructor<T, Keys extends unknown[], Owner>(
  descriptor: InstanceDescriptor<T, () => T | Promise<T>, Keys, Owner>,
  instance: T,
): () => void {
  if (descriptor.owner != null) {
    invariant(descriptor.transferOwnership != null);
    const owner = descriptor.owner; // Capture the current owner
    const destructor = descriptor.transferOwnership(instance, descriptor.owner);
    return () => {
      // Call destructor only when the owner is not destroyed.
      if (!hasMethod("isDestroyed")<() => boolean>(owner) || !owner.isDestroyed()) {
        destructor();
      }
    };
  } else {
    const destroy = descriptor.destroy; // Capture the current destroy callback
    return () => {
      // Let the callback destroy instance, otherwise assume the instance might
      // have destroy() method and automatically invoke it.
      if (typeof destroy === "function") {
        destroy(instance);
      } else if (destroy !== null && hasMethod("destroy")<() => void>(instance)) {
        instance.destroy();
      }
    };
  }
}

export function useInstance<T, Keys extends unknown[], Owner>(
  descriptor: InstanceDescriptor<T, () => DisallowPromise<T>, Keys, Owner>,
): T {
  const [state, setState] = useState<T>();
  const ref = useRef<T>();
  if (ref.current == null) {
    ref.current = descriptor.create();
  }

  // useEffect is called twice with *the previous state* in StrictMode and in
  // the future, but many resources of Cesium are destroyed on removal from the
  // collection, which cannot be called twice. Letting the effect destroy the
  // instance and recreate it in the second call effectively compensate for it.
  useEffect(() => {
    if (ref.current == null) {
      ref.current = descriptor.create();
      setState(ref.current); // Need to trigger state update
    }
    const instance = ref.current;
    const destructor = createDestructor(descriptor, instance);
    return () => {
      destructor();
      ref.current = undefined;
      setState(undefined);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [descriptor.owner, ...descriptor.keys]);

  return state ?? ref.current;
}
