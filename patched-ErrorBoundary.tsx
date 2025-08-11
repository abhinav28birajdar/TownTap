import React from 'react';
import { ScrollView, Text, View } from 'react-native';

interface ErrorBoundaryState {
  error: Error | null;
}

interface LogData {
  message: string;
  timestamp: number;
  error?: Error;
}

export class ErrorBoundary extends React.Component<{ children: React.ReactNode }, ErrorBoundaryState> {
  constructor(props: { children: React.ReactNode }) {
    super(props);
    this.state = { error: null };
  }

  static getDerivedStateFromError(error: Error) {
    return { error };
  }

  componentDidCatch(error: Error) {
    // You can log the error here
    console.error('Error caught by boundary:', error);
  }

  render() {
    if (!this.state.error) {
      return this.props.children;
    }

    const logData: LogData = {
      message: this.state.error.message,
      timestamp: Date.now(),
      error: this.state.error
    };

    return (
      <ScrollView style={{ flex: 1 }}>
        <View style={{ padding: 20 }}>
          <Text style={{ fontSize: 18, fontWeight: 'bold', marginBottom: 10 }}>
            Something went wrong
          </Text>
          <Text style={{ color: '#666' }}>
            {this.state.error.message}
          </Text>
          {__DEV__ && (
            <Text style={{ color: '#666', marginTop: 10 }}>
              {this.state.error.stack}
            </Text>
          )}
        </View>
      </ScrollView>
    );
  }
}
