import {
  Sidebar,
  SidebarContent,
  SidebarHeader,
  SidebarInset,
  SidebarTrigger,
} from '@/components/ui/sidebar';
import { SidebarHistory } from '@/components/sidebar-history';
import { ContentRepurposer } from '@/components/content-repurposer';
import { Logo } from '@/components/icons';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import { PanelLeft } from 'lucide-react';

export default function Home() {
  return (
    <>
      <Sidebar>
        <SidebarHeader>
          <Link
            href="/"
            className="flex items-center gap-2 font-headline font-semibold text-lg text-sidebar-foreground hover:text-sidebar-primary transition-colors"
          >
            <Logo className="size-7" />
            <span>Adapt AI</span>
          </Link>
        </SidebarHeader>
        <SidebarContent>
          <SidebarHistory />
        </SidebarContent>
      </Sidebar>
      <SidebarInset>
        <header className="sticky top-0 z-10 flex h-14 items-center gap-4 border-b bg-background/80 px-4 backdrop-blur-sm sm:static sm:h-auto sm:border-0 sm:bg-transparent sm:px-6 sm:pt-4">
          <SidebarTrigger className="md:hidden" />
          <div className="flex-1" />
        </header>
        <main className="flex-1 p-4 sm:p-6">
          <div className="max-w-4xl mx-auto">
            <h1 className="text-3xl md:text-4xl font-headline font-bold mb-2">
              Educate India, in every language.
            </h1>
            <p className="text-muted-foreground mb-8">
              Our AI instantly transforms educational content to reach every corner of India, breaking language barriers and saving hundreds of hours of manual work.
            </p>
            <ContentRepurposer />
          </div>
        </main>
      </SidebarInset>
    </>
  );
}
