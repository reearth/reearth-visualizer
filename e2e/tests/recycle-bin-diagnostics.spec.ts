import fs from "fs";
import path from "path";

import { test } from "@playwright/test";

test("Recycle bin count diagnostic", async () => {
  const recycleBinInfoPath = path.join(__dirname, "../.auth/recycle-bin-info.json");
  let count = -1;
  try {
    count = JSON.parse(fs.readFileSync(recycleBinInfoPath, "utf-8")).count ?? -1;
  } catch {
    // not written yet
  }

  console.log(`\n============================`);
  console.log(`🗑️  Recycle bin project count: ${count}`);
  if (count >= 16) {
    console.log(`⚠️  Count exceeds 16 — recycle bin tests would fail in this environment.`);
  } else if (count >= 0) {
    console.log(`✅  Count is within safe range.`);
  } else {
    console.log(`❓  Could not determine count (global setup may have failed).`);
  }
  console.log(`============================\n`);
});
