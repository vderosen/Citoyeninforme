#!/usr/bin/env node

const fs = require("fs");
const path = require("path");

const PATCHES = [
  {
    relativePath: "node_modules/@gluestack-ui/toast/lib/ToastList.jsx",
    isPatched: (content) =>
      content.includes("import { Platform, View } from 'react-native';") &&
      content.includes(
        "import { SafeAreaView } from 'react-native-safe-area-context';"
      ),
    apply: (content) =>
      content.replace(
        /import\s*\{\s*Platform\s*,\s*SafeAreaView\s*,\s*View\s*\}\s*from\s*["']react-native["'];/,
        "import { Platform, View } from 'react-native';\nimport { SafeAreaView } from 'react-native-safe-area-context';"
      ),
  },
  {
    relativePath: "node_modules/@gluestack-ui/toast/src/ToastList.tsx",
    isPatched: (content) =>
      content.includes("import { Platform, View } from 'react-native';") &&
      content.includes(
        "import { SafeAreaView } from 'react-native-safe-area-context';"
      ),
    apply: (content) =>
      content.replace(
        /import\s*\{\s*Platform\s*,\s*SafeAreaView\s*,\s*View\s*\}\s*from\s*["']react-native["'];/,
        "import { Platform, View } from 'react-native';\nimport { SafeAreaView } from 'react-native-safe-area-context';"
      ),
  },
  {
    relativePath: "node_modules/react-native-css-interop/dist/runtime/components.js",
    isPatched: (content) => !content.includes("react_native_1.SafeAreaView"),
    apply: (content) =>
      content.replace(
        /\(0,\s*api_1\.cssInterop\)\(react_native_1\.SafeAreaView,\s*\{\s*className:\s*"style"\s*\}\);\n?/,
        ""
      ),
  },
  {
    relativePath: "node_modules/react-native-css-interop/src/runtime/components.ts",
    isPatched: (content) =>
      !content.includes("  SafeAreaView,") &&
      !content.includes('cssInterop(SafeAreaView, { className: "style" });'),
    apply: (content) => {
      let updated = content.replace(/\n\s*SafeAreaView,\n/, "\n");
      updated = updated.replace(
        /\ncssInterop\(SafeAreaView,\s*\{\s*className:\s*"style"\s*\}\);\n/,
        "\n"
      );
      return updated;
    },
  },
];

function patchFile(root, patch) {
  const filePath = path.join(root, patch.relativePath);
  if (!fs.existsSync(filePath)) {
    return { status: "missing", filePath };
  }

  const content = fs.readFileSync(filePath, "utf8");

  if (patch.isPatched(content)) {
    return { status: "already-patched", filePath };
  }

  const updated = patch.apply(content);

  if (updated === content) {
    return { status: "pattern-not-found", filePath };
  }

  fs.writeFileSync(filePath, updated, "utf8");

  return { status: "patched", filePath };
}

function main() {
  const root = process.cwd();
  const results = PATCHES.map((patch) => patchFile(root, patch));

  for (const result of results) {
    // Keep output concise and machine-readable in install logs.
    console.log(`[safe-area-patch] ${result.status}: ${result.filePath}`);
  }
}

main();
