export { default as generateRandomString } from "@reearth/util/generate-random-string";

export async function f(url: string): Promise<Response> {
  const res = await fetch(url);
  if (res.status !== 200) {
    throw new Error(`fetched ${url} but status code was ${res.status}`);
  }
  return res;
}
