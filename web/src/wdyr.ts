import React from "react";

const enabled = false;
// const enabled = true;

export default async function wdyr() {
  if (import.meta.env.DEV && enabled) {
    const { default: whyDidYouRender } = await import("@welldone-software/why-did-you-render");
    whyDidYouRender(React, {
      trackAllPureComponents: true,
    });
  }
}
