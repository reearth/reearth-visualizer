import { useCallback, useState, useEffect, useMemo } from "react";
import { useIntl } from "react-intl";
import useFileInput from "use-file-input";

import { useAuth } from "@reearth/auth";

import { SheetParameter } from "./Gdrive";

export default (
  syncLoading: boolean,
  handleDatasetAdd?: (url: string | File, schemeId: string | null) => Promise<void>,
  handleGoogleSheetDatasetAdd?: (
    accessToken: string,
    fileId: string,
    sheetName: string,
    schemeId: string | null,
  ) => Promise<void>,
  onClose?: () => void,
) => {
  const { getAccessToken } = useAuth();
  const intl = useIntl();

  const googleApiKey = window.REEARTH_CONFIG?.googleApiKey;
  const extensions = window.REEARTH_CONFIG?.extensions?.datasetImport;
  const [url, setUrl] = useState<string>();
  const [csv, setCsv] = useState<File>();
  const [sheet, setSheet] = useState<SheetParameter>();
  const [disabled, setDisabled] = useState(true);
  const [dataType, setDataType] = useState<string>();
  const [accessToken, setAccessToken] = useState<string>();

  const primaryButtonText = useMemo(() => {
    if (syncLoading) {
      return intl.formatMessage({ defaultMessage: "sending..." });
    } else {
      return intl.formatMessage({ defaultMessage: "Add Dataset" });
    }
  }, [syncLoading, intl]);

  const extensionTypes = useMemo(() => {
    if (!extensions) return;
    const types: string[] = [];
    for (let i = 0; i < extensions.length; i++) {
      if (types.includes(extensions[i].id)) continue;
      types.push(extensions[i].id);
    }
    return types;
  }, [extensions]);

  const AllDatasetTypes = useMemo(() => {
    const ReEarthDatasetTypes = ["csv", "gcms", "box", "drop", "gdrive"];
    return extensionTypes ? [...extensionTypes, ...ReEarthDatasetTypes] : ReEarthDatasetTypes;
  }, [extensionTypes]);

  const handleSetDataType = useCallback(
    (type?: string) => {
      if (type && AllDatasetTypes.includes(type)) {
        setDataType(type);
      } else {
        setDataType(undefined);
      }
    },
    [AllDatasetTypes],
  );

  const handleImport = useCallback(async () => {
    if (dataType === "gdrive") {
      if (!sheet || !handleGoogleSheetDatasetAdd) return;
      await handleGoogleSheetDatasetAdd(sheet.accessToken, sheet.fileId, sheet.sheetName, null);
    }
    const data = dataType === "csv" ? csv : url;
    if (!data || !handleDatasetAdd) return;
    await handleDatasetAdd(data, null);
  }, [dataType, url, csv, sheet, handleDatasetAdd, handleGoogleSheetDatasetAdd]);

  const handleSelectCsvFile = useFileInput(
    (files: FileList) => {
      const file = files[0];
      if (!file) return;
      setCsv(file);
      handleSetDataType("csv");
    },
    { accept: ".csv,text/csv", multiple: false },
  );

  const handleClose = useCallback(() => {
    setCsv(undefined);
    setSheet(undefined);
    setUrl(undefined);
    handleSetDataType(undefined);
    onClose?.();
  }, [onClose, handleSetDataType]);

  const handleSheetSelect = useCallback(sheet => {
    setSheet(sheet);
  }, []);

  const handleReturn = useCallback(() => {
    setUrl(undefined);
    setCsv(undefined);
    handleSetDataType(undefined);
    setSheet(undefined);
  }, [handleSetDataType]);

  useEffect(() => {
    getAccessToken().then(token => {
      setAccessToken(token);
    });
  }, [getAccessToken]);

  useEffect(() => {
    setDisabled(!(csv || url || sheet));
  }, [csv, url, sheet]);

  return {
    url,
    csv,
    dataType,
    disabled,
    accessToken,
    primaryButtonText,
    googleApiKey,
    extensions,
    setUrl,
    handleSelectCsvFile,
    handleSetDataType,
    handleReturn,
    handleSheetSelect,
    handleImport,
    handleClose,
  };
};
