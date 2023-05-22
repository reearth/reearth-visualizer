/*
https://github.com/uupaa/dynamic-import-polyfill

MIT License

Copyright (c) 2018 uupaa

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.
*/

const cache = new Map<string, any>(); // added
const events = new Map<string, ((data: any, err: any) => void)[]>(); // added
const emitEvent = (url: string, data: any, err: any) => {
  const event = events.get(url);
  if (event) {
    event.forEach(cb => cb(data, err));
  }
};

function toAbsoluteURL(url: string) {
  const a = document.createElement("a");
  a.setAttribute("href", url); // <a href="hoge.html">
  return (a.cloneNode(false) as any).href; // -> "http://example.com/hoge.html"
}

export function importModule<T = any>(url: string) {
  // added
  const cached = cache.get(url);
  if (cached) {
    return Promise.resolve<T>(cached);
  }
  const event = events.get(url);
  if (event) {
    // still loading
    return new Promise<T>((resolve, reject) => {
      const cb = (data: T, err: any) => {
        if (err) {
          reject(err);
          return;
        }
        resolve(data);
      };
      event.push(cb);
    });
  }
  events.set(url, []);

  return new Promise<T>((resolve, reject) => {
    const vector = "$importModule$" + Math.random().toString(32).slice(2);
    const script = document.createElement("script");
    const destructor = () => {
      delete (window as any)[vector];
      script.onerror = null;
      script.onload = null;
      script.remove();
      URL.revokeObjectURL(script.src);
      script.src = "";
      events.delete(url); // added
    };
    script.type = "module";
    script.onerror = () => {
      const err = new Error(`Failed to import: ${url}`);
      reject(err);
      emitEvent(url, undefined, err); // added
      destructor();
    };
    script.onload = () => {
      const data = (window as any)[vector];
      cache.set(url, data); // added
      resolve(data);
      emitEvent(url, data, undefined); // added
      destructor();
    };
    const absURL = toAbsoluteURL(url);
    const loader = `import * as m from "${absURL}"; window.${vector} = m;`; // export Module
    const blob = new Blob([loader], { type: "text/javascript" });
    script.src = URL.createObjectURL(blob);

    document.head.appendChild(script);
  });
}

export default importModule;
