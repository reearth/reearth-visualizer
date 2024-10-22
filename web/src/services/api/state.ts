import { atom } from "jotai";

const tasksInProgressAtom = atom<string[]>([]);

export const isAnyTaskInProgressAtom = atom((get) => {
  const tasks = get(tasksInProgressAtom);
  return tasks.length > 0;
});

export const addTaskAtom = atom(null, (get, set, task: string) => {
  const currentTasks = get(tasksInProgressAtom);
  set(tasksInProgressAtom, [...currentTasks, task]);
  // remove after timeout
  setTimeout(() => {
    set(removeTaskAtom, task);
  }, 5000);
});

export const removeTaskAtom = atom(null, (get, set, task: string) => {
  const currentTasks = get(tasksInProgressAtom);
  set(
    tasksInProgressAtom,
    currentTasks.filter((t) => t !== task)
  );
});
