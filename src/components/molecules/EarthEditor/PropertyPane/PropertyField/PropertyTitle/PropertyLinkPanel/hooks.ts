import { useState, useCallback, useEffect, useMemo } from "react";
import { DatasetSchema, Type } from "./types";

export default ({
  linkedDataset,
  onDatasetPickerOpen,
  onClose,
  onLink,
  onClear,
  linkableType,
  datasetSchemas,
  fixedDatasetSchemaId,
  fixedDatasetId,
  isLinkable,
}: {
  linkedDataset?: {
    schema: string;
    dataset?: string;
    field: string;
    schemaName?: string;
    datasetName?: string;
    fieldName?: string;
  };
  onDatasetPickerOpen?: () => void;
  onClose?: () => void;
  onLink?: (ds: string, s: string | undefined, f: string) => void;
  onClear?: () => void;
  linkableType?: Type;
  datasetSchemas?: DatasetSchema[];
  fixedDatasetSchemaId?: string;
  fixedDatasetId?: string;
  isLinkable?: boolean;
}) => {
  const [selected, select] = useState<{
    source?: string;
    schema?: string;
    dataset?: string;
    field?: string;
  }>({});

  const [pos, setPos] = useState(0);

  const visibleDatasetSchemas = useMemo(
    () =>
      linkableType
        ? datasetSchemas?.filter(s => !!s.fields?.find(f => f.type === linkableType))
        : datasetSchemas,
    [datasetSchemas, linkableType],
  );

  const selectedSchema = useMemo(
    () => (selected.schema ? datasetSchemas?.find(s => s.id === selected.schema) : undefined),
    [datasetSchemas, selected.schema],
  );

  const selectedDatasetPath = linkedDataset
    ? [
        linkedDataset.schemaName ?? linkedDataset.schema,
        linkedDataset.datasetName ?? linkedDataset.dataset,
        linkedDataset.fieldName ?? linkedDataset.field,
      ].filter((s): s is string => !!s)
    : undefined;

  const startDatasetSelection = useCallback(() => {
    setPos(1);
    onDatasetPickerOpen?.();
  }, [onDatasetPickerOpen]);

  const finishDatasetSelection = useCallback(
    (field: string) => {
      setPos(0);
      onClose?.();
      if (selected.schema) {
        onLink?.(
          fixedDatasetSchemaId ?? selected.schema,
          fixedDatasetId ?? selected.dataset,
          field,
        );
      }
    },
    [onClose, selected.schema, selected.dataset, onLink, fixedDatasetSchemaId, fixedDatasetId],
  );

  const proceed = useCallback(
    (selected: { source?: string; schema?: string; dataset?: string; field?: string }) => {
      select(s => ({
        ...s,
        ...selected,
      }));
      setPos(p => p + 1);
    },
    [],
  );

  const back = useCallback(() => {
    setPos(s => (s <= 0 ? 0 : s - 1));
  }, []);

  const clear = useCallback(() => {
    onClear?.();
    onClose?.();
  }, [onClear, onClose]);

  useEffect(() => {
    select({
      schema: fixedDatasetSchemaId ?? linkedDataset?.schema,
      dataset: fixedDatasetId ?? linkedDataset?.dataset,
      field: linkedDataset?.field,
    });
  }, [fixedDatasetId, fixedDatasetSchemaId, linkedDataset]);

  useEffect(() => {
    setPos(0);
  }, [isLinkable, fixedDatasetSchemaId]);

  return {
    selected,
    pos,
    startDatasetSelection,
    finishDatasetSelection,
    proceed,
    back,
    visibleDatasetSchemas,
    selectedSchema,
    selectedDatasetPath,
    clear,
  };
};
