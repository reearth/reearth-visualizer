import { styled } from "@reearth/services/theme";

export type Props = {
  checked: boolean;
  onChange: (checked: boolean) => void;
  disabled?: boolean;
};

const Toggle: React.FC<Props> = ({ checked, onChange, disabled = false }) => (
  <Wrapper>
    <Switch checked={checked} disabled={disabled} onClick={() => onChange(!checked)}>
      <TopSlider checked={checked} />
    </Switch>
  </Wrapper>
);

export default Toggle;

const Wrapper = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
`;

const Switch = styled.label<{
  checked: boolean;
  disabled: boolean;
}>`
  cursor: ${({ disabled }) => (!disabled ? "pointer" : "not-allowed")};
  width: 24px;
  height: 14px;
  background: ${({ checked, theme }) => (checked ? theme.select.main : theme.secondary.main)};
  border: 1px solid ${({ checked, theme }) => (checked ? theme.select.main : theme.secondary.main)};
  border-radius: 12px;
  opacity: ${({ disabled }) => (!disabled ? 1 : 0.5)};
  transition: 0.4s;
`;

const TopSlider = styled.div<{
  checked: boolean;
}>`
  width: 14px;
  height: 14px;
  background: ${({ theme }) => theme.content.withBackground};
  transition: 0.4s;
  border-radius: 50%;
  transform: ${({ checked }) => checked && "translateX(10px)"};
`;
