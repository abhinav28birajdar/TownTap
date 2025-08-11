import { registerRootComponent } from 'expo';
import { Stack } from 'expo-router';
import React from 'react';
import { ErrorBoundary } from './patched-ErrorBoundary';

export function withExpoRouter(App: React.ComponentType<any>) {
  function ExpoRoot() {
    return React.createElement(
      ErrorBoundary,
      null,
      React.createElement(
        Stack,
        null,
        React.createElement(App, null)
      )
    );
  }

  registerRootComponent(ExpoRoot);
}
