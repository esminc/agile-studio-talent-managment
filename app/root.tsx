import { Amplify } from "aws-amplify";
import config from "./amplify_outputs.json";
// Configure Amplify for SSR
// Configure Amplify for SSR with minimal configuration
Amplify.configure(
  {
    Auth: {
      Cognito: {
        userPoolId: config.auth.userPoolId,
        userPoolClientId: config.auth.userPoolClientId,
        identityPoolId: config.auth.identityPoolId,
      },
    },
  },
  { ssr: true },
);

import {
  isRouteErrorResponse,
  Links,
  Meta,
  Outlet,
  Scripts,
  ScrollRestoration,
} from "react-router";
// Type definitions for Route functions
type LinksFunction = () => Array<{
  rel: string;
  href: string;
  crossOrigin?: string;
}>;
type LoaderFunction = (args: { request: Request }) => Promise<unknown>;
type ErrorBoundaryProps = { error: unknown };
import { Authenticator, ThemeProvider } from "@aws-amplify/ui-react";
import "@aws-amplify/ui-react/styles.css";
import { ProtectedLayout } from "./components/protected-layout";
import "./app.css";

export const links: LinksFunction = () => [
  { rel: "preconnect", href: "https://fonts.googleapis.com" },
  {
    rel: "preconnect",
    href: "https://fonts.gstatic.com",
    crossOrigin: "anonymous",
  },
  {
    rel: "stylesheet",
    href: "https://fonts.googleapis.com/css2?family=Inter:ital,opsz,wght@0,14..32,100..900;1,14..32,100..900&display=swap",
  },
];

export const loader: LoaderFunction = async ({ request }) => {
  const url = new URL(request.url);
  const pathname = url.pathname;

  // Skip authentication check for login page
  if (pathname === "/login") {
    return { user: null };
  }

  try {
    const { getCurrentUser } = await import("./utils/auth.server");
    const user = await getCurrentUser();
    return { user };
  } catch (error) {
    console.error("Error getting current user:", error);
    return { user: null };
  }
};

export function Layout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <head>
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <Meta />
        <Links />
      </head>
      <body>
        <Authenticator.Provider>
          <ThemeProvider>{children}</ThemeProvider>
        </Authenticator.Provider>
        <ScrollRestoration />
        <Scripts />
      </body>
    </html>
  );
}

export default function App() {
  return (
    <ProtectedLayout>
      <Outlet />
    </ProtectedLayout>
  );
}

export function ErrorBoundary({ error }: ErrorBoundaryProps) {
  let message = "Oops!";
  let details = "An unexpected error occurred.";
  let stack: string | undefined;

  if (isRouteErrorResponse(error)) {
    message = error.status === 404 ? "404" : "Error";
    details =
      error.status === 404
        ? "The requested page could not be found."
        : error.statusText || details;
  } else if (import.meta.env.DEV && error && error instanceof Error) {
    details = error.message;
    stack = error.stack;
  }

  return (
    <main className="pt-16 p-4 container mx-auto">
      <h1>{message}</h1>
      <p>{details}</p>
      {stack && (
        <pre className="w-full p-4 overflow-x-auto">
          <code>{stack}</code>
        </pre>
      )}
    </main>
  );
}
