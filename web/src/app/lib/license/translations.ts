import type { TFunction } from "i18next";

// License summaries are looked up by value at render time, so `t()` only ever
// sees a dynamic string there and i18next-parser cannot extract the keys. This
// file is never imported — it exists so the parser finds the literals and keeps
// them in the locale catalogs. Keep it in sync with `summary` in ./licenses.ts.
export function registerLicenseTranslations(t: TFunction) {
  t(
    "Anyone can use, share, and adapt your work for any purpose, including commercially, as long as they credit you."
  );
  t(
    "Anyone can use, change, and share your work, including in commercial or closed products – they only keep your copyright notice."
  );
  t(
    "Like MIT, plus an explicit patent grant for extra legal protection. Anyone can use it commercially; they keep notices and mark any changes."
  );
  t(
    "Anyone can freely use, modify, and share your data for any purpose – they only keep the attribution notice."
  );
  t(
    "Anyone can use and adapt your database, including commercially, as long as they credit you."
  );
  t(
    "Anyone can use and adapt your work, including commercially, but must credit you and release their versions under this same license."
  );
  t(
    "Anyone can use and modify your software, but anything they build on it must also be shared as open source under this license."
  );
  t(
    "Others can include your code in their own programs, even closed ones. Only changes to your code itself must be shared as open source."
  );
  t(
    "A European open-source license. Anyone can use and modify your work, but their versions must stay open under a compatible license."
  );
  t(
    "Anyone can use and adapt your database, including commercially, but must credit you and share any adapted database under this same license."
  );
  t(
    "Anyone can share your work, including commercially, but must credit you and cannot publish modified versions."
  );
  t(
    "Anyone can share and adapt your work for non-commercial purposes only, as long as they credit you."
  );
}
