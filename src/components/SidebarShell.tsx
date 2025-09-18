"use client";

import React from 'react';
import {
  Sidebar,
  SidebarContent,
  SidebarHeader,
  SidebarInset,
  SidebarTrigger,
  SidebarFooter,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
} from '@/components/ui/sidebar';
import { Logo } from '@/components/icons';
import { SidebarToggleButton } from '@/components/SidebarToggleButton';
import { ThemeToggle } from '@/components/theme-toggle';
import { LogIn, UserPlus } from 'lucide-react';
import Link from 'next/link';
import { SidebarHistory } from '@/components/sidebar-history';
import { useLocalStorage } from '@/hooks/use-local-storage';

export function SidebarShell({ children }: { children: React.ReactNode }) {
  const [history, setHistory] = useLocalStorage<import('@/types').HistoryItem[]>(
    'adapt-ai-history',
    []
  );
  return (
    <>
      <Sidebar>
        <SidebarHeader className="flex items-center gap-2">
          <div className="relative flex items-center gap-2 w-full">
            <Link
              href="/"
              className="flex items-center gap-2 font-headline font-semibold text-lg text-sidebar-foreground hover:text-sidebar-primary transition-colors"
            >
              <Logo className="size-7" />
              <span className="group-data-[collapsible=icon]:hidden">Adapt AI</span>
            </Link>
            <div className="flex items-center gap-2 absolute right-2 top-1/2 -translate-y-1/2">
              <ThemeToggle />
              <SidebarToggleButton position="sidebar" />
            </div>
          </div>
        </SidebarHeader>
        <SidebarContent>
          {/* Use the same History sidebar so there is only one sidebar across pages */}
          <SidebarHistory history={history} setHistory={setHistory} />
        </SidebarContent>
        <SidebarFooter className="border-t border-sidebar-border">
          <SidebarMenu>
            <SidebarMenuItem>
              <SidebarMenuButton tooltip="Sign Up">
                <UserPlus />
                <span>Sign Up</span>
              </SidebarMenuButton>
            </SidebarMenuItem>
            <SidebarMenuItem>
              <SidebarMenuButton tooltip="Login">
                <LogIn />
                <span>Login</span>
              </SidebarMenuButton>
            </SidebarMenuItem>
          </SidebarMenu>
        </SidebarFooter>
      </Sidebar>
      <SidebarToggleButton position="floating" />
      <SidebarInset>
        <header className="sticky top-0 z-10 flex h-14 items-center gap-4 border-b bg-background/80 px-4 backdrop-blur-sm sm:static sm:h-auto sm:border-0 sm:bg-transparent sm:px-6 sm:pt-4">
          <SidebarTrigger className="md:hidden" />
          <div className="flex-1" />
        </header>
        <main className="flex-1 p-4 sm:p-6">
          <div className="max-w-4xl mx-auto">{children}</div>
        </main>
      </SidebarInset>
    </>
  );
}
