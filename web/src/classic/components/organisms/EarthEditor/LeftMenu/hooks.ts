import { useIsCapturing } from "@reearth/services/state";

export default () => {
  const [isCapturing] = useIsCapturing();

  return {
    isCapturing,
  };
};
