import type { LinksFunction } from "@react-router/node";

// Export types for route components
export type Route = {
  LinksFunction: LinksFunction;
  ErrorBoundaryProps: {
    error: unknown;
  };
};
