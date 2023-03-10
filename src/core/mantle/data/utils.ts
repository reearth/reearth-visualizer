export { default as generateRandomString } from "@reearth/util/generate-random-string";

export type FetchOptions = {
  signal?: AbortSignal;
};

export async function f(url: string, options?: FetchOptions): Promise<Response> {
  const res = await fetch(url, options);
  if (res.status !== 200) {
    throw new Error(`fetched ${url} but status code was ${res.status}`);
  }
  return res;
}

export function isDefined<T>(value: T | undefined | null): value is T {
  return value !== undefined && value !== null;
}

export function convertToCoordinates(coordinates: string) {
  return coordinates.split(" ").map(coord => parseFloat(coord));
}
