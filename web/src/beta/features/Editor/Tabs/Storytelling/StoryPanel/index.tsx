import { FC } from "react";

import { styled } from "@reearth/services/theme";

type Props = {};

export const StoryPanel: FC<Props> = () => {
  return <Root>StoryPanel</Root>;
};

const Root = styled.div`
  box-sizing: border-box;
  width: 462px;
  padding: 10px 24px;
  background-color: ${({ theme }) => theme.colors.scrollBar.bg.light};
`;
