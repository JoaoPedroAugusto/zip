import React, { useState } from 'react';
import {
  Tractor, BrainCircuit, Users, Settings, LogOut, Menu, X,
  ChevronRight, LayoutDashboard, Banknote, ShieldCheck, Bell,
  Wallet, CreditCard, BarChart3, Bird, BellRing,
} from 'lucide-react';
import { useAuth } from './lib/auth';
import { useStore } from './lib/store';
import { cn, getInitials } from './lib/utils';

import LoginPage from './pages/LoginPage';
import DashboardPage from './pages/DashboardPage';
import ProductionPage from './pages/ProductionPage';
import MarketPage from './pages/MarketPage';
import PartnersPage from './pages/PartnersPage';
import CashFlowPage from './pages/CashFlowPage';
import SettingsPage from './pages/SettingsPage';

type Page = 'dashboard' | 'financeiro' | 'producao' | 'mercado' | 'socios' | 'config';

const NAV_ITEMS: { id: Page; label: string; icon: React.ReactNode }[] = [
  { id: 'dashboard', label: 'Dashboard', icon: <LayoutDashboard className="w-5 h-5" /> },
  { id: 'financeiro', label: 'Financeiro', icon: <Banknote className="w-5 h-5" /> },
  { id: 'producao', label: 'Produção', icon: <Tractor className="w-5 h-5" /> },
  { id: 'mercado', label: 'Mercado AI', icon: <BrainCircuit className="w-5 h-5" /> },
  { id: 'socios', label: 'Sócios', icon: <Users className="w-5 h-5" /> },
  { id: 'config', label: 'Configurações', icon: <Settings className="w-5 h-5" /> },
];

