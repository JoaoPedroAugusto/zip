import React, { useState } from 'react';
import {
  BrainCircuit,
  TrendingUp,
  ChevronDown,
  ChevronRight,
  Zap,
  DollarSign,
  X,
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

export default function DashboardPage({ onNavigate }: DashboardProps) {
  const { user } = useAuth();
  const { partners, cashFlow, flocks, goals, settings, makeInvestment } = useStore();
  const [showAllPartners, setShowAllPartners] = useState(false);
  const [showInvestModal, setShowInvestModal] = useState(false);
  const [investAmount, setInvestAmount] = useState('');

  const totalCapital = partners.reduce((acc, p) => acc + p.totalInvested, 0);
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
          <div className="absolute inset-0 bg-black/50" onClick={() => setShowInvestModal(false)} />
          <div className="relative bg-white dark:bg-[#1a2332] rounded-2xl p-6 sm:p-8 w-full max-w-md shadow-2xl animate-fade-in-up">
            <button onClick={() => setShowInvestModal(false)} className="absolute top-4 right-4 text-[#414844] dark:text-white/50 hover:text-[#012d1d]">
              <X className="w-5 h-5" />
            </button>
            <h3 className="font-headline font-bold text-xl text-[#012d1d] dark:text-white mb-1">Realizar Aporte</h3>
            <p className="text-sm text-[#414844] dark:text-white/50 mb-6">Informe o valor do seu investimento</p>
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
                  className="w-full bg-[#f3f4f3] dark:bg-white/10 border border-[#edeeed] dark:border-white/10 rounded-xl px-4 py-3.5 text-[#012d1d] dark:text-white text-lg font-bold focus:outline-none focus:ring-2 focus:ring-[#012d1d]/20"
                />
              </div>
              <button
                onClick={handleInvest}
                disabled={!investAmount || parseFloat(investAmount) <= 0}
                className="w-full bg-gradient-to-r from-[#012d1d] to-[#1b4332] text-white font-bold py-3.5 rounded-xl hover:opacity-90 active:scale-[0.98] transition-all disabled:opacity-40 disabled:cursor-not-allowed flex items-center justify-center gap-2"
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
          <p className="text-[10px] sm:text-xs uppercase tracking-[0.2em] font-bold text-[#7b5800] dark:text-[#ffdea6] mb-1">
            Resumo do Patrimônio
          </p>
          <h2 className="font-headline font-extrabold text-3xl sm:text-4xl lg:text-5xl text-[#012d1d] dark:text-white tracking-tighter">
            {formatCurrency(totalCapital)}
          </h2>
          <p className="text-[#414844] dark:text-white/50 text-xs sm:text-sm font-medium mt-1">
            Capital Total Integralizado {totalCapital > 0 ? `| Valuation: ${formatCurrencyCompact(valuation)}` : ''}
          </p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => setShowInvestModal(true)}
            className="bg-gradient-to-r from-[#ffdea6] to-[#f5c96a] text-[#5d4200] font-bold px-5 py-2.5 rounded-lg text-sm hover:brightness-105 active:scale-95 transition-all shadow-sm"
          >
            Realizar Aporte
          </button>
        </div>
      </div>

      {/* Empty State */}
      {isEmpty && (
        <div className="text-center py-16 bg-white dark:bg-white/5 rounded-2xl border border-dashed border-[#edeeed] dark:border-white/10">
          <div className="text-5xl mb-4">🐔</div>
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
                "bg-white dark:bg-white/5 p-4 sm:p-5 rounded-xl shadow-sm hover:shadow-md transition-all animate-fade-in-up border border-transparent dark:border-white/5",
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
                <div className="bg-white dark:bg-white/5 p-5 sm:p-6 rounded-2xl shadow-sm border border-transparent dark:border-white/5">
                  <h3 className="font-headline font-bold text-[#012d1d] dark:text-white text-sm mb-4">Despesas por Categoria</h3>
                  <div className="h-48 sm:h-52">
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie data={pieData} cx="50%" cy="50%" innerRadius={45} outerRadius={75} paddingAngle={3} dataKey="value">
                          {pieData.map((_, index) => (<Cell key={`cell-${index}`} fill={pieColors[index % pieColors.length]} />))}
                        </Pie>
                        <Tooltip formatter={(value: number) => formatCurrency(value)} contentStyle={{ borderRadius: '8px', border: 'none', fontSize: '12px' }} />
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
                <div className="bg-white dark:bg-white/5 p-5 sm:p-6 rounded-2xl shadow-sm border border-transparent dark:border-white/5 space-y-4">
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
                        "flex items-center justify-between p-3 bg-white dark:bg-white/10 rounded-xl hover:bg-gray-50 dark:hover:bg-white/15 transition-all shadow-sm cursor-pointer group",
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
                <h3 className="text-[10px] font-bold uppercase tracking-widest text-white/60 mb-3">Meu Investimento</h3>
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
