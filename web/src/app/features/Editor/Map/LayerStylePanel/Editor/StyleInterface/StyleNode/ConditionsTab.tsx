import {
  DragAndDropList,
  IconButton,
  Selector,
  TextInput,
  Typography
} from "@reearth/app/lib/reearth-ui";
import { useT } from "@reearth/services/i18n/hooks";
import { styled } from "@reearth/services/theme";
import { css } from "@reearth/services/theme/reearthTheme/common";
import { FC, useCallback, useMemo } from "react";

import {
  AppearanceField,
  StyleConditionOperator,
  StyleCondition,
  StyleSimpleValue
} from "../types";

import Field from "./Field";

type Props = {
  conditions?: StyleCondition[];
  field?: AppearanceField;
  valueOptions?: { value: string; label: string }[];
  disabled?: boolean;
  editMode?: boolean;
  onUpdate?: (value: StyleCondition[]) => void;
};

export const styleConditionOperators: StyleConditionOperator[] = [
  "===",
  "!==",
  "<=",
  ">=",
  "<",
  ">",
  "startsWith"
];

const OPERATION_OPTIONS: {
  value: StyleConditionOperator;
  label: string;
}[] = [
  { value: "===", label: "===" },
  { value: "!==", label: "!==" },
  { value: ">", label: ">" },
  { value: ">=", label: ">=" },
  { value: "<", label: "<" },
  { value: "<=", label: "<=" },
  { value: "startsWith", label: "Starts with" }
];

const STYLE_CONDITIONS_DRAG_HANDLE_CLASS_NAME =
  "reearth-visualizer-editor-style-conditions-drag-handle";

