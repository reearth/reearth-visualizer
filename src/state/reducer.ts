import { createSlice, PayloadAction } from "@reduxjs/toolkit";

import { Camera } from "@reearth/util/value";

export type LocalState = {
  error?: string;
  sceneId?: string;
  rootLayerId?: string;
  selectedLayer?: string;
  selectedWidget?: { pluginId: string; extensionId: string };
  selectedType?: "scene" | "layer" | "widget";
  selectedBlock?: string;
  isCapturing: boolean;
  camera?: Camera;
  currentTeam?: {
    id: string;
    name: string;
    members?: Array<any>;
    assets?: any;
    projects?: any;
    personal?: boolean;
  };
  currentProject?: { id: string; name: string; sceneId?: string; isArchived?: boolean };
  notification?: { type: "error" | "warning" | "info"; text: string };
};

const localInitialState: LocalState = {
  isCapturing: false,
};

export const localSlice = createSlice({
  name: "local",
  initialState: localInitialState,
  reducers: {
    set: (state, action: PayloadAction<Partial<LocalState>>) => ({
      ...state,
      ...action.payload,
    }),
  },
});

export const reducer = localSlice.reducer;

export type Store = ReturnType<typeof reducer>;
