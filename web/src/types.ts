// eslint-disable-next-line
export type Brand<V, Brand extends string> = V & { readonly __brand__: Brand };

export type ExtendedFunc<F extends (...args: any) => any, A> = (
  a1: A,
  ...a2: Parameters<F>
) => ReturnType<F>;

export type ExtendedFunc2<F extends (...args: any) => any, A, B> = (
  a1: A,
  a2: B,
  ...a3: Parameters<F>
) => ReturnType<F>;

export type ExtendedFunc3<F extends (...args: any) => any, A, B, C> = (
  a1: A,
  a2: B,
  a3: C,
  ...a4: Parameters<F>
) => ReturnType<F>;

export type Args<F> = F extends (a: any, ...b: infer A) => any ? A : never;
export type Args2<F> = F extends (a: any, b: any, ...c: infer A) => any ? A : never;
export type Args3<F> = F extends (a: any, b: any, c: any, ...d: infer A) => any ? A : never;

export type OmitFunc<F extends (a: any, ...args: any) => any> = (...a2: Args<F>) => ReturnType<F>;
export type OmitFunc2<F extends (a: any, b: any, ...args: any) => any> = (
  ...a2: Args2<F>
) => ReturnType<F>;
export type OmitFunc3<F extends (a: any, b: any, c: any, ...args: any) => any> = (
  ...a2: Args3<F>
) => ReturnType<F>;

export type ExtendedFuncProps<P extends { [key in string]?: (...args: any) => any }, A> = {
  [K in keyof P]?: ExtendedFunc<NonNullable<P[K]>, A>;
};

export type ExtendedFuncProps2<P extends { [key in string]?: (...args: any) => any }, A, B> = {
  [K in keyof P]?: ExtendedFunc2<NonNullable<P[K]>, A, B>;
};

export type ExtendedFuncProps3<P extends { [key in string]?: (...args: any) => any }, A, B, C> = {
  [K in keyof P]?: ExtendedFunc3<NonNullable<P[K]>, A, B, C>;
};

export type OmitFuncProps<P extends { [key in string]?: (...args: any) => any }> = {
  [K in keyof P]?: OmitFunc<NonNullable<P[K]>>;
};

export type OmitFuncProps2<P extends { [key in string]?: (...args: any) => any }> = {
  [K in keyof P]?: OmitFunc2<NonNullable<P[K]>>;
};

export type OmitFuncProps3<P extends { [key in string]?: (...args: any) => any }> = {
  [K in keyof P]?: OmitFunc3<NonNullable<P[K]>>;
};

export type ProjectType = "classic" | "beta";
