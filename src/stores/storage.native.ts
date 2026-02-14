/**
 * Native storage using MMKV (iOS/Android)
 */
import { MMKV } from "react-native-mmkv";
import type { StateStorage } from "zustand/middleware";

const mmkv = new MMKV({ id: "survey-storage" });

export const zustandStorage: StateStorage = {
  getItem: (name: string) => {
    const value = mmkv.getString(name);
    return value ?? null;
  },
  setItem: (name: string, value: string) => {
    mmkv.set(name, value);
  },
  removeItem: (name: string) => {
    mmkv.delete(name);
  },
};
