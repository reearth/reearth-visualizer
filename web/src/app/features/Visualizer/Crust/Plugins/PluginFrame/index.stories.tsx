import { Meta, StoryFn } from "@storybook/react-vite";
import { useRef } from "react";

import Component, { Props, Ref } from ".";

// Mock function for actions
const fn = () => () => {};

export default {
  component: Component,
  parameters: { actions: { argTypesRegex: "^on.*" } }
} as Meta;

export const Default: StoryFn<Props> = (args) => <Component {...args} />;

let cb: (message: unknown) => void;

Default.args = {
  src: `/plugins/plugin.js`,
  uiVisible: true,
  iFrameProps: {
    style: {
      width: "300px",
      height: "300px",
      backgroundColor: "#fff"
    }
  },
  exposed: ({ main: { render, postMessage } }) => ({
    console: {
      log: fn()
    },
    reearth: {
      on(type: string, value: (message: unknown) => void) {
        if (type === "message") {
          cb = value;
        }
      },
      ui: {
        show: render,
        postMessage
      }
    }
  }),
  onMessage: (message: unknown) => {
    fn();
    return cb?.(message);
  }
};

export const HiddenIFrame: StoryFn<Props> = (args) => <Component {...args} />;

HiddenIFrame.args = {
  src: `/plugins/hidden.js`,
  uiVisible: true,
  iFrameProps: {
    style: {
      width: "300px",
      height: "300px",
      backgroundColor: "#fff"
    }
  },
  exposed: ({ main: { render, postMessage } }) => ({
    console: {
      log: fn()
    },
    reearth: {
      on(type: string, value: (message: unknown) => void) {
        if (type === "message") {
          cb = value;
        }
      },
      ui: {
        show: render,
        postMessage
      }
    }
  }),
  onMessage: (message: unknown) => {
    fn();
    return cb?.(message);
  }
};

export const SourceCode: StoryFn<Props> = (args) => <Component {...args} />;

SourceCode.args = {
  sourceCode: `console.log("Hello")`,
  exposed: {
    console: {
      log: fn()
    }
  }
};

export const AutoResize: StoryFn<Props> = (args) => {
  const ref = useRef<Ref>(null);
  return (
    <Component
      {...args}
      onMessage={(msg) => {
        ref.current
          ?.arena()
          ?.evalCode(
            `"onmessage" in globalThis && globalThis.onmessage(${JSON.stringify(msg)})`
          );
      }}
      ref={ref}
    />
  );
};

AutoResize.args = {
  sourceCode: `
    render(\`
      <style>body{width: 100px; height: 50px; background:yellow}</style>
      <h1 id="s"></h1>
      <script>
        let a = false;
        const s = document.getElementById("s");

        setInterval(() => {
          a = !a;
          const w = a ? "300px" : "100px";
          document.body.style.width = w;
          parent.postMessage({ width: w }, "*");
        }, 1000);

        const resize = () => {
          s.textContent = window.innerWidth + "x" + window.innerHeight;
        };
        window.onresize = resize;
        resize();
      </script>
    \`);
    onmessage = msg => { resize(msg.width, msg.height); };
  `,
  autoResize: "both",
  uiVisible: true,
  exposed: ({ main: { render, resize } }) => ({ render, resize })
};
