import { useState } from "react";

import Icon from "@reearth/beta/components/Icon";
import { styled } from "@reearth/services/theme";

import useHooks from "./hooks";

type Props = {
  sceneId?: string;
};

const Manager: React.FC<Props> = ({ sceneId }) => {
  const [show, setShow] = useState(false);
  const { installableWidgets, installedWidgets, handleWidgetAdd } = useHooks({ sceneId });

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
      {installedWidgets?.map(w => (
        <p
          key={`${w.pluginId}/${w.extensionId}`}
          onClick={() => handleWidgetAdd(`${w.pluginId}/${w.extensionId}`)}>
          {w.title}
        </p>
      ))}
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

const StyledIcon = styled(Icon)`
  cursor: pointer;
`;
