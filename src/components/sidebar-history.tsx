'use client';

import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { useState } from 'react';
import { History, Trash2, FileText, LayoutDashboard, BookOpen, MessageSquare } from 'lucide-react';
import { useLocalStorage } from '@/hooks/use-local-storage';
import {
  SidebarGroup,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarGroupAction,
} from '@/components/ui/sidebar';
import type { HistoryItem } from '@/types';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import { Button } from '@/components/ui/button';

export function SidebarHistory({ history, setHistory }: { history: HistoryItem[]; setHistory: (value: HistoryItem[] | ((val: HistoryItem[]) => HistoryItem[])) => void }) {
  const searchParams = useSearchParams();
  const activeHistoryId = searchParams?.get('historyId') ?? null;
  const clearHistory = () => {
    setHistory([]);
  };

  return (
    <>
      {/* Quick navigation buttons above History */}
      <SidebarGroup>
        <SidebarMenu>
          <SidebarMenuItem>
            <Link href="/" className="w-full" scroll={false}>
              <SidebarMenuButton className="w-full" tooltip={{ children: 'Chat', side: 'right' }}>
                <MessageSquare />
                <span>Chat</span>
              </SidebarMenuButton>
            </Link>
          </SidebarMenuItem>
          <SidebarMenuItem>
            <Link href="/dashboard" className="w-full" scroll={false}>
              <SidebarMenuButton className="w-full" tooltip={{ children: 'Dashboard', side: 'right' }}>
                <LayoutDashboard />
                <span>Dashboard</span>
              </SidebarMenuButton>
            </Link>
          </SidebarMenuItem>
          <SidebarMenuItem>
            <Link href="/library" className="w-full" scroll={false}>
              <SidebarMenuButton className="w-full" tooltip={{ children: 'Library', side: 'right' }}>
                <BookOpen />
                <span>Library</span>
              </SidebarMenuButton>
            </Link>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarGroup>

      <SidebarGroup>
      <SidebarGroupLabel className="flex items-center">
        <History className="mr-2 size-4" />
        History
      </SidebarGroupLabel>
      {history.length > 0 && (
        <AlertDialog>
          <AlertDialogTrigger asChild>
            <SidebarGroupAction aria-label="Clear history">
              <Trash2 />
            </SidebarGroupAction>
          </AlertDialogTrigger>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
              <AlertDialogDescription>
                This action cannot be undone. This will permanently delete your
                generation history.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancel</AlertDialogCancel>
              <AlertDialogAction onClick={clearHistory}>Continue</AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      )}
      <SidebarMenu>
        {history.length > 0 ? (
          history.map((item) => (
            <SidebarMenuItem key={item.id}>
              <Link href={`/?historyId=${item.id}`} className="w-full" scroll={false}>
                <SidebarMenuButton
                  isActive={activeHistoryId === item.id}
                  className="w-full"
                  tooltip={{
                    children: item.input.content.substring(0, 100) + '...',
                    side: 'right',
                  }}
                >
                  <FileText />
                  <span>
                    {item.input.content.substring(0, 20) +
                      (item.input.content.length > 20 ? '...' : '')}
                  </span>
                </SidebarMenuButton>
              </Link>
            </SidebarMenuItem>
          ))
        ) : (
          <div className="p-4 text-sm text-sidebar-foreground/50">
            No history yet. Generate some content to see it here.
          </div>
        )}
      </SidebarMenu>
    </SidebarGroup>
    </>
  );
}
