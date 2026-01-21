import { Button, Typography } from "@reearth/app/lib/reearth-ui";
import CommonField, {
  CommonFieldProps
} from "@reearth/app/ui/fields/CommonField";
import { useT } from "@reearth/services/i18n/hooks";
import { styled, useTheme } from "@reearth/services/theme";
import { FC, useCallback, useEffect, useMemo, useState } from "react";

import EditPanel from "./EditPanel";

export type TimePeriodFieldProp = {
  currentTime: string;
  startTime: string;
  endTime: string;
};

export type TimePeriodFieldProps = CommonFieldProps & {
  value?: TimePeriodFieldProp;
  onChange?: (value?: TimePeriodFieldProp) => void;
};

const TimePeriodField: FC<TimePeriodFieldProps> = ({
  title,
  description,
  value,
  onChange
}) => {
  const [openEditModal, setOpenEditModal] = useState(false);
  const [timePeriodValues, setTimePeriodValues] = useState(value);

  const t = useT();
  const theme = useTheme();

  const handleEditorModalClose = useCallback(() => {
    setOpenEditModal(false);
    if (!value) {
      setTimePeriodValues?.(undefined);
    }
  }, [value]);

  const handleEditorModalOpen = useCallback(() => setOpenEditModal(true), []);

  const handleTimePeriodSettingDelete = useCallback(() => {
    if (!value) return;
    onChange?.();
  }, [value, onChange]);

  useEffect(() => {
    setTimePeriodValues(value);
  }, [value]);

  const checkAllFieldsSet = useMemo(
    () =>
      timePeriodValues?.startTime &&
      timePeriodValues?.currentTime &&
      timePeriodValues?.endTime,
    [
      timePeriodValues?.currentTime,
      timePeriodValues?.endTime,
      timePeriodValues?.startTime
    ]
  );

  return (
    <CommonField
      title={title}
      description={description}
      data-testid="timeperiodfield-commonfield"
    >
      <Wrapper data-testid="timeperiodfield-wrapper">
        <TimePeriodWrapper data-testid="timeperiodfield-periodwrapper">
          <ProgressSteps data-testid="timeperiodfield-progresssteps">
            <Circle filled data-testid="timeperiodfield-circle-start" />
            <Circle data-testid="timeperiodfield-circle-current" />
            <Circle filled data-testid="timeperiodfield-circle-end" />
          </ProgressSteps>
          <NoteIcon data-testid="timeperiodfield-noteicon">
            {!checkAllFieldsSet ? (
              <Typography
                size="body"
                color={theme.content.weak}
                data-testid="timeperiodfield-notset"
              >
                {t("Not set")}
              </Typography>
            ) : (
              <>
                <Typography size="body" data-testid="timeperiodfield-starttime">
                  {timePeriodValues?.startTime && timePeriodValues?.startTime}
                </Typography>
                <Typography
                  size="body"
                  data-testid="timeperiodfield-currenttime"
                >
                  {timePeriodValues?.currentTime &&
                    timePeriodValues?.currentTime}
                </Typography>
                <Typography size="body" data-testid="timeperiodfield-endtime">
                  {timePeriodValues?.endTime && timePeriodValues?.endTime}
                </Typography>
              </>
            )}
          </NoteIcon>
          <Button
            iconButton
            icon="trash"
            onClick={handleTimePeriodSettingDelete}
            disabled={!timePeriodValues}
            appearance="simple"
            data-testid="delete-button"
          />
        </TimePeriodWrapper>
        <ButtonWrapper data-testid="timeperiodfield-buttonwrapper">
          <Button
            appearance="secondary"
            title={t("set")}
            icon="clock"
            size="small"
            onClick={handleEditorModalOpen}
            data-testid="set-button"
          />
        </ButtonWrapper>
      </Wrapper>
      {openEditModal && (
        <EditPanel
          timePeriodValues={timePeriodValues}
          onChange={onChange}
          onClose={handleEditorModalClose}
          visible
          data-testid="timeperiodfield-editpanel"
        />
      )}
    </CommonField>
  );
};

const Wrapper = styled("div")(({ theme }) => ({
  display: "flex",
  gap: theme.spacing.smallest,
  width: "100%"
}));

const TimePeriodWrapper = styled("div")(({ theme }) => ({
  border: `1px solid ${theme.outline.weak}`,
  borderRadius: theme.radius.small,
  background: theme.bg[1],
  display: "flex",
  width: "100%",
  boxShadow: theme.shadow.input
}));

const ButtonWrapper = styled("div")(({ theme }) => ({
  display: "flex",
  gap: theme.spacing.smallest,
  height: "30px",
  whiteSpace: "nowrap"
}));

const NoteIcon = styled("div")(({ theme }) => ({
  position: "relative",
  flex: 1,
  display: "flex",
  flexDirection: "column",
  paddingTop: theme.spacing.smallest,
  gap: theme.spacing.small
}));

const ProgressSteps = styled("div")(({ theme }) => ({
  display: "flex",
  flexDirection: "column",
  alignItems: "center",
  padding: theme.spacing.small,
  gap: theme.spacing.large,
  position: "relative"
}));

const Circle = styled("div")<{ filled?: boolean }>(({ theme, filled }) => ({
  width: "8px",
  height: "8px",
  borderRadius: "50%",
  background: filled ? theme.bg[3] : "transparent",
  border: `1px solid ${theme.outline.weak}`,
  position: "relative",
  "&:not(:last-child)::after": {
    content: '""',
    width: "1px",
    height: "13px",
    background: theme.outline.weak,
    position: "absolute",
    top: "10px",
    left: "50%",
    transform: "translateX(-50%)",
    zIndex: 0
  }
}));

export default TimePeriodField;
