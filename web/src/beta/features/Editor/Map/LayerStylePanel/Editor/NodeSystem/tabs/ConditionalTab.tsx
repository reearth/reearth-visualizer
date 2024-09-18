import {
  DragAndDropList,
  IconButton,
  Selector,
  TextInput,
  Typography
} from "@reearth/beta/lib/reearth-ui";
import { useT } from "@reearth/services/i18n";
import { styled } from "@reearth/services/theme";
import { FC, ReactNode, useMemo } from "react";

import useHooks from "./hooks";

type ConditionalTabProp = {
  children: ReactNode;
};

const options = [
  {
    value: "=",
    label: "="
  },
  {
    value: "!=",
    label: "!="
  },
  {
    value: ">=",
    label: ">="
  },
  {
    value: "<=",
    label: "=>"
  },
  {
    value: "<",
    label: "<"
  },
  {
    value: ">",
    label: ">"
  }
];

const STYLE_CONDITIONS_DRAG_HANDLE_CLASS_NAME =
  "reearth-visualizer-editor-style-conditions-drag-handle";

const ConditionalTab: FC<ConditionalTabProp> = ({ children }) => {
  const t = useT();
  const {
    styleConditionList,
    handleStyleConditionAdd,
    handleStyleConditionListDelete,
    handleMoveStart,
    handleMoveEnd
  } = useHooks();

  const DraggableConditionItems = useMemo(
    () =>
      styleConditionList?.map((item, idx) => ({
        id: item.id,
        content: (
          <ContentWaper key={item.id}>
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
                  <TextInput placeholder={t("Text")} />
                </InputWapper>
                <InputWapper>
                  <Selector placeholder="" options={options} />
                </InputWapper>
                <InputWapper>
                  <TextInput placeholder={t("Text")} />
                </InputWapper>
              </ConditionStatement>
              <ConditionValue>{children}</ConditionValue>
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
      })),
    [styleConditionList, t, children, handleStyleConditionListDelete]
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

      {styleConditionList && styleConditionList.length > 0 && (
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
