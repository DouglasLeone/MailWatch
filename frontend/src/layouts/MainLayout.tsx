// Layout principal - Design Premium com Sidebar Moderna
import type { ReactNode } from 'react';
import { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { 
  LayoutDashboard, 
  Mail, 
  Clock, 
  PlusCircle, 
  List, 
  LogOut, 
  Menu, 
  X,
  Search,
  ChevronRight,
  Settings
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { cn } from '@/lib/utils';
import { useAuth } from '@/hooks/useAuth';

interface MainLayoutProps {
  children?: ReactNode;
}

const navItems = [
  { path: '/dashboard', label: 'Dashboard', icon: LayoutDashboard, badge: null },
  { path: '/pendentes', label: 'Pendentes', icon: Clock, badge: 'warning' },
  { path: '/cadastro-manual', label: 'Novo E-mail', icon: PlusCircle, badge: null },
  { path: '/lista-geral', label: 'Histórico', icon: List, badge: null },
];

export function MainLayout({ children }: MainLayoutProps) {
  const location = useLocation();
  const { user, logout } = useAuth();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const isActive = (path: string) => location.pathname === path;

  return (
    <div className="min-h-screen bg-background">
      {/* Sidebar Desktop */}
      <aside className="fixed left-0 top-0 z-40 hidden h-screen w-64 flex-col border-r border-sidebar-border bg-sidebar lg:flex">
        {/* Logo */}
        <div className="flex h-16 items-center gap-3 px-6">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-primary to-primary/80 shadow-glow">
            <Mail className="h-4.5 w-4.5 text-primary-foreground" />
          </div>
          <div className="flex flex-col">
            <span className="text-base font-bold text-sidebar-foreground tracking-tight">MailWatch</span>
            <span className="text-2xs text-sidebar-muted">Sistema de Gestão</span>
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex-1 space-y-1 px-3 overflow-y-auto">
          <p className="px-3 mb-2 text-2xs font-semibold uppercase tracking-wider text-sidebar-muted">
            Menu Principal
          </p>
          {navItems.map((item) => {
            const Icon = item.icon;
            const active = isActive(item.path);
            return (
              <Link
                key={item.path}
                to={item.path}
                className={cn(
                  "group flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-all duration-200",
                  active
                    ? "bg-gradient-to-r from-primary/20 to-primary/10 text-primary shadow-sm border-l-2 border-primary"
                    : "text-sidebar-foreground/70 hover:bg-sidebar-accent hover:text-sidebar-foreground"
                )}
              >
                <Icon className={cn(
                  "h-[18px] w-[18px] transition-colors",
                  active ? "text-primary" : "text-sidebar-muted group-hover:text-sidebar-foreground"
                )} />
                <span className="flex-1">{item.label}</span>
                {item.badge === 'warning' && (
                  <span className="flex h-5 min-w-5 items-center justify-center rounded-full bg-warning/20 px-1.5 text-2xs font-semibold text-warning">
                    !
                  </span>
                )}
                {active && <ChevronRight className="h-4 w-4 text-primary/60" />}
              </Link>
            );
          })}
        </nav>

        {/* User Section */}
        <div className="border-t border-sidebar-border p-4">
          <div className="flex items-center gap-3 mb-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-primary/30 to-primary/10 text-sm font-bold text-primary">
              {user?.nome?.charAt(0).toUpperCase() || 'U'}
            </div>
            <div className="flex-1 min-w-0">
              <p className="truncate text-sm font-semibold text-sidebar-foreground">{user?.nome || 'Usuário'}</p>
              <p className="truncate text-xs text-sidebar-muted">{user?.email || ''}</p>
            </div>
          </div>
          <div className="flex gap-2">
          
            <Button
              variant="ghost"
              size="icon"
              className="h-9 w-9 text-sidebar-foreground/70 hover:bg-destructive/10 hover:text-destructive"
              onClick={logout}
            >
              <LogOut className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </aside>

      {/* Header Desktop */}
      <header className="fixed left-64 right-0 top-0 z-30 hidden h-16 items-center justify-between border-b border-border bg-background/80 backdrop-blur-xl px-6 lg:flex">
        <div className="flex items-center gap-4">
          <h1 className="text-lg font-semibold text-foreground">
            {navItems.find(item => isActive(item.path))?.label || 'Dashboard'}
          </h1>
        </div>
        <div className="flex items-center gap-3" />
      </header>

      {/* Header Mobile */}
      <header className="fixed left-0 right-0 top-0 z-50 flex h-16 items-center justify-between border-b border-border bg-background/95 backdrop-blur-xl px-4 lg:hidden">
        <div className="flex items-center gap-3">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-primary to-primary/80 shadow-lg">
            <Mail className="h-4 w-4 text-primary-foreground" />
          </div>
          <span className="text-base font-bold text-foreground">MailWatch</span>
        </div>
        <Button
          variant="ghost"
          size="icon"
          onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          className="h-9 w-9"
        >
          {isMobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </Button>
      </header>

      {/* Mobile Menu Overlay */}
      {isMobileMenuOpen && (
        <>
          <div 
            className="fixed inset-0 z-40 bg-foreground/20 backdrop-blur-sm lg:hidden" 
            onClick={() => setIsMobileMenuOpen(false)}
          />
          <div className="fixed right-0 top-16 z-50 h-[calc(100vh-4rem)] w-72 bg-sidebar border-l border-sidebar-border shadow-2xl lg:hidden animate-slide-down">
            <nav className="p-4 space-y-1">
              {navItems.map((item) => {
                const Icon = item.icon;
                const active = isActive(item.path);
                return (
                  <Link
                    key={item.path}
                    to={item.path}
                    onClick={() => setIsMobileMenuOpen(false)}
                    className={cn(
                      "flex items-center gap-3 rounded-lg px-3 py-3 text-sm font-medium transition-all",
                      active
                        ? "bg-primary/20 text-primary"
                        : "text-sidebar-foreground/70 hover:bg-sidebar-accent hover:text-sidebar-foreground"
                    )}
                  >
                    <Icon className="h-5 w-5" />
                    {item.label}
                  </Link>
                );
              })}
            </nav>
            <div className="absolute bottom-0 left-0 right-0 p-4 border-t border-sidebar-border">
              <Button
                variant="ghost"
                className="w-full justify-start gap-3 text-sidebar-foreground/70 hover:bg-destructive/10 hover:text-destructive"
                onClick={() => {
                  setIsMobileMenuOpen(false);
                  logout();
                }}
              >
                <LogOut className="h-5 w-5" />
                Sair
              </Button>
            </div>
          </div>
        </>
      )}

      {/* Main Content */}
      <main className="min-h-screen pt-16 lg:ml-64 lg:pt-16">
        <div className="p-4 md:p-6 lg:p-8">
          {children}
        </div>
      </main>
    </div>
  );
}
