import { Typography } from "@reearth/beta/lib/reearth-ui";
import { FC } from "react";


export type Props = {
  path?: string;
};

const AccountPage: FC<Props> = () => (
  <Typography size="h4">Account page</Typography>
);

export default AccountPage;
