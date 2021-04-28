import { useCallback, useState, useEffect } from "react";
import { useIntl } from "react-intl";
import useFileInput from "use-file-input";
import { Type as NotificationType } from "@reearth/components/atoms/NotificationBar";

export type DatasetType = "csv" | "gcms" | "box" | "drop" | "gdrive";

export default (
  handleDatasetAdd?: (url: string | File, schemeId: string | null) => Promise<void>,
  onNotify?: (type: NotificationType, text: string) => void,
) => {
  const intl = useIntl();
  const [url, onUrlChange] = useState<string>();
  const [csv, changeCsv] = useState<File>();
  const [dataType, setDataType] = useState<DatasetType>();
  const [disabled, setDisabled] = useState(true);

  const handleImport = useCallback(async () => {
    const data = dataType === "csv" ? csv : url;
    if (!data || !handleDatasetAdd) return;
    await handleDatasetAdd(data, null);
    onNotify?.(
      "info",
      intl.formatMessage({ defaultMessage: "You have added a dataset successfully." }),
    );
  }, [dataType, url, csv, handleDatasetAdd, intl, onNotify]);

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

  const onReturn = useCallback(() => {
    onUrlChange(undefined);
    changeCsv(undefined);
    setDataType(undefined);
  }, []);

  useEffect(() => {
    setDisabled(!(csv || url));
  }, [csv, url]);

  return {
    url,
    onUrlChange,
    csv,
    dataType,
    disabled,
    onSelectCsvFile,
    handleClick,
    onReturn,
    handleImport,
  };
};
