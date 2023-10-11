import { gql } from "@apollo/client";

const nlsStyleFragment = gql`
  fragment NLSLayerStyle on Style {
    id
    name
    value
  }
`;

export default nlsStyleFragment;
