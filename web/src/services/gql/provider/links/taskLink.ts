import { ApolloLink } from "@apollo/client/link";
import { GQLTask } from "@reearth/services/state";
import { Observable } from "rxjs";
import { v4 as uuidv4 } from "uuid";

export default (
  addTask: (task: GQLTask) => void,
  removeTask: (task: GQLTask) => void
): ApolloLink =>
  new ApolloLink(
    (operation: ApolloLink.Operation, forward: ApolloLink.ForwardFunction) => {
    const taskId = uuidv4();
    addTask({ id: taskId });

    return new Observable((observer) => {
      const sub = forward(operation).subscribe({
        next: (result) => {
          if (result.errors) {
            removeTask({ id: taskId });
          }
          observer.next(result);
        },
        error: (error) => {
          observer.error(error);
          removeTask({ id: taskId });
        },
        complete: () => {
          observer.complete();
          removeTask({ id: taskId });
        }
      });

      return () => {
        sub.unsubscribe();
        removeTask({ id: taskId });
      };
    });
  });
