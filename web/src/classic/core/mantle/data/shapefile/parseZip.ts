import JSZip from "jszip";

// eslint-disable-next-line @typescript-eslint/no-unused-vars
async function unzip(buffer: Buffer): Promise<{ [key: string]: Buffer | string }> {
  const zip = new JSZip();
  await zip.loadAsync(buffer);
  const files = zip.file(/.+/);
  const out: { [key: string]: Buffer | string } = {};

  await Promise.all(
    files.map(async a => {
      let result;
      if (a.name.slice(-3).toLowerCase() === "shp" || a.name.slice(-3).toLowerCase() === "dbf") {
        result = await a.async("nodebuffer");
      } else {
        result = await a.async("text");
      }
      out[a.name] = result;
    }),
  );

  return out;
}

// eslint-disable-next-line @typescript-eslint/no-unused-vars
async function parseZip(buffer: Buffer | ArrayBuffer, whiteList?: string[]) {
  // Implementation of parseZip function
  // ...
}
