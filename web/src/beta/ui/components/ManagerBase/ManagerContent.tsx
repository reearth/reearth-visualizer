import { styled } from "@reearth/services/theme";

export const ManagerContent = styled.div(({ theme }) => ({
  display: "flex",
  flexDirection: "column",
  flex: 1,
  height: 0,
  width: "100%",
  ["* ::-webkit-scrollbar"]: {
    width: "8px"
  },
  ["* ::-webkit-scrollbar-track"]: {
    background: theme.relative.darker,
    borderRadius: "10px"
  },
  ["* ::-webkit-scrollbar-thumb"]: {
    background: theme.relative.light,
    borderRadius: "4px"
  },
  ["* ::-webkit-scrollbar-thumb:hover"]: {
    background: theme.relative.lighter
  },
  ["@media (max-width: 630px)"]: {
    width: "630px",
    overflowX: "auto"
  }
}));
