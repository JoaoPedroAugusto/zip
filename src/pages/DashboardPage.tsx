import React, { useState, useMemo } from 'react';
import {
  BrainCircuit,
  TrendingUp,
  ChevronDown,
  ChevronRight,
  Zap,
  DollarSign,
  X,
  Landmark,
  Calculator,
  Wallet,
  ArrowDownToLine,
  CalendarDays,
  Percent,
  BadgeDollarSign,
  PiggyBank,
  CircleDollarSign,
  Sparkles,
  Bird,
} from 'lucide-react';
import {
  LineChart, Line, BarChart, Bar, AreaChart, Area,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend,
  PieChart, Pie, Cell,
} from 'recharts';
import { useStore } from '../lib/store';
import { formatCurrency, formatCurrencyCompact, cn, getStatusColor, getInitials } from '../lib/utils';
import { calculateFCR, calculateBreakEven, calculateValuation } from '../lib/formulas';
import { useAuth } from '../lib/auth';

const COLORS = ['#012d1d', '#1b4332', '#2d6a4f', '#40916c', '#52b788', '#74c69d', '#95d5b2', '#b7e4c7', '#d8f3dc'];

type DashboardProps = {
  onNavigate: (page: string) => void;
};

// Itaú interest rate reference (CDI-based, ~100% CDI)
const ITAU_MONTHLY_RATE = 0.0087; // ~0.87% ao mês (CDI aprox. 10.75% a.a. = 0.87% a.m.)
const ITAU_ANNUAL_RATE = 0.1075; // ~10.75% a.a. (referência Itaú CDI)

function calculateCompoundInterest(principal: number, monthlyRate: number, months: number) {
  const total = principal * Math.pow(1 + monthlyRate, months);
  const interest = total - principal;
  return { total, interest };
}

