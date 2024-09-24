import { PopupMenuItem } from "@reearth/beta/lib/reearth-ui";
import { SetStateAction } from "jotai";
import {
  createElement,
  Dispatch,
  FC,
  ReactElement,
  ReactNode,
  useCallback,
  useEffect,
  useMemo,
  useState
} from "react";

import { LayerStyleProps } from "../InterfaceTab";

import { AppearanceType } from "./common/type";

type Props = {
  appearanceType: AppearanceType;
  nodeCategoryMenu: PopupMenuItem[];
  componentNode?: Record<
    string,
    FC<LayerStyleProps & { appearanceType: AppearanceType }>
  >;

  setMenuItems: Dispatch<SetStateAction<PopupMenuItem[]>>;
} & LayerStyleProps;

export default function useDynamicNodes({
  appearanceType,
  layerStyle,
  nodeCategoryMenu,
  componentNode,
  setMenuItems,
  setLayerStyle
}: Props) {
  const [dynamicNodeContent, setDynamicNodeContent] = useState<ReactNode[]>([]);


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

  useEffect(() => {
    const properties = layerStyle?.value?.[appearanceType];

    if (properties) {
      const nodeContent: ReactNode[] = [];

      for (const key of Object.keys(properties)) {
        const Component = componentNode?.[key];
        if (Component) {
          const updatedOptionsMenu = optionsMenu.map((item) => ({
            ...item,
            onClick: () => item.onClick(key)
          }));

          nodeContent.push(
            createElement(Component, {
              key,
              layerStyle,
              appearanceType,
              optionsMenu: updatedOptionsMenu,
              setLayerStyle
            })
          );
        }
      }

      setDynamicNodeContent(nodeContent);
    } else {
      setDynamicNodeContent([]);
    }
  }, [
    layerStyle,
    appearanceType,
    componentNode,
    setLayerStyle,
    setDynamicNodeContent,
    optionsMenu
  ]);

  const handleMenuClick = useCallback(
    (id: string) => {
      const item = nodeCategoryMenu.find((item) => item.id === id);

      if (item && componentNode?.[item.id]) {
        const Component = componentNode[item.id];
        setDynamicNodeContent((prevContent) => [
          ...prevContent,
          createElement(Component, {
            key: item.id,
            layerStyle,
            appearanceType,
            optionsMenu,
            setLayerStyle
          })
        ]);
      }
    },
    [
      appearanceType,
      componentNode,
      layerStyle,
      nodeCategoryMenu,
      optionsMenu,
      setDynamicNodeContent,
      setLayerStyle
    ]
  );

  useEffect(() => {
    const renderedKeys = new Set(
      dynamicNodeContent.map((content) => (content as ReactElement).key)
    );

    const menuItems = nodeCategoryMenu
      .filter((item) => !renderedKeys.has(item.id))
      .map((item) => ({
        ...item,
        onClick: () => handleMenuClick(item.id)
      }));

    setMenuItems(menuItems);
  }, [dynamicNodeContent, handleMenuClick, layerStyle, nodeCategoryMenu, optionsMenu, setLayerStyle, setMenuItems]);

  return {
    dynamicNodeContent
  };
}
