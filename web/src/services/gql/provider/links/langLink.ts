import { setContext } from "@apollo/client/link/context";
import i18n from "@reearth/services/i18n/i18n";

export default () => {
  return setContext(async (_, { headers }) => {
    const defaultLang = "en";
    const locale = i18n.language;

    const splitLocale = locale.split("-");
    const lang = splitLocale.length > 1 ? splitLocale[0] : defaultLang;
    if (!lang.match(/^[a-zA-Z]{2,3}$/)) {
      console.warn(
        `Invalid language code: ${locale}, falling back to "${defaultLang}"`
      );
      return { headers: { ...headers, lang: defaultLang } };
    }

    return {
      headers: {
        ...headers,
        lang
      }
    };
  });
};
