import { useIsCapturing } from "@reearth/classic/state";

export default () => {
  const [isCapturing] = useIsCapturing();

  return {
    isCapturing,
  };
};
