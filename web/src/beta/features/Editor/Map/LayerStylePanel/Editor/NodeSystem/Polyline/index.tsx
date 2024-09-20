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
import { polylineNodeMenu } from "../NodeMenuCategory";

import { componentNode } from "./nodes";

type PolylineProps = {
  setMenuItems: Dispatch<SetStateAction<PopupMenuItem[]>>;
} & LayerStyleProps;

const Polyline: FC<PolylineProps> = ({
  layerStyle,
  setMenuItems,
  setLayerStyle
}) => {
  const [dynamicNodeContent, setDynamicNodeContent] = useState<ReactNode[]>([]);
  const [clickedItems, setClickedItems] = useState<Set<string>>(new Set());

  const { optionsMenu } = useHooks({
    appearanceType: "polyline",
    layerStyle,
    setLayerStyle
  });

  useEffect(() => {
    if (layerStyle?.value?.polyline) {
      const polylineProperties = layerStyle.value.polyline;
      const newContent: ReactNode[] = [];
      for (const [key] of Object.entries(polylineProperties)) {
        const Component = componentNode[key];
        if (Component) {
          newContent.push(
            <Component
              key={key}
              layerStyle={layerStyle}
              appearanceType="polyline"
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
      const item = polylineNodeMenu.find((item) => item.id === id);

      if (item) {
        const Component = componentNode[item.id];
        if (Component) {
          setDynamicNodeContent((prevContent) => [
            ...prevContent,
            <Component
              key={item.id}
              layerStyle={layerStyle}
              appearanceType="polyline"
              setLayerStyle={setLayerStyle}
              optionsMenu={optionsMenu}
            />
          ]);
        }

        setClickedItems((prevClicked) => new Set(prevClicked).add(id));
      }
    };

    const menuWithHandlers = polylineNodeMenu
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

export default Polyline;

const Wrapper = styled("div")(({ theme }) => ({
  display: "flex",
  flexDirection: "column",
  gap: theme.spacing.small,
  alignItems: "flex-start"
}));
