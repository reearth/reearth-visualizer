import {
  Button,
  Icon,
  PopupPanel,
  RangeSlider,
  RangeSliderProps,
  Typography
} from "@reearth/app/lib/reearth-ui";
import { useT } from "@reearth/services/i18n/hooks";
import { styled, useTheme } from "@reearth/services/theme";
import { css } from "@reearth/services/theme/reearthTheme/common";
import { FC, useCallback, useEffect, useState } from "react";

type EditPanelProps = {
  description?: string;
  onSave?: (value: number[]) => void;
  onClose: () => void;
} & RangeSliderProps;

const EditPanel: FC<EditPanelProps> = ({
  value,
  description,
  min,
  max,
  onClose,
  onSave
}) => {
  const t = useT();
  const theme = useTheme();

  const [localValue, setLocalValue] = useState(value);

  useEffect(() => {
    if (value?.every((v) => v !== null)) {
      setLocalValue(value);
    } else setLocalValue([min, max] as number[]);
  }, [max, min, value]);

  const handleSave = useCallback(() => {
    onSave?.(localValue || []);
    onClose?.();
  }, [localValue, onClose, onSave]);

  return (
    <PopupPanel
      title={t("Zoom Level Editor")}
      onCancel={onClose}
      data-testid="zoom-edit-panel"
      actions={
        <ButtonWrapper data-testid="zoom-edit-button-wrapper">
          <Button
            extendWidth
            size="small"
            title={t("Cancel")}
            onClick={onClose}
            data-testid="zoom-edit-cancel-button"
          />
          <Button
            extendWidth
            size="small"
            title={t("Apply")}
            appearance="primary"
            onClick={handleSave}
            data-testid="zoom-edit-apply-button"
          />
        </ButtonWrapper>
      }
    >
      <Wrapper data-testid="zoom-edit-wrapper">
        <SliderWrapper data-testid="zoom-edit-slider-wrapper">
          <Icon icon="videoCamera" data-testid="zoom-edit-camera-icon" />
          <RangeSlider
            value={localValue}
            min={min}
            max={max}
            step={1}
            onChange={setLocalValue}
            data-testid="zoom-edit-range-slider"
          />
          <Icon icon="globeSimple" data-testid="zoom-edit-globe-icon" />
        </SliderWrapper>
        <Typography
          size="footnote"
          color={theme.content.weak}
          data-testid="zoom-edit-description"
        >
          {description}
        </Typography>
      </Wrapper>
    </PopupPanel>
  );
};

export default EditPanel;

const Wrapper = styled("div")(({ theme }) => ({
  display: css.display.flex,
  flexDirection: css.flexDirection.column,
  gap: theme.spacing.smallest
}));

const SliderWrapper = styled("div")(({ theme }) => ({
  display: css.display.flex,
  justifyContent: css.justifyContent.center,
  alignItems: css.alignItems.center,
  gap: theme.spacing.normal
}));

const ButtonWrapper = styled("div")(({ theme }) => ({
  display: css.display.flex,
  justifyContent: css.justifyContent.center,
  alignItems: css.alignItems.flexStart,
  gap: theme.spacing.small
}));
