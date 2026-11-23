import React, { type PropsWithChildren } from 'react';
import { ExpoRoot } from 'expo-router';
import { EditionProvider } from './src/context/SessionContext';
import type { UserRole } from './src/services/authService';

declare const require: NodeRequire & {
  context: (directory: string, recursive: boolean, pattern: RegExp) => React.ComponentProps<typeof ExpoRoot>['context'];
};

const routes = require.context('./src/app', true, /\.[jt]sx?$/);

export default function App({ requiredRole }: { requiredRole: UserRole }) {
  function Edition({ children }: PropsWithChildren) {
    return <EditionProvider value={requiredRole}>{children}</EditionProvider>;
  }
  return <ExpoRoot context={routes} wrapper={Edition} />;
}
