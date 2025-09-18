"use client";

import React from 'react';
import { SidebarShell } from '@/components/SidebarShell';

export default function WithSidebarLayout({ children }: { children: React.ReactNode }) {
  return <SidebarShell>{children}</SidebarShell>;
}
