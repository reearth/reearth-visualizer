import React from "react";
import { styled, useTheme } from "@reearth/theme";
import { useIntl } from "react-intl";

import { FieldProps } from "../types";
import Text from "@reearth/components/atoms/Text";

export type Props = FieldProps<any> & {
  className?: string;
  linkedDatasetFieldName?: string;
};

const NonEditableField: React.FC<Props> = ({ className, linkedDatasetFieldName }) => {
  const intl = useIntl();
  const theme = useTheme();
  return (
    <Wrapper
      size="2xs"
      color={linkedDatasetFieldName ? theme.main.accent : theme.layers.smallText}
      className={className}>
      {linkedDatasetFieldName
        ? intl.formatMessage(
            {
              defaultMessage: "This field is linked to {datasetField}.",
            },
            { datasetField: linkedDatasetFieldName },
          )
        : intl.formatMessage({
            defaultMessage: "This field is not editable currently.",
          })}
    </Wrapper>
  );
};

const Wrapper = styled(Text)`
  width: 100%;
`;

export default NonEditableField;
