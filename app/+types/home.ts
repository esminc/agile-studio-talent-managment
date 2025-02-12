import type { LoaderFunction, MetaFunction } from "@remix-run/node";

export type LoaderArgs = Parameters<LoaderFunction>[0];
export type MetaArgs = Parameters<MetaFunction>[0];
