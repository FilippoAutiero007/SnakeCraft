import { ClerkProvider, SignedIn, SignedOut, SignInButton, UserButton } from "@clerk/nextjs";
import type { Metadata } from "next";
import "../index.css";

export const metadata: Metadata = {
  title: "SnakeCraft",
  description: "A fun and challenging snake game with biomes, bosses, and power-ups",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <ClerkProvider>
      <html lang="it">
        <head>
          <meta charSet="utf-8" />
          <meta name="viewport" content="width=device-width, initial-scale=1" />
        </head>
        <body className="bg-background text-foreground">
          <div id="auth-top-right" className="fixed top-4 right-4 z-50">
            <SignedOut>
              <SignInButton mode="modal" />
            </SignedOut>
            <SignedIn>
              <UserButton />
            </SignedIn>
          </div>
          {children}
        </body>
      </html>
    </ClerkProvider>
  );
}