export default function DashboardPage({ onNavigate }: DashboardProps) {
  const { user } = useAuth();
  const { partners, cashFlow, flocks, goals, settings, makeInvestment } = useStore();
  const [showAllPartners, setShowAllPartners] = useState(false);
  const [showInvestModal, setShowInvestModal] = useState(false);
  const [investAmount, setInvestAmount] = useState('');
  const [showInterestCalc, setShowInterestCalc] = useState(false);

  // Interest calculator state
  const SEED_CAPITAL = 21000; // Base fixa inicial
  const [interestMonths, setInterestMonths] = useState(12);
  const [interestRate, setInterestRate] = useState(0.87);
  const [baseWithdrawn, setBaseWithdrawn] = useState(false);

  const totalCapital = partners.reduce((acc, p) => acc + p.totalInvested, 0);
  // Bola de neve: base fixa R$21k + todos os aportes realizados
  const interestBase = SEED_CAPITAL + totalCapital;
  const goalPercentage = goals.monthlyGoal > 0 ? Math.min((goals.collectedValue / goals.monthlyGoal) * 100, 100) : 0;

  const activeFlock = flocks.find(f => f.status === 'ATIVO');
  const fcr = activeFlock ? calculateFCR(activeFlock.totalFeedConsumed, activeFlock.totalWeightGain) : 0;

  const totalEntries = cashFlow.filter(c => c.type === 'ENTRADA').reduce((a, c) => a + c.value, 0);
  const totalExits = cashFlow.filter(c => c.type === 'SAIDA').reduce((a, c) => a + c.value, 0);
  const cashFlowBalance = totalEntries - totalExits;

  const valuation = calculateValuation(totalCapital, 1.8);

  const paidCount = partners.filter(p => p.paymentStatus === 'PAGO').length;
  const pendingCount = partners.filter(p => p.paymentStatus === 'PENDENTE').length;
  const lateCount = partners.filter(p => p.paymentStatus === 'ATRASADO').length;

  // Expense breakdown for pie chart
  const expenseByCategory: Record<string, number> = {};
  cashFlow.filter(c => c.type === 'SAIDA').forEach(c => {
    expenseByCategory[c.category] = (expenseByCategory[c.category] || 0) + c.value;
  });
  const pieData = Object.entries(expenseByCategory).map(([name, value]) => ({ name, value }));
  const pieColors = ['#012d1d', '#1b4332', '#2d6a4f', '#40916c', '#52b788', '#7b5800', '#c4860a', '#e5a42b', '#ffdea6'];

  const displayPartners = showAllPartners ? partners : partners.slice(0, 5);

  // Interest calculation
  const monthlyRateDecimal = interestRate / 100;
  const interestData = useMemo(() => {
    const data = [];
    for (let m = 0; m <= interestMonths; m++) {
      const { total, interest } = calculateCompoundInterest(interestBase, monthlyRateDecimal, m);
      data.push({
        month: m,
        label: m === 0 ? 'Hoje' : `${m}m`,
        total: Number(total.toFixed(2)),
        interest: Number(interest.toFixed(2)),
        base: interestBase,
      });
    }
    return data;
  }, [interestBase, interestMonths, monthlyRateDecimal]);

  const finalCalc = interestData[interestData.length - 1];
  const netAfterWithdrawal = baseWithdrawn ? finalCalc.interest : finalCalc.total;

  const handleInvest = () => {
    const amount = parseFloat(investAmount);
    if (!user || isNaN(amount) || amount <= 0) return;
    makeInvestment(user.id, amount);
    setInvestAmount('');
    setShowInvestModal(false);
  };

  const isEmpty = partners.length === 0 && cashFlow.length === 0;

  return (
    <div className="space-y-8 sm:space-y-10 animate-fade-in">
      {/* Invest Modal */}
      {showInvestModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={() => setShowInvestModal(false)} />
          <div className="relative bg-white dark:bg-[#1a2332] rounded-2xl p-6 sm:p-8 w-full max-w-md shadow-2xl animate-fade-in-up">
            <button onClick={() => setShowInvestModal(false)} className="absolute top-4 right-4 text-[#414844] dark:text-white/50 hover:text-[#012d1d] transition-colors">
              <X className="w-5 h-5" />
            </button>
            <div className="flex items-center gap-3 mb-1">
              <div className="w-10 h-10 bg-gradient-to-br from-[#ffdea6] to-[#f5c96a] rounded-xl flex items-center justify-center shadow-md">
                <BadgeDollarSign className="w-5 h-5 text-[#5d4200]" />
              </div>
              <h3 className="font-headline font-bold text-xl text-[#012d1d] dark:text-white">Realizar Aporte</h3>
            </div>
            <p className="text-sm text-[#414844] dark:text-white/50 mb-6 ml-[52px]">Informe o valor do seu investimento</p>
            <div className="space-y-4">
              <div>
                <label className="text-[10px] font-bold uppercase tracking-wider text-[#414844] dark:text-white/60 mb-1 block">
                  Valor do Aporte (R$)
                </label>
                <input
                  type="number"
                  value={investAmount}
                  onChange={e => setInvestAmount(e.target.value)}
                  placeholder="0,00"
                  min="1"
                  step="0.01"
                  className="w-full bg-[#f3f4f3] dark:bg-white/10 border border-[#edeeed] dark:border-white/10 rounded-xl px-4 py-3.5 text-[#012d1d] dark:text-white text-lg font-bold focus:outline-none focus:ring-2 focus:ring-[#012d1d]/20 transition-all"
                />
              </div>
              <button
                onClick={handleInvest}
                disabled={!investAmount || parseFloat(investAmount) <= 0}
                className="w-full bg-gradient-to-r from-[#012d1d] to-[#1b4332] text-white font-bold py-3.5 rounded-xl hover:opacity-90 active:scale-[0.98] transition-all disabled:opacity-40 disabled:cursor-not-allowed flex items-center justify-center gap-2 shadow-lg"
              >
                <DollarSign className="w-4 h-4" /> Confirmar Investimento
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Welcome / Equity Summary */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
        <div>
          <p className="text-[10px] sm:text-xs uppercase tracking-[0.2em] font-bold text-[#7b5800] dark:text-[#ffdea6] mb-1 flex items-center gap-1.5">
            <Sparkles className="w-3.5 h-3.5" />
            Resumo do Patrimônio
          </p>
          <h2 className="font-headline font-extrabold text-3xl sm:text-4xl lg:text-5xl text-[#012d1d] dark:text-white tracking-tighter">
            {formatCurrency(totalCapital)}
          </h2>
          <p className="text-[#414844] dark:text-white/50 text-xs sm:text-sm font-medium mt-1">
            Capital Total Integralizado {totalCapital > 0 ? `| Valuation: ${formatCurrencyCompact(valuation)}` : ''}
          </p>
        </div>
        <div className="flex gap-2 flex-wrap">
          <button
            onClick={() => setShowInterestCalc(!showInterestCalc)}
            className="bg-gradient-to-r from-[#ec7000] to-[#ff8c1a] text-white font-bold px-5 py-2.5 rounded-lg text-sm hover:brightness-110 active:scale-95 transition-all shadow-md flex items-center gap-2"
          >
            <Landmark className="w-4 h-4" /> Juros Itaú
          </button>
          <button
            onClick={() => setShowInvestModal(true)}
            className="bg-gradient-to-r from-[#ffdea6] to-[#f5c96a] text-[#5d4200] font-bold px-5 py-2.5 rounded-lg text-sm hover:brightness-105 active:scale-95 transition-all shadow-sm"
          >
            Realizar Aporte
          </button>
        </div>
      </div>

      {/* ============== ITAÚ INTEREST CALCULATOR ============== */}
      {showInterestCalc && (
        <div className="animate-fade-in-up">
          <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-[#ec7000] via-[#ff8c1a] to-[#f5a623] p-[1px] shadow-2xl">
            <div className="bg-white dark:bg-[#1a2332] rounded-2xl overflow-hidden">
              {/* Header */}
              <div className="bg-gradient-to-r from-[#ec7000] to-[#ff8c1a] px-5 sm:px-6 py-4 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-11 h-11 bg-white/20 backdrop-blur-sm rounded-xl flex items-center justify-center shadow-inner">
                    <Landmark className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <h3 className="font-headline font-extrabold text-white text-lg tracking-tight flex items-center gap-2">
                      Simulador de Juros
                      <span className="text-[9px] bg-white/20 px-2 py-0.5 rounded-full font-bold uppercase">Itaú</span>
                    </h3>
                    <p className="text-white/70 text-xs">Rendimento CDI · Juros Compostos</p>
                  </div>
                </div>
                <button onClick={() => setShowInterestCalc(false)} className="text-white/60 hover:text-white transition-colors p-1">
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="p-5 sm:p-6 space-y-6">
                {/* Controls */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div>
                    <label className="text-[10px] font-bold uppercase tracking-wider text-[#414844] dark:text-white/60 mb-1.5 block flex items-center gap-1.5">
                      <Wallet className="w-3.5 h-3.5" /> Capital Base (Bola de Neve)
                    </label>
                    <div className="w-full bg-[#f3f4f3] dark:bg-white/10 border border-[#edeeed] dark:border-white/10 rounded-xl px-4 py-3">
                      <p className="text-[#012d1d] dark:text-white text-sm font-bold">{formatCurrency(interestBase)}</p>
                      <p className="text-[9px] text-[#414844] dark:text-white/40 mt-0.5">
                        {formatCurrency(SEED_CAPITAL)} base {totalCapital > 0 ? `+ ${formatCurrency(totalCapital)} aportes` : '· Faça aportes para crescer'}
                      </p>
                    </div>
                  </div>
                  <div>
                    <label className="text-[10px] font-bold uppercase tracking-wider text-[#414844] dark:text-white/60 mb-1.5 block flex items-center gap-1.5">
                      <CalendarDays className="w-3.5 h-3.5" /> Período (meses)
                    </label>
                    <input
                      type="number"
                      value={interestMonths}
                      onChange={e => setInterestMonths(Math.max(1, Math.min(120, parseInt(e.target.value) || 1)))}
                      min="1"
                      max="120"
                      className="w-full bg-[#f3f4f3] dark:bg-white/10 border border-[#edeeed] dark:border-white/10 rounded-xl px-4 py-3 text-[#012d1d] dark:text-white text-sm font-bold focus:outline-none focus:ring-2 focus:ring-[#ec7000]/30 transition-all"
                    />
                  </div>
                  <div>
                    <label className="text-[10px] font-bold uppercase tracking-wider text-[#414844] dark:text-white/60 mb-1.5 block flex items-center gap-1.5">
                      <Percent className="w-3.5 h-3.5" /> Taxa Mensal (%)
                    </label>
                    <input
                      type="number"
                      value={interestRate}
                      onChange={e => setInterestRate(Math.max(0, parseFloat(e.target.value) || 0))}
                      step="0.01"
                      className="w-full bg-[#f3f4f3] dark:bg-white/10 border border-[#edeeed] dark:border-white/10 rounded-xl px-4 py-3 text-[#012d1d] dark:text-white text-sm font-bold focus:outline-none focus:ring-2 focus:ring-[#ec7000]/30 transition-all"
                    />
                  </div>
                </div>

                {/* Quick Presets */}
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="text-[10px] font-bold text-[#414844] dark:text-white/50 uppercase tracking-wider mr-1">Período:</span>
                  {[3, 6, 12, 24, 36, 60].map(m => (
                    <button
                      key={m}
                      onClick={() => setInterestMonths(m)}
                      className={cn(
                        "px-3 py-1.5 rounded-lg text-[10px] font-bold transition-all",
                        interestMonths === m
                          ? "bg-[#ec7000] text-white shadow-sm"
                          : "bg-[#f3f4f3] dark:bg-white/10 text-[#414844] dark:text-white/60 hover:bg-[#ec7000]/10"
                      )}
                    >
                      {m}m
                    </button>
                  ))}
                </div>

                {/* Results Grid */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                  <div className="bg-gradient-to-br from-[#ec7000]/5 to-[#ff8c1a]/10 dark:from-[#ec7000]/10 dark:to-[#ff8c1a]/5 rounded-xl p-4 border border-[#ec7000]/10">
                    <div className="flex items-center gap-1.5 mb-2">
                      <Wallet className="w-3.5 h-3.5 text-[#ec7000]" />
                      <p className="text-[9px] font-bold uppercase tracking-wider text-[#414844] dark:text-white/50">Capital Inicial</p>
                    </div>
                    <p className="text-lg sm:text-xl font-headline font-extrabold text-[#012d1d] dark:text-white tracking-tight">
                      {formatCurrency(interestBase)}
                    </p>
                  </div>
                  <div className="bg-gradient-to-br from-emerald-50 to-emerald-100/50 dark:from-emerald-900/10 dark:to-emerald-800/5 rounded-xl p-4 border border-emerald-200/50 dark:border-emerald-800/20">
                    <div className="flex items-center gap-1.5 mb-2">
                      <TrendingUp className="w-3.5 h-3.5 text-emerald-600" />
                      <p className="text-[9px] font-bold uppercase tracking-wider text-[#414844] dark:text-white/50">Juros Ganhos</p>
                    </div>
                    <p className="text-lg sm:text-xl font-headline font-extrabold text-emerald-600 tracking-tight">
                      +{formatCurrency(finalCalc.interest)}
                    </p>
                  </div>
                  <div className="bg-gradient-to-br from-blue-50 to-blue-100/50 dark:from-blue-900/10 dark:to-blue-800/5 rounded-xl p-4 border border-blue-200/50 dark:border-blue-800/20">
                    <div className="flex items-center gap-1.5 mb-2">
                      <PiggyBank className="w-3.5 h-3.5 text-blue-600" />
                      <p className="text-[9px] font-bold uppercase tracking-wider text-[#414844] dark:text-white/50">Total Final</p>
                    </div>
                    <p className="text-lg sm:text-xl font-headline font-extrabold text-blue-600 tracking-tight">
                      {formatCurrency(finalCalc.total)}
                    </p>
                  </div>
                  <div className={cn(
                    "rounded-xl p-4 border transition-all",
                    baseWithdrawn
                      ? "bg-gradient-to-br from-amber-50 to-amber-100/50 dark:from-amber-900/10 dark:to-amber-800/5 border-amber-200/50 dark:border-amber-800/20"
                      : "bg-gradient-to-br from-[#012d1d]/5 to-[#1b4332]/5 dark:from-white/5 dark:to-white/[0.02] border-[#012d1d]/10 dark:border-white/10"
                  )}>
                    <div className="flex items-center gap-1.5 mb-2">
                      <CircleDollarSign className={cn("w-3.5 h-3.5", baseWithdrawn ? "text-amber-600" : "text-[#012d1d] dark:text-white/60")} />
                      <p className="text-[9px] font-bold uppercase tracking-wider text-[#414844] dark:text-white/50">
                        {baseWithdrawn ? 'Só os Juros' : 'Líquido Total'}
                      </p>
                    </div>
                    <p className={cn("text-lg sm:text-xl font-headline font-extrabold tracking-tight",
                      baseWithdrawn ? "text-amber-600" : "text-[#012d1d] dark:text-white"
                    )}>
                      {formatCurrency(netAfterWithdrawal)}
                    </p>
                  </div>
                </div>

                {/* Withdraw Base Button */}
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 p-4 bg-[#f3f4f3] dark:bg-white/5 rounded-xl">
                  <div className="flex items-center gap-3">
                    <div className={cn(
                      "w-10 h-10 rounded-xl flex items-center justify-center transition-all",
                      baseWithdrawn ? "bg-amber-100 dark:bg-amber-900/20" : "bg-[#edeeed] dark:bg-white/10"
                    )}>
                      <ArrowDownToLine className={cn("w-5 h-5", baseWithdrawn ? "text-amber-600" : "text-[#414844] dark:text-white/50")} />
                    </div>
                    <div>
                      <p className="font-bold text-sm text-[#012d1d] dark:text-white">Retirar Capital Base</p>
                      <p className="text-xs text-[#414844] dark:text-white/50 mt-0.5">
                        {baseWithdrawn
                          ? `Você retirou ${formatCurrency(interestBase)} — ficam apenas os juros`
                          : 'Simule a retirada do dinheiro investido e veja só os juros'}
                      </p>
                    </div>
                  </div>
                  <button
                    onClick={() => setBaseWithdrawn(!baseWithdrawn)}
                    className={cn(
                      "relative w-14 h-7 rounded-full transition-all duration-300 focus:outline-none focus:ring-2 shrink-0",
                      baseWithdrawn ? "bg-amber-500 focus:ring-amber-300" : "bg-[#e1e3e2] dark:bg-white/20 focus:ring-[#012d1d]/20"
                    )}
                  >
                    <div className={cn(
                      "absolute top-0.5 w-6 h-6 rounded-full bg-white shadow-md transition-all duration-300 flex items-center justify-center",
                      baseWithdrawn ? "left-7" : "left-0.5"
                    )}>
                      <ArrowDownToLine className={cn("w-3 h-3", baseWithdrawn ? "text-amber-500" : "text-gray-400")} />
                    </div>
                  </button>
                </div>

                {/* Chart */}
                <div className="h-52 sm:h-64">
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={interestData} margin={{ top: 5, right: 5, left: -15, bottom: 0 }}>
                      <defs>
                        <linearGradient id="interestGradient" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#ec7000" stopOpacity={0.3} />
                          <stop offset="95%" stopColor="#ec7000" stopOpacity={0} />
                        </linearGradient>
                        <linearGradient id="baseGradient" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#012d1d" stopOpacity={0.15} />
                          <stop offset="95%" stopColor="#012d1d" stopOpacity={0} />
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" stroke="rgba(0,0,0,0.06)" />
                      <XAxis dataKey="label" tick={{ fontSize: 10 }} />
                      <YAxis tick={{ fontSize: 10 }} tickFormatter={v => `R$${(v / 1000).toFixed(0)}k`} />
                      <Tooltip
                        formatter={(value: number, name: string) => [
                          formatCurrency(value),
                          name === 'total' ? 'Total' : name === 'interest' ? 'Juros' : 'Base'
                        ]}
                        contentStyle={{ borderRadius: '12px', border: 'none', fontSize: '12px', boxShadow: '0 4px 20px rgba(0,0,0,0.1)' }}
                      />
                      <Area type="monotone" dataKey="total" stroke="#ec7000" strokeWidth={2.5} fill="url(#interestGradient)" />
                      <Area type="monotone" dataKey="base" stroke="#012d1d" strokeWidth={1.5} fill="url(#baseGradient)" strokeDasharray="5 5" />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>

                {/* Info Footer */}
                <div className="flex items-center gap-2 text-[10px] text-[#414844] dark:text-white/40 bg-[#f3f4f3]/50 dark:bg-white/[0.02] rounded-lg px-3 py-2">
                  <Calculator className="w-3.5 h-3.5 shrink-0" />
                  <span>
                    Simulação baseada em taxa CDI de referência Itaú ({(interestRate).toFixed(2)}% a.m. / {((Math.pow(1 + monthlyRateDecimal, 12) - 1) * 100).toFixed(2)}% a.a.).
                    Valores aproximados, sujeitos a variação.
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Empty State */}
      {isEmpty && (
        <div className="text-center py-16 bg-white dark:bg-white/5 rounded-2xl border border-dashed border-[#edeeed] dark:border-white/10">
          <div className="w-16 h-16 mx-auto mb-4 bg-gradient-to-br from-[#012d1d] to-[#1b4332] rounded-2xl flex items-center justify-center shadow-lg">
            <Bird className="w-8 h-8 text-white" />
          </div>
          <h3 className="font-headline font-bold text-xl text-[#012d1d] dark:text-white mb-2">Bem-vindo ao Cuiudos Sócios!</h3>
          <p className="text-[#414844] dark:text-white/50 text-sm max-w-md mx-auto">
            Seu painel está vazio. Comece realizando seu primeiro aporte para ver os dados aqui.
          </p>
        </div>
      )}

      {/* Progress Bar */}
      {goals.monthlyGoal > 0 && (
        <div className="space-y-3">
          <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-2">
            <div className="flex items-baseline gap-2">
              <span className="text-xl sm:text-2xl font-bold text-[#012d1d] dark:text-white">{goalPercentage.toFixed(0)}%</span>
              <span className="text-[#414844] dark:text-white/50 text-sm">da meta mensal atingida</span>
            </div>
            <div className="text-right">
              <p className="text-xs font-bold text-[#414844] dark:text-white/50 uppercase">Meta: {formatCurrency(goals.monthlyGoal)}</p>
            </div>
          </div>
          <div className="h-3 w-full bg-[#edeeed] dark:bg-white/10 rounded-full overflow-hidden">
            <div className="h-full bg-gradient-to-r from-[#012d1d] to-[#1b4332] rounded-full transition-all duration-1000" style={{ width: `${goalPercentage}%` }} />
          </div>
        </div>
      )}

      {/* KPIs */}
      {partners.length > 0 && (
        <section className="grid grid-cols-1 xs:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3 sm:gap-4">
          {[
            { label: 'Sócios', value: `${partners.length}`, badge: `${paidCount} pagos`, badgeColor: 'bg-emerald-100 text-emerald-700' },
            { label: 'Mortalidade', value: activeFlock ? `${activeFlock.accumulatedMortality}%` : 'N/A', badge: activeFlock ? (activeFlock.accumulatedMortality < 2 ? 'CONTROLADO' : 'ALERTA') : '', badgeColor: activeFlock && activeFlock.accumulatedMortality < 2 ? 'bg-blue-50 text-blue-700' : 'bg-red-100 text-red-700' },
            { label: 'CA', value: activeFlock ? fcr.toFixed(2) : 'N/A', badge: activeFlock ? (fcr < 1.5 ? 'ÓTIMO' : fcr < 1.8 ? 'BOM' : 'ATENÇÃO') : '', badgeColor: fcr < 1.5 ? 'bg-emerald-100 text-emerald-800' : fcr < 1.8 ? 'bg-blue-100 text-blue-700' : 'bg-red-100 text-red-700', accent: true },
            { label: 'Entradas', value: formatCurrencyCompact(totalEntries), valueColor: 'text-emerald-600' },
            { label: 'Fluxo de Caixa', value: `${cashFlowBalance >= 0 ? '+' : ''}${formatCurrencyCompact(cashFlowBalance)}`, valueColor: cashFlowBalance >= 0 ? 'text-emerald-600' : 'text-red-600' },
          ].map((kpi, i) => (
            <div
              key={kpi.label}
              className={cn(
                "bg-white dark:bg-white/5 p-4 sm:p-5 rounded-xl shadow-sm hover:shadow-md transition-all animate-fade-in-up border border-transparent dark:border-white/5 hover:-translate-y-0.5",
                kpi.accent && "border-b-4 border-[#012d1d] dark:border-[#ffdea6]"
              )}
              style={{ animationDelay: `${i * 80}ms` }}
            >
              <p className="text-[9px] sm:text-[10px] font-bold uppercase tracking-wider text-[#414844] dark:text-white/50 mb-2 sm:mb-3">{kpi.label}</p>
              <div className="flex items-baseline gap-2 flex-wrap">
                <span className={cn("text-xl sm:text-2xl font-headline font-extrabold tracking-tighter", kpi.valueColor || "text-[#012d1d] dark:text-white")}>
                  {kpi.value}
                </span>
                {kpi.badge && (
                  <span className={cn("text-[9px] px-2 py-0.5 rounded-full font-bold", kpi.badgeColor)}>
                    {kpi.badge}
                  </span>
                )}
              </div>
            </div>
          ))}
        </section>
      )}

      {/* Main Grid */}
      {partners.length > 0 && (
        <div className="grid grid-cols-1 lg:grid-cols-[1fr_300px] xl:grid-cols-[1fr_320px] gap-6 lg:gap-8">
          <div className="space-y-8">
            {/* AI Insight */}
            <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-[#012d1d] to-[#1b4332] p-[1px] shadow-xl animate-fade-in-up delay-200">
              <div className="bg-white/10 backdrop-blur-xl p-5 sm:p-6 flex gap-5 items-start rounded-2xl">
                <div className="w-12 h-12 bg-[#ffdea6] rounded-full flex items-center justify-center shrink-0 shadow-lg animate-float">
                  <BrainCircuit className="text-[#5d4200] w-6 h-6" />
                </div>
                <div className="space-y-2 flex-1">
                  <h3 className="font-headline font-extrabold text-white text-lg tracking-tight flex items-center gap-2">
                    Painel Inteligente <Zap className="w-4 h-4 text-[#ffdea6]" />
                  </h3>
                  <div className="bg-[#ffdea6]/90 backdrop-blur rounded-lg p-4 border-l-4 border-[#7b5800]">
                    <p className="text-[#5d4200] font-medium leading-relaxed italic text-sm">
                      "O grupo possui {partners.length} sócios com capital total de {formatCurrency(totalCapital)}.
                      {cashFlowBalance >= 0
                        ? ` Fluxo de caixa positivo de ${formatCurrencyCompact(cashFlowBalance)}.`
                        : ` Atenção: fluxo de caixa negativo de ${formatCurrencyCompact(cashFlowBalance)}.`
                      }
                      {activeFlock
                        ? ` O ${activeFlock.id} tem ${activeFlock.currentQuantity.toLocaleString('pt-BR')} aves ativas.`
                        : ' Nenhum lote ativo no momento.'
                      }"
                    </p>
                  </div>
                </div>
              </div>
              <div className="absolute inset-0 animate-shimmer pointer-events-none rounded-2xl" />
            </div>

            {/* Expense Pie Chart */}
            {pieData.length > 0 && (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
                <div className="bg-white dark:bg-white/5 p-5 sm:p-6 rounded-2xl shadow-sm border border-transparent dark:border-white/5 hover:shadow-md transition-all">
                  <h3 className="font-headline font-bold text-[#012d1d] dark:text-white text-sm mb-4">Despesas por Categoria</h3>
                  <div className="h-48 sm:h-52">
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie data={pieData} cx="50%" cy="50%" innerRadius={45} outerRadius={75} paddingAngle={3} dataKey="value">
                          {pieData.map((_, index) => (<Cell key={`cell-${index}`} fill={pieColors[index % pieColors.length]} />))}
                        </Pie>
                        <Tooltip formatter={(value: number) => formatCurrency(value)} contentStyle={{ borderRadius: '12px', border: 'none', fontSize: '12px', boxShadow: '0 4px 20px rgba(0,0,0,0.1)' }} />
                      </PieChart>
                    </ResponsiveContainer>
                  </div>
                  <div className="grid grid-cols-2 gap-1 mt-2">
                    {pieData.map((item, i) => (
                      <div key={item.name} className="flex items-center gap-1.5 text-[10px]">
                        <span className="w-2 h-2 rounded-full shrink-0" style={{ backgroundColor: pieColors[i % pieColors.length] }} />
                        <span className="text-[#414844] dark:text-white/50 truncate">{item.name}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Quick Stats */}
                <div className="bg-white dark:bg-white/5 p-5 sm:p-6 rounded-2xl shadow-sm border border-transparent dark:border-white/5 space-y-4 hover:shadow-md transition-all">
                  <h3 className="font-headline font-bold text-[#012d1d] dark:text-white text-sm">Resumo Financeiro</h3>
                  <div className="space-y-3">
                    <div className="flex justify-between text-xs">
                      <span className="text-[#414844] dark:text-white/50">Total Entradas</span>
                      <span className="font-bold text-emerald-600">{formatCurrency(totalEntries)}</span>
                    </div>
                    <div className="flex justify-between text-xs">
                      <span className="text-[#414844] dark:text-white/50">Total Saídas</span>
                      <span className="font-bold text-red-600">{formatCurrency(totalExits)}</span>
                    </div>
                    <div className="h-px bg-[#edeeed] dark:bg-white/10" />
                    <div className="flex justify-between text-xs">
                      <span className="text-[#414844] dark:text-white/50">Saldo</span>
                      <span className={cn("font-bold", cashFlowBalance >= 0 ? "text-emerald-600" : "text-red-600")}>
                        {cashFlowBalance >= 0 ? '+' : ''}{formatCurrency(cashFlowBalance)}
                      </span>
                    </div>
                    <div className="h-px bg-[#edeeed] dark:bg-white/10" />
                    <div className="flex justify-between text-xs">
                      <span className="text-[#414844] dark:text-white/50">Valuation (1.8x)</span>
                      <span className="font-bold text-[#7b5800]">{formatCurrency(valuation)}</span>
                    </div>
                    {goals.projectedROI > 0 && (
                      <div className="flex justify-between text-xs">
                        <span className="text-[#414844] dark:text-white/50">ROI Projetado</span>
                        <span className="font-bold text-[#012d1d] dark:text-[#ffdea6]">{goals.projectedROI}%</span>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Partner Sidebar */}
          <div className="space-y-6">
            <div className="bg-[#e1e3e2] dark:bg-white/5 rounded-2xl p-5 shadow-sm animate-slide-in-right border border-transparent dark:border-white/5">
              <div className="flex items-center justify-between mb-5">
                <h3 className="font-headline font-bold text-[#012d1d] dark:text-white text-sm uppercase tracking-wider">Sócios do Grupo</h3>
                <span className="text-[10px] bg-[#012d1d]/10 dark:bg-white/10 text-[#012d1d] dark:text-white/70 px-2 py-0.5 rounded font-bold">
                  {partners.length} {partners.length === 1 ? 'Sócio' : 'Sócios'}
                </span>
              </div>

              {partners.length === 0 ? (
                <p className="text-center text-sm text-[#414844] dark:text-white/40 py-8">Nenhum sócio cadastrado ainda.</p>
              ) : (
                <div className="space-y-2.5">
                  {displayPartners.map((partner) => (
                    <div
                      key={partner.id}
                      className={cn(
                        "flex items-center justify-between p-3 bg-white dark:bg-white/10 rounded-xl hover:bg-gray-50 dark:hover:bg-white/15 transition-all shadow-sm cursor-pointer group hover:-translate-y-0.5",
                        partner.id === user?.id && "ring-2 ring-[#012d1d]/20 dark:ring-[#ffdea6]/30"
                      )}
                      onClick={() => onNavigate('socios')}
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-gradient-to-br from-[#012d1d] to-[#1b4332] flex items-center justify-center text-[9px] font-bold text-white">
                          {getInitials(partner.name)}
                        </div>
                        <div>
                          <p className="text-xs font-bold text-[#012d1d] dark:text-white">{partner.name}</p>
                          <p className="text-[10px] text-[#414844] dark:text-white/40">
                            {partner.quotaPercentage > 0 ? `${partner.quotaPercentage}%` : 'Sem aporte'}
                          </p>
                        </div>
                      </div>
                      <span className={cn("text-[8px] font-bold px-2 py-0.5 rounded-full uppercase", getStatusColor(partner.paymentStatus))}>
                        {partner.paymentStatus}
                      </span>
                    </div>
                  ))}
                  {partners.length > 5 && (
                    <button
                      onClick={() => setShowAllPartners(!showAllPartners)}
                      className="w-full py-2 text-[10px] font-bold text-[#414844] dark:text-white/50 hover:text-[#012d1d] dark:hover:text-white transition-colors uppercase tracking-widest flex items-center justify-center gap-1"
                    >
                      {showAllPartners ? 'Ver Menos' : 'Ver Todos'}
                      <ChevronDown className={cn("w-3.5 h-3.5 transition-transform", showAllPartners && "rotate-180")} />
                    </button>
                  )}
                </div>
              )}
            </div>

            {/* My Investment */}
            {user && user.totalInvested > 0 && (
              <div className="bg-gradient-to-br from-[#012d1d] to-[#1b4332] rounded-2xl p-5 text-white shadow-lg animate-slide-in-right delay-200">
                <h3 className="text-[10px] font-bold uppercase tracking-widest text-white/60 mb-3 flex items-center gap-1.5">
                  <PiggyBank className="w-3.5 h-3.5" /> Meu Investimento
                </h3>
                <div className="space-y-3">
                  <div className="flex justify-between items-baseline">
                    <span className="text-white/60 text-xs">Total Investido</span>
                    <span className="font-headline font-extrabold text-xl">{formatCurrency(user.totalInvested)}</span>
                  </div>
                  <div className="flex justify-between items-baseline">
                    <span className="text-white/60 text-xs">Minha Cota</span>
                    <span className="font-bold">{user.quotaPercentage}%</span>
                  </div>
                  <div className="flex justify-between items-baseline">
                    <span className="text-white/60 text-xs">Meu Valuation</span>
                    <span className="font-bold text-[#ffdea6]">{formatCurrency(valuation * (user.quotaPercentage / 100))}</span>
                  </div>
                  <div className="h-px bg-white/10" />
                  <div className="flex justify-between items-center">
                    <span className="text-white/60 text-xs">Status do Mês</span>
                    <span className={cn("text-[9px] font-bold px-2.5 py-1 rounded-full uppercase", getStatusColor(user.paymentStatus))}>
                      {user.paymentStatus}
                    </span>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
