import {
  isStoreVersionNewer,
  shouldRunMandatoryUpdateCheck,
} from "../../src/services/mandatory-update";

describe("mandatory update version check", () => {
  test("returns true when store version is newer", () => {
    expect(isStoreVersionNewer("1.1.2", "1.1.3")).toBe(true);
    expect(isStoreVersionNewer("1.1.2", "1.2.0")).toBe(true);
    expect(isStoreVersionNewer("1.1.2", "2.0.0")).toBe(true);
  });

  test("returns false when versions are equal", () => {
    expect(isStoreVersionNewer("1.1.2", "1.1.2")).toBe(false);
  });

  test("returns false when current version is newer", () => {
    expect(isStoreVersionNewer("1.2.0", "1.1.9")).toBe(false);
  });

  test("handles different segment lengths", () => {
    expect(isStoreVersionNewer("1.1", "1.1.1")).toBe(true);
    expect(isStoreVersionNewer("1.1.0", "1.1")).toBe(false);
  });
});

describe("mandatory update execution guard", () => {
  test("runs only in production-like standalone context", () => {
    expect(
      shouldRunMandatoryUpdateCheck({
        appEnv: "production",
        appOwnership: "standalone",
        isDev: false,
      })
    ).toBe(true);
  });

  test("skips in development", () => {
    expect(
      shouldRunMandatoryUpdateCheck({
        appEnv: "production",
        appOwnership: "standalone",
        isDev: true,
      })
    ).toBe(false);
  });

  test("skips when app env is not production", () => {
    expect(
      shouldRunMandatoryUpdateCheck({
        appEnv: "development",
        appOwnership: "standalone",
        isDev: false,
      })
    ).toBe(false);
  });

  test("skips in Expo Go or guest ownership", () => {
    expect(
      shouldRunMandatoryUpdateCheck({
        appEnv: "production",
        appOwnership: "expo",
        isDev: false,
      })
    ).toBe(false);

    expect(
      shouldRunMandatoryUpdateCheck({
        appEnv: "production",
        appOwnership: "guest",
        isDev: false,
      })
    ).toBe(false);
  });
});
