import { useMemo } from "react";

import { LayerStyleProps } from "../InterfaceTab";

import { AppearanceType } from "./common/type";

type Props = {
  appearanceType: AppearanceType;
} & LayerStyleProps;

export default function useHooks({ appearanceType, setLayerStyle }: Props) {
  const optionsMenu = useMemo(() => {
    return [
      {
        id: "delete",
        title: "Delete",
        icon: "trash" as const,
        onClick: (propertyKey: string) => {
          setLayerStyle((prev) => {
            if (!prev?.id || !prev?.value[appearanceType]) return prev;
            const { [propertyKey]: _, ...updatedModel } =
              prev.value[appearanceType];

            return {
              ...prev,
              value: {
                ...prev.value,
                [appearanceType]: updatedModel
              }
            };
          });
        }
      }
    ];
  }, [appearanceType, setLayerStyle]);

  return {
    optionsMenu
  };
}
