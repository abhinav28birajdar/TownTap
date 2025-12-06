import { Colors } from '@/constants/colors';
import { Typography } from '@/constants/theme';
import React, { Component, ErrorInfo, ReactNode } from 'react';
import {
    Platform,
    ScrollView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from 'react-native';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
  onError?: (error: Error, errorInfo: ErrorInfo) => void;
}

interface State {
  hasError: boolean;
  error: Error | null;
  errorInfo: ErrorInfo | null;
}

export class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
      errorInfo: null,
    };
  }

  static getDerivedStateFromError(error: Error): State {
    return {
      hasError: true,
      error,
      errorInfo: null,
    };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('Error caught by ErrorBoundary:', error, errorInfo);
    
    this.setState({
      error,
      errorInfo,
    });

    // Call custom error handler if provided
    if (this.props.onError) {
      this.props.onError(error, errorInfo);
    }
  }

  handleReset = () => {
    this.setState({
      hasError: false,
      error: null,
      errorInfo: null,
    });
  };

  render() {
    if (this.state.hasError) {
      // Use custom fallback if provided
      if (this.props.fallback) {
        return this.props.fallback;
      }

      // Default error UI
      return (
        <View style={styles.container}>
          <ScrollView 
            contentContainerStyle={styles.content}
            showsVerticalScrollIndicator={false}
          >
            <View style={styles.iconContainer}>
              <Text style={styles.icon}>⚠️</Text>
            </View>

            <Text style={styles.title}>Oops! Something went wrong</Text>
            <Text style={styles.subtitle}>
              We're sorry for the inconvenience. The app encountered an unexpected error.
            </Text>

            <TouchableOpacity
              style={styles.button}
              onPress={this.handleReset}
              activeOpacity={0.7}
            >
              <Text style={styles.buttonText}>Try Again</Text>
            </TouchableOpacity>

            {__DEV__ && this.state.error && (
              <View style={styles.debugContainer}>
                <Text style={styles.debugTitle}>Debug Information:</Text>
                
                <View style={styles.debugSection}>
                  <Text style={styles.debugLabel}>Error:</Text>
                  <Text style={styles.debugText}>{this.state.error.toString()}</Text>
                </View>

                {this.state.error.stack && (
                  <View style={styles.debugSection}>
                    <Text style={styles.debugLabel}>Stack Trace:</Text>
                    <ScrollView 
                      style={styles.stackTraceContainer}
                      horizontal
                      showsHorizontalScrollIndicator={false}
                    >
                      <Text style={styles.debugText}>{this.state.error.stack}</Text>
                    </ScrollView>
                  </View>
                )}

                {this.state.errorInfo && (
                  <View style={styles.debugSection}>
                    <Text style={styles.debugLabel}>Component Stack:</Text>
                    <ScrollView 
                      style={styles.stackTraceContainer}
                      horizontal
                      showsHorizontalScrollIndicator={false}
                    >
                      <Text style={styles.debugText}>
                        {this.state.errorInfo.componentStack}
                      </Text>
                    </ScrollView>
                  </View>
                )}
              </View>
            )}
          </ScrollView>
        </View>
      );
    }

    return this.props.children;
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.light.background,
  },
  content: {
    flexGrow: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  iconContainer: {
    marginBottom: 24,
  },
  icon: {
    fontSize: 64,
  },
  title: {
    ...Typography.styles.headline.large,
    color: Colors.light.text,
    textAlign: 'center',
    marginBottom: 12,
  },
  subtitle: {
    ...Typography.styles.body.large,
    color: Colors.light.textSecondary,
    textAlign: 'center',
    marginBottom: 32,
    maxWidth: 400,
  },
  button: {
    backgroundColor: Colors.light.primary,
    paddingVertical: 14,
    paddingHorizontal: 32,
    borderRadius: 8,
    marginBottom: 24,
  },
  buttonText: {
    ...Typography.styles.label.large,
    color: '#FFFFFF',
    fontSize: 16,
  },
  debugContainer: {
    width: '100%',
    marginTop: 24,
    padding: 16,
    backgroundColor: '#f5f5f5',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#e0e0e0',
  },
  debugTitle: {
    ...Typography.styles.headline.small,
    color: Colors.light.text,
    marginBottom: 12,
  },
  debugSection: {
    marginBottom: 16,
  },
  debugLabel: {
    ...Typography.styles.label.large,
    color: Colors.light.text,
    marginBottom: 4,
  },
  debugText: {
    ...Typography.styles.body.small,
    color: Colors.light.textSecondary,
    fontFamily: Platform.OS === 'ios' ? 'Menlo' : 'monospace',
  },
  stackTraceContainer: {
    maxHeight: 200,
    backgroundColor: '#ffffff',
    padding: 8,
    borderRadius: 4,
  },
});
