import { ReactNode } from "react";
import { GridSection } from "react-align";

import type { CommonProps as PluginCommonProps } from "../Plugin";

import Area from "./Area";
import type { WidgetZone, WidgetLayoutConstraint } from "./hooks";

export type Props = {
  children?: ReactNode;
  zone?: WidgetZone;
  zoneName: "inner" | "outer";
  layoutConstraint?: { [w: string]: WidgetLayoutConstraint };
  isEditable?: boolean;
  isBuilt?: boolean;
  sceneProperty?: any;
  overrideSceneProperty?: (pluginId: string, property: any) => void;
} & PluginCommonProps;

const sections = ["left", "center", "right"] as const;
const areas = ["top", "middle", "bottom"] as const;

export default function Zone({
  zone,
  zoneName,
  layoutConstraint,
  sceneProperty,
  pluginProperty,
  pluginBaseUrl,
  isEditable,
  isBuilt,
  children,
  ...props
}: Props) {
  return (
    <>
      {sections.map(s => (
        <GridSection key={s} stretch={s === "center"}>
          {areas.map(a =>
            s === "center" && children && a === "middle" ? (
              <div key={a} style={{ display: "flex", flex: "1 0 auto" }}>
                {children}
              </div>
            ) : (
              <Area
                key={a}
                zone={zoneName}
                section={s}
                area={a}
                widgets={zone?.[s]?.[a]?.widgets}
                align={zone?.[s]?.[a]?.align ?? "start"}
                layoutConstraint={layoutConstraint}
                sceneProperty={sceneProperty}
                pluginProperty={pluginProperty}
                pluginBaseUrl={pluginBaseUrl}
                isEditable={isEditable}
                isBuilt={isBuilt}
                {...props}
              />
            ),
          )}
        </GridSection>
      ))}
    </>
  );
}
