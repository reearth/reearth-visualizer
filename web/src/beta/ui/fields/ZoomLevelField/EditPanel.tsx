import {
  Button,
  Icon,
  PopupPanel,
  RangeSlider,
  RangeSliderProps,
  Typography
} from "@reearth/beta/lib/reearth-ui";
import { useT } from "@reearth/services/i18n";
import { styled, useTheme } from "@reearth/services/theme";
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
    if (value) {
      setLocalValue(value);
    }
  }, [value]);

  const handleSave = useCallback(() => {
    onSave?.(localValue || []);
    onClose?.();
  }, [localValue, onClose, onSave]);

  return (
    <PopupPanel
      title={t("Zoom Level Editor")}
      onCancel={onClose}
      actions={
        <ButtonWrapper>
          <Button
            extendWidth
            size="small"
            title={t("Cancel")}
            onClick={onClose}
          />
          <Button
            extendWidth
            size="small"
            title={t("Apply")}
            appearance="primary"
            onClick={handleSave}
          />
        </ButtonWrapper>
      }
    >
      <Wrapper>
        <Icon icon="videoCamera" />
        <RangeSlider
          value={localValue}
          min={min}
          max={max}
          step={1}
          onChange={setLocalValue}
        />
        <Icon icon="globeSimple" />
      </Wrapper>
      <Typography size="footnote" color={theme.content.weak}>
        {description}
      </Typography>
    </PopupPanel>
  );
};

export default EditPanel;

const Wrapper = styled("div")(({ theme }) => ({
  display: "flex",
  justifyContent: "center",
  alignItems: "flex-start",
  gap: theme.spacing.normal
}));

const ButtonWrapper = styled("div")(({ theme }) => ({
  display: "flex",
  justifyContent: "center",
  alignItems: "flex-start",
  gap: theme.spacing.small
}));
