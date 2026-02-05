import { ApolloLink } from "@apollo/client";

export default (_endpoint: string) => {
  return new ApolloLink((operation, forward) => {
    if (!forward) return null;
    return forward(operation);
  });
};
