import { PopupMenuItem } from "@reearth/beta/lib/reearth-ui";
import { styled } from "@reearth/services/theme";
import { SetStateAction } from "jotai";
import {
  Dispatch,
  FC,
  isValidElement,
  ReactNode,
  useEffect,
  useState
} from "react";

import { polylineNodeMenu } from "../NodeMenuCategory";

import ShowNode from "./Show";
import StylesNode from "./Styles";

type PolylineProps = {
  setCurrentMenu: Dispatch<SetStateAction<PopupMenuItem[]>>;
};

const Polyline: FC<PolylineProps> = ({ setCurrentMenu }) => {
  const [dynamicContent, setDynamicContent] = useState<ReactNode[]>([]);
  const [clickedItems, setClickedItems] = useState<Set<string>>(new Set());

  const handleMenuClick = (id: string) => {
    setClickedItems((prevClickedItems) => {
      const newClickedItems = new Set(prevClickedItems);
      if (newClickedItems.has(id)) {
        setDynamicContent((prevContent) =>
          prevContent.filter(
            (content) => isValidElement(content) && content.key !== id
          )
        );
        newClickedItems.delete(id);
      } else {
        let newContent: ReactNode = null;
        switch (id) {
          case "show":
            newContent = <ShowNode key={id} />;
            break;
          case "style":
            newContent = <StylesNode key={id} />;
            break;
          default:
            newContent = null;
        }

        if (newContent) {
          setDynamicContent((prevContent) => [...prevContent, newContent]);
          newClickedItems.add(id);
        }
      }

      return newClickedItems;
    });
  };

  useEffect(() => {
    const menuWithHandlers = polylineNodeMenu
      .filter((item) => !clickedItems.has(item.id))
      .map((item) => ({
        ...item,
        onClick: () => handleMenuClick(item.id)
      }));

    setCurrentMenu(menuWithHandlers);
  }, [setCurrentMenu, clickedItems]);

  return <Wrapper>{dynamicContent}</Wrapper>;
};

export default Polyline;

const Wrapper = styled("div")(({ theme }) => ({
  display: "flex",
  flexDirection: "column",
  gap: theme.spacing.normal,
  alignItems: "flex-start"
}));
