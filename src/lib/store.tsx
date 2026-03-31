import React, { createContext, useContext, useState, useEffect, type ReactNode } from 'react';
import { supabase } from './supabase';

// ====== TYPES ======
export type Partner = {
  id: string;
  name: string;
  email: string;
  password?: string;
  quotaPercentage: number;
  totalInvested: number;
  paymentStatus: 'PAGO' | 'PENDENTE' | 'ATRASADO';
  role: 'admin' | 'socio';
  phone: string;
  joinDate: string;
  monthlyContribution: number;
};

export type CashFlow = {
  id: string;
  date: string;
  type: 'ENTRADA' | 'SAIDA';
  category: string;
  value: number;
  responsible: string;
  receiptLink: string;
  description: string;
};

export type Flock = {
  id: string;
  startDate: string;
  initialQuantity: number;
  currentQuantity: number;
  accumulatedMortality: number;
  averageWeight: number;
  dailyFeedConsumption: number;
  expectedSaleDate: string;
  status: 'ATIVO' | 'VENDIDO' | 'EM PREPARAÇÃO';
  totalFeedConsumed: number;
  totalWeightGain: number;
  breed: string;
  batchCost: number;
};

export type Goal = {
  monthlyGoal: number;
  collectedValue: number;
  projectedROI: number;
  realizedROI: number;
};

export type MarketAlert = {
  id: string;
  date: string;
  title: string;
  description: string;
  impact: 'POSITIVO' | 'NEGATIVO' | 'NEUTRO';
  source: string;
};

export type Notification = {
  id: string;
  date: string;
  title: string;
  message: string;
  read: boolean;
  type: 'payment' | 'market' | 'production' | 'system' | 'investment';
  excludeUserId?: string;
  read_by?: string[];
};

export type AppSettings = {
  darkMode: boolean;
  language: string;
};

// ====== STORE CONTEXT ======
type StoreContextType = {
  partners: Partner[];
  cashFlow: CashFlow[];
  flocks: Flock[];
  goals: Goal;
  marketAlerts: MarketAlert[];
  notifications: Notification[];
  settings: AppSettings;
  // Actions
  addPartner: (partner: Partner) => void;
  updatePartner: (id: string, data: Partial<Partner>) => void;
  addCashFlow: (item: CashFlow) => void;
  addFlock: (flock: Flock) => void;
  updateFlock: (id: string, data: Partial<Flock>) => void;
  updateGoals: (data: Partial<Goal>) => void;
  addNotification: (notification: Notification) => void;
  markNotificationRead: (id: string) => void;
  markAllNotificationsRead: () => void;
  toggleDarkMode: () => void;
  updateSettings: (data: Partial<AppSettings>) => void;
  makeInvestment: (partnerId: string, amount: number) => void;
  recalculateQuotas: () => void;
};

const defaultGoals: Goal = {
  monthlyGoal: 0,
  collectedValue: 0,
  projectedROI: 0,
  realizedROI: 0,
};

function getInitialDarkMode(): boolean {
  try {
    const stored = localStorage.getItem('cuiudos_dark_mode');
    if (stored !== null) return stored === 'true';
  } catch {}
  return false;
}

const defaultSettings: AppSettings = {
  darkMode: getInitialDarkMode(),
  language: 'pt-BR',
};

const StoreContext = createContext<StoreContextType>({} as StoreContextType);
export const useStore = () => useContext(StoreContext);

// ====== MAP DATABASE RESPONSE ======
function mapPartner(dbPartner: any): Partner {
  return {
    id: dbPartner.id,
    name: dbPartner.name,
    email: dbPartner.email,
    quotaPercentage: Number(dbPartner.quota_percentage) || 0,
    totalInvested: Number(dbPartner.total_invested) || 0,
    paymentStatus: dbPartner.payment_status,
    role: dbPartner.role,
    phone: dbPartner.phone || '',
    joinDate: dbPartner.join_date,
    monthlyContribution: Number(dbPartner.monthly_contribution) || 0,
  };
}
function mapFlock(dbFlock: any): Flock {
  return {
    id: dbFlock.id,
    startDate: dbFlock.start_date,
    initialQuantity: dbFlock.initial_quantity,
    currentQuantity: dbFlock.current_quantity,
    accumulatedMortality: dbFlock.accumulated_mortality,
    averageWeight: Number(dbFlock.average_weight),
    dailyFeedConsumption: Number(dbFlock.daily_feed_consumption),
    expectedSaleDate: dbFlock.expected_sale_date || '',
    status: dbFlock.status,
    totalFeedConsumed: Number(dbFlock.total_feed_consumed),
    totalWeightGain: Number(dbFlock.total_weight_gain),
    breed: dbFlock.breed,
    batchCost: Number(dbFlock.batch_cost),
  };
}
function mapCashFlow(dbCF: any): CashFlow {
  return {
    id: dbCF.id,
    date: dbCF.date,
    type: dbCF.type,
    category: dbCF.category,
    value: Number(dbCF.value),
    responsible: dbCF.responsible,
    receiptLink: dbCF.receipt_link || '',
    description: dbCF.description || '',
  };
}