const ConditionsTab: FC<Props> = ({
  conditions,
  field,
  valueOptions,
  disabled,
  editMode,
  onUpdate
}) => {
  const handleItemDrop = useCallback(
    (draggedIndex: number, targetIndex: number) => {
      if (
        targetIndex < 0 ||
        !conditions ||
        targetIndex >= conditions.length ||
        draggedIndex === targetIndex
      )
        return;
      const newConditions = [...conditions];
      const [draggedItem] = newConditions.splice(draggedIndex, 1);
      newConditions.splice(targetIndex, 0, draggedItem);

      onUpdate?.(newConditions);
    },
    [conditions, onUpdate]
  );

  const handleMoveEnd = useCallback(
    (itemIdx?: string, newIndex?: number) => {
      if (itemIdx !== undefined && newIndex !== undefined) {
        const parsedIndex = parseInt(itemIdx, 10);
        if (!Number.isNaN(parsedIndex)) {
          handleItemDrop(parsedIndex, newIndex);
        }
      }
    },
    [handleItemDrop]
  );

  const t = useT();

  const createCondition = useCallback(() => {
    onUpdate?.([
      ...(conditions ?? []),
      {
        variable: "",
        operator: "===",
        value: "",
        applyValue: undefined
      }
    ]);
  }, [conditions, onUpdate]);

  const updateCondition = useCallback(
    (idx: number, key: "variable" | "operator" | "value", value: string) => {
      const newConditions = conditions ? [...conditions] : [];
      newConditions[idx] = {
        ...newConditions[idx],
        [key]: value
      };
      onUpdate?.(newConditions);
    },
    [conditions, onUpdate]
  );

  const deleteCondition = useCallback(
    (idx: number) => {
      const newConditions = conditions ? [...conditions] : [];
      newConditions.splice(idx, 1);
      onUpdate?.(newConditions);
    },
    [conditions, onUpdate]
  );

  const updateApplyValue = useCallback(
    (idx: number, value: StyleSimpleValue) => {
      const newConditions = conditions ? [...conditions] : [];
      newConditions[idx] = {
        ...newConditions[idx],
        applyValue: value
      };
      onUpdate?.(newConditions);
    },
    [conditions, onUpdate]
  );

  const DraggableConditionItems = useMemo(
    () =>
      conditions?.map((condition, idx) => {
        return {
          id: idx,
          content: (
            <ContentWrapper key={idx}>
              <IconButton
                key="dnd"
                icon="dotsSixVertical"
                size="small"
                appearance="simple"
                disabled={!editMode}
                className={STYLE_CONDITIONS_DRAG_HANDLE_CLASS_NAME}
              />
              <ConditionWrapper>
                <ConditionStatement>
                  <Typography size="body">if</Typography>
                  <InputWrapper>
                    <TextInput
                      value={condition.variable || ""}
                      placeholder={"${property}"}
                      disabled={!editMode}
                      appearance={!editMode ? "readonly" : undefined}
                      onBlur={(val) => updateCondition(idx, "variable", val)}
                    />
                  </InputWrapper>
                  <OperatorWrapper>
                    <Selector
                      value={condition.operator}
                      placeholder=""
                      options={OPERATION_OPTIONS}
                      disabled={!editMode}
                      appearance={!editMode ? "readonly" : undefined}
                      onChange={(val) =>
                        updateCondition(idx, "operator", val as string)
                      }
                    />
                  </OperatorWrapper>
                  <InputWrapper>
                    <TextInput
                      value={condition.value || ""}
                      placeholder={"value or 'string'"}
                      disabled={!editMode}
                      appearance={!editMode ? "readonly" : undefined}
                      onBlur={(val) => updateCondition(idx, "value", val)}
                    />
                  </InputWrapper>
                </ConditionStatement>
                <ConditionValue>
                  <Field
                    field={field}
                    value={condition.applyValue}
                    options={valueOptions}
                    editMode={editMode}
                    onUpdate={(value) => updateApplyValue(idx, value)}
                  />
                </ConditionValue>
              </ConditionWrapper>
              <IconButton
                key="remove"
                icon="minus"
                size="small"
                appearance="simple"
                disabled={!editMode}
                onClick={() => deleteCondition(idx)}
              />
            </ContentWrapper>
          )
        };
      }),
    [
      conditions,
      editMode,
      field,
      valueOptions,
      updateCondition,
      updateApplyValue,
      deleteCondition
    ]
  );

  return disabled ? (
    <InfoWrapper>
      <Typography size="body" color="weak">
        {t(
          "Condition is incompatible with the current system for this node or value."
        )}
      </Typography>
    </InfoWrapper>
  ) : (
    <ConditionsWrapper>
      <IconButtonWrapper>
        <IconButton
          key="add"
          icon="plus"
          size="small"
          appearance="simple"
          disabled={!editMode}
          onClick={createCondition}
        />
      </IconButtonWrapper>

      {DraggableConditionItems && (
        <DragAndDropList
          items={DraggableConditionItems}
          handleClassName={STYLE_CONDITIONS_DRAG_HANDLE_CLASS_NAME}
          onMoveEnd={handleMoveEnd}
        />
      )}
    </ConditionsWrapper>
  );
};

export default ConditionsTab;

const ConditionsWrapper = styled("div")(({ theme }) => ({
  display: css.display.flex,
  flexDirection: css.flexDirection.column,
  gap: theme.spacing.smallest,
  paddingBottom: theme.spacing.smallest
}));

const InfoWrapper = styled("div")(({ theme }) => ({
  padding: theme.spacing.small
}));

const IconButtonWrapper = styled("div")(() => ({
  display: css.display.flex,
  justifyContent: css.justifyContent.flexEnd,
  width: "100%"
}));

const ContentWrapper = styled("div")(({ theme }) => ({
  display: css.display.flex,
  gap: theme.spacing.smallest,
  alignItems: css.alignItems.center
}));

const ConditionWrapper = styled("div")(({ theme }) => ({
  display: css.display.flex,
  flexDirection: css.flexDirection.column,
  gap: theme.spacing.smallest,
  alignItems: css.alignItems.flexStart,
  flex: 1,
  minWidth: 0
}));

const ConditionStatement = styled("div")(({ theme }) => ({
  display: css.display.flex,
  gap: theme.spacing.smallest,
  alignItems: css.alignItems.center,
  width: "100%"
}));

const InputWrapper = styled("div")(() => ({
  flex: 1
}));

const OperatorWrapper = styled("div")(() => ({
  width: 80
}));

const ConditionValue = styled("div")(() => ({
  width: "100%"
}));
