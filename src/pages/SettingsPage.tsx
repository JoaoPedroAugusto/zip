import React, { useState } from 'react';
import { Moon, Sun, User, Lock, Shield, Trash2, Check, AlertTriangle } from 'lucide-react';
import { useAuth } from '../lib/auth';
import { useStore } from '../lib/store';
import { cn, getInitials } from '../lib/utils';

export default function SettingsPage() {
  const { user } = useAuth();
  const { settings, toggleDarkMode } = useStore();
  const [showSuccess, setShowSuccess] = useState(false);

  const handleToggleDark = () => {
    toggleDarkMode();
    setShowSuccess(true);
    setTimeout(() => setShowSuccess(false), 2000);
  };

  if (!user) return null;

  return (
    <div className="space-y-8 animate-fade-in max-w-3xl">
      <div>
        <h1 className="font-headline font-extrabold text-2xl sm:text-3xl text-[#012d1d] dark:text-white tracking-tight">
          Configurações
        </h1>
        <p className="text-[#414844] dark:text-white/60 text-xs sm:text-sm font-medium mt-1">
          Gerencie sua conta e preferências do sistema
        </p>
      </div>

      {/* Success Toast */}
      {showSuccess && (
        <div className="fixed top-20 right-4 z-50 bg-emerald-500 text-white px-4 py-3 rounded-xl shadow-lg flex items-center gap-2 animate-fade-in-up">
          <Check className="w-4 h-4" />
          <span className="text-sm font-bold">Configuração salva!</span>
        </div>
      )}

      {/* Profile Section */}
      <div className="bg-white dark:bg-white/5 rounded-2xl shadow-sm p-6 space-y-4 border border-transparent dark:border-white/10">
        <h2 className="font-headline font-bold text-[#012d1d] dark:text-white flex items-center gap-2">
          <User className="w-5 h-5" /> Meu Perfil
        </h2>
        <div className="flex items-center gap-4">
          <div className="w-16 h-16 rounded-full bg-gradient-to-br from-[#012d1d] to-[#1b4332] flex items-center justify-center text-xl font-bold text-white shadow-lg">
            {getInitials(user.name)}
          </div>
          <div>
            <p className="font-bold text-lg text-[#012d1d] dark:text-white">{user.name}</p>
            <p className="text-[#414844] dark:text-white/50 text-sm">{user.email}</p>
            <div className="flex items-center gap-2 mt-1">
              <span className={cn(
                "text-[9px] font-bold px-2 py-0.5 rounded-full uppercase",
                user.role === 'admin' ? "bg-[#ffdea6] text-[#5d4200]" : "bg-[#012d1d]/10 text-[#012d1d] dark:bg-white/10 dark:text-white/70"
              )}>
                {user.role === 'admin' ? 'Administrador' : 'Sócio'}
              </span>
              {user.phone && (
                <span className="text-[10px] text-[#414844] dark:text-white/40">{user.phone}</span>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Appearance */}
      <div className="bg-white dark:bg-white/5 rounded-2xl shadow-sm p-6 space-y-5 border border-transparent dark:border-white/10">
        <h2 className="font-headline font-bold text-[#012d1d] dark:text-white flex items-center gap-2">
          {settings.darkMode ? <Moon className="w-5 h-5" /> : <Sun className="w-5 h-5" />}
          Aparência
        </h2>

        <div className="flex items-center justify-between p-4 bg-[#f3f4f3] dark:bg-white/5 rounded-xl">
          <div>
            <p className="font-bold text-sm text-[#012d1d] dark:text-white">Modo Escuro</p>
            <p className="text-xs text-[#414844] dark:text-white/50 mt-0.5">
              Alterne entre tema claro e escuro
            </p>
          </div>
          <button
            onClick={handleToggleDark}
            className={cn(
              "relative w-14 h-7 rounded-full transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-[#012d1d]/20",
              settings.darkMode ? "bg-[#012d1d]" : "bg-[#e1e3e2]"
            )}
          >
            <div className={cn(
              "absolute top-0.5 w-6 h-6 rounded-full bg-white shadow-md transition-all duration-300 flex items-center justify-center",
              settings.darkMode ? "left-7" : "left-0.5"
            )}>
              {settings.darkMode ? (
                <Moon className="w-3.5 h-3.5 text-[#012d1d]" />
              ) : (
                <Sun className="w-3.5 h-3.5 text-[#7b5800]" />
              )}
            </div>
          </button>
        </div>

        {/* Theme Preview */}
        <div className="grid grid-cols-2 gap-3">
          <button
            onClick={() => { if (settings.darkMode) handleToggleDark(); }}
            className={cn(
              "p-4 rounded-xl border-2 transition-all text-left",
              !settings.darkMode
                ? "border-[#012d1d] bg-white shadow-md"
                : "border-transparent bg-[#f3f4f3] dark:bg-white/5 hover:border-[#012d1d]/20"
            )}
          >
            <div className="flex items-center gap-2 mb-2">
              <Sun className="w-4 h-4 text-[#7b5800]" />
              <span className="text-xs font-bold text-[#012d1d] dark:text-white">Claro</span>
              {!settings.darkMode && <Check className="w-3 h-3 text-emerald-500 ml-auto" />}
            </div>
            <div className="space-y-1">
              <div className="h-2 w-full bg-[#f3f4f3] rounded" />
              <div className="h-2 w-3/4 bg-[#e1e3e2] rounded" />
              <div className="h-2 w-1/2 bg-[#edeeed] rounded" />
            </div>
          </button>
          <button
            onClick={() => { if (!settings.darkMode) handleToggleDark(); }}
            className={cn(
              "p-4 rounded-xl border-2 transition-all text-left",
              settings.darkMode
                ? "border-[#ffdea6] bg-[#1a1a2e] shadow-md"
                : "border-transparent bg-[#1a1a2e] hover:border-white/20"
            )}
          >
            <div className="flex items-center gap-2 mb-2">
              <Moon className="w-4 h-4 text-[#ffdea6]" />
              <span className="text-xs font-bold text-white">Escuro</span>
              {settings.darkMode && <Check className="w-3 h-3 text-emerald-500 ml-auto" />}
            </div>
            <div className="space-y-1">
              <div className="h-2 w-full bg-white/10 rounded" />
              <div className="h-2 w-3/4 bg-white/5 rounded" />
              <div className="h-2 w-1/2 bg-white/[0.03] rounded" />
            </div>
          </button>
        </div>
      </div>

      {/* Security */}
      <div className="bg-white dark:bg-white/5 rounded-2xl shadow-sm p-6 space-y-4 border border-transparent dark:border-white/10">
        <h2 className="font-headline font-bold text-[#012d1d] dark:text-white flex items-center gap-2">
          <Shield className="w-5 h-5" /> Segurança
        </h2>

        <div className="p-4 bg-[#f3f4f3] dark:bg-white/5 rounded-xl">
          <div className="flex items-center gap-3">
            <Lock className="w-4 h-4 text-[#414844] dark:text-white/50" />
            <div>
              <p className="font-bold text-sm text-[#012d1d] dark:text-white">Senha</p>
              <p className="text-xs text-[#414844] dark:text-white/50">Última alteração: ao criar a conta</p>
            </div>
          </div>
        </div>

        <div className="p-4 bg-[#f3f4f3] dark:bg-white/5 rounded-xl">
          <div className="flex items-center gap-3">
            <Shield className="w-4 h-4 text-[#414844] dark:text-white/50" />
            <div>
              <p className="font-bold text-sm text-[#012d1d] dark:text-white">Perfil de Acesso</p>
              <p className="text-xs text-[#414844] dark:text-white/50">
                {user.role === 'admin'
                  ? 'Administrador — acesso total ao sistema'
                  : 'Sócio — acesso aos seus dados e ao dashboard geral'}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* About */}
      <div className="bg-white dark:bg-white/5 rounded-2xl shadow-sm p-6 border border-transparent dark:border-white/10">
        <h2 className="font-headline font-bold text-[#012d1d] dark:text-white mb-3">Sobre o Sistema</h2>
        <div className="space-y-2 text-xs text-[#414844] dark:text-white/50">
          <p><strong className="text-[#012d1d] dark:text-white">Sistema:</strong> Cuiudos Sócios v2.0</p>
        </div>
      </div>
    </div>
  );
}
