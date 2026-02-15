#!/usr/bin/env node

const fs = require("fs");
const path = require("path");

const TARGETS = [
  "node_modules/@gluestack-ui/toast/lib/ToastList.jsx",
  "node_modules/@gluestack-ui/toast/src/ToastList.tsx",
];

const LEGACY_IMPORT =
  /import\s*\{\s*Platform\s*,\s*SafeAreaView\s*,\s*View\s*\}\s*from\s*["']react-native["'];/;
const MODERN_IMPORT =
  "import { Platform, View } from 'react-native';\nimport { SafeAreaView } from 'react-native-safe-area-context';";

function patchFile(filePath) {
  if (!fs.existsSync(filePath)) {
    return { status: "missing", filePath };
  }

  const content = fs.readFileSync(filePath, "utf8");

  if (content.includes("react-native-safe-area-context")) {
    return { status: "already-patched", filePath };
  }

  if (!LEGACY_IMPORT.test(content)) {
    return { status: "pattern-not-found", filePath };
  }

  const updated = content.replace(LEGACY_IMPORT, MODERN_IMPORT);
  fs.writeFileSync(filePath, updated, "utf8");

  return { status: "patched", filePath };
}

function main() {
  const root = process.cwd();
  const results = TARGETS.map((relativePath) =>
    patchFile(path.join(root, relativePath))
  );

  for (const result of results) {
    // Keep output concise and machine-readable in install logs.
    console.log(`[safe-area-patch] ${result.status}: ${result.filePath}`);
  }
}

main();
