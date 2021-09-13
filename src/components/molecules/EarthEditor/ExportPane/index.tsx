import React, { useState, useCallback } from "react";
import { useIntl } from "react-intl";

import Button from "@reearth/components/atoms/Button";
import SelectBox, { Props as SelectBoxProps } from "@reearth/components/atoms/SelectBox";
import Text from "@reearth/components/atoms/Text";
import { styled } from "@reearth/theme";

export type Format = "kml" | "czml" | "geojson" | "shape";

const defaultFormat: Format = "kml";

type Props = {
  className?: string;
  show?: boolean;
  onExport: (format: Format) => void;
};

const ExportPane: React.FC<Props> = ({ className, onExport }) => {
  const intl = useIntl();
  const [format, setFormat] = useState<Format>(defaultFormat);

  const handleExport = useCallback(() => onExport(format), [format, onExport]);

  return (
    <Wrapper className={className}>
      <SelectWrapper>
        <Label size="s">{intl.formatMessage({ defaultMessage: "Export type" })}</Label>
        <StyledSelectField
          selected={format}
          items={[
            { key: "kml", label: "KML" },
            { key: "czml", label: "CZML" },
            { key: "geojson", label: "GeoJSON" },
            { key: "shape", label: "Shapefile" },
          ]}
          onChange={f => setFormat(f ?? defaultFormat)}
        />
      </SelectWrapper>
      <StyledButton
        buttonType="primary"
        text={intl.formatMessage({ defaultMessage: "Export" })}
        onClick={handleExport}
      />
    </Wrapper>
  );
};

const Wrapper = styled.div`
  background: ${props => props.theme.properties};
  margin: 14px 0;
`;

const SelectWrapper = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-around;
  margin: 10px auto;
`;

const StyledSelectField = styled((props: SelectBoxProps<Format>) => (
  <SelectBox<Format> {...props} />
))`
  max-width: 190px;
  margin: 5px 10px;
  flex: 1;
`;

const StyledButton = styled(Button)`
  float: right;
`;

const Label = styled(Text)`
  margin-left: 10px;
`;

export default ExportPane;
