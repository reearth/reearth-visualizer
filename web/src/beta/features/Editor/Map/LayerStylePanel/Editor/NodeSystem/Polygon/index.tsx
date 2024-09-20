import { PopupMenuItem } from "@reearth/beta/lib/reearth-ui";
import { styled } from "@reearth/services/theme";
import { SetStateAction } from "jotai";
import {
  Dispatch,
  FC,
  ReactElement,
  ReactNode,
  useEffect,
  useState
} from "react";

import { LayerStyleProps } from "../../InterfaceTab";
import useHooks from "../hook";
import { polygonNodeMenu } from "../NodeMenuCategory";

import { componentNode } from "./nodes";

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

  const { optionsMenu } = useHooks({
    appearanceType: "polygon",
    layerStyle,
    setLayerStyle
  });

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
              appearanceType="polygon"
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
              appearanceType="polygon"
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
