import { useCallback, useEffect, useState } from "react";

export type SheetParameter = {
  accessToken: string;
  fileId: string;
  sheetName: string;
};

export type GoogleSheet = {
  properties: {
    gridProperties: { rowCount: number; columnCount: number };
    index: number;
    sheetId: string;
    sheetType: string;
    title: string;
  };
};

export type File = {
  id: string;
  name: string;
};

export default (onSheetSelect: (sheet: SheetParameter) => void) => {
  const [isLoading, setIsLoading] = useState(true);
  const [pickerApiLoaded, setPickerApiLoaded] = useState(false);
  const [pickedFile, setPickedFile] = useState<File>();
  const [pickedFileSheets, setPickedFileSheets] = useState<GoogleSheet[]>([]);
  const [selectedSheet, setSelectedSheet] = useState<File>();
  const [accessToken, setAccessToken] = useState("");

  const pickerCallback = async (data: any) => {
    if (data[google.picker.Response.ACTION] === google.picker.Action.PICKED) {
      setPickedFile({ name: data.docs[0].name, id: data.docs[0].id });
      gapi.client.sheets.spreadsheets
        .get({
          spreadsheetId: data.docs[0].id,
        })
        .then(function (response: any) {
          setPickedFileSheets(response.result.sheets as GoogleSheet[]);
        });
    }
  };

  useEffect(() => {
    const googleApiKey = window.REEARTH_CONFIG?.googleApiKey;
    if (pickerApiLoaded && accessToken && googleApiKey) {
      setIsLoading(false);
      const picker = new google.picker.PickerBuilder()
        .addView(google.picker.ViewId.SPREADSHEETS)
        .setOAuthToken(accessToken)
        .setDeveloperKey(googleApiKey)
        .setCallback(pickerCallback)
        .build();
      picker.setVisible(true);
    }
  }, [accessToken, pickerApiLoaded]);

  const handleClientLoad = async () => {
    const googleApiKey = window.REEARTH_CONFIG?.googleApiKey;
    setIsLoading(true);
    const googleClientId = window.REEARTH_CONFIG?.googleClientId;
    await gapi.load("client:auth2", () => {
      gapi.client
        .init({
          apiKey: googleApiKey,
          clientId: googleClientId,
          scope:
            "https://www.googleapis.com/auth/drive https://www.googleapis.com/auth/documents.readonly",
          discoveryDocs: ["https://sheets.googleapis.com/$discovery/rest?version=v4"],
        })
        .then(function () {
          if (gapi.auth2.getAuthInstance().isSignedIn.get()) {
            gapi.auth2.getAuthInstance().signOut();
          }
          setIsLoading(false);
        });
    });
    await gapi.load("picker", () => {
      setPickerApiLoaded(true);
    });
  };

  const updateSigninStatus = (isSignedIn: boolean, accessToken: any) => {
    if (isSignedIn) {
      setAccessToken(accessToken);
    }
  };

  const handleSheetSelect = useCallback(
    (sheet: File) => {
      setSelectedSheet({ id: sheet.id, name: sheet.name });
      onSheetSelect({
        accessToken,
        fileId: pickedFile?.id as string,
        sheetName: sheet.name as string,
      });
    },
    [onSheetSelect, accessToken, pickedFile?.id],
  );

  const handleAuthClick = () => {
    Promise.resolve(gapi.auth2.getAuthInstance().signIn()).then(() => {
      updateSigninStatus(
        gapi.auth2.getAuthInstance().isSignedIn.get(),
        gapi.auth2.getAuthInstance().currentUser.get().getAuthResponse().access_token,
      );
    });
  };

  useEffect(() => {
    const gDriveScript = document.createElement("script");
    gDriveScript.src = "https://apis.google.com/js/api.js";
    gDriveScript.async = true;
    gDriveScript.onload = () => {
      handleClientLoad();
    };
    document.body.appendChild(gDriveScript);
    return () => {
      document.body.removeChild(gDriveScript);
    };
  }, []);

  return {
    isLoading,
    pickedFile,
    pickedFileSheets,
    selectedSheet,
    handleAuthClick,
    handleSheetSelect,
    handleClientLoad,
  };
};
