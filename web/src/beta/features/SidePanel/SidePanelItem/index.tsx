import styled from "@emotion/styled";

export default styled.div<{ maxHeight?: string }>`
  flex-grow: 1;
  height: 100%;
  ${({ maxHeight }) => maxHeight && `max-height: ${maxHeight};`}
`;
