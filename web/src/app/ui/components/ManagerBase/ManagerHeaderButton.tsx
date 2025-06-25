import { Button, ButtonProps } from "@reearth/app/lib/reearth-ui";
import { FC } from "react";

export type ManagerHeaderButtonProps = ButtonProps & {
  managerSize?: "medium" | "large";
};

export const ManagerHeaderButton: FC<ManagerHeaderButtonProps> = ({
  managerSize = "medium",
  ...props
}) => {
  return (
    <Button size={managerSize === "medium" ? "small" : "normal"} {...props} />
  );
};
