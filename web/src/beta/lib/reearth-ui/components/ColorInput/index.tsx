import { FC } from "react";
import { RgbaColorPicker } from "react-colorful";

import { Popup } from "@reearth/beta/lib/reearth-ui/components/Popup";
import { TextInput } from "@reearth/beta/lib/reearth-ui/components/TextInput";
import { css, styled } from "@reearth/services/theme";

import useHooks from "./hooks";

export type ColorInputProps = {
  value?: string;
  size?: "normal" | "small";
  disabled?: boolean;
  onChange?: (text: string) => void;
};

export type RGBA = {
  r: number;
  g: number;
  b: number;
  a: number;
};

export const ColorInput: FC<ColorInputProps> = ({ value, onChange }) => {
  const { open, rgba, colorValue, colorState, handleChange, handleOpen, handleBlur } = useHooks({
    value,
    onChange,
  });

  return (
    <Wrapper>
      <Popup
        open={open}
        placement="bottom"
        offset={4}
        trigger={
          <InpuWrapper>
            <Swatch color={colorState} onClick={handleOpen} />
            <TextInput
              value={colorValue}
              placeholder="#RRGGBBAA"
              onChange={handleChange}
              onBlur={handleBlur}
              extendWidth
            />
          </InpuWrapper>
        }>
        <ColorPickerWrapper>
          <ColorPicker color={rgba} onChange={() => {}} />
          <RgbaInputWrapper />
        </ColorPickerWrapper>
      </Popup>
    </Wrapper>
  );
};

const Wrapper = styled("div")(({ theme }) => ({
  display: "flex",
  gap: theme.spacing.smallest,
  alignItems: "flex-start",
  width: "246px",
}));

const InpuWrapper = styled("div")(({ theme }) => ({
  display: "flex",
  gap: theme.spacing.smallest,
  alignItems: "flex-start",
  width: "246px",
}));

const Swatch = styled("div")<{ color?: string }>(({ theme, color }) => ({
  height: "26px",
  width: "26px",
  flexShrink: 0,
  border: `1px solid ${theme.outline.weak}`,
  borderRadius: theme.radius.small,
  background: color ? color : theme.bg[1],
  boxShadow: theme.shadow.input,
}));

const ColorPickerStyles = css`
  .react-colorful__saturation-pointer {
    width: 12px;
    height: 12px;
    border-width: 2px;
  }

  .react-colorful__hue-pointer,
  .react-colorful__alpha-pointer {
    width: 1px;
    height: 10px;
    border: 1px solid white;
    border-radius: 2px;
  }

  .react-colorful__saturation {
    margin-bottom: 10px;
    border-radius: 3px;
    width: 270px;
    border-bottom: none;
  }

  .react-colorful__hue,
  .react-colorful__alpha {
    height: 10px;
    width: 270px;
    margin: 0 5px 10px 3px;
    border-radius: 3px;
  }
`;

const ColorPicker = styled(RgbaColorPicker)`
  ${ColorPickerStyles}
`;

const ColorPickerWrapper = styled("div")(({ theme }) => ({
  display: "flex",
  flexDirection: "column",
  alignItems: "flex-start",
  gap: theme.spacing.normal,
}));

const RgbaInputWrapper = styled.div`
  display: flex;
  height: 56px;
  flex-direction: column;
  align-items: flex-start;
  justify-content: flex-start;
  gap: 8px;
`;
