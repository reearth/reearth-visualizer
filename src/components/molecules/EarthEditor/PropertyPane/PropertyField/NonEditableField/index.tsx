import React from "react";
import { useIntl } from "react-intl";

import Text from "@reearth/components/atoms/Text";
import { styled, useTheme } from "@reearth/theme";

import { FieldProps } from "../types";

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
      color={linkedDatasetFieldName ? theme.main.link : theme.layers.smallText}
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
