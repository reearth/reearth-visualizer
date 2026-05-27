import { Credit as ProcessesCredit } from "@reearth/app/utils/value";
import { CreditItem, Credits } from "@reearth/core";
import { useEffect, useMemo, useState } from "react";

import { Widget } from "../../types";

type WidgetCredit = {
  description?: string;
  logo?: string;
  creditUrl: string;
};

export const useDataAttribution = ({
  credits,
  widget
}: {
  credits?: Credits;
  widget: Widget;
}) => {
  const [cesiumCredit, setCesiumCredit] = useState<ProcessesCredit | undefined>(
    undefined
  );
  const [otherCredits, setOtherCredits] = useState<
    ProcessesCredit[] | undefined
  >(undefined);
  const [googleCredit, setGoogleCredit] = useState<ProcessesCredit | undefined>(
    undefined
  );

  const widgetCredits = useMemo(() => {
    const defaultValue = widget?.property?.default;
    // Ensure we return an array - defaultValue should be an array of WidgetCredit objects
    return Array.isArray(defaultValue) ? defaultValue : [];
  }, [widget?.property?.default]);

  useEffect(() => {
    if (credits) {
      const cesium = parseCreditHtml(credits?.engine?.cesium);
      setCesiumCredit(cesium);

      const lightboxCredits = credits.lightbox
        .map(parseCreditHtml)
        .filter(Boolean) as ProcessesCredit[];
      const screenCredits = credits.screen
        .map(parseCreditHtml)
        .filter(Boolean) as ProcessesCredit[];
      const googleCredit = screenCredits.find((e) =>
        e.logo?.includes("google")
      );
      setGoogleCredit(googleCredit);

      const widgetProcessesCredits: ProcessesCredit[] = widgetCredits
        .filter((credit): credit is WidgetCredit => {
          // Type guard to ensure we have WidgetCredit objects
          return (
            typeof credit === "object" &&
            credit !== null &&
            ("description" in credit ||
              "logo" in credit ||
              "creditUrl" in credit) &&
            (credit.description || credit.logo || credit.creditUrl)
          );
        })
        .map(
          (widgetCredit: WidgetCredit): ProcessesCredit => ({
            description: widgetCredit.description || "",
            logo: widgetCredit.logo,
            creditUrl: widgetCredit.creditUrl
          })
        );

      setOtherCredits([
        ...lightboxCredits,
        ...screenCredits,
        ...widgetProcessesCredits
      ]);
    }
  }, [credits, widget?.property?.default, widgetCredits]);

  return {
    cesiumCredit,
    otherCredits,
    googleCredit
  };
};

function parseCreditHtml(
  credit: CreditItem | undefined
): ProcessesCredit | undefined {
  if (!credit) return undefined;

  if (credit?.html) {
    try {
      const parser = new DOMParser();
      const doc = parser.parseFromString(credit.html, "text/html");
      const logo = doc.querySelector("img")?.getAttribute("src") || "";
      const description =
        doc.querySelector("img")?.getAttribute("title") ||
        doc.body.textContent ||
        "";
      const creditUrl = doc.querySelector("a")?.getAttribute("href") || "";

      return { logo, description, creditUrl };
    } catch (error) {
      console.error("Error processing credit HTML:", error);
      return undefined;
    }
  }

  return undefined;
}
