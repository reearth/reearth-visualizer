import { Credit as ProcessesCredit } from "@reearth/beta/utils/value";
import { Credit } from "@reearth/core";
import { useEffect, useMemo, useState } from "react";

import { Widget } from "../../../types";

type WidgetCredit = {
  description?: string;
  logo?: string;
  creditUrl: string;
};

export const useDataAttribution = ({
  credits,
  widget
}: {
  credits?: Credit[];
  widget: Widget;
}) => {
  const [processedCredits, setProcessedCredits] = useState<ProcessesCredit[]>(
    []
  );

  const widgetCredits = useMemo(
    () => widget?.property.default || [],
    [widget?.property.default]
  );

  const processedCoreCredits = useMemo(
    () =>
      credits
        ?.map((credit) => parseCreditHtml(credit.html))
        .filter(Boolean) as ProcessesCredit[],
    [credits]
  );

  useEffect(() => {
    const widgetProcessedCredits: ProcessesCredit[] = widgetCredits
      .filter(
        (widgetCredit: WidgetCredit) =>
          widgetCredit.description ||
          widgetCredit.logo ||
          widgetCredit.creditUrl
      )
      .map((widgetCredit: WidgetCredit) => ({
        description: widgetCredit.description || "",
        img: widgetCredit.logo,
        link: widgetCredit.creditUrl
      }));

    const combinedCredits = [
      ...processedCoreCredits,
      ...widgetProcessedCredits
    ];

    setProcessedCredits(combinedCredits);
  }, [processedCoreCredits, widgetCredits]);

  return {
    processedCredits
  };
};

function parseCreditHtml(html?: string): ProcessesCredit | undefined {
  if (!html) return undefined;

  const tempDiv = document.createElement("div");
  tempDiv.innerHTML = html;

  const imgElement = tempDiv.querySelector("img");
  const description =
    imgElement?.getAttribute("title") || tempDiv.textContent || "";
  const img = imgElement?.src;

  const linkElement = tempDiv.querySelector("a");
  const link = linkElement ? linkElement.href : undefined;

  return { description, img, link };
}
