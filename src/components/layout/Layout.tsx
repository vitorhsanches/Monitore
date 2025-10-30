import { Header } from './Header';
import { Sidebar } from './Sidebar';
import { Navigation } from './Navigation';

interface LayoutProps {
  children: React.ReactNode;
}

export function Layout({ children }: LayoutProps) {
  return (
    <div className="min-h-screen bg-background">
      <Header />
      <div className="flex">
        <Sidebar />
        <main className="flex-1 pb-16 md:pb-0">
          {children}
        </main>
      </div>
      <Navigation />
    </div>
  );
}