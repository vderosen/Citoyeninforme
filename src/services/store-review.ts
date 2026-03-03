import Constants from "expo-constants";
import * as Linking from "expo-linking";
import * as StoreReview from "expo-store-review";
import { Platform } from "react-native";

const APP_STORE_REVIEW_URL = "https://apps.apple.com/app/id6759607258?action=write-review";
const ANDROID_PACKAGE_NAME = "com.vderosen.citoyeninforme";

export async function openStoreListing(): Promise<void> {
  if (Platform.OS === "ios") {
    await Linking.openURL(APP_STORE_REVIEW_URL);
    return;
  }

  if (Platform.OS === "android") {
    const packageName = Constants.expoConfig?.android?.package ?? ANDROID_PACKAGE_NAME;
    const marketUrl = `market://details?id=${packageName}`;
    const webUrl = `https://play.google.com/store/apps/details?id=${packageName}`;

    const canOpenMarket = await Linking.canOpenURL(marketUrl);
    await Linking.openURL(canOpenMarket ? marketUrl : webUrl);
  }
}

export async function requestNativeStoreReview(): Promise<boolean> {
  try {
    const isAvailable = await StoreReview.isAvailableAsync();
    if (isAvailable) {
      await StoreReview.requestReview();
      return true;
    }
  } catch {
    // A native prompt request can fail; caller should decide fallback UX.
  }

  return false;
}
