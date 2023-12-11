import { groupBy } from "lodash-es";
import { type RequireExactlyOne } from "type-fest";

interface Stage {
  uniforms: Record<string, unknown>;
}

type Entry<Uniforms> = RequireExactlyOne<
  {
    stage: Stage;
    stages: readonly Stage[];
    uniforms: ReadonlyArray<keyof Uniforms | { [K in keyof Uniforms]?: string }>;
  },
  "stage" | "stages"
>;

interface Handler {
  name: string;
  get: () => unknown;
  set: (value: unknown) => void;
}

function makeHandler(source: string, target: string, stages: readonly Stage[]): Handler {
  return {
    name: source,
    get: () => stages[0].uniforms[target],
    set: (value: unknown) => {
      stages.forEach(stage => {
        stage.uniforms[target] = value;
      });
    },
  };
}

export function createUniforms<Uniforms extends object>(
  entries: ReadonlyArray<Entry<Uniforms>>,
): Uniforms {
  const handlers = groupBy(
    entries.flatMap(({ stage, stages, uniforms }) =>
      uniforms.flatMap(uniform =>
        typeof uniform === "string"
          ? [makeHandler(uniform, uniform, stage != null ? [stage] : stages)]
          : Object.entries(uniform).map(([source, target]) =>
              makeHandler(source, target, stage != null ? [stage] : stages),
            ),
      ),
    ),
    ({ name }) => name,
  );

  const uniforms = {};
  Object.entries(handlers).forEach(([name, handlers]) => {
    Object.defineProperty(uniforms, name, {
      get: () => handlers[0].get(),
      set: (value: unknown) => {
        handlers.forEach(handler => {
          handler.set(value);
        });
      },
    });
  });

  return uniforms as Uniforms;
}
