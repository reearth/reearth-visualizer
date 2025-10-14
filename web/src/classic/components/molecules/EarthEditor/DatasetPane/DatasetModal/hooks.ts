import { useCallback, useState, useEffect, useMemo } from "react";
import useFileInput from "use-file-input";

import { useAuth } from "@reearth/services/auth";
import { useT } from "@reearth/services/i18n";

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
  handleHostedDatasetAdd?: (
    url: string,
    auth: { type: string;[key: string]: any } | null,
    schemaId: string | null,
  ) => Promise<void>,
  onClose?: () => void,
) => {
  const { getAccessToken } = useAuth();
  const t = useT();

  const googleApiKey = window.REEARTH_CONFIG?.googleApiKey;
  const extensions = window.REEARTH_CONFIG?.extensions?.datasetImport;
  const [url, setUrl] = useState<string>();
  const [csv, setCsv] = useState<File>();
  const [sheet, setSheet] = useState<SheetParameter>();
  const [hostedUrl, setHostedUrl] = useState<string>("");
  const [authType, setAuthType] = useState<"none" | "basic" | "apikey">("none");
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [apiKey, setApiKey] = useState("");
  const [disabled, setDisabled] = useState(true);
  const [dataType, setDataType] = useState<string>();
  const [accessToken, setAccessToken] = useState<string>();

  const AllDatasetTypes = useMemo(() => {
    const ReEarthDatasetTypes = ["csv", "gcms", "box", "drop", "gdrive", "hosted"];
    return extensions ? [...extensions, ...ReEarthDatasetTypes] : ReEarthDatasetTypes;
  }, [extensions]);

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
    } else if (dataType === "hosted") {
      if (!handleHostedDatasetAdd) return;
      const auth = authType === "none"
        ? null
        : authType === "basic"
          ? { type: "basic", username, password }
          : { type: "apikey", apiKey };
      await handleHostedDatasetAdd(hostedUrl, auth, null);
    } else {
      const data = dataType === "csv" ? csv : url;
      if (!data || !handleDatasetAdd) return;
      await handleDatasetAdd(data, null);
    }
    handleClose();
  }, [
    dataType,
    url,
    csv,
    sheet,
    hostedUrl,
    authType,
    username,
    password,
    apiKey,
    handleDatasetAdd,
    handleGoogleSheetDatasetAdd,
    handleHostedDatasetAdd,
  ]);

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
    setHostedUrl("");
    setAuthType("none");
    setUsername("");
    setPassword("");
    setApiKey("");
    handleSetDataType(undefined);
    onClose?.();
  }, [onClose, handleSetDataType]);

  const handleSheetSelect = useCallback((sheet?: SheetParameter) => {
    if (!sheet) return;
    setSheet(sheet);
  }, []);

  const handleReturn = useCallback(() => {
    setUrl(undefined);
    setCsv(undefined);
    setHostedUrl("");
    setAuthType("none");
    setUsername("");
    setPassword("");
    setApiKey("");
    handleSetDataType(undefined);
    setSheet(undefined);
  }, [handleSetDataType]);

  useEffect(() => {
    getAccessToken().then(token => {
      setAccessToken(token);
    });
  }, [getAccessToken]);

  useEffect(() => {
    setDisabled(!(csv || url || sheet || (dataType === "hosted" && hostedUrl)));
  }, [csv, url, sheet, hostedUrl, dataType]);

  return {
    url,
    csv,
    dataType,
    disabled,
    accessToken,
    hostedUrl,
    authType,
    username,
    password,
    apiKey,
    primaryButtonText: syncLoading ? t("sending...") : t("Add Dataset"),
    googleApiKey,
    extensions,
    setUrl,
    setHostedUrl,
    setAuthType,
    setUsername,
    setPassword,
    setApiKey,
    handleSelectCsvFile,
    handleSetDataType,
    handleReturn,
    handleSheetSelect,
    handleImport,
    handleClose,
  };
};