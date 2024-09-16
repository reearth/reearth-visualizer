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
import { polygonNodeMenu } from "../NodeMenuCategory";

import { componentNode } from "./Nodes";

type PolygonProps = {
  setMenuItems: Dispatch<SetStateAction<PopupMenuItem[]>>;
} & LayerStyleProps;

const Polygon: FC<PolygonProps> = ({
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
            if (!prev?.id || !prev?.value?.polygon) return prev;
            const { [propertyKey]: _, ...updatedPolygon } = prev.value.polygon;

            return {
              ...prev,
              value: {
                ...prev.value,
                polyline: updatedPolygon
              }
            };
          });
        }
      }
    ];
  }, [setLayerStyle]);

  useEffect(() => {
    if (layerStyle?.value?.polygon) {
      const polygonProperties = layerStyle.value.polygon;
      const newContent: ReactNode[] = [];
      for (const [key] of Object.entries(polygonProperties)) {
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
      const item = polygonNodeMenu.find((item) => item.id === id);

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

    const menuWithHandlers = polygonNodeMenu
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

export default Polygon;

const Wrapper = styled("div")(({ theme }) => ({
  display: "flex",
  flexDirection: "column",
  gap: theme.spacing.small,
  alignItems: "flex-start"
}));
