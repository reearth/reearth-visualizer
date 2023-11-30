import { ReactNode } from "react";
import { GridSection } from "react-align";

import { WidgetAreaState } from "@reearth/classic/components/organisms/EarthEditor/PropertyPane/hooks";

import { Viewport } from "../hooks";
import type { CommonProps as PluginCommonProps } from "../Plugin";

import Area from "./Area";
import { WAS_SECTIONS, WAS_AREAS } from "./constants";
import type { WidgetZone, WidgetLayoutConstraint } from "./hooks";

export type Props = {
  children?: ReactNode;
  isMobileZone?: boolean;
  selectedWidgetArea?: WidgetAreaState;
  zone?: WidgetZone;
  zoneName: "inner" | "outer";
  layoutConstraint?: { [w: string]: WidgetLayoutConstraint };
  isEditable?: boolean;
  isBuilt?: boolean;
  sceneProperty?: any;
  viewport?: Viewport;
  overrideSceneProperty?: (pluginId: string, property: any) => void;
  onWidgetAlignAreaSelect?: (widgetAreaState?: WidgetAreaState) => void;
} & PluginCommonProps;

export default function Zone({
  isMobileZone,
  selectedWidgetArea,
  zone,
  zoneName,
  layoutConstraint,
  sceneProperty,
  pluginProperty,
  pluginBaseUrl,
  isEditable,
  isBuilt,
  children,
  onWidgetAlignAreaSelect,
  ...props
}: Props) {
  return (
    <>
      {WAS_SECTIONS.map(s => (
        <GridSection key={s} stretch={s === "center"}>
          {WAS_AREAS.map(a =>
            s === "center" && children && a === "middle" ? (
              <div key={a} style={{ display: "flex", flex: "1 0 auto" }}>
                {children}
              </div>
            ) : (
              <Area
                key={a}
                isMobileZone={isMobileZone}
                selectedWidgetArea={selectedWidgetArea}
                zone={zoneName}
                section={s}
                area={a}
                widgets={zone?.[s]?.[a]?.widgets}
                align={zone?.[s]?.[a]?.align ?? "start"}
                padding={zone?.[s]?.[a]?.padding ?? { top: 6, bottom: 6, left: 6, right: 6 }}
                backgroundColor={zone?.[s]?.[a]?.background ?? "unset"}
                gap={zone?.[s]?.[a]?.gap ?? 6}
                centered={zone?.[s]?.[a]?.centered ?? false}
                layoutConstraint={layoutConstraint}
                sceneProperty={sceneProperty}
                pluginProperty={pluginProperty}
                pluginBaseUrl={pluginBaseUrl}
                isEditable={isEditable}
                isBuilt={isBuilt}
                onWidgetAlignAreaSelect={onWidgetAlignAreaSelect}
                {...props}
              />
            ),
          )}
        </GridSection>
      ))}
    </>
  );
}
