import { CSSProperties } from "react";

import { styled } from "@reearth/theme";
import { MetricsSizes, metricsSizes } from "@reearth/theme/metrics";

export type Props = {
  className?: string;
  children: React.ReactNode;
  onClick?: () => void;
} & BoxProps;

type Metrics<T> = {
  m?: T;
  mt?: T;
  mb?: T;
  mr?: T;
  ml?: T;
  mv?: T;
  mh?: T;
  p?: T;
  pt?: T;
  pb?: T;
  pr?: T;
  pl?: T;
  pv?: T;
  ph?: T;
};

type MetricsProps = Metrics<MetricsSizes>;

type BorderProps = {
  border?: string;
  borderRadius?: number;
  borderWidth?: number;
  borderColor?: number;
  borderStyle?: CSSProperties["borderStyle"];
};

type OtherCSSProperties = {
  bg?: string;
  width?: CSSProperties["width"];
};

type BoxProps = MetricsProps & BorderProps & OtherCSSProperties;

const Box: React.FC<Props> = props => {
  const { className, children, onClick, ...styleProps } = props;
  return (
    <Wrapper className={className} onClick={onClick} {...styleProps}>
      {children}
    </Wrapper>
  );
};

const Wrapper = styled.div<BoxProps>`
  background-color: ${props => props.bg};
  width: ${props => props.width};
  margin: ${props => (props.m && props.m in metricsSizes ? `${metricsSizes[props.m]}px}` : "")};
  margin: ${props => (props.mv && props.mv in metricsSizes ? `${metricsSizes[props.mv]}px 0` : "")};
  margin: ${props => (props.mh && props.mh in metricsSizes ? `0 ${metricsSizes[props.mh]}px` : "")};
  margin-top: ${props =>
    props.mt && props.mt in metricsSizes ? `${metricsSizes[props.mt]}px` : ""};
  margin-bottom: ${props =>
    props.mb && props.mb in metricsSizes ? `${metricsSizes[props.mb]}px` : ""};
  margin-right: ${props =>
    props.mr && props.mr in metricsSizes ? `${metricsSizes[props.mr]}px` : ""};
  margin-left: ${props =>
    props.ml && props.ml in metricsSizes ? `${metricsSizes[props.ml]}px` : ""};
  padding: ${props => (props.p && props.p in metricsSizes ? `${metricsSizes[props.p]}px` : "")};
  padding: ${props =>
    props.pv && props.pv in metricsSizes ? `${metricsSizes[props.pv]}px 0` : ""};
  padding: ${props =>
    props.ph && props.ph in metricsSizes ? `0 ${metricsSizes[props.ph]}px` : ""};
  padding-top: ${props =>
    props.pt && props.pt in metricsSizes ? `${metricsSizes[props.pt]}px` : ""};
  padding-bottom: ${props =>
    props.pb && props.pb in metricsSizes ? `${metricsSizes[props.pb]}px` : ""};
  padding-right: ${props =>
    props.pr && props.pr in metricsSizes ? `${metricsSizes[props.pr]}px` : ""};
  padding-left: ${props =>
    props.pl && props.pl in metricsSizes ? `${metricsSizes[props.pl]}px` : ""};
  border: ${props => props.border};
  border-radius: ${props => (props.border ? `${props.borderRadius}px` : "")};
  border-width: ${props => (props.borderWidth ? `${props.borderWidth}px` : "")};
  border-color: ${props => (props.borderColor ? `${props.borderColor}` : "")};
  border-style: ${props => (props.borderStyle ? `${props.borderStyle}` : "")};
`;

export default Box;
