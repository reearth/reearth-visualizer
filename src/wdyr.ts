/// <reference types="@welldone-software/why-did-you-render" />
/* eslint-disable @typescript-eslint/no-var-requires */
import React from "react";

const enabled = false;

if (process.env.NODE_ENV === "development" && enabled) {
  const whyDidYouRender = require("@welldone-software/why-did-you-render");
  whyDidYouRender(React, {
    trackAllPureComponents: true,
  });
}
