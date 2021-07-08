import { useCallback, useState, useEffect } from "react";
import { useIntl } from "react-intl";
import useFileInput from "use-file-input";
import { Type as NotificationType } from "@reearth/components/atoms/NotificationBar";
import { SheetParameter } from "./Gdrive";

export type DatasetType = "csv" | "gcms" | "box" | "drop" | "gdrive";

export default (
  handleDatasetAdd?: (url: string | File, schemeId: string | null) => Promise<void>,
  handleGoogleSheetDatasetAdd?: (
    accessToken: string,
    fileId: string,
    sheetName: string,
    schemeId: string | null,
  ) => Promise<void>,
  onNotify?: (type: NotificationType, text: string) => void,
) => {
  const intl = useIntl();
  const [url, onUrlChange] = useState<string>();
  const [csv, changeCsv] = useState<File>();
  const [sheet, changeSheet] = useState<SheetParameter>();
  const [dataType, setDataType] = useState<DatasetType>();
  const [disabled, setDisabled] = useState(true);

  const handleImport = useCallback(async () => {
    if (dataType === "gdrive") {
      if (!sheet || !handleGoogleSheetDatasetAdd) return;
      await handleGoogleSheetDatasetAdd(sheet.accessToken, sheet.fileId, sheet.sheetName, null);
      onNotify?.(
        "info",
        intl.formatMessage({ defaultMessage: "You have added a dataset successfully." }),
      );
    }
    const data = dataType === "csv" ? csv : url;
    if (!data || !handleDatasetAdd) return;
    await handleDatasetAdd(data, null);
    onNotify?.(
      "info",
      intl.formatMessage({ defaultMessage: "You have added a dataset successfully." }),
    );
  }, [dataType, url, csv, sheet, handleDatasetAdd, handleGoogleSheetDatasetAdd, intl, onNotify]);

  const onSelectCsvFile = useFileInput(
    (files: FileList) => {
      const file = files[0];
      if (!file) return;
      changeCsv(file);
      setDataType("csv");
    },
    { accept: ".csv,text/csv", multiple: false },
  );

  const handleClick = useCallback(type => {
    setDataType(type);
  }, []);

  const onSheetSelect = useCallback(sheet => {
    changeSheet(sheet);
  }, []);

  const onReturn = useCallback(() => {
    onUrlChange(undefined);
    changeCsv(undefined);
    setDataType(undefined);
    changeSheet(undefined);
  }, []);

  useEffect(() => {
    setDisabled(!(csv || url || sheet));
  }, [csv, url, sheet]);

  return {
    url,
    onUrlChange,
    csv,
    dataType,
    disabled,
    onSelectCsvFile,
    handleClick,
    onReturn,
    onSheetSelect,
    handleImport,
  };
};
