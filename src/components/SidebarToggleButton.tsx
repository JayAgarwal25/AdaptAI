"use client";
import { useSidebar } from '@/components/ui/sidebar';
import { SidebarTrigger } from '@/components/ui/sidebar';

type SidebarToggleButtonProps = {
  position?: 'sidebar' | 'floating';
  className?: string;
};

export function SidebarToggleButton({ position, className }: SidebarToggleButtonProps) {
  const { state } = useSidebar();
  if (position === 'sidebar') {
    return <SidebarTrigger className={className} />;
  }
  if (position === 'floating' && state === 'collapsed') {
    return <SidebarTrigger className="fixed top-2 left-2 z-50 md:inline-flex transition-all duration-300" />;
  }
  return null;
}
