// TEMPLATE — reference only. V0 reads this to learn the Rosedale sign-in
// page composition (centered card, brand wordmark, Continue-with-Google
// button, hint copy, optional error banner). Not routed by Next.js —
// templates/ is excluded from compilation and lives outside app/.
//
// Composition rules demonstrated here:
//   - Centered layout: min-h-screen + flex items-center/justify-center
//   - White bg (demos don't have dark mode). The login page is the one
//     place in the shell that breaks out of the surface-main panel look.
//   - Wordmark block: small brand wordmark + "Sign in to continue" caption
//   - Single primary CTA — "Continue with Google" — h-11, full width,
//     white fill with 1px gray border, phosphor GoogleLogo icon
//   - Hint copy below the CTA explaining the org-restriction
//   - Error banner state (rose-50 / rose-700 pattern) when auth fails
//
// V0 should mirror this when a demo's brief mentions authentication,
// role-based access, or a sign-in gate. The button is inert in the demo;
// clicking it does NOT trigger OAuth — demos don't have a real auth layer.

"use client";

import { GoogleLogo } from "@phosphor-icons/react";
import { Button } from "@/components/ui/button";

export default function LoginPageTemplate() {
  // Hard-coded for the mock — V0 swaps in the client-specific brand name
  // and copy per demo, but keeps the layout identical.
  const brandName = "Rosedale OS";
  const orgDomain = "rosedale.ai";
  const errorMessage: string | null = null; // set to a string to see the banner

  return (
    <main className="min-h-screen flex items-center justify-center bg-white px-6">
      <div className="w-full max-w-sm flex flex-col items-center gap-8">
        <div className="flex flex-col items-center gap-2">
          <h1 className="text-2xl font-semibold tracking-tight text-gray-900">
            {brandName}
          </h1>
          <p className="text-sm text-gray-500">Sign in to continue</p>
        </div>

        <div className="w-full flex flex-col gap-3">
          <Button
            type="button"
            className="h-11 w-full gap-2 bg-white text-gray-900 border border-gray-200 hover:bg-gray-50"
            size="lg"
          >
            <GoogleLogo weight="bold" className="size-5" />
            <span className="font-medium">Continue with Google</span>
          </Button>
          <p className="text-xs text-center text-gray-500">
            Team members only. Sign in with your @{orgDomain} Google account.
          </p>
        </div>

        {errorMessage && (
          <div
            role="alert"
            className="w-full rounded-md border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-800"
          >
            {errorMessage}
          </div>
        )}
      </div>
    </main>
  );
}
