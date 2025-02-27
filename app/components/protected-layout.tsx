import * as React from "react";
import { useAuthenticator } from "@aws-amplify/ui-react";
import { Navigate, useLoaderData } from "react-router";
import { SidebarProvider, SidebarTrigger } from "./ui/sidebar";
import { AppSidebar } from "./app-sidebar";

export function ProtectedLayout({ children }: { children: React.ReactNode }) {
  const { authStatus } = useAuthenticator((context) => [context.authStatus]);
  const { user } = useLoaderData() || { user: null };

  // Check authentication status from both client and server
  const isAuthenticated = authStatus === "authenticated" || !!user;

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  return (
    <SidebarProvider>
      <AppSidebar />
      <main>
        <SidebarTrigger />
        {children}
      </main>
    </SidebarProvider>
  );
}
