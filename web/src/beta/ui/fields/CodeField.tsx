import { FC } from "react";

import { CodeInput, CodeInputProps } from "@reearth/beta/lib/reearth-ui";
import { styled } from "@reearth/services/theme";

import CommonField, { CommonFieldProps } from "./CommonField";

export type CodeFieldProps = CommonFieldProps &
  CodeInputProps & { height?: number; width?: number };

const CodeField: FC<CodeFieldProps> = ({ commonTitle, description, height, width, ...props }) => {
  return (
    <CommonField commonTitle={commonTitle} description={description}>
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
  width: width ? `${width}px` : "100%",
}));
