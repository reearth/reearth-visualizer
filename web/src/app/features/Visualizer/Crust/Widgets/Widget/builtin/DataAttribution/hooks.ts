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
      let googleCredit = screenCredits.find((e) => e.logo?.includes("google"));
      if (
        !googleCredit &&
        credits.lightbox.some((c) => c.html?.includes("Google"))
      ) {
        googleCredit = {
          logo: "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAGIAAAASCAYAAACghwvPAAAAGXRFWHRTb2Z0d2FyZQBBZG9iZSBJbWFnZVJlYWR5ccllPAAAAs1JREFUeNrsWYGRhCAMtARLsARLoARLoARLsANKsARLoARKsARK4M+fcLOXCxHP+fPm/5lh5tQAIZtkA9c00FJK5taX9Ny2d0Nzcbvp0N+633rzW9ttcy7tt/liHU1W5MQc09Z3ZFqSs1eCEDbv35ShbwN54W8BIjeryMwk4y/ZnGbot3vHzwMRs7MJ6S9dAUTmhFVS7KCRukq5dkem2+SOAEFj+gNAJClFQfS/HYjcxhfGthDGCQAdBCMtgpwpkDF67ULvnAQEpc6VjRl39htgTMfmSqCDV9Z52CfoOJEOWReHjkfPEbPQ93d4YQreIXVHIASF2C2AFZmhsA0AQlTm8xwIMBwaR+UAmMvmihC+5fE9AsHW8cxZjBBpgWQirgFcvNLvcF9nBwjNKGPB6Bgh+BxBaQRxZSkhZC9l4EhArPCtZam2xAFo4KyDIU++8yST62kfFjmTGfmJZ9k+sejpWIRYNTWRgthnwStmIV1l41n4PQrpKoEhHiKElZtPQDBSNULIB4mzmIENyEYEr5CaFtj7wub6Bl9YL0eTA/vliLhXp4fIGjxwAiA0wpsqI25SSNgUgDCls45G2oKBF4m8mZGtkJpWAQi/o7/EqTFHhHkijvJBCL1Ri4gkRMSkRER/MiJWSpXZm9sDQHSYIgtAeM47sM/aiJgFgNzDOHagW8mAHS02MHJyNGbkaY3kPeZoxhEDbL7EEcglppIjkFeMVK2UgAAO6CqAaEuHPm4fgSMsRBLOEx4yAfP4qiuOA1WTJmdOVE1GkQ+1QOxFDnOmhVVnvlA1zehEharJS9HYACHHmks/MjInSekcIeVGz3M5gbGwuQLK80s/4eyxl2I9eq0ChIfo5/pH8HDHyuJJPCeUzxG+5iD67isMK4DjeL3/oZem7z2J/+BGZiXfp0+46/orQGgcEc7cg/0D8fofP1X5/sN0P/X/xZcAAwB8nuN904Y57wAAAABJRU5ErkJggg==",
          description: "Google Maps"
        };
      }
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
