import { ReactNode, CSSProperties, AriaRole, AriaAttributes } from "react";

import { ariaProps } from "@reearth/util/aria";

export type Props = {
  className?: string;
  onClick?: () => void;
  children?: ReactNode;
  testId?: string;
  role?: AriaRole;
} & FlexOptions &
  AriaAttributes;

export type FlexOptions = {
  align?: CSSProperties["alignItems"];
  justify?: CSSProperties["justifyContent"];
  wrap?: CSSProperties["flexWrap"];
  direction?: CSSProperties["flexDirection"];
  basis?: CSSProperties["flexBasis"];
  grow?: CSSProperties["flexGrow"];
  shrink?: CSSProperties["flexShrink"];
  flex?: CSSProperties["flex"];
  gap?: CSSProperties["gap"];
};

const Flex: React.FC<Props> = ({
  className,
  onClick,
  children,
  testId,
  align,
  justify,
  wrap,
  direction,
  basis,
  grow,
  shrink,
  flex,
  gap,
  role,
  ...props
}) => {
  const aria = ariaProps(props);

  return (
    <div
      className={className}
      role={role}
      style={{
        display: "flex",
        flexDirection: direction,
        alignItems: align,
        justifyContent: justify,
        flexWrap: wrap,
        flexBasis: basis,
        flexGrow: grow,
        flexShrink: shrink,
        flex,
        gap, // TODO: Safari doesn't support this property and please develop polyfill
      }}
      onClick={onClick}
      data-testid={testId}
      {...aria}>
      {children}
    </div>
  );
};

export default Flex;
