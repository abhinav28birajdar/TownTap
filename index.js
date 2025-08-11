import { registerRootComponent } from 'expo';
import React from 'react';
import App from './App';
import { ErrorBoundary } from './patched-ErrorBoundary';

function RootComponent() {
  return React.createElement(
    ErrorBoundary,
    null,
    React.createElement(App, null)
  );
}

registerRootComponent(RootComponent);
