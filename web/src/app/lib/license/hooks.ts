import { SelectorOption } from "@reearth/app/lib/reearth-ui";
import { useT } from "@reearth/services/i18n/hooks";
import { useMemo } from "react";

import {
  LicenseGroupKey,
  NO_LICENSE_VALUE,
  visualizerProjectLicenseGroups
} from "./licenses";

// The license menu shared by project creation and the project's license
// settings: every license under its heading, each with a plain-language
// summary and a link to its full text. Only project creation offers the
// "no license" row — settings picks a template to edit, and clearing the
// license there is just emptying the editor.
export const useLicenseSelectorOptions = ({
  withNoLicense
}: { withNoLicense?: boolean } = {}): SelectorOption[] => {
  const t = useT();

  return useMemo(() => {
    const groupLabels: Record<LicenseGroupKey, string> = {
      open: t("Open — Free to use"),
      shareAlike: t("Share-alike — Derivatives stay open"),
      limited: t("Limited use")
    };

    return [
      ...(withNoLicense
        ? [
            {
              value: NO_LICENSE_VALUE,
              label: t("No license"),
              description: t(
                "Keep all rights reserved — you can select a license or create your own later."
              )
            }
          ]
        : []),
      ...visualizerProjectLicenseGroups.flatMap(({ key, licenses }) =>
        licenses.map((license) => ({
          value: license.value,
          label: license.label,
          description: license.summary,
          descriptionLink: license.url,
          group: groupLabels[key]
        }))
      )
    ];
  }, [t, withNoLicense]);
};
