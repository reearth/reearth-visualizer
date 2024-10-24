import { ApolloLink, Operation, NextLink, Observable } from "@apollo/client";
import { GQLTask } from "@reearth/services/state";
import { v4 as uuidv4 } from "uuid";

export default (
  addTask: (task: GQLTask) => void,
  removeTask: (task: GQLTask) => void
): ApolloLink =>
  new ApolloLink((operation: Operation, forward: NextLink) => {
    const taskId = uuidv4();
    addTask({ id: taskId });

    return new Observable((observer) => {
      const timeoutId = setTimeout(() => {
        observer.error(new Error("Operation timeout"));
        removeTask({ id: taskId });
      }, 10000);

      const sub = forward(operation).subscribe({
        next: (result) => {
          if (result.errors) {
            clearTimeout(timeoutId);
            removeTask({ id: taskId });
          }
          observer.next(result);
        },
        error: (error) => {
          clearTimeout(timeoutId);
          observer.error(error);
          removeTask({ id: taskId });
        },
        complete: () => {
          clearTimeout(timeoutId);
          observer.complete();
          removeTask({ id: taskId });
        }
      });

      return () => {
        clearTimeout(timeoutId);
        sub.unsubscribe();
        removeTask({ id: taskId });
      };
    });
  });
