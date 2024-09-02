import useClientStorage from "../useClientStorage";

export default () => {
  const clientStorage = useClientStorage();

  return {
    clientStorage
  };
};
