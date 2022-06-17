import { ReactNode, CSSProperties } from "react";

export type Props = {
  className?: string;
  onClick?: () => void;
  children?: ReactNode;
  testId?: string;
} & FlexOptions;

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
}) => {
  const styles = {
    display: "flex",
    flexDirection: direction,
    alignItems: align,
    justifyContent: justify,
    flexWrap: wrap,
    flexBasis: basis,
    flexGrow: grow,
    flexShrink: shrink,
    flex: flex,
    gap: gap, // TODO: Safari doesn't support this property and please develop polyfill
  };
  return (
    <div className={className} style={styles} onClick={onClick} data-testid={testId}>
      {children}
    </div>
  );
};

export default Flex;
