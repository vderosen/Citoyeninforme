import Constants from "expo-constants";
import { Platform } from "react-native";

interface MandatoryUpdateCheckResult {
  isRequired: boolean;
  storeUrl: string | null;
}

interface MandatoryUpdateExecutionContext {
  appEnv?: string;
  appOwnership?: string | null;
  isDev: boolean;
}

interface AppleLookupResult {
  version?: string;
  trackViewUrl?: string;
}

interface AppleLookupResponse {
  resultCount: number;
  results: AppleLookupResult[];
}

const ITUNES_LOOKUP_BASE_URL = "https://itunes.apple.com/lookup";
const LOOKUP_COUNTRY = "fr";
const LOOKUP_TIMEOUT_MS = 6000;

export function shouldRunMandatoryUpdateCheck({
  appEnv,
  appOwnership,
  isDev,
}: MandatoryUpdateExecutionContext): boolean {
  if (isDev) return false;
  if (appOwnership && appOwnership !== "standalone") return false;
  if (appEnv && appEnv !== "production") return false;
  return true;
}

function normalizeVersion(version: string): number[] {
  return version
    .split(".")
    .map((segment) => Number.parseInt(segment, 10))
    .map((value) => (Number.isNaN(value) ? 0 : value));
}

export function isStoreVersionNewer(currentVersion: string, storeVersion: string): boolean {
  const currentParts = normalizeVersion(currentVersion);
  const storeParts = normalizeVersion(storeVersion);
  const length = Math.max(currentParts.length, storeParts.length);

  for (let index = 0; index < length; index += 1) {
    const current = currentParts[index] ?? 0;
    const store = storeParts[index] ?? 0;
    if (store > current) return true;
    if (store < current) return false;
  }

  return false;
}

async function fetchLatestIosStoreMetadata(bundleId: string): Promise<AppleLookupResult | null> {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), LOOKUP_TIMEOUT_MS);

  try {
    const params = new URLSearchParams({ bundleId, country: LOOKUP_COUNTRY });
    const response = await fetch(`${ITUNES_LOOKUP_BASE_URL}?${params.toString()}`, {
      signal: controller.signal,
    });

    if (!response.ok) return null;

    const payload = (await response.json()) as AppleLookupResponse;
    if (payload.resultCount < 1 || payload.results.length === 0) return null;

    return payload.results[0] ?? null;
  } catch {
    return null;
  } finally {
    clearTimeout(timeoutId);
  }
}

export async function checkMandatoryUpdate(): Promise<MandatoryUpdateCheckResult> {
  if (
    !shouldRunMandatoryUpdateCheck({
      appEnv: process.env.EXPO_PUBLIC_APP_ENV,
      appOwnership: Constants.appOwnership,
      isDev: __DEV__,
    })
  ) {
    return { isRequired: false, storeUrl: null };
  }

  const currentVersion = Constants.expoConfig?.version;
  if (!currentVersion) {
    return { isRequired: false, storeUrl: null };
  }

  if (Platform.OS === "ios") {
    const bundleId = Constants.expoConfig?.ios?.bundleIdentifier;
    if (!bundleId) {
      return { isRequired: false, storeUrl: null };
    }

    const metadata = await fetchLatestIosStoreMetadata(bundleId);
    const storeVersion = metadata?.version;
    const storeUrl = metadata?.trackViewUrl ?? null;

    if (!storeVersion || !storeUrl) {
      return { isRequired: false, storeUrl: null };
    }

    return {
      isRequired: isStoreVersionNewer(currentVersion, storeVersion),
      storeUrl,
    };
  }

  return { isRequired: false, storeUrl: null };
}
