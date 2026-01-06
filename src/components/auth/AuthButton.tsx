import React from 'react';
import { SignedIn, SignedOut, SignInButton, UserButton } from '@clerk/clerk-react';

export const AuthButton: React.FC = () => {
  return (
    <div className="fixed top-4 right-4 z-50">
      <SignedOut>
        <SignInButton mode="modal">
          <button className="px-4 py-2 bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 rounded-lg font-bold shadow-lg transition-all duration-200 hover:scale-105">
            🔐 Accedi con Google
          </button>
        </SignInButton>
      </SignedOut>
      <SignedIn>
        <div className="flex items-center gap-2">
          <UserButton 
            afterSignOutUrl="/"
            appearance={{
              elements: {
                avatarBox: "w-10 h-10 border-2 border-purple-500 shadow-lg hover:border-purple-400 transition-colors"
              }
            }}
          />
        </div>
      </SignedIn>
    </div>
  );
};
