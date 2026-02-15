/**
 * Native storage using MMKV (iOS/Android)
 */
import { MMKV } from "react-native-mmkv";
import type { StateStorage } from "zustand/middleware";

const memoryStorage = new Map<string, string>();

let mmkv: MMKV | null = null;

try {
  mmkv = new MMKV({ id: "survey-storage" });
} catch (error) {
  console.warn(
    "[storage] MMKV unavailable in this runtime. Falling back to in-memory storage.",
    error
  );
}

export const zustandStorage: StateStorage = {
  getItem: (name: string) => {
    if (mmkv) {
      const value = mmkv.getString(name);
      return value ?? null;
    }
    return memoryStorage.get(name) ?? null;
  },
  setItem: (name: string, value: string) => {
    if (mmkv) {
      mmkv.set(name, value);
      return;
    }
    memoryStorage.set(name, value);
  },
  removeItem: (name: string) => {
    if (mmkv) {
      mmkv.delete(name);
      return;
    }
    memoryStorage.delete(name);
  },
};
