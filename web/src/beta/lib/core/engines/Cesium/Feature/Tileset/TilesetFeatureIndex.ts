import { type Cesium3DTileContent } from "cesium";

import { FeatureIndex } from "../../FeatureIndex";
import { InternalCesium3DTileFeature } from "../../types";

interface IndexRecord {
  content: Cesium3DTileContent;
  batchId: number;
}

export class TilesetFeatureIndex extends FeatureIndex<IndexRecord, InternalCesium3DTileFeature> {
  has(key: string): boolean {
    return this.records.has(key);
  }

  find(key: string) {
    const record = this.records.get(key);
    if (record == null) {
      return;
    }
    return record.map(
      ({ content, batchId }) => content.getFeature(batchId) as InternalCesium3DTileFeature,
    );
  }

  addFeature(content: Cesium3DTileContent, batchId: number, key?: string): void {
    if (key == null) {
      return;
    }
    const record = this.records.get(key);
    if (record == null) {
      this.records.set(key, [{ content, batchId }]);
    } else {
      record.push({ content, batchId });
    }
  }

  deleteFeature(key: string | undefined): void {
    if (key == null) {
      return;
    }
    if (this.records.has(key)) {
      this.records.delete(key);
    }
  }
}
