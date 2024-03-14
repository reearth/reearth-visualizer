// This is for indexing the feature to find the feature with less computation.
// You can refer TilesetFeatureIndex to see the detail of implementation.
export class FeatureIndex<Record = unknown, Feature = unknown> {
  readonly records = new Map<string, Record[]>();

  constructor() {}

  has(key: string): boolean {
    return this.records.has(key);
  }

  find(_key: string): Feature[] | undefined {
    return;
  }
}
