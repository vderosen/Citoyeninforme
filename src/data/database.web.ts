/**
 * Web stub — SQLite is not available on web.
 * Data is served directly from the Zustand store (loaded from bundled JSON).
 */

import type { ElectionDataset } from "./schema";

export async function initializeDatabase(
  _dataset: ElectionDataset
): Promise<null> {
  return null;
}
