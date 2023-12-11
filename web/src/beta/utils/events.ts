import { MouseEvent } from "react";

export const stopClickPropagation = (e?: MouseEvent<Element>) => {
  e?.stopPropagation();
};
