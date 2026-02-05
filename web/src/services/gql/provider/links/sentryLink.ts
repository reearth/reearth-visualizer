import { ApolloLink } from "@apollo/client/link";

export default (_endpoint: string) => {
  return new ApolloLink((operation, forward) => {
    return forward(operation);
  });
};
