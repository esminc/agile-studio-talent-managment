import * as React from "react";
import { SidebarProvider, SidebarTrigger } from "./ui/sidebar";
import { AppSidebar } from "./app-sidebar";

export type Account = { name: string; email: string; photo?: string | null };

export function BaseLayout({
  children,
  account,
}: {
  account: Account;
  children: React.ReactNode;
}) {
  return (
    <SidebarProvider>
      <AppSidebar account={account} />
      <main className="w-full">
        <SidebarTrigger />
        {children}
      </main>
    </SidebarProvider>
  );
}
