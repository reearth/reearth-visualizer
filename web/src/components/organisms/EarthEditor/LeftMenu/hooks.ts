import { useIsCapturing } from "@reearth/state";

export default () => {
  const [isCapturing] = useIsCapturing();

  return {
    isCapturing,
  };
};
