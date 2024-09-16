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
import { modelNodeMenu } from "../NodeMenuCategory";

import { componentNode } from "./Nodes";

type ThreedModelProps = {
  setMenuItems: Dispatch<SetStateAction<PopupMenuItem[]>>;
} & LayerStyleProps;

const ThreedModel: FC<ThreedModelProps> = ({
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
            if (!prev?.id || !prev?.value?.model) return prev;
            const { [propertyKey]: _, ...updatedModel } = prev.value.model;

            return {
              ...prev,
              value: {
                ...prev.value,
                model: updatedModel
              }
            };
          });
        }
      }
    ];
  }, [setLayerStyle]);

  useEffect(() => {
    if (layerStyle?.value?.model) {
      const modelProperties = layerStyle.value.model;
      const newContent: ReactNode[] = [];
      for (const [key] of Object.entries(modelProperties)) {
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
      const item = modelNodeMenu.find((item) => item.id === id);

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

    const menuWithHandlers = modelNodeMenu
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

export default ThreedModel;

const Wrapper = styled("div")(({ theme }) => ({
  display: "flex",
  flexDirection: "column",
  gap: theme.spacing.small,
  alignItems: "flex-start"
}));
