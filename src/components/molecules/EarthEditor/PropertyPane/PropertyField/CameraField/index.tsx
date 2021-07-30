import React from "react";
import { styled, css, useTheme } from "@reearth/theme";
import useHooks from "./hooks";
import { useIntl } from "react-intl";

import Icon from "@reearth/components/atoms/Icon";
import Button from "@reearth/components/atoms/Button";
import { Camera } from "@reearth/util/value";
import { FieldProps } from "../types";
import Text from "@reearth/components/atoms/Text";

export type Props = FieldProps<Camera> & {
  onDelete?: () => void;
  isCapturing?: boolean;
  onIsCapturingChange?: (isCapturing: boolean) => void;
  camera?: Camera;
  onCameraChange?: (camera: Partial<Camera>) => void;
  onlyPose?: boolean;
};

const CameraField: React.FC<Props> = ({
  value,
  onChange,
  onDelete,
  disabled,
  isCapturing,
  onIsCapturingChange,
  camera: cameraState,
  onCameraChange,
  onlyPose,
}) => {
  const intl = useIntl();

  const {
    wrapperRef,
    cameraWrapperRef,
    popper,
    camera,
    open,
    openPopup,
    startCapture,
    handleLatChange,
    handleLngChange,
    handleAltitudeChange,
    handleHeadingChange,
    handlePitchChange,
    handleRollChange,
    handleClickCancelButton,
    handleClickSubmitButton,
    jump,
  } = useHooks({
    cameraValue: value,
    onSubmit: onChange,
    isCapturing,
    onIsCapturingChange,
    cameraState,
    onCameraChange,
    disabled,
    onlyPose,
  });

  const lat = camera?.lat && Math.round(camera?.lat * 1000) / 1000;
  const lng = camera?.lng && Math.round(camera?.lng * 1000) / 1000;
  const altitude = camera?.altitude && Math.round(camera?.altitude);
  const heading = camera?.heading && Math.round(camera?.heading * 1000) / 1000;
  const pitch = camera?.pitch && Math.round(camera?.pitch * 1000) / 1000;
  const roll = camera?.roll && Math.round(camera?.roll * 1000) / 1000;
  const theme = useTheme();
  return (
    <Wrapper ref={wrapperRef} onClick={value ? undefined : startCapture} data-camera-popup>
      <CameraWrapper ref={cameraWrapperRef}>
        <StyledText
          size="xs"
          color={value ? theme.properties.contentsFloatText : theme.properties.contentsText}
          onClick={value ? openPopup : undefined}>
          {value
            ? onlyPose
              ? intl.formatMessage({ defaultMessage: "Pose Set" })
              : intl.formatMessage({ defaultMessage: "Position Set" })
            : intl.formatMessage({ defaultMessage: "Not Set" })}
        </StyledText>
        {value ? (
          <StyledIcon icon="bin" size={16} onClick={onDelete} />
        ) : (
          <StyledIcon icon="capture" size={16} onClick={value ? openPopup : undefined} />
        )}
      </CameraWrapper>
      <Popup ref={popper.ref} open={open} style={popper.styles} {...popper.attributes}>
        {!onlyPose && (
          <FormGroup>
            <FormIcon icon="marker" size={16} />
            <FormFieldGroup>
              <FormFieldRow>
                <FormWrapper>
                  <Input type="number" value={lat} onChange={handleLatChange} />
                  <FloatText size="2xs" color={theme.properties.contentsFloatText}>
                    {intl.formatMessage({ defaultMessage: "Latitude" })}
                  </FloatText>
                </FormWrapper>
                <FormWrapper>
                  <Input type="number" value={lng} onChange={handleLngChange} />
                  <FloatText size="2xs" color={theme.properties.contentsFloatText}>
                    {intl.formatMessage({ defaultMessage: "Longtitude" })}
                  </FloatText>
                </FormWrapper>
                <FormWrapper>
                  <Input
                    type="number"
                    value={altitude}
                    onChange={handleAltitudeChange}
                    step={10 ** 6}
                  />
                  <FloatText size="2xs" color={theme.properties.contentsFloatText}>
                    {intl.formatMessage({ defaultMessage: "Altitude" })}
                  </FloatText>
                </FormWrapper>
              </FormFieldRow>
            </FormFieldGroup>
          </FormGroup>
        )}
        <FormGroup>
          <FormIcon icon="camera" size={16} />
          <FormFieldGroup>
            <FormFieldRow>
              <FormWrapper>
                <Input type="number" value={heading} onChange={handleHeadingChange} step="0.01" />
                <FloatText size="2xs" color={theme.properties.contentsFloatText}>
                  {intl.formatMessage({ defaultMessage: "Heading" })}
                </FloatText>
              </FormWrapper>
              <FormWrapper>
                <Input type="number" value={pitch} onChange={handlePitchChange} step="0.01" />
                <FloatText size="2xs" color={theme.properties.contentsFloatText}>
                  {intl.formatMessage({ defaultMessage: "Pitch" })}
                </FloatText>
              </FormWrapper>
              <FormWrapper>
                <Input type="number" value={roll} onChange={handleRollChange} step="0.01" />
                <FloatText size="2xs" color={theme.properties.contentsFloatText}>
                  {intl.formatMessage({ defaultMessage: "Roll" })}
                </FloatText>
              </FormWrapper>
            </FormFieldRow>
          </FormFieldGroup>
        </FormGroup>
        <FormGroup>
          {value && !isCapturing && (
            <FormButtonGroup>
              <Button
                buttonType="secondary"
                text={
                  onlyPose
                    ? intl.formatMessage({ defaultMessage: "Check Pose" })
                    : intl.formatMessage({ defaultMessage: "Jump" })
                }
                onClick={jump}
              />
            </FormButtonGroup>
          )}
        </FormGroup>
        <FormGroup>
          <FormButtonGroup>
            <Button
              buttonType="secondary"
              text={intl.formatMessage({ defaultMessage: "Cancel" })}
              onClick={handleClickCancelButton}
            />
            {!isCapturing && (
              <Button
                buttonType="primary"
                text={
                  value && onlyPose
                    ? intl.formatMessage({ defaultMessage: "Edit Pose" })
                    : intl.formatMessage({ defaultMessage: "Edit Position" })
                }
                onClick={startCapture}
              />
            )}
            {isCapturing && (
              <Button
                buttonType="primary"
                text={intl.formatMessage({ defaultMessage: "Capture" })}
                onClick={handleClickSubmitButton}
              />
            )}
          </FormButtonGroup>
        </FormGroup>
      </Popup>
    </Wrapper>
  );
};

