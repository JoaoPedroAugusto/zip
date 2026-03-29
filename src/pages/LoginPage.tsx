import React, { useState } from 'react';
import { Tractor, Eye, EyeOff, LogIn, ShieldCheck, AlertTriangle, UserPlus, Mail, Lock, User, Phone } from 'lucide-react';
import { useAuth } from '../lib/auth';
import { cn } from '../lib/utils';

type Mode = 'login' | 'register';

export default function LoginPage() {
  const { login, register } = useAuth();
  const [mode, setMode] = useState<Mode>('login');

  // Login fields
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  // Register fields
  const [regName, setRegName] = useState('');
  const [regEmail, setRegEmail] = useState('');
  const [regPassword, setRegPassword] = useState('');
  const [regConfirm, setRegConfirm] = useState('');
  const [regPhone, setRegPhone] = useState('');

  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    const result = await login(email, password);
    if (!result.success) {
      setError(result.error || 'Erro ao entrar.');
    }
    setIsLoading(false);
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (regPassword !== regConfirm) {
      setError('As senhas não coincidem.');
      return;
    }

    setIsLoading(true);

    const result = await register({
      name: regName,
      email: regEmail,
      password: regPassword,
      phone: regPhone,
    });

    if (!result.success) {
      setError(result.error || 'Erro ao cadastrar.');
    }
    setIsLoading(false);
  };

  const switchMode = (newMode: Mode) => {
    setMode(newMode);
    setError('');
    setEmail('');
    setPassword('');
    setRegName('');
    setRegEmail('');
    setRegPassword('');
    setRegConfirm('');
    setRegPhone('');
  };

  const inputClass = "w-full bg-white/[0.06] border border-white/[0.1] rounded-xl px-4 py-3.5 text-white placeholder-white/20 focus:outline-none focus:ring-2 focus:ring-[#ffdea6]/40 focus:border-transparent transition-all text-sm";

  return (
    <div className="min-h-screen login-bg flex items-center justify-center p-4 relative">
      {/* Decorative */}
      <div className="absolute top-20 left-20 w-2 h-2 bg-[#ffdea6]/30 rounded-full animate-float hidden sm:block" />
      <div className="absolute top-40 right-40 w-3 h-3 bg-[#ffdea6]/20 rounded-full animate-float delay-300 hidden sm:block" />
      <div className="absolute bottom-40 left-1/4 w-1.5 h-1.5 bg-white/10 rounded-full animate-float delay-500 hidden sm:block" />

      <div className="w-full max-w-md animate-fade-in-up">
        {/* Logo */}
        <div className="text-center mb-8">
          <div className="w-16 h-16 sm:w-20 sm:h-20 bg-gradient-to-br from-[#ffdea6] to-[#f5c96a] rounded-2xl flex items-center justify-center mx-auto mb-4 sm:mb-5 shadow-xl shadow-[#ffdea6]/20 animate-float">
            <Tractor className="text-[#5d4200] w-8 h-8 sm:w-10 sm:h-10" />
          </div>
          <h1 className="font-headline font-extrabold text-2xl sm:text-3xl text-white tracking-tight mb-1">
            Cuiudos Sócios
          </h1>
          <p className="text-white/50 text-sm font-medium">
            Sistema de Gestão Avícola — Conselho de Sócios
          </p>
        </div>

        {/* Mode Tabs */}
        <div className="flex bg-white/[0.04] rounded-xl p-1 mb-6">
          <button
            onClick={() => switchMode('login')}
            className={cn(
              "flex-1 py-2.5 rounded-lg text-sm font-bold transition-all flex items-center justify-center gap-2",
              mode === 'login'
                ? "bg-white/10 text-white shadow-sm"
                : "text-white/40 hover:text-white/60"
            )}
          >
            <LogIn className="w-4 h-4" /> Entrar
          </button>
          <button
            onClick={() => switchMode('register')}
            className={cn(
              "flex-1 py-2.5 rounded-lg text-sm font-bold transition-all flex items-center justify-center gap-2",
              mode === 'register'
                ? "bg-white/10 text-white shadow-sm"
                : "text-white/40 hover:text-white/60"
            )}
          >
            <UserPlus className="w-4 h-4" /> Cadastrar
          </button>
        </div>

        {/* Card */}
        <div className="bg-white/[0.07] backdrop-blur-2xl rounded-2xl sm:rounded-3xl p-6 sm:p-8 border border-white/[0.08] shadow-2xl">
          {mode === 'login' ? (
            <>
              <div className="mb-5">
                <h2 className="font-headline font-bold text-xl text-white mb-1">Acesse sua conta</h2>
                <p className="text-white/40 text-sm">Digite suas credenciais para entrar</p>
              </div>

              <form onSubmit={handleLogin} className="space-y-4">
                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold uppercase tracking-wider text-white/60 flex items-center gap-1.5">
                    <Mail className="w-3 h-3" /> E-mail
                  </label>
                  <input
                    type="email"
                    value={email}
                    onChange={e => setEmail(e.target.value)}
                    placeholder="seu@email.com"
                    required
                    className={inputClass}
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold uppercase tracking-wider text-white/60 flex items-center gap-1.5">
                    <Lock className="w-3 h-3" /> Senha
                  </label>
                  <div className="relative">
                    <input
                      type={showPassword ? 'text' : 'password'}
                      value={password}
                      onChange={e => setPassword(e.target.value)}
                      placeholder="••••••••"
                      required
                      className={cn(inputClass, "pr-12")}
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-white/30 hover:text-white/60 transition-colors p-1"
                    >
                      {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                {error && (
                  <div className="flex items-center gap-2 bg-red-500/10 border border-red-500/20 rounded-lg px-4 py-3 animate-fade-in">
                    <AlertTriangle className="w-4 h-4 text-red-400 shrink-0" />
                    <p className="text-red-300 text-sm">{error}</p>
                  </div>
                )}

                <button
                  type="submit"
                  disabled={isLoading}
                  className="w-full bg-gradient-to-r from-[#ffdea6] to-[#f5c96a] text-[#5d4200] font-headline font-bold py-3.5 rounded-xl shadow-lg shadow-[#ffdea6]/10 hover:shadow-[#ffdea6]/20 hover:brightness-110 active:scale-[0.98] transition-all text-sm uppercase tracking-wider disabled:opacity-60 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                  {isLoading ? (
                    <><div className="w-4 h-4 border-2 border-[#5d4200]/30 border-t-[#5d4200] rounded-full animate-spin" /> Entrando...</>
                  ) : (
                    <><LogIn className="w-4 h-4" /> Entrar no Painel</>
                  )}
                </button>
              </form>

              <p className="text-center text-white/30 text-xs mt-5">
                Não tem conta?{' '}
                <button onClick={() => switchMode('register')} className="text-[#ffdea6] hover:underline font-bold">
                  Cadastre-se aqui
                </button>
              </p>
            </>
          ) : (
            <>
              <div className="mb-5">
                <h2 className="font-headline font-bold text-xl text-white mb-1">Criar conta</h2>
                <p className="text-white/40 text-sm">Cadastre-se como sócio do grupo</p>
              </div>

              <form onSubmit={handleRegister} className="space-y-4">
                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold uppercase tracking-wider text-white/60 flex items-center gap-1.5">
                    <User className="w-3 h-3" /> Nome Completo *
                  </label>
                  <input
                    type="text"
                    value={regName}
                    onChange={e => setRegName(e.target.value)}
                    placeholder="Seu nome completo"
                    required
                    className={inputClass}
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold uppercase tracking-wider text-white/60 flex items-center gap-1.5">
                    <Mail className="w-3 h-3" /> E-mail *
                  </label>
                  <input
                    type="email"
                    value={regEmail}
                    onChange={e => setRegEmail(e.target.value)}
                    placeholder="seu@email.com"
                    required
                    className={inputClass}
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold uppercase tracking-wider text-white/60 flex items-center gap-1.5">
                    <Phone className="w-3 h-3" /> Telefone
                  </label>
                  <input
                    type="tel"
                    value={regPhone}
                    onChange={e => setRegPhone(e.target.value)}
                    placeholder="(00) 00000-0000"
                    className={inputClass}
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-bold uppercase tracking-wider text-white/60 flex items-center gap-1.5">
                      <Lock className="w-3 h-3" /> Senha *
                    </label>
                    <input
                      type={showPassword ? 'text' : 'password'}
                      value={regPassword}
                      onChange={e => setRegPassword(e.target.value)}
                      placeholder="Min. 6 caracteres"
                      required
                      minLength={6}
                      className={inputClass}
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-bold uppercase tracking-wider text-white/60">
                      Confirmar *
                    </label>
                    <input
                      type={showPassword ? 'text' : 'password'}
                      value={regConfirm}
                      onChange={e => setRegConfirm(e.target.value)}
                      placeholder="Repita a senha"
                      required
                      className={inputClass}
                    />
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    id="showPwd"
                    checked={showPassword}
                    onChange={() => setShowPassword(!showPassword)}
                    className="rounded"
                  />
                  <label htmlFor="showPwd" className="text-white/40 text-xs cursor-pointer">Mostrar senhas</label>
                </div>

                {error && (
                  <div className="flex items-center gap-2 bg-red-500/10 border border-red-500/20 rounded-lg px-4 py-3 animate-fade-in">
                    <AlertTriangle className="w-4 h-4 text-red-400 shrink-0" />
                    <p className="text-red-300 text-sm">{error}</p>
                  </div>
                )}

                <button
                  type="submit"
                  disabled={isLoading}
                  className="w-full bg-gradient-to-r from-[#ffdea6] to-[#f5c96a] text-[#5d4200] font-headline font-bold py-3.5 rounded-xl shadow-lg shadow-[#ffdea6]/10 hover:shadow-[#ffdea6]/20 hover:brightness-110 active:scale-[0.98] transition-all text-sm uppercase tracking-wider disabled:opacity-60 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                  {isLoading ? (
                    <><div className="w-4 h-4 border-2 border-[#5d4200]/30 border-t-[#5d4200] rounded-full animate-spin" /> Cadastrando...</>
                  ) : (
                    <><UserPlus className="w-4 h-4" /> Criar Minha Conta</>
                  )}
                </button>
              </form>

              <p className="text-center text-white/30 text-xs mt-5">
                Já tem conta?{' '}
                <button onClick={() => switchMode('login')} className="text-[#ffdea6] hover:underline font-bold">
                  Entrar
                </button>
              </p>
            </>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-center gap-2 mt-6 opacity-40">
          <ShieldCheck className="text-white w-3.5 h-3.5" />
          <p className="text-white text-[10px] font-bold uppercase tracking-widest">
            Dados Protegidos e Auditados
          </p>
        </div>
      </div>
    </div>
  );
}
