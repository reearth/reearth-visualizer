import { styled } from "@reearth/services/theme";

export const ManagerContent = styled.div(({ theme }) => ({
  display: "flex",
  flexDirection: "column",
  flex: 1,
  height: 0,
  width: "100%",
  ["* ::-webkit-scrollbar"]: {
    width: theme.scrollBar.width
  },
  ["* ::-webkit-scrollbar-track"]: {
    background: theme.scrollBar.scrollbarTrack.background,
    borderRadius: theme.scrollBar.scrollbarTrack.radius
  },
  ["* ::-webkit-scrollbar-thumb"]: {
    background: theme.scrollBar.scrollbarThumb.background,
    borderRadius: theme.scrollBar.scrollbarThumb.radius
  },
  ["* ::-webkit-scrollbar-thumb:hover"]: {
    background: theme.scrollBar.scrollbarThumbHover.background
  },
  ["@media (max-width: 630px)"]: {
    width: "630px",
    overflowX: "auto"
  }
}));
