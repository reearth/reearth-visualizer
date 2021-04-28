import { useCallback } from "react";
import {
  useSelector as useReduxSelector,
  useStore as useReduxStore,
  useDispatch,
} from "react-redux";

import { Store, LocalState, localSlice } from "./reducer";

export const useSelector = <TSelected = unknown>(
  selector: (state: Store) => TSelected,
  equalityFn?: (left: TSelected, right: TSelected) => boolean,
) => useReduxSelector(selector, equalityFn);

export const useStore = () => useReduxStore<Store>();

export const useSetLocalState = () => {
  const dispatch = useDispatch();
  const dispatcher = useCallback(
    (state: Partial<LocalState>) => dispatch(localSlice.actions.set(state)),
    [dispatch],
  );
  return dispatcher;
};

export const useLocalState = <T>(
  selector: (state: LocalState) => T,
): [T, (state: Partial<LocalState>) => void] => {
  const selected = useSelector(s => selector(s));
  return [selected, useSetLocalState()];
};
