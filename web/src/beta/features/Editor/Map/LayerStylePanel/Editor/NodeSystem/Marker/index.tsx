import { PopupMenuItem } from "@reearth/beta/lib/reearth-ui";
import { styled } from "@reearth/services/theme";
import { SetStateAction } from "jotai";
import {
  Dispatch,
  FC,
  ReactElement,
  ReactNode,
  useEffect,
  useMemo,
  useState
} from "react";

import { LayerStyleProps } from "../../InterfaceTab";
import { markerNodeMenu } from "../NodeMenuCategory";

import { componentNode } from "./Nodes";

type MarkerProps = {
  setMenuItems: Dispatch<SetStateAction<PopupMenuItem[]>>;
} & LayerStyleProps;

const Marker: FC<MarkerProps> = ({
  layerStyle,
  setMenuItems,
  setLayerStyle
}) => {
  const [dynamicNodeContent, setDynamicNodeContent] = useState<ReactNode[]>([]);
  const [clickedItems, setClickedItems] = useState<Set<string>>(new Set());

  const optionsMenu = useMemo(() => {
    return [
      {
        id: "delete",
        title: "Delete",
        icon: "trash" as const,
        onClick: (propertyKey: string) => {
          setLayerStyle((prev) => {
            if (!prev?.id || !prev?.value?.marker) return prev;
            const { [propertyKey]: _, ...updatedMarker } = prev.value.marker;

            return {
              ...prev,
              value: {
                ...prev.value,
                marker: updatedMarker
              }
            };
          });
        }
      }
    ];
  }, [setLayerStyle]);

  useEffect(() => {
    if (layerStyle?.value?.marker) {
      const markerProperties = layerStyle.value.marker;
      const newContent: ReactNode[] = [];
      for (const [key] of Object.entries(markerProperties)) {
        const Component = componentNode[key];
        if (Component) {
          newContent.push(
            <Component
              key={key}
              layerStyle={layerStyle}
              optionsMenu={optionsMenu.map((item) => ({
                ...item,
                onClick: () => item.onClick(key)
              }))}
              setLayerStyle={setLayerStyle}
            />
          );
        }
      }

      setDynamicNodeContent(newContent);
    } else {
      setDynamicNodeContent([]);
    }
  }, [layerStyle, optionsMenu, setLayerStyle]);

  useEffect(() => {
    const renderedKeys = new Set(
      dynamicNodeContent.map((content) => (content as ReactElement).key)
    );

    const handleMenuClick = (id: string) => {
      const item = markerNodeMenu.find((item) => item.id === id);

      if (item) {
        const Component = componentNode[item.id];
        if (Component) {
          setDynamicNodeContent((prevContent) => [
            ...prevContent,
            <Component
              key={item.id}
              layerStyle={layerStyle}
              setLayerStyle={setLayerStyle}
              optionsMenu={optionsMenu}
            />
          ]);
        }

        setClickedItems((prevClicked) => new Set(prevClicked).add(id));
      }
    };

    const menuWithHandlers = markerNodeMenu
      .filter((item) => !renderedKeys.has(item.id))
      .map((item) => ({
        ...item,
        onClick: () => handleMenuClick(item.id)
      }));

    setMenuItems(menuWithHandlers);
  }, [
    clickedItems,
    dynamicNodeContent,
    layerStyle,
    optionsMenu,
    setLayerStyle,
    setMenuItems
  ]);

  return <Wrapper>{dynamicNodeContent}</Wrapper>;
};

export default Marker;

const Wrapper = styled("div")(({ theme }) => ({
  display: "flex",
  flexDirection: "column",
  gap: theme.spacing.small,
  alignItems: "flex-start"
}));
