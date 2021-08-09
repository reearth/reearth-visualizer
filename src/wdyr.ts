/// <reference types="@welldone-software/why-did-you-render" />
/* eslint-disable @typescript-eslint/no-var-requires */
import React from "react";

if (process.env.NODE_ENV === "development") {
  const whyDidYouRender = require("@welldone-software/why-did-you-render");
  whyDidYouRender(React, {
    trackAllPureComponents: true,
  });
}
