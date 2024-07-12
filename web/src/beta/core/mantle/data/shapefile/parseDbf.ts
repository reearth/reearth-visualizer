export function parseDbf(dbf: ArrayBuffer, cpg?: string): Record<string, any>[] {
  const header = parseHeader(dbf);
  const records = parseRecords(dbf, header, cpg);
  return records;
}

export function parseHeader(dbf: ArrayBuffer): {
  version: number;
  dateUpdated: Date;
  recordCount: number;
  recordSize: number;
  fields: {
    name: string;
    type: string;
    size: number;
    decimals: number;
  }[];
} {
  const view = new DataView(dbf);
  const version = view.getUint8(0);
  const dateUpdated = new Date(1900 + view.getUint8(1), view.getUint8(2) - 1, view.getUint8(3));
  const recordCount = view.getInt32(4, true);
  const headerSize = view.getInt16(8, true);
  const recordSize = view.getInt16(10, true);
  const fields = parseFields(new DataView(dbf, 32, headerSize - 32));
  return { version, dateUpdated, recordCount, recordSize, fields };
}

function parseFields(fieldData: DataView): {
  name: string;
  type: string;
  size: number;
  decimals: number;
}[] {
  const fields = [];
  let offset = 0;
  while (offset < fieldData.byteLength && fieldData.getUint8(offset) !== 0x0d) {
    const name = new TextDecoder()
      .decode(new Uint8Array(fieldData.buffer, fieldData.byteOffset + offset, 11))
      .replace(/\0.*/g, "");
    const type = String.fromCharCode(fieldData.getUint8(offset + 11));
    const size = fieldData.getUint8(offset + 16);
    const decimals = fieldData.getUint8(offset + 17);
    fields.push({ name, type, size, decimals });
    offset += 32;
  }
  return fields;
}

function parseRecords(
  dbf: ArrayBuffer,
  header: ReturnType<typeof parseHeader>,
  cpg?: string,
): Record<string, any>[] {
  const records = [];
  const decoder = cpg ? new TextDecoder(cpg) : new TextDecoder();
  const fields = header.fields;
  for (let i = 0; i < header.recordCount; i++) {
    const record: Record<string, any> = {};
    const offset = header.recordSize * i + 1;
    for (const field of fields) {
      const value = new TextDecoder().decode(new Uint8Array(dbf, offset, field.size)).trim();
      switch (field.type) {
        case "N":
        case "F":
          record[field.name] = parseFloat(value);
          break;
        case "D":
          record[field.name] = new Date(
            parseInt(value.slice(0, 4), 10),
            parseInt(value.slice(4, 6), 10) - 1,
            parseInt(value.slice(6, 8), 10),
          );
          break;
        case "L":
          record[field.name] = value.toLowerCase() === "y" || value.toLowerCase() === "t";
          break;
        default:
          record[field.name] = decoder.decode(new Uint8Array(dbf, offset, field.size)).trim();
      }
    }
    records.push(record);
  }
  return records;
}
