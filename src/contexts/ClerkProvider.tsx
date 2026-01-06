import React from 'react';
import { ClerkProvider as BaseClerkProvider } from '@clerk/clerk-react';

const CLERK_PUBLISHABLE_KEY = import.meta.env.VITE_CLERK_PUBLISHABLE_KEY;

if (!CLERK_PUBLISHABLE_KEY) {
  throw new Error('Missing Clerk Publishable Key');
}

interface ClerkProviderProps {
  children: React.ReactNode;
}

export const ClerkProvider: React.FC<ClerkProviderProps> = ({ children }) => {
  return (
    <BaseClerkProvider publishableKey={CLERK_PUBLISHABLE_KEY}>
      {children}
    </BaseClerkProvider>
  );
};
