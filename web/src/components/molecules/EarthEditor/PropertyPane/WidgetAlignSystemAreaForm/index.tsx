import React from "react";

import Flex from "@reearth/components/atoms/Flex";
import Text from "@reearth/components/atoms/Text";
import ToggleButton from "@reearth/components/atoms/ToggleButton";
import { useT } from "@reearth/i18n";
import { styled } from "@reearth/theme";
import { metricsSizes } from "@reearth/theme/metrics";

import ColorField from "../PropertyField/ColorField";
import NumberField from "../PropertyField/NumberField";
import { WidgetAreaPadding, WidgetAreaState } from "../PropertyItem";

export type Props = {
  selectedWidgetArea: WidgetAreaState;
  onAreaStateChange?: (widgetAreaState: WidgetAreaState) => Promise<void> | void;
};

const WidgetAlignSystemAreaForm: React.FC<Props> = ({ selectedWidgetArea, onAreaStateChange }) => {
  const t = useT();
  return (
    <>
      <FormItemWrapper>
        <PaddingTitleWrapper>
          <Text size="xs" otherProperties={{ userSelect: "none" }}>
            {t("Padding")}
          </Text>
        </PaddingTitleWrapper>
        <PaddingPropertyFieldsWrapper>
          <PaddingPropertyFieldsRow style={{ justifyContent: "center" }}>
            <PaddingFieldWrapper>
              <NumberField
                suffix="px"
                min={0}
                value={selectedWidgetArea.padding?.top}
                onChange={(value?: number) =>
                  onAreaStateChange?.({
                    ...selectedWidgetArea,
                    padding: {
                      ...(selectedWidgetArea.padding as WidgetAreaPadding),
                      top: value ?? 0,
                    },
                  })
                }
              />
            </PaddingFieldWrapper>
          </PaddingPropertyFieldsRow>

          <PaddingPropertyFieldsRow style={{ justifyContent: "space-between" }}>
            <PaddingFieldWrapper>
              <NumberField
                suffix="px"
                min={0}
                value={selectedWidgetArea.padding?.left}
                onChange={(value?: number) =>
                  onAreaStateChange?.({
                    ...selectedWidgetArea,
                    padding: {
                      ...(selectedWidgetArea.padding as WidgetAreaPadding),
                      left: value ?? 0,
                    },
                  })
                }
              />
            </PaddingFieldWrapper>
            <PaddingFieldWrapper>
              <NumberField
                suffix="px"
                min={0}
                value={selectedWidgetArea.padding?.right}
                onChange={(value?: number) =>
                  onAreaStateChange?.({
                    ...selectedWidgetArea,
                    padding: {
                      ...(selectedWidgetArea.padding as WidgetAreaPadding),
                      right: value ?? 0,
                    },
                  })
                }
              />
            </PaddingFieldWrapper>
          </PaddingPropertyFieldsRow>
          <PaddingPropertyFieldsRow style={{ justifyContent: "center" }}>
            <PaddingFieldWrapper>
              <NumberField
                suffix="px"
                min={0}
                value={selectedWidgetArea.padding?.bottom}
                onChange={(value?: number) =>
                  onAreaStateChange?.({
                    ...selectedWidgetArea,
                    padding: {
                      ...(selectedWidgetArea.padding as WidgetAreaPadding),
                      bottom: value ?? 0,
                    },
                  })
                }
              />
            </PaddingFieldWrapper>
          </PaddingPropertyFieldsRow>
        </PaddingPropertyFieldsWrapper>
      </FormItemWrapper>
      <FormItemWrapper />
      <FormItemWrapper>
        <StyledPropertyTitleWrapper>
          <Text size="xs" otherProperties={{ userSelect: "none" }}>
            {t("Gap Spacing")}
          </Text>
        </StyledPropertyTitleWrapper>
        <StyledPropertyFieldWrapper>
          <NumberField
            suffix="px"
            min={0}
            value={selectedWidgetArea.gap}
            onChange={(value?: number) =>
              onAreaStateChange?.({
                ...selectedWidgetArea,
                gap: value,
              })
            }
          />
        </StyledPropertyFieldWrapper>
      </FormItemWrapper>
      <FormItemWrapper>
        <StyledPropertyTitleWrapper>
          <Text size="xs" otherProperties={{ userSelect: "none" }}>
            {t("Align Center")}
          </Text>
        </StyledPropertyTitleWrapper>
        <StyledPropertyFieldWrapper>
          <ToggleButton
            checked={selectedWidgetArea.centered}
            onChange={(value?: boolean) =>
              onAreaStateChange?.({
                ...selectedWidgetArea,
                centered: value,
              })
            }
          />
        </StyledPropertyFieldWrapper>
      </FormItemWrapper>
      <FormItemWrapper>
        <StyledPropertyTitleWrapper>
          <Text size="xs" otherProperties={{ userSelect: "none" }}>
            {t("Background Color")}
          </Text>
        </StyledPropertyTitleWrapper>
        <StyledPropertyFieldWrapper>
          <ColorField
            value={selectedWidgetArea.background}
            onChange={(value?: string) =>
              onAreaStateChange?.({
                ...selectedWidgetArea,
                background: value,
              })
            }
          />
        </StyledPropertyFieldWrapper>
      </FormItemWrapper>
    </>
  );
};

const FormItemWrapper = styled(Flex)`
  flex-wrap: wrap;
  margin-bottom: ${metricsSizes.l}px;
  align-items: center;
`;

const StyledPropertyTitleWrapper = styled.div`
  flex: 1;
  font-size: 12px;
  margin-right: ${metricsSizes.s}px;
`;

const StyledPropertyFieldWrapper = styled.div`
  flex: 2;
  width: 100%;
  min-width: 0;
`;

const PaddingTitleWrapper = styled.div`
  flex: 1;
  width: 100%;
  font-size: 12px;
  margin-bottom: 8px;
`;

const PaddingPropertyFieldsWrapper = styled.div`
  border: 1px dashed #4a4a4a;
  display: flex;
  flex-wrap: wrap;
  justify-content: space-between;
`;

const PaddingPropertyFieldsRow = styled.div`
  flex: 0 0 100%;
  display: flex;
`;

const PaddingFieldWrapper = styled.div`
  width: 52px;
`;

export default WidgetAlignSystemAreaForm;
