import { styled } from "@reearth/theme";

const Avatar = styled.div<{ size: number; avatar?: string }>`
  display: flex;
  align-items: center;
  justify-content: center;
  min-width: ${({ size }) => size}px;
  min-height: ${({ size }) => size}px;
  font-size: 24px;
  border-radius: 50%;
  background: ${({ avatar }) => (avatar ? `url(${avatar});` : "#888888")};
`;

export default Avatar;
