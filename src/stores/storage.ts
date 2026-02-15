/**
 * Default storage adapter (used on web).
 *
 * Metro bundler resolves platform-specific files at build time:
 * - Native (iOS/Android): storage.native.ts (MMKV)
 * - Web: this file (localStorage)
 *
 * This file doubles as the TypeScript resolution target for
 * `import { zustandStorage } from "./storage"`.
 */
import type { StateStorage } from "zustand/middleware";

export const zustandStorage: StateStorage = {
  getItem: (name: string) => {
    if (typeof localStorage === "undefined") return null;
    return localStorage.getItem(name);
  },
  setItem: (name: string, value: string) => {
    if (typeof localStorage === "undefined") return;
    localStorage.setItem(name, value);
  },
  removeItem: (name: string) => {
    if (typeof localStorage === "undefined") return;
    localStorage.removeItem(name);
  },
};
