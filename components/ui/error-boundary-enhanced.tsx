import { useColors } from '@/contexts/theme-context';
import React, { Component, ErrorInfo, ReactNode } from 'react';
import { ScrollView, StyleSheet, View } from 'react-native';
import { ThemedButton } from './themed-button';
import { ThemedText } from './themed-text-enhanced';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
  onError?: (error: Error, errorInfo: ErrorInfo) => void;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

class ErrorBoundaryClass extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
    };
  }

  static getDerivedStateFromError(error: Error): State {
    return {
      hasError: true,
      error,
    };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('ErrorBoundary caught an error:', error, errorInfo);
    this.props.onError?.(error, errorInfo);
  }

  handleReset = () => {
    this.setState({
      hasError: false,
      error: null,
    });
  };

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback;
      }

      return <ErrorFallback error={this.state.error} onReset={this.handleReset} />;
    }

    return this.props.children;
  }
}

function ErrorFallback({ error, onReset }: { error: Error | null; onReset: () => void }) {
  const colors = useColors();

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <ScrollView
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        <View style={[styles.iconContainer, { backgroundColor: colors.errorBg }]}>
          <ThemedText variant="displayMedium">⚠️</ThemedText>
        </View>

        <ThemedText variant="headlineMedium" align="center" style={styles.title}>
          Something went wrong
        </ThemedText>

        <ThemedText variant="bodyMedium" color="secondary" align="center" style={styles.message}>
          We're sorry for the inconvenience. The app encountered an unexpected error.
        </ThemedText>

        {__DEV__ && error && (
          <View style={[styles.errorDetails, { backgroundColor: colors.errorBg, borderColor: colors.error }]}>
            <ThemedText variant="labelSmall" color="error" weight="semibold">
              Error Details (Dev Only)
            </ThemedText>
            <ThemedText variant="bodySmall" color="error" style={styles.errorText}>
              {error.toString()}
            </ThemedText>
            {error.stack && (
              <ThemedText variant="bodySmall" color="error" style={styles.errorStack}>
                {error.stack}
              </ThemedText>
            )}
          </View>
        )}

        <ThemedButton
          title="Try Again"
          variant="primary"
          size="large"
          fullWidth
          onPress={onReset}
          icon="refresh-outline"
        />
      </ScrollView>
    </View>
  );
}

export const ErrorBoundary = ErrorBoundaryClass;

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    flexGrow: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  iconContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 24,
  },
  title: {
    marginBottom: 12,
  },
  message: {
    marginBottom: 32,
    maxWidth: 300,
  },
  errorDetails: {
    width: '100%',
    padding: 16,
    borderRadius: 8,
    borderWidth: 1,
    marginBottom: 24,
  },
  errorText: {
    marginTop: 8,
  },
  errorStack: {
    marginTop: 8,
    fontSize: 10,
  },
});
