import { Credit as ProcessesCredit } from "@reearth/beta/utils/value";
import { Credit } from "@reearth/core";
import { useEffect, useMemo, useState } from "react";

import { Widget } from "../../../types";

const parseCreditHtml = (html?: string): ProcessesCredit | undefined => {
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

  useEffect(() => {
    const parsedCoreCredits = credits?.map((credit) =>
      parseCreditHtml(credit.html)
    );

    const widgetProcessedCredits = widgetCredits
      .filter(
        (widgetCredit: any) =>
          widgetCredit.description ||
          widgetCredit.logo ||
          widgetCredit.creditUrl
      )
      .map((widgetCredit: any) => ({
        description: widgetCredit.description || "",
        img: widgetCredit.logo,
        link: widgetCredit.creditUrl
      }));

    const combinedCredits = [
      ...(parsedCoreCredits?.filter(Boolean) as ProcessesCredit[]),
      ...widgetProcessedCredits
    ];

    setProcessedCredits(combinedCredits);
  }, [credits, widgetCredits]);

  return {
    processedCredits
  };
};
