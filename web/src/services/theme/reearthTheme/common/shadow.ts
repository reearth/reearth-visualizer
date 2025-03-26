const shadow = {
  input: "0px 2px 2px 0px rgba(0, 0, 0, 0.25) inset",
  button: "0px 2px 2px 0px rgba(0, 0, 0, 0.25)",
  card: "2px 2px 2px 0px rgba(0, 0, 0, 0.25)",
  popup: "4px 4px 4px 0px rgba(0, 0, 0, 0.25)",
  tooltip: "4px 6px 12px 0px rgba(0, 0, 0, 0.60)"
} as const;

export type ShadowType = typeof shadow;

export default shadow;
