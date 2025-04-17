import JSZip from "jszip";

export async function fetchFile(url: string): Promise<string> {
  const response = await fetch(url);
  if (!response.ok) {
    throw new Error(`Failed to fetch ${url}: ${response.statusText}`);
  }
  return response.text();
}

export async function fetchAndZipFiles(
  urls: string[],
  zipFileName: string
): Promise<File | undefined> {
  const zip = new JSZip();

  for (const url of urls) {
    try {
      const content = await fetchFile(url);
      const fileName = url.split("/").pop();

      if (!fileName) return;

      zip.file(fileName, content);
    } catch (error) {
      console.error(`Failed to fetch ${url}:`, error);
    }
  }

  let file;

  await zip
    .generateAsync({ type: "blob" })
    .then((blob) => {
      file = new File([blob], zipFileName);
    })
    .catch((error) => {
      console.error("Error generating ZIP file:", error);
    });

  return file;
}
