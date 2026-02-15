import { useNetInfo } from "@react-native-community/netinfo";

interface NetworkStatus {
  isConnected: boolean;
  isInternetReachable: boolean | null;
}

export function useNetworkStatus(): NetworkStatus {
  const netInfo = useNetInfo();

  return {
    // Treat null (initial state) as connected to avoid false offline on startup
    isConnected: netInfo.isConnected !== false,
    isInternetReachable: netInfo.isInternetReachable,
  };
}
