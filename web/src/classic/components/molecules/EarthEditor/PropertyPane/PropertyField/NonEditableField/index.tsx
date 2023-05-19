import React from "react";

import { useT } from "@reearth/beta/services/i18n";
import { styled, useTheme } from "@reearth/beta/services/theme";
import Text from "@reearth/classic/components/atoms/Text";

import { FieldProps } from "../types";

export type Props = FieldProps<any> & {
  className?: string;
  linkedDatasetFieldName?: string;
};

const NonEditableField: React.FC<Props> = ({ className, linkedDatasetFieldName }) => {
  const t = useT();
  const theme = useTheme();
  return (
    <Wrapper
      size="2xs"
      color={linkedDatasetFieldName ? theme.main.link : theme.layers.smallText}
      className={className}>
      {linkedDatasetFieldName
        ? t("This field is linked to {{datasetField}}.", { datasetField: linkedDatasetFieldName })
        : t("This field is not editable currently.")}
    </Wrapper>
  );
};

const Wrapper = styled(Text)`
  width: 100%;
`;

export default NonEditableField;
