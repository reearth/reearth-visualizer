import { setContext } from "@apollo/client/link/context";
import i18n from "@reearth/services/i18n/i18n";

export default () => {
  return setContext(async (_, { headers }) => {
    const local = i18n.language.split("-")[0];
    return {
      headers: {
        ...headers,
        lang: local
      }
    };
  });
};
