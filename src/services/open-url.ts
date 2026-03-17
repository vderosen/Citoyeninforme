import { Linking } from "react-native";
import * as WebBrowser from "expo-web-browser";

const HTTP_URL_REGEX = /^https?:\/\//i;

/**
 * Open an external URL without throwing on unsupported devices/schemes.
 * Returns true when an opener was successfully triggered.
 */
export async function openExternalUrl(url: string): Promise<boolean> {
  if (!url) {
    return false;
  }

  if (HTTP_URL_REGEX.test(url)) {
    try {
      await WebBrowser.openBrowserAsync(url);
      return true;
    } catch {
      // Fall back to native URL opener when browser API fails.
    }
  }

  try {
    const canOpen = await Linking.canOpenURL(url);
    if (!canOpen) {
      return false;
    }

    await Linking.openURL(url);
    return true;
  } catch {
    return false;
  }
}
