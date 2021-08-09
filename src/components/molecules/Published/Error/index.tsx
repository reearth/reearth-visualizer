import React from "react";

import { styled } from "@reearth/theme";

export default function Error() {
  return <Wrapper>Error!</Wrapper>;
}

const Wrapper = styled.div`
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: #000;
  color: #ccc;
  font-size: 14px;
  padding: 10px;
`;
