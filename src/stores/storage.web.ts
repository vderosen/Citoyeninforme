/**
 * Web storage using localStorage
 */
import type { StateStorage } from "zustand/middleware";

export const zustandStorage: StateStorage = {
  getItem: (name: string) => {
    return localStorage.getItem(name);
  },
  setItem: (name: string, value: string) => {
    localStorage.setItem(name, value);
  },
  removeItem: (name: string) => {
    localStorage.removeItem(name);
  },
};