export default function App() {
  const { user, isAuthenticated, logout } = useAuth();
  const { notifications, markNotificationRead, markAllNotificationsRead, settings } = useStore();
  const [activePage, setActivePage] = useState<Page>('dashboard');
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);

  if (!isAuthenticated) {
    return <LoginPage />;
  }

  // Filter notifications: exclude those meant to be hidden from current user
  const userNotifications = notifications.filter(n => n.excludeUserId !== user?.id);
  const unreadCount = userNotifications.filter(n => !n.read).length;

  const renderPage = () => {
    switch (activePage) {
      case 'dashboard': return <DashboardPage onNavigate={(p) => setActivePage(p as Page)} />;
      case 'financeiro': return <CashFlowPage />;
      case 'producao': return <ProductionPage />;
      case 'mercado': return <MarketPage />;
      case 'socios': return <PartnersPage />;
      case 'config': return <SettingsPage />;
      default: return <DashboardPage onNavigate={(p) => setActivePage(p as Page)} />;
    }
  };

  const handleNavigate = (page: Page) => {
    setActivePage(page);
    setMobileMenuOpen(false);
  };

  return (
    <div className={cn("min-h-screen text-[#191c1c] font-sans selection:bg-[#ffdea6] selection:text-[#271900] flex overflow-x-hidden",
      settings.darkMode ? "bg-[#0f1419] dark text-white" : "bg-[#f9f9f8]"
    )}>
      {/* Mobile Overlay */}
      {mobileMenuOpen && (
        <div className="fixed inset-0 bg-black/40 z-40 lg:hidden animate-fade-in" onClick={() => setMobileMenuOpen(false)} />
      )}

      {/* Sidebar */}
      <aside className={cn(
        "fixed left-0 top-0 h-screen w-64 flex flex-col border-r z-50 transition-transform duration-300",
        settings.darkMode
          ? "bg-[#1a2332] border-white/10 shadow-xl"
          : "bg-[#f3f4f3] border-[#e7e8e7] shadow-[0_12px_40px_rgba(25,28,28,0.06)]",
        "lg:translate-x-0",
        mobileMenuOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"
      )}>
        <div className="p-5 sm:p-6 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-[#1b4332] rounded-lg flex items-center justify-center shadow-sm">
              <Tractor className="text-white w-5 h-5" />
            </div>
            <div>
              <h2 className="font-headline font-extrabold text-[#012d1d] dark:text-white text-sm leading-tight">Gestão Avícola</h2>
              <p className="text-[9px] text-[#414844] dark:text-white/40 uppercase tracking-widest font-bold">Conselho de Sócios</p>
            </div>
          </div>
          <button onClick={() => setMobileMenuOpen(false)} className="lg:hidden p-1 hover:bg-[#edeeed] dark:hover:bg-white/10 rounded transition-colors">
            <X className="w-5 h-5 text-[#414844] dark:text-white/60" />
          </button>
        </div>

        <nav className="flex-1 space-y-1 px-3 mt-2">
          {NAV_ITEMS.map(item => (
            <button
              key={item.id}
              onClick={() => handleNavigate(item.id)}
              className={cn(
                "w-full rounded-lg px-4 py-3 flex items-center gap-3 transition-all duration-200 group",
                activePage === item.id
                  ? "bg-gradient-to-r from-[#012d1d] to-[#1b4332] text-white shadow-sm"
                  : "text-[#414844] dark:text-white/60 hover:bg-[#edeeed] dark:hover:bg-white/10 hover:translate-x-1"
              )}
            >
              {item.icon}
              <span className="font-medium text-sm">{item.label}</span>
              {activePage === item.id && <ChevronRight className="w-4 h-4 ml-auto opacity-50" />}
            </button>
          ))}
        </nav>

        <div className="p-3 space-y-2">
          <div className="bg-white dark:bg-white/10 rounded-xl p-3 shadow-sm">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-full bg-gradient-to-br from-[#012d1d] to-[#1b4332] flex items-center justify-center text-[10px] font-bold text-white">
                {user ? getInitials(user.name) : '??'}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-xs font-bold text-[#012d1d] dark:text-white truncate">{user?.name}</p>
                <p className="text-[9px] text-[#414844] dark:text-white/40 truncate">{user?.role === 'admin' ? 'Administrador' : 'Sócio'}</p>
              </div>
            </div>
          </div>
          <button
            onClick={logout}
            className="w-full bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 py-2.5 rounded-lg text-[10px] font-bold uppercase tracking-wider hover:bg-red-100 dark:hover:bg-red-900/30 transition-all flex items-center justify-center gap-1.5"
          >
            <LogOut className="w-3.5 h-3.5" /> Sair da Conta
          </button>
        </div>
      </aside>

      {/* Main */}
      <main className="lg:ml-64 flex-1 min-h-screen min-w-0 w-full">
        <header className={cn(
          "sticky top-0 z-30 backdrop-blur-md border-b",
          settings.darkMode
            ? "bg-[#0f1419]/80 border-white/5"
            : "bg-[#f9f9f8]/80 border-[#e7e8e7]/50"
        )}>
          <div className="px-4 lg:px-8 py-3 sm:py-4 flex justify-between items-center max-w-[1600px] mx-auto">
            <div className="flex items-center gap-3 sm:gap-4">
              <button onClick={() => setMobileMenuOpen(true)} className="lg:hidden p-2 hover:bg-[#edeeed] dark:hover:bg-white/10 rounded-lg transition-colors">
                <Menu className="w-5 h-5 text-[#414844] dark:text-white/60" />
              </button>
              <div>
                <h1 className="font-headline font-extrabold text-lg sm:text-xl lg:text-2xl tracking-tighter text-[#012d1d] dark:text-white">
                  Cuiudos Sócios
                </h1>
                <p className="text-[#414844] dark:text-white/40 font-medium text-[9px] sm:text-[10px] lg:text-xs hidden sm:block">
                  Painel Executivo | {NAV_ITEMS.find(n => n.id === activePage)?.label}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2 sm:gap-4">
              {/* Notifications */}
              <div className="relative">
                <button
                  onClick={() => setShowNotifications(!showNotifications)}
                  className="p-2 hover:bg-[#edeeed] dark:hover:bg-white/10 rounded-full transition-colors relative"
                >
                  <Bell className="w-5 h-5 text-[#414844] dark:text-white/60" />
                  {unreadCount > 0 && (
                    <span className="absolute -top-0.5 -right-0.5 w-4 h-4 bg-red-500 text-white text-[8px] font-bold rounded-full flex items-center justify-center animate-pulse-glow">
                      {unreadCount}
                    </span>
                  )}
                </button>

                {showNotifications && (
                  <>
                    <div className="fixed inset-0 z-40" onClick={() => setShowNotifications(false)} />
                    <div className={cn(
                      "absolute right-0 top-12 w-80 rounded-2xl shadow-xl border z-50 overflow-hidden animate-fade-in-up",
                      settings.darkMode ? "bg-[#1a2332] border-white/10" : "bg-white border-[#edeeed]"
                    )}>
                      <div className="px-4 py-3 border-b border-[#edeeed] dark:border-white/10 flex items-center justify-between">
                        <h3 className="font-headline font-bold text-sm text-[#012d1d] dark:text-white">Notificações</h3>
                        {unreadCount > 0 && (
                          <button onClick={markAllNotificationsRead} className="text-[9px] text-[#012d1d] dark:text-[#ffdea6] font-bold hover:underline">
                            Marcar todas como lidas
                          </button>
                        )}
                      </div>
                      <div className="max-h-80 overflow-y-auto">
                        {userNotifications.length === 0 ? (
                          <div className="text-center py-8 text-[#414844] dark:text-white/40 text-sm">
                            Nenhuma notificação.
                          </div>
                        ) : (
                          userNotifications.slice(0, 10).map(n => (
                            <div
                              key={n.id}
                              onClick={() => markNotificationRead(n.id)}
                              className={cn(
                                "px-4 py-3 border-b border-[#f3f4f3] dark:border-white/5 last:border-0 hover:bg-gray-50 dark:hover:bg-white/5 transition-colors cursor-pointer",
                                !n.read && "bg-[#012d1d]/[0.02] dark:bg-white/[0.02]"
                              )}
                            >
                              <div className="flex items-start gap-3">
                                <div className={cn("w-7 h-7 rounded-lg flex items-center justify-center shrink-0 mt-0.5",
                                  n.type === 'investment' ? "bg-amber-100 dark:bg-amber-900/20" :
                                  n.type === 'payment' ? "bg-blue-100 dark:bg-blue-900/20" :
                                  n.type === 'market' ? "bg-emerald-100 dark:bg-emerald-900/20" :
                                  n.type === 'production' ? "bg-orange-100 dark:bg-orange-900/20" :
                                  "bg-gray-100 dark:bg-white/10"
                                )}>
                                  {n.type === 'investment' ? <Wallet className="w-3.5 h-3.5 text-amber-600" /> :
                                   n.type === 'payment' ? <CreditCard className="w-3.5 h-3.5 text-blue-600" /> :
                                   n.type === 'market' ? <BarChart3 className="w-3.5 h-3.5 text-emerald-600" /> :
                                   n.type === 'production' ? <Bird className="w-3.5 h-3.5 text-orange-600" /> :
                                   <BellRing className="w-3.5 h-3.5 text-gray-500" />}
                                </div>
                                <div className="flex-1 min-w-0">
                                  <div className="flex items-center gap-2">
                                    <p className="text-xs font-bold text-[#012d1d] dark:text-white">{n.title}</p>
                                    {!n.read && <span className="w-1.5 h-1.5 bg-[#012d1d] dark:bg-[#ffdea6] rounded-full" />}
                                  </div>
                                  <p className="text-[10px] text-[#414844] dark:text-white/50 mt-0.5 line-clamp-2">{n.message}</p>
                                  <p className="text-[9px] text-[#414844]/50 dark:text-white/20 mt-1">{n.date}</p>
                                </div>
                              </div>
                            </div>
                          ))
                        )}
                      </div>
                    </div>
                  </>
                )}
              </div>

              {/* User (desktop) */}
              <div className="hidden lg:flex items-center gap-3 pl-3 border-l border-[#edeeed] dark:border-white/10">
                <div className="text-right">
                  <p className="text-xs font-bold text-[#012d1d] dark:text-white">{user?.name}</p>
                  <p className="text-[9px] text-[#414844] dark:text-white/40 uppercase font-bold tracking-tighter">
                    {user?.role === 'admin' ? 'Administrador' : 'Sócio'}
                  </p>
                </div>
                <div className="w-9 h-9 rounded-full bg-gradient-to-br from-[#012d1d] to-[#1b4332] flex items-center justify-center text-[10px] font-bold text-white ring-2 ring-[#012d1d]/10 dark:ring-white/10">
                  {user ? getInitials(user.name) : '??'}
                </div>
              </div>
            </div>
          </div>
        </header>

        <div className="px-3 sm:px-4 lg:px-8 py-5 sm:py-6 lg:py-10 max-w-[1600px] mx-auto overflow-x-hidden">
          {renderPage()}
        </div>

        <footer className={cn(
          "px-4 lg:px-8 py-6 border-t max-w-[1600px] mx-auto",
          settings.darkMode ? "border-white/5" : "border-[#e7e8e7]"
        )}>
          <div className="flex flex-col md:flex-row justify-between items-center gap-4 opacity-50">
            <div className="flex items-center gap-3">
              <ShieldCheck className="text-[#012d1d] dark:text-white w-4 h-4" />
              <p className="text-[10px] font-bold uppercase tracking-widest text-[#191c1c] dark:text-white">
                Dados Protegidos e Auditados
              </p>
            </div>
            <p className="text-[10px] font-medium text-[#414844] dark:text-white/60">
              © 2026 Cuiudos Sócios. Uso exclusivo do Conselho de Sócios.
            </p>
          </div>
        </footer>
      </main>
    </div>
  );
}
