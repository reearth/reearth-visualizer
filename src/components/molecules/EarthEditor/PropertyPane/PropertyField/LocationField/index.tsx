import React from "react";
import { useIntl } from "react-intl";

import { styled } from "@reearth/theme";

import NumberField from "../NumberField";
import { FieldProps } from "../types";

export type Location = {
  lat: number;
  lng: number;
  height?: number;
};

export type Props = FieldProps<Location> & {
  className?: string;
  isAltitudeEnabled?: boolean;
};

export const LngLatMinMax = {
  lngMin: -180,
  lngMax: 180,
  latMin: -90,
  latMax: 90,
};

const LocationField: React.FC<Props> = ({
  className,
  value,
  onChange,
  isAltitudeEnabled,
  linked,
  overridden,
  disabled,
}) => {
  const intl = useIntl();

  return (
    <Wrapper className={className}>
      <NumberField
        name={intl.formatMessage({ defaultMessage: "Latitude" })}
        value={value?.lat}
        onChange={v =>
          onChange && v !== null && !isNaN(v) && onChange({ lat: v, lng: value?.lng ?? 0 })
        }
        linked={linked}
        overridden={overridden}
        disabled={disabled}
        min={LngLatMinMax["latMin"]}
        max={LngLatMinMax["latMax"]}
      />
      <NumberField
        name={intl.formatMessage({ defaultMessage: "Longitude" })}
        value={value?.lng}
        onChange={v =>
          onChange && v !== null && !isNaN(v) && onChange({ lat: value?.lat ?? 0, lng: v })
        }
        linked={linked}
        overridden={overridden}
        disabled={disabled}
        min={LngLatMinMax["lngMin"]}
        max={LngLatMinMax["lngMax"]}
      />
      {isAltitudeEnabled && (
        <NumberField
          name={intl.formatMessage({ defaultMessage: "Altitude" })}
          value={value?.height}
          linked={linked}
          overridden={overridden}
          disabled={disabled}
        />
      )}
    </Wrapper>
  );
};

const Wrapper = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  width: 100%;

  > * {
    margin-right: 10px;

    :last-child {
      margin-right: 0;
    }
  }
`;

export default LocationField;
