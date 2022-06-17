import { action } from "@storybook/addon-actions";
import { Meta } from "@storybook/react";

import Header, { Props } from ".";

const defaultProps: Props = {
  user: {
    name: "Shinnosuke Komiya",
  },
  currentTeam: {
    id: "1",
    name: "Darwin Education",
  },
  teams: [
    {
      id: "A",
      name: "Team A",
    },
    {
      id: "B",
      name: "Team B",
    },
  ],
  onBack: () => action("onBack"),
  onForward: () => action("onForward"),
  onSignOut: () => action("signOut"),
};

export default {
  title: "molecules/Common/Header",
  component: Header,
} as Meta;

export const Default = () => <Header {...defaultProps} />;
export const WithNoTeams = () => <Header {...{ ...defaultProps, teams: [] }} />;
export const NoLogin = () => (
  <Header {...{ ...defaultProps, onSignOut: undefined, user: undefined }} />
);
