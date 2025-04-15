import JSZip from "jszip";
import { v4 as uuidv4 } from "uuid";

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

const CHUNK_SIZE = 16 * 1024 * 1024; // 16MB

export const uploadFile = async (file: File, teamId: string, axios: any) => {
  const totalChunks = Math.ceil(file.size / CHUNK_SIZE);
  const fileId = uuidv4();

  for (let chunkNum = 0; chunkNum < totalChunks; chunkNum++) {
    const start = chunkNum * CHUNK_SIZE;
    const end = Math.min(file.size, start + CHUNK_SIZE);
    const chunk = file.slice(start, end);

    const formData = new FormData();
    formData.append("file", chunk, `${file.name}.part${chunkNum}`);
    formData.append("file_id", fileId);
    formData.append("team_id", teamId);
    formData.append("chunk_num", chunkNum.toString());
    formData.append("total_chunks", totalChunks.toString());

    try {
      const response = await axios.post("/split-import", formData);
      return response.data;
    } catch (err: any) {
      return err.message;
    }
  }
};
