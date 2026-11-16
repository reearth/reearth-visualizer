// Packs the package, installs the tarball into a temporary plugin-like
// project and compiles test/api.ts against it with strict TypeScript under the
// module resolutions plugin projects use. Run with `npm test`.
import { execFileSync } from "node:child_process";
import {
  cpSync,
  mkdirSync,
  mkdtempSync,
  readdirSync,
  rmSync,
  symlinkSync,
  writeFileSync,
  realpathSync
} from "node:fs";
import { tmpdir } from "node:os";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const root = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const tmp = mkdtempSync(join(tmpdir(), "visualizer-plugin-api-"));
const run = (cmd, args, cwd) =>
  execFileSync(cmd, args, { cwd, encoding: "utf8", stdio: ["ignore", "pipe", "pipe"] });

let failed = false;
try {
  const tgz = run("npm", ["pack", "--silent", "--pack-destination", tmp], root).trim().split("\n").pop();

  const pkgDir = join(tmp, "node_modules", "@reearth", "visualizer-plugin-api");
  mkdirSync(pkgDir, { recursive: true });
  run("tar", ["-xzf", join(tmp, tgz), "-C", pkgDir, "--strip-components=1"], tmp);
  // The peer dependency a plugin project installs next to the package.
  symlinkSync(realpathSync(join(root, "node_modules", "@reearth", "core")), join(tmp, "node_modules", "@reearth", "core"));
  cpSync(join(root, "test"), join(tmp, "test"), { recursive: true });

  const tsc = join(root, "node_modules", ".bin", "tsc");
  const modes = [
    { name: "bundler", module: "ESNext", moduleResolution: "bundler", pkgType: "module" },
    { name: "node16-esm", module: "Node16", moduleResolution: "Node16", pkgType: "module" },
    { name: "node16-cjs", module: "Node16", moduleResolution: "Node16", pkgType: "commonjs" }
  ];
  for (const m of modes) {
    // The consumer's own package type decides how Node16 reads its imports.
    writeFileSync(join(tmp, "package.json"), JSON.stringify({ type: m.pkgType }));
    const cfg = `tsconfig.${m.name}.json`;
    writeFileSync(
      join(tmp, cfg),
      JSON.stringify({
        compilerOptions: {
          target: "ES2020",
          module: m.module,
          moduleResolution: m.moduleResolution,
          strict: true,
          noEmit: true,
          skipLibCheck: true,
          types: []
        },
        include: ["test"]
      })
    );
    try {
      run(tsc, ["-p", cfg], tmp);
      console.log(`ok   ${m.name}`);
    } catch (e) {
      failed = true;
      console.error(`FAIL ${m.name}\n${e.stdout}${e.stderr}`);
    }
  }
  console.log(`files in package: ${readdirSync(join(pkgDir, "dist")).filter((f) => f.endsWith(".d.ts")).length} .d.ts`);
} finally {
  rmSync(tmp, { recursive: true, force: true });
}
process.exit(failed ? 1 : 0);
