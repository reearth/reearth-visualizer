export type Events = {
  select?: SelectEvent;
};

export type SelectEvent = {
  // disabled?: boolean;
  openUrl?: OpenUrlEvent;
  // photoOverlay?: PhotoOverlayEvent;
};

export type OpenUrlEvent = {
  url?: string;
  urlKey?: string;
};

// export type PhotoOverlayEvent = {};
