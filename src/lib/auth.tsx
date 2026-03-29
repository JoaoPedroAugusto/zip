import React, { createContext, useContext, useState, useEffect, type ReactNode } from 'react';
import { supabase } from './supabase';
import type { Partner } from './store';

type AuthContextType = {
  user: Partner | null;
  login: (email: string, password: string) => Promise<{ success: boolean; error?: string }>;
  register: (data: RegisterData) => Promise<{ success: boolean; error?: string }>;
  logout: () => Promise<void>;
  isAuthenticated: boolean;
  refreshUser: () => Promise<void>;
};

export type RegisterData = {
  name: string;
  email: string;
  password: string;
  phone: string;
};

const AuthContext = createContext<AuthContextType>({
  user: null,
  login: async () => ({ success: false }),
  register: async () => ({ success: false }),
  logout: async () => {},
  isAuthenticated: false,
  refreshUser: async () => {},
});

export const useAuth = () => useContext(AuthContext);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<Partner | null>(null);

  const fetchPartner = async (userId: string) => {
    const { data, error } = await supabase
      .from('partners')
      .select('*')
      .eq('id', userId)
      .single();
    
    if (data && !error) {
      setUser({
        id: data.id,
        name: data.name,
        email: data.email,
        password: '', // do not expose password
        quotaPercentage: data.quota_percentage,
        totalInvested: data.total_invested,
        paymentStatus: data.payment_status,
        role: data.role,
        phone: data.phone || '',
        joinDate: data.join_date,
        monthlyContribution: data.monthly_contribution,
      });
    } else {
      setUser(null);
    }
  };

  useEffect(() => {
    // Check active session on mount
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session?.user) {
        fetchPartner(session.user.id);
      }
    });

    // Listen to auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (_event, session) => {
        if (session?.user) {
          fetchPartner(session.user.id);
        } else {
          setUser(null);
        }
      }
    );

    return () => subscription.unsubscribe();
  }, []);

  const refreshUser = async () => {
    if (user) {
      await fetchPartner(user.id);
    }
  };

  const login = async (email: string, password: string): Promise<{ success: boolean; error?: string }> => {
    if (!email || !password) {
      return { success: false, error: 'Preencha todos os campos.' };
    }

    const { error } = await supabase.auth.signInWithPassword({ email, password });
    
    if (error) {
      let errorMessage = 'E-mail ou senha incorretos.';
      if (error.message.includes('Invalid login')) errorMessage = 'E-mail ou senha incorretos.';
      return { success: false, error: errorMessage };
    }

    return { success: true };
  };

  const register = async (data: RegisterData): Promise<{ success: boolean; error?: string }> => {
    if (!data.name || !data.email || !data.password) {
      return { success: false, error: 'Preencha todos os campos obrigatórios.' };
    }

    if (data.password.length < 6) {
      return { success: false, error: 'A senha deve ter pelo menos 6 caracteres.' };
    }

    // 1. Register with Supabase Auth
    const { data: authData, error: authError } = await supabase.auth.signUp({
      email: data.email,
      password: data.password,
    });

    if (authError) {
      console.error('Supabase Auth Error:', authError);
      return { success: false, error: `Auth Error: ${authError.message}` };
    }

    const userId = authData.user?.id;
    if (!userId) {
      return { success: false, error: 'Erro ao obter ID do usuário.' };
    }

    // Check if it's the first user to make them admin
    const { count } = await supabase
      .from('partners')
      .select('*', { count: 'exact', head: true });
    
    const isFirstUser = count === 0;

    // 2. Insert into custom partners table
    const { error: dbError } = await supabase
      .from('partners')
      .insert({
        id: userId,
        name: data.name,
        email: data.email,
        phone: data.phone || '',
        role: isFirstUser ? 'admin' : 'socio',
        join_date: new Date().toISOString().split('T')[0],
      });

    if (dbError) {
      console.error(dbError);
      return { success: false, error: `Erro ao salvar perfil: ${dbError.message || JSON.stringify(dbError)}` };
    }

    // Sign in automatically
    await fetchPartner(userId);

    return { success: true };
  };

  const logout = async () => {
    await supabase.auth.signOut();
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, login, register, logout, isAuthenticated: !!user, refreshUser }}>
      {children}
    </AuthContext.Provider>
  );
}
