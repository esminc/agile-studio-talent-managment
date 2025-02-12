import type { LoaderFunction, MetaFunction } from "@remix-run/node";

export namespace Route {
  export type LoaderArgs = Parameters<LoaderFunction>[0];
  export type MetaArgs = Parameters<MetaFunction>[0];
  export type LinksFunction = () => { rel: string; href: string; crossOrigin?: string; }[];
  export type ErrorBoundaryProps = { error: unknown };
}
