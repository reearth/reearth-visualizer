import { ApolloLink, Observable } from "@apollo/client";
import { HEADER_KEY_SKIP_GLOBAL_LOADING } from "@reearth/services/gql";
import { GQLTask } from "@reearth/services/state";
import { v4 as uuidv4 } from "uuid";

export default (
  addTask: (task: GQLTask) => void,
  removeTask: (task: GQLTask) => void
): ApolloLink =>
  new ApolloLink(
    (operation: ApolloLink.Operation, forward: ApolloLink.ForwardFunction) => {
    const skipLoading =
      operation.getContext().headers?.[HEADER_KEY_SKIP_GLOBAL_LOADING] === "true";

    const taskId = uuidv4();
    if (!skipLoading) addTask({ id: taskId });

    return new Observable((observer) => {
      const sub = forward(operation).subscribe({
        next: (result) => {
          if (result.errors && !skipLoading) {
            removeTask({ id: taskId });
          }
          observer.next(result);
        },
        error: (error) => {
          observer.error(error);
          if (!skipLoading) removeTask({ id: taskId });
        },
        complete: () => {
          observer.complete();
          if (!skipLoading) removeTask({ id: taskId });
        }
      });

      return () => {
        sub.unsubscribe();
        if (!skipLoading) removeTask({ id: taskId });
      };
    });
  });
