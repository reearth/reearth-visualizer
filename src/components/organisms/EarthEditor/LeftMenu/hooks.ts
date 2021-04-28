import { useLocalState } from "@reearth/state";

export default () => {
  const [{ isCapturing }] = useLocalState(s => ({
    isCapturing: s.isCapturing,
  }));

  return {
    isCapturing,
  };
};