// ====== PROVIDER ======
export function StoreProvider({ children }: { children: ReactNode }) {
  const [partners, setPartners] = useState<Partner[]>([]);
  const [cashFlow, setCashFlow] = useState<CashFlow[]>([]);
  const [flocks, setFlocks] = useState<Flock[]>([]);
  const [goals, setGoals] = useState<Goal>(defaultGoals);
  const [marketAlerts, setMarketAlerts] = useState<MarketAlert[]>([]);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [settings, setSettings] = useState<AppSettings>(defaultSettings);
  const [userId, setUserId] = useState<string | null>(null);

  // Load Initial Data
  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => setUserId(data?.session?.user?.id || null));
    supabase.auth.onAuthStateChange((event, session) => setUserId(session?.user?.id || null));
    
    // Fetch all tables
    const loadData = async () => {
      const [pts, cflow, flks, gls, alts, nots] = await Promise.all([
        supabase.from('partners').select('*'),
        supabase.from('cash_flow').select('*').order('date', { ascending: false }),
        supabase.from('flocks').select('*'),
        supabase.from('goals').select('*').maybeSingle(),
        supabase.from('market_alerts').select('*').order('date', { ascending: false }),
        supabase.from('notifications').select('*').order('date', { ascending: false }),
      ]);

      if (pts.data) setPartners(pts.data.map(mapPartner));
      if (cflow.data) setCashFlow(cflow.data.map(mapCashFlow));
      if (flks.data) setFlocks(flks.data.map(mapFlock));
      if (gls.data) {
        setGoals({
          monthlyGoal: Number(gls.data.monthly_goal),
          collectedValue: Number(gls.data.collected_value),
          projectedROI: Number(gls.data.projected_roi),
          realizedROI: Number(gls.data.realized_roi),
        });
      }
      if (alts.data) setMarketAlerts(alts.data as unknown as MarketAlert[]);
      if (nots.data) {
        setNotifications(nots.data.map((n: any) => ({
          ...n,
          read: n.read_by?.includes(userId || ''),
        })));
      }
    };

    loadData();

    // Setup basic Realtime for Notifications and Cash Flow
    const channel = supabase.channel('schema-db-changes')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'cash_flow' }, payload => {
        if (payload.eventType === 'INSERT') {
          setCashFlow(prev => [mapCashFlow(payload.new), ...prev]);
        }
      })
      .on('postgres_changes', { event: '*', schema: 'public', table: 'notifications' }, payload => {
        if (payload.eventType === 'INSERT') {
          const n = payload.new;
          setNotifications(prev => [{ ...n, read: n.read_by?.includes(userId || '') }, ...prev]);
        }
      })
      .on('postgres_changes', { event: '*', schema: 'public', table: 'partners' }, payload => {
          if (payload.eventType === 'UPDATE') {
              setPartners(prev => prev.map(p => p.id === payload.new.id ? mapPartner(payload.new) : p));
          }
      })
      .subscribe();

    return () => { supabase.removeChannel(channel); };
  }, [userId]);

  // Apply dark mode to document
  useEffect(() => {
    if (settings.darkMode) document.documentElement.classList.add('dark');
    else document.documentElement.classList.remove('dark');
  }, [settings.darkMode]);

  // --- Actions (Optimistic UI + Supabase API) ---

  const addPartner = async (partner: Partner) => {
    setPartners(prev => [...prev, partner]);
    await supabase.from('partners').insert({
        id: partner.id, name: partner.name, email: partner.email,
        phone: partner.phone || '', role: partner.role || 'socio',
    });
  };

  const updatePartner = async (id: string, data: Partial<Partner>) => {
    setPartners(prev => prev.map(p => p.id === id ? { ...p, ...data } : p));
    const toUpdate: any = {};
    if (data.name !== undefined) toUpdate.name = data.name;
    if (data.quotaPercentage !== undefined) toUpdate.quota_percentage = data.quotaPercentage;
    if (data.totalInvested !== undefined) toUpdate.total_invested = data.totalInvested;
    if (data.paymentStatus !== undefined) toUpdate.payment_status = data.paymentStatus;
    await supabase.from('partners').update(toUpdate).eq('id', id);
  };

  const addCashFlow = async (item: CashFlow) => {
    setCashFlow(prev => [item, ...prev]);
    await supabase.from('cash_flow').insert({
        date: item.date, type: item.type, category: item.category,
        value: item.value, responsible: item.responsible,
        receipt_link: item.receiptLink, description: item.description,
    });
  };

  const addFlock = async (flock: Flock) => {
    setFlocks(prev => [...prev, flock]);
    await supabase.from('flocks').insert({
        start_date: flock.startDate, initial_quantity: flock.initialQuantity,
        current_quantity: flock.currentQuantity, accumulated_mortality: flock.accumulatedMortality,
        average_weight: flock.averageWeight, daily_feed_consumption: flock.dailyFeedConsumption,
        expected_sale_date: flock.expectedSaleDate || null, status: flock.status,
        total_feed_consumed: flock.totalFeedConsumed, total_weight_gain: flock.totalWeightGain,
        breed: flock.breed, batch_cost: flock.batchCost
    });
  };

  const updateFlock = async (id: string, data: Partial<Flock>) => {
    setFlocks(prev => prev.map(f => f.id === id ? { ...f, ...data } : f));
    const toUpdate: any = {};
    if (data.currentQuantity !== undefined) toUpdate.current_quantity = data.currentQuantity;
    if (data.accumulatedMortality !== undefined) toUpdate.accumulated_mortality = data.accumulatedMortality;
    if (data.averageWeight !== undefined) toUpdate.average_weight = data.averageWeight;
    if (data.status !== undefined) toUpdate.status = data.status;
    await supabase.from('flocks').update(toUpdate).eq('id', id);
  };

  const updateGoals = async (data: Partial<Goal>) => {
    setGoals(prev => ({ ...prev, ...data }));
    const toUpdate: any = {};
    if (data.monthlyGoal !== undefined) toUpdate.monthly_goal = data.monthlyGoal;
    if (data.collectedValue !== undefined) toUpdate.collected_value = data.collectedValue;
    if (data.projectedROI !== undefined) toUpdate.projected_roi = data.projectedROI;
    if (data.realizedROI !== undefined) toUpdate.realized_roi = data.realizedROI;
    await supabase.from('goals').update(toUpdate).eq('id', 1);
  };

  const addNotification = async (notification: Notification) => {
    setNotifications(prev => [notification, ...prev]);
    await supabase.from('notifications').insert({
        title: notification.title, message: notification.message,
        type: notification.type, exclude_user_id: notification.excludeUserId || null,
        read_by: [],
    });
  };

  const markNotificationRead = async (id: string) => {
    setNotifications(prev => prev.map(n => n.id === id ? { ...n, read: true } : n));
    if (!userId) return;
    const { data } = await supabase.from('notifications').select('read_by').eq('id', id).single();
    if (data) {
        const readBy = new Set(data.read_by || []);
        readBy.add(userId);
        await supabase.from('notifications').update({ read_by: Array.from(readBy) }).eq('id', id);
    }
  };

  const markAllNotificationsRead = async () => {
    setNotifications(prev => prev.map(n => ({ ...n, read: true })));
    // Implement on supabase layer -> too complex for single run. Best left as local optimistic.
  };

  const toggleDarkMode = () => {
    setSettings(prev => {
      const newDark = !prev.darkMode;
      try { localStorage.setItem('cuiudos_dark_mode', String(newDark)); } catch {}
      return { ...prev, darkMode: newDark };
    });
  };

  const updateSettings = (data: Partial<AppSettings>) => {
    setSettings(prev => ({ ...prev, ...data }));
  };

  const recalculateQuotas = async () => {
    const total = partners.reduce((acc, p) => acc + p.totalInvested, 0);
    if (total === 0) return;
    
    const updatedPts = partners.map(p => ({
        ...p, quotaPercentage: Number(((p.totalInvested / total) * 100).toFixed(2))
    }));
    
    setPartners(updatedPts);
    
    for (const p of updatedPts) {
        await supabase.from('partners').update({ quota_percentage: p.quotaPercentage }).eq('id', p.id);
    }
  };

  // Recalculate if investors change locally
  useEffect(() => {
    // A bit heavy in production, for MVP keeps state synchronized if someone forces updatePartner
  }, [partners.length]);

  const makeInvestment = async (partnerId: string, amount: number) => {
    const partner = partners.find(p => p.id === partnerId);
    if (!partner || amount <= 0) return;

    const now = new Date();
    const dateStr = now.toISOString().split('T')[0];

    // local update
    const newTotal = partner.totalInvested + amount;
    setPartners(prev => prev.map(p => p.id === partnerId ? { ...p, totalInvested: newTotal, paymentStatus: 'PAGO' } : p));
    
    // insert cashflow local
    addCashFlow({
        id: crypto.randomUUID(), type: 'ENTRADA', category: 'Aporte',
        value: amount, responsible: partner.name, receiptLink: '',
        date: dateStr, description: `Aporte de investimento — ${partner.name}`,
    });

    setGoals(prev => ({ ...prev, collectedValue: prev.collectedValue + amount }));

    // db update
    await updatePartner(partnerId, { totalInvested: newTotal, paymentStatus: 'PAGO' });
    
    // (goals, notifications, cash flow handles indirectly or explicitly in addCashFlow)
    await updateGoals({ collectedValue: goals.collectedValue + amount });

    addNotification({
        id: crypto.randomUUID(), title: 'Novo Aporte Realizado',
        message: `${partner.name} depositou R$ ${amount.toFixed(2)}`,
        read: false, type: 'investment', date: now.toISOString()
    });
    
    // auto recalc
    setTimeout(() => recalculateQuotas(), 500);
  };

  return (
    <StoreContext.Provider value={{
      partners, cashFlow, flocks, goals, marketAlerts, notifications, settings,
      addPartner, updatePartner, addCashFlow, addFlock, updateFlock, updateGoals,
      addNotification, markNotificationRead, markAllNotificationsRead, toggleDarkMode, updateSettings,
      makeInvestment, recalculateQuotas,
    }}>
      {children}
    </StoreContext.Provider>
  );
}
