import { renderHook } from "@testing-library/react-native";
import { useNetworkStatus } from "../../src/hooks/useNetworkStatus";

const mockUseNetInfo = jest.fn();

jest.mock("@react-native-community/netinfo", () => ({
  useNetInfo: () => mockUseNetInfo(),
}));

describe("useNetworkStatus", () => {
  test("returns isConnected: true when connected", () => {
    mockUseNetInfo.mockReturnValue({
      isConnected: true,
      isInternetReachable: true,
    });

    const { result } = renderHook(() => useNetworkStatus());
    expect(result.current.isConnected).toBe(true);
    expect(result.current.isInternetReachable).toBe(true);
  });

  test("returns isConnected: false when disconnected", () => {
    mockUseNetInfo.mockReturnValue({
      isConnected: false,
      isInternetReachable: false,
    });

    const { result } = renderHook(() => useNetworkStatus());
    expect(result.current.isConnected).toBe(false);
  });

  test("treats null (initial state) as connected", () => {
    mockUseNetInfo.mockReturnValue({
      isConnected: null,
      isInternetReachable: null,
    });

    const { result } = renderHook(() => useNetworkStatus());
    // null !== false, so isConnected should be true
    expect(result.current.isConnected).toBe(true);
  });
});
