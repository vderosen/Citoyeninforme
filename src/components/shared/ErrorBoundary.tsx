import React from "react";
import { View, Text, Pressable } from "react-native";
import { router } from "expo-router";
import { captureException } from "../../services/crash-reporting";

interface ErrorBoundaryProps {
  children: React.ReactNode;
  fallback?: React.ReactNode;
}

interface ErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
}

export class ErrorBoundary extends React.Component<
  ErrorBoundaryProps,
  ErrorBoundaryState
> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo): void {
    captureException(error, {
      component: errorInfo.componentStack ?? "unknown",
    });
  }

  handleRetry = () => {
    this.setState({ hasError: false, error: null });
  };

  handleGoHome = () => {
    this.setState({ hasError: false, error: null });
    router.replace("/(tabs)");
  };

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback;
      }

      return (
        <View className="flex-1 items-center justify-center px-8 py-12 bg-warm-white">
          <Text className="text-4xl mb-4">⚠️</Text>
          <Text className="font-display-medium text-lg text-civic-navy text-center mb-2">
            Quelque chose s'est mal passé
          </Text>
          <Text className="font-body text-sm text-text-caption text-center mb-6">
            Une erreur inattendue s'est produite
          </Text>
          <Pressable
            onPress={this.handleRetry}
            className="bg-accent-coral rounded-lg px-6 py-3 mb-3"
            style={{ minHeight: 44 }}
            accessibilityRole="button"
            accessibilityLabel="Réessayer"
          >
            <Text className="font-body-medium text-text-inverse text-center">
              Réessayer
            </Text>
          </Pressable>
          <Pressable
            onPress={this.handleGoHome}
            className="bg-warm-gray rounded-lg px-6 py-3"
            style={{ minHeight: 44 }}
            accessibilityRole="button"
            accessibilityLabel="Retour à l'accueil"
          >
            <Text className="font-body-medium text-civic-navy text-center">
              Retour à l'accueil
            </Text>
          </Pressable>
        </View>
      );
    }

    return this.props.children;
  }
}
