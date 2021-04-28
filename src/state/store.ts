import { configureStore } from "@reduxjs/toolkit";

import { reducer } from "./reducer";

export const store = configureStore({
  reducer,
});

if (module.hot) {
  module.hot.accept("./reducer", () => {
    // eslint-disable-next-line @typescript-eslint/no-var-requires
    const nextReducer = require("./reducer").reducer;
    store.replaceReducer(nextReducer);
  });
}
