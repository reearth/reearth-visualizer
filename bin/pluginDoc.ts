// import { writeFileSync } from "fs";
import * as ts from "typescript";

import tsconfig from "../tsconfig.json";

const files = ["./src/plugin/api.ts"];
const program = ts.createProgram(files, tsconfig as any);
const tc = program.getTypeChecker();

type D = {
  name: string;
  desc: string;
  properties: P[];
};

type P = {
  name: string;
  desc: string;
  type: string;
  required: boolean;
};

for (const s of program.getSourceFiles()) {
  if (s.fileName.substr(-5) === ".d.ts") continue;
  const decls: D[] = [];
  ts.forEachChild(s, node => {
    const d = parse(node);
    if (d) {
      decls.push(d);
    }
  });
  const res = render(decls, n => decls.findIndex(d => d.name === n) != -1);
  // writeFileSync("./docs/plugin.md", res);
  console.log(res);
}

function parse(node: ts.Node): D | undefined {
  if (!ts.isTypeAliasDeclaration(node)) return;
  const sym = tc.getSymbolAtLocation(node.name);
  if (!sym) return;

  const properties = tc
    .getTypeAtLocation(node)
    .getApparentProperties()
    .map((s): P | undefined => {
      const d = s.getDeclarations()?.[0];
      const t = d ? tc.getTypeAtLocation(d) : undefined;
      if (!t) return undefined;
      return {
        name: s.name,
        type: tc.typeToString(t),
        required: (s.flags & ts.SymbolFlags.Optional) === 0,
        desc: ts.displayPartsToString(s.getDocumentationComment(tc)),
      };
    })
    .filter((p): p is P => !!p);

  return {
    name: node.name.text,
    desc: ts.displayPartsToString(sym.getDocumentationComment(tc)),
    properties,
  };
}

function render(decls: D[], linkable: (name: string) => boolean): string {
  return decls
    .flatMap(d => [
      `# ${d.name}`,
      d.desc,
      d.properties.map(p => `- ${renderHead(p, linkable)}`).join("\n"),
      ...d.properties.filter(p => p.desc).flatMap(p => [`## ${renderHead(p, linkable)}`, p.desc]),
    ])
    .filter(Boolean)
    .join("\n\n");
}

function renderHead(p: P, linkable: (name: string) => boolean): string {
  return [p.name, ": ", renderType(p.type, p.required, linkable)].join("");
}

function renderType(type: string, required: boolean, linkable: (name: string) => boolean) {
  const ts = split(type, [") => ", "[]", "?: ", ": ", " & ", " | ", "(", ")", ", "])
    .map(s =>
      typeof s === "string" && linkable(s)
        ? {
            link: s,
          }
        : s,
    )
    .map(s =>
      typeof s === "string" ? s : "link" in s ? `[${s.link}](#${s.link})` : "s" in s ? s.s : "",
    )
    .join("");
  const func = / => /.test(type);
  return [
    !required && func ? "(" : "",
    ts,
    !required && func ? ")" : "",
    !required ? " | undefined" : "",
  ].join("");
}

function split(text: string, splitter: string[]): (string | { s: string })[] {
  if (!text.length) return [];
  const res: (string | { s: string })[] = [];
  let buf = "";
  for (let i = 0; i < text.length; i++) {
    buf += text[i];
    const s = splitter.find(s => buf.includes(s));
    if (s) {
      res.push(buf.slice(0, -s.length), { s: buf.slice(-s.length) });
      buf = "";
    }
  }
  if (buf.length) {
    res.push(buf);
  }
  return res;
}
