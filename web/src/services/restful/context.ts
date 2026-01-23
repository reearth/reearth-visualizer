import { AxiosInstance } from "axios";
import { createContext } from "react";

type RestfulContextType = {
  axios: AxiosInstance;
};

const RestfulContext = createContext<RestfulContextType | undefined>(undefined);

export default RestfulContext;
