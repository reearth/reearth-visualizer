import { action } from "@storybook/addon-actions";
import { Meta, Story } from "@storybook/react";
import { useRef } from "react";

import Component, { Props, Ref } from ".";

export default {
  title: "atoms/Plugin",
  component: Component,
  parameters: { actions: { argTypesRegex: "^on.*" } },
} as Meta;

export const Default: Story<Props> = args => <Component {...args} />;

let cb: (message: any) => void | undefined;

Default.args = {
  src: `/plugins/plugin.js`,
  canBeVisible: true,
  iFrameProps: {
    style: {
      width: "300px",
      height: "300px",
      backgroundColor: "#fff",
    },
  },
  exposed: ({ render, postMessage }) => ({
    console: {
      log: action("console.log"),
    },
    reearth: {
      on(type: string, value: (message: any) => void | undefined) {
        if (type === "message") {
          cb = value;
        }
      },
      ui: {
        show: render,
        postMessage,
      },
    },
  }),
  onMessage: (message: any) => {
    action("onMessage")(message);
    return cb?.(message);
  },
};

export const HiddenIFrame: Story<Props> = args => <Component {...args} />;

HiddenIFrame.args = {
  src: `/plugins/hidden.js`,
  canBeVisible: true,
  iFrameProps: {
    style: {
      width: "300px",
      height: "300px",
      backgroundColor: "#fff",
    },
  },
  exposed: ({ render, postMessage }) => ({
    console: {
      log: action("console.log"),
    },
    reearth: {
      on(type: string, value: (message: any) => void | undefined) {
        if (type === "message") {
          cb = value;
        }
      },
      ui: {
        show: render,
        postMessage,
      },
    },
  }),
  onMessage: (message: any) => {
    action("onMessage")(message);
    return cb?.(message);
  },
};

export const SourceCode: Story<Props> = args => <Component {...args} />;

SourceCode.args = {
  sourceCode: `console.log("Hello")`,
  exposed: {
    console: {
      log: action("console.log"),
    },
  },
};

export const AutoResize: Story<Props> = args => {
  const ref = useRef<Ref>(null);
  return (
    <Component
      {...args}
      onMessage={msg => {
        ref.current
          ?.arena()
          ?.evalCode(`"onmessage" in globalThis && globalThis.onmessage(${JSON.stringify(msg)})`);
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
  canBeVisible: true,
  exposed: ({ render, resize }) => ({ render, resize }),
};