const Wrapper = styled.div`
  width: 100%;
  border: solid 1px ${props => props.theme.properties.border};
`;

const CameraWrapper = styled.div`
  border-radius: 3px;
  display: flex;
  align-items: center;
  width: 100%;
  box-sizing: border-box;
  cursor: pointer;
  user-select: none;
`;

const StyledIcon = styled(Icon)`
  color: ${props => props.theme.properties.contentsText};
  margin-right: 5px;
`;

const StyledText = styled(Text)`
  flex: 1;
  padding: 8px;
  margin: auto;
`;

const Popup = styled.ul<{ open: boolean }>`
  ${({ open }) =>
    !open &&
    css`
      visibility: hidden;
      pointer-events: none;
    `}
  display: flex;
  flex-direction: column;
  width: 286px;
  margin: 0;
  border: solid 1px ${props => props.theme.properties.border};
  border-radius: 5px;
  background: ${props => props.theme.properties.bg};
  box-sizing: border-box;
  padding: 10px 16px;
  z-index: ${props => props.theme.zIndexes.propertyFieldPopup};
`;

const FormGroup = styled.div`
  display: flex;
`;

const FormIcon = styled(Icon)`
  margin: 10px 10px 10px 0;
  color: ${props => props.theme.properties.contentsText};
`;

const FormButtonGroup = styled.div`
  display: flex;
  justify-content: flex-end;
  flex: 1;
`;

const FormFieldGroup = styled.div`
  display: flex;
  flex-direction: column;
`;

const FormFieldRow = styled.div`
  display: flex;
  margin: 5px;
`;

const FormWrapper = styled.div`
  display: flex;
  align-items: center;
  flex: 1;
  flex-direction: column;
  box-sizing: border-box;

  &:not(:last-child) {
    margin-right: 5px;
  }
`;

const Input = styled.input`
  font-size: 11px;
  display: block;
  border: solid 1px ${props => props.theme.properties.border};
  border-radius: 3px;
  background: ${({ theme }) => theme.main.deepBg};
  outline: none;
  color: ${({ theme }) => theme.properties.contentsText};
  width: 100%;
  padding: 5px;
  box-sizing: border-box;
`;

const FloatText = styled(Text)`
  user-select: none;
`;

export default CameraField;
