import Icon from "@reearth/beta/components/Icon";
import { usePluginsFetcher } from "@reearth/services/api";
import { styled } from "@reearth/services/theme";

type Props = {
  sceneId?: string;
};

const Manager: React.FC<Props> = ({ sceneId }) => {
  const { usePluginsQuery } = usePluginsFetcher();
  const { plugins } = usePluginsQuery(sceneId);
  console.log("PLUGINS!!@#: ", plugins);
  return (
    <Wrapper>
      <ActionArea onClick={() => alert("SHOW WIDGETSSS")}>
        <Icon icon="plusSquare" size={14} />
      </ActionArea>
    </Wrapper>
  );
};

export default Manager;

const Wrapper = styled.div``;

const ActionArea = styled.div`
  display: flex;
  justify-content: flex-end;
  gap: 4px;
  cursor: pointer;
`;
