import { CodeInput, CodeInputProps } from "@reearth/beta/lib/reearth-ui";
import { styled } from "@reearth/services/theme";
import { FC } from "react";

import CommonField, { CommonFieldProps } from "./CommonField";

export type CodeFieldProps = CommonFieldProps &
  CodeInputProps & { height?: number; width?: number };

const CodeField: FC<CodeFieldProps> = ({
  title,
  description,
  height,
  width,
  ...props
}) => {
  return (
    <CommonField title={title} description={description}>
      <CodeInputWrapper height={height} width={width}>
        <CodeInput {...props} />
      </CodeInputWrapper>
    </CommonField>
  );
};

export default CodeField;

const CodeInputWrapper = styled("div")<{
  height?: number;
  width?: number;
}>(({ height, width }) => ({
  height: height ? `${height}px` : "auto",
  width: width ? `${width}px` : "100%"
}));
