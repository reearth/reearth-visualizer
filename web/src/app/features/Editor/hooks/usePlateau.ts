import { createCatalogClient } from "@reearth/services/plateau/graphql";
import { useEffect } from "react";

// Hardcoded the api url since it won't change.
const PLATEAU_CATALOG_API_URL =
  "https://api.plateau.reearth.io/datacatalog/graphql";

export default () => {
  useEffect(() => {
    createCatalogClient(PLATEAU_CATALOG_API_URL, undefined);
  }, []);
};
