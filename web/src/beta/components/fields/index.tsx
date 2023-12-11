import { ReactNode } from "react";

import { styled } from "@reearth/services/theme";

import Text from "../Text";

type Props = {
  name?: string;
  description?: string;
  children: ReactNode;
  className?: string;
};

const Property: React.FC<Props> = ({ name, description, children, className }) => {
  return (
    <Wrapper className={className}>
      {name && <Text size="footnote">{name}</Text>}
      {children}
      {description && (
        <Description size="xFootnote" customColor>
          {description}
        </Description>
      )}
    </Wrapper>
  );
};

export default Property;

const Wrapper = styled.div`
  display: flex;
  flex-direction: column;
  gap: 8px;
`;

const Description = styled(Text)`
  color: ${({ theme }) => theme.content.weak};
`;
