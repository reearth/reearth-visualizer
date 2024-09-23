import {
  DragAndDropList,
  IconButton,
  Selector,
  TextInput,
  Typography
} from "@reearth/beta/lib/reearth-ui";
import { useT } from "@reearth/services/i18n";
import { styled } from "@reearth/services/theme";
import { Dispatch, FC, ReactNode, SetStateAction, useMemo } from "react";

import { Condition } from "../type";

import useHooks from "./hooks";

type ConditionalTabProp = {
  children: (idx: number) => ReactNode;
  conditions: Condition[];
  setConditions: Dispatch<SetStateAction<Condition[]>>;
};

const options = [
  { value: "===", label: "===" },
  { value: "==", label: "==" },
  { value: "!==", label: "!==" },
  { value: ">=", label: ">=" },
  { value: "<=", label: "<=" },
  { value: "<", label: "<" },
  { value: ">", label: ">" }
];

const STYLE_CONDITIONS_DRAG_HANDLE_CLASS_NAME =
  "reearth-visualizer-editor-style-conditions-drag-handle";

const ConditionalTab: FC<ConditionalTabProp> = ({
  children,
  conditions,
  setConditions
}) => {
  const t = useT();
  const {
    handleConditionChange,
    handleStyleConditionAdd,
    handleStyleConditionListDelete,
    getProcessedCondition,
    handleMoveStart,
    handleMoveEnd
  } = useHooks({
    conditions,
    setConditions
  });

  const DraggableConditionItems = useMemo(
    () =>
      conditions.map((condition, idx) => {
        const conditionValue = getProcessedCondition(condition[0]);

        return {
          id: `condition-${idx}`,
          content: (
            <ContentWaper key={idx}>
              <IconButton
                key="dnd"
                icon="dotsSixVertical"
                size="small"
                appearance="simple"
                className={STYLE_CONDITIONS_DRAG_HANDLE_CLASS_NAME}
              />
              <ConditionWrapper>
                <ConditionStatement>
                  <Typography size="body">{t("if")}</Typography>
                  <InputWapper>
                    <TextInput
                      value={conditionValue[0] || ""}
                      placeholder={t("Text")}
                      onBlur={(val) =>
                        handleConditionChange(idx, "variable", val)
                      }
                    />
                  </InputWapper>
                  <InputWapper>
                    <Selector
                      value={conditionValue[1] || ""}
                      placeholder=""
                      options={options}
                      onChange={(val) =>
                        handleConditionChange(idx, "operator", val as string)
                      }
                    />
                  </InputWapper>
                  <InputWapper>
                    <TextInput
                      value={conditionValue[2] || ""}
                      placeholder={t("Text")}
                      onBlur={(val) => handleConditionChange(idx, "value", val)}
                    />
                  </InputWapper>
                </ConditionStatement>
                <ConditionValue>{children(idx)}</ConditionValue>{" "}
              </ConditionWrapper>
              <IconButton
                key="remove"
                icon="minus"
                size="small"
                appearance="simple"
                onClick={() => handleStyleConditionListDelete(idx)}
              />
            </ContentWaper>
          )
        };
      }),
    [
      conditions,
      getProcessedCondition,
      t,
      children,
      handleConditionChange,
      handleStyleConditionListDelete
    ]
  );

  return (
    <Wrapper>
      <IconButtonWrapper>
        <IconButton
          key="add"
          icon="plus"
          size="small"
          appearance="simple"
          onClick={handleStyleConditionAdd}
        />
      </IconButtonWrapper>

      {conditions && conditions.length > 0 && (
        <DragAndDropList
          items={DraggableConditionItems}
          onMoveStart={handleMoveStart}
          onMoveEnd={handleMoveEnd}
        />
      )}
    </Wrapper>
  );
};

export default ConditionalTab;

const Wrapper = styled("div")(({ theme }) => ({
  display: "flex",
  flexDirection: "column",
  gap: theme.spacing.smallest,
  paddingBottom: theme.spacing.smallest
}));

const IconButtonWrapper = styled("div")(() => ({
  display: "flex",
  justifyContent: "flex-end",
  width: "100%"
}));

const ContentWaper = styled("div")(({ theme }) => ({
  display: "flex",
  gap: theme.spacing.smallest,
  alignItems: "center"
}));

const ConditionWrapper = styled("div")(({ theme }) => ({
  display: "flex",
  flexDirection: "column",
  gap: theme.spacing.smallest,
  alignItems: "flex-start"
}));

const ConditionStatement = styled("div")(({ theme }) => ({
  display: "flex",
  gap: theme.spacing.smallest,
  alignItems: "center"
}));

const InputWapper = styled("div")(() => ({
  flex: 1
}));

const ConditionValue = styled("div")(() => ({
  width: "100%"
}));
