import { Buffer } from "buffer";

export function parseDbf(dbf: Buffer, cpg?: string): Record<string, any>[] {
  const header = parseHeader(dbf);
  const records = parseRecords(dbf, header, cpg);
  return records;
}

export function parseHeader(dbf: Buffer): {
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
  const version = dbf.readUInt8(0);
  const dateUpdated = new Date(1900 + dbf.readUInt8(1), dbf.readUInt8(2) - 1, dbf.readUInt8(3));
  const recordCount = dbf.readInt32LE(4);
  const headerSize = dbf.readInt16LE(8);
  const recordSize = dbf.readInt16LE(10);
  const fields = parseFields(dbf.subarray(32, headerSize));

  return {
    version,
    dateUpdated,
    recordCount,
    recordSize,
    fields,
  };
}

function parseFields(fieldData: Buffer): {
  name: string;
  type: string;
  size: number;
  decimals: number;
}[] {
  const fields = [];
  let offset = 0;

  while (offset < fieldData.length && fieldData[offset] !== 0x0d) {
    const name = fieldData.toString("ascii", offset, offset + 11).replace(/\0.*/, "");
    const type = String.fromCharCode(fieldData.readUInt8(offset + 11));
    const size = fieldData.readUInt8(offset + 16);
    const decimals = fieldData.readUInt8(offset + 17);

    fields.push({
      name,
      type,
      size,
      decimals,
    });

    offset += 32;
  }

  return fields;
}

function parseRecords(
  dbf: Buffer,
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
      const value = dbf.toString("ascii", offset, offset + field.size).trim();

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
          record[field.name] = decoder.decode(Buffer.from(value, "binary")).trim();
      }
    }

    records.push(record);
  }

  return records;
}
