import { useState } from "react";

import Icon from "@reearth/beta/components/Icon";
import ListItem from "@reearth/beta/components/ListItem";
import { styled } from "@reearth/services/theme";

import useHooks from "./hooks";

type Props = {
  sceneId?: string;
  selectedWidgetId?: string;
};

const Manager: React.FC<Props> = ({ sceneId }) => {
  const [show, setShow] = useState(false);
  const {
    selectedWidget,
    installedWidgets,
    installableWidgets,
    handleWidgetAdd,
    handleWidgetSelection,
  } = useHooks({ sceneId });

  return (
    <Wrapper>
      <ActionArea>
        <StyledIcon icon="plusSquare" size={14} onClick={() => setShow(s => !s)} />
      </ActionArea>
      {show && (
        <ul>
          {installableWidgets
            ?.filter(w => !w.disabled)
            .map(w => (
              <li
                key={`${w.pluginId}/${w.extensionId}`}
                onClick={() => handleWidgetAdd(`${w.pluginId}/${w.extensionId}`)}>
                {w.title}
              </li>
            ))}
        </ul>
      )}
      <InstalledWidgetsList>
        {installedWidgets?.map(w => (
          <ListItem
            key={w.id}
            text={w.title}
            isSelected={w.id === selectedWidget?.id}
            onItemClick={() => handleWidgetSelection(w.id)}
            onActionClick={() => console.log("ACTIONS")}
          />
        ))}
      </InstalledWidgetsList>
    </Wrapper>
  );
};

export default Manager;

const Wrapper = styled.div``;

const ActionArea = styled.div`
  display: flex;
  justify-content: flex-end;
  gap: 4px;
`;

const InstalledWidgetsList = styled.div`
  display: flex;
  flex-direction: column;
`;

const StyledIcon = styled(Icon)`
  cursor: pointer;
`;
