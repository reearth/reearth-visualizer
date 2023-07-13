import Icon from "@reearth/beta/components/Icon";
import { styled } from "@reearth/services/theme";

const Manager: React.FC = () => {
  return (
    <div>
      <ActionArea onClick={() => alert("SHOW WIDGETSSS")}>
        <Icon icon="plusSquare" size={14} />
        <Icon icon="arrowDown" size={14} />
      </ActionArea>
    </div>
  );
};

export default Manager;

const ActionArea = styled.div`
  display: flex;
  justify-content: flex-end;
  gap: 4px;
  padding: 0 8px 8px 8px;
  background: ${({ theme }) => theme.general.bg.veryWeak};
  cursor: pointer;
`;
