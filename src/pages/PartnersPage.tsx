import React, { useState } from 'react';
import {
  Users, Mail, Phone, Calendar, DollarSign, Search, ChevronDown,
  Shield, PieChart as PieChartIcon, Eye, EyeOff, CheckCircle2,
  Clock, AlertTriangle, UserCheck, Crown,
} from 'lucide-react';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts';
import { useStore } from '../lib/store';
import { formatCurrency, formatDate, cn, getStatusColor, getInitials } from '../lib/utils';
import { calculateValuation } from '../lib/formulas';
import { useAuth } from '../lib/auth';

const COLORS = ['#012d1d', '#1b4332', '#2d6a4f', '#40916c', '#52b788', '#74c69d', '#95d5b2', '#b7e4c7', '#d8f3dc'];
type FilterType = 'TODOS' | 'PAGO' | 'PENDENTE' | 'ATRASADO';

export default function PartnersPage() {
  const { user } = useAuth();
  const { partners } = useStore();
  const [filter, setFilter] = useState<FilterType>('TODOS');
  const [search, setSearch] = useState('');
  const [selectedPartner, setSelectedPartner] = useState<string | null>(null);
  
  const isAdmin = user?.role === 'admin';
  const [showPrivateData, setShowPrivateData] = useState(!isAdmin);
  const adminAlwaysShows = user?.role === 'admin' ? false : false;

  const totalCapital = partners.reduce((a, p) => a + p.totalInvested, 0);
  const valuation = calculateValuation(totalCapital, 1.8);

  const filteredPartners = partners.filter(p => {
    const matchFilter = filter === 'TODOS' || p.paymentStatus === filter;
    const matchSearch = p.name.toLowerCase().includes(search.toLowerCase()) || p.email.toLowerCase().includes(search.toLowerCase());
    return matchFilter && matchSearch;
  });

  const equityData = partners.filter(p => p.totalInvested > 0).map(p => ({
    name: p.name.split(' ')[0],
    value: p.totalInvested,
  }));
  const paidCount = partners.filter(p => p.paymentStatus === 'PAGO').length;

  return (
    <div className="space-y-8 animate-fade-in">
      <div className="flex justify-between items-start flex-wrap gap-4">
        <div>
          <h1 className="font-headline font-extrabold text-2xl sm:text-3xl text-[#012d1d] dark:text-white tracking-tight">
            Conselho de Sócios
          </h1>
          <p className="text-[#414844] dark:text-white/50 text-xs sm:text-sm font-medium mt-1">
            Gestão de participações, aportes e patrimônio do grupo
          </p>
        </div>
        {isAdmin && (
          <button
            onClick={() => setShowPrivateData(!showPrivateData)}
            className="flex items-center gap-2 bg-white dark:bg-white/10 text-[#012d1d] dark:text-white border border-[#edeeed] dark:border-white/10 px-4 py-2.5 rounded-lg text-sm font-bold hover:bg-gray-50 dark:hover:bg-white/15 transition-all"
          >
            {showPrivateData ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
            {showPrivateData ? 'Ocultar Detalhes' : 'Ver Detalhes'}
          </button>
        )}
      </div>

      {/* Summary */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        <div className="bg-white dark:bg-white/5 p-4 sm:p-5 rounded-xl shadow-sm border border-transparent dark:border-white/5 hover:shadow-md hover:-translate-y-0.5 transition-all">
          <p className="text-[9px] sm:text-[10px] font-bold uppercase tracking-wider text-[#414844] dark:text-white/50 mb-2">Total de Sócios</p>
          <p className="text-2xl sm:text-3xl font-headline font-extrabold text-[#012d1d] dark:text-white">{partners.length}</p>
        </div>
        <div className="bg-white dark:bg-white/5 p-4 sm:p-5 rounded-xl shadow-sm border border-transparent dark:border-white/5 hover:shadow-md hover:-translate-y-0.5 transition-all">
          <p className="text-[9px] sm:text-[10px] font-bold uppercase tracking-wider text-[#414844] dark:text-white/50 mb-2">Capital Total</p>
          <p className="text-lg sm:text-xl font-headline font-extrabold text-[#012d1d] dark:text-white">{formatCurrency(totalCapital)}</p>
        </div>
        <div className="bg-white dark:bg-white/5 p-4 sm:p-5 rounded-xl shadow-sm border border-transparent dark:border-white/5 hover:shadow-md hover:-translate-y-0.5 transition-all">
          <p className="text-[9px] sm:text-[10px] font-bold uppercase tracking-wider text-[#414844] dark:text-white/50 mb-2">Valuation (1.8x)</p>
          <p className="text-lg sm:text-xl font-headline font-extrabold text-[#7b5800] dark:text-[#ffdea6]">{formatCurrency(valuation)}</p>
        </div>
        <div className="bg-white dark:bg-white/5 p-4 sm:p-5 rounded-xl shadow-sm border border-transparent dark:border-white/5 hover:shadow-md hover:-translate-y-0.5 transition-all">
          <p className="text-[9px] sm:text-[10px] font-bold uppercase tracking-wider text-[#414844] dark:text-white/50 mb-2">Adimplência</p>
          <p className="text-lg sm:text-xl font-headline font-extrabold text-emerald-600">
            {partners.length > 0 ? `${((paidCount / partners.length) * 100).toFixed(0)}%` : 'N/A'}
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-[1fr_280px] xl:grid-cols-[1fr_300px] gap-6 lg:gap-8">
        <div className="space-y-4">
          {/* Search & Filter */}
          <div className="flex items-center gap-2 sm:gap-3 flex-wrap">
            <div className="relative flex-1 min-w-[180px]">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#414844]/40" />
              <input type="text" placeholder="Buscar sócio..." value={search} onChange={e => setSearch(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 bg-white dark:bg-white/10 border border-[#edeeed] dark:border-white/10 rounded-lg text-sm text-[#012d1d] dark:text-white focus:outline-none focus:ring-2 focus:ring-[#012d1d]/20 transition-all" />
            </div>
            <div className="flex gap-1 sm:gap-1.5 flex-wrap">
              {(['TODOS', 'PAGO', 'PENDENTE', 'ATRASADO'] as FilterType[]).map(f => (
                <button key={f} onClick={() => setFilter(f)}
                  className={cn("px-2.5 sm:px-3 py-1.5 sm:py-2 text-[9px] sm:text-[10px] font-bold uppercase tracking-wider rounded-lg transition-all",
                    filter === f ? "bg-[#012d1d] text-white shadow-sm" : "bg-white dark:bg-white/10 text-[#414844] dark:text-white/60 border border-[#edeeed] dark:border-white/10 hover:bg-gray-50 dark:hover:bg-white/15"
                  )}>
                  {f}
                </button>
              ))}
            </div>
          </div>

          {/* Partners */}
          {partners.length === 0 ? (
            <div className="text-center py-16 bg-white dark:bg-white/5 rounded-2xl border border-dashed border-[#edeeed] dark:border-white/10">
              <div className="w-14 h-14 mx-auto mb-3 bg-gradient-to-br from-[#012d1d] to-[#1b4332] rounded-2xl flex items-center justify-center shadow-lg">
                <Users className="w-7 h-7 text-white" />
              </div>
              <p className="text-[#414844] dark:text-white/50 text-sm">Nenhum sócio cadastrado ainda.</p>
              <p className="text-[#414844] dark:text-white/30 text-xs mt-1">Novos sócios aparecerão aqui ao se registrarem.</p>
            </div>
          ) : (
            <div className="space-y-3">
              {filteredPartners.map((partner, i) => {
                const isSelected = selectedPartner === partner.id;
                const isCurrentUser = partner.id === user?.id;
                const partnerValuation = totalCapital > 0 ? valuation * (partner.totalInvested / totalCapital) : 0;
                const canViewPrivate = adminAlwaysShows ? true : showPrivateData;

                return (
                  <div key={partner.id} className={cn("bg-white dark:bg-white/5 rounded-xl shadow-sm overflow-hidden transition-all animate-fade-in-up hover:shadow-md border border-transparent dark:border-white/5", isCurrentUser && "ring-2 ring-[#012d1d]/20 dark:ring-[#ffdea6]/30")} style={{ animationDelay: `${i * 60}ms` }}>
                    <button onClick={() => setSelectedPartner(isSelected ? null : partner.id)}
                      className="w-full flex flex-col sm:flex-row items-start sm:items-center justify-between p-3 sm:p-4 hover:bg-gray-50/50 dark:hover:bg-white/5 transition-colors gap-2 sm:gap-0">
                      <div className="flex items-center gap-3 sm:gap-4">
                        <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[#012d1d] to-[#1b4332] flex items-center justify-center text-xs font-bold text-white shadow-sm">
                          {getInitials(partner.name)}
                        </div>
                        <div className="text-left">
                          <div className="flex items-center gap-2">
                            <h3 className="font-bold text-[#012d1d] dark:text-white">{partner.name}</h3>
                            {partner.role === 'admin' && <Crown className="w-3.5 h-3.5 text-[#7b5800]" />}
                            {isCurrentUser && <span className="text-[8px] bg-[#012d1d] text-white px-1.5 py-0.5 rounded-full font-bold">VOCÊ</span>}
                          </div>
                          <p className="text-xs text-[#414844] dark:text-white/50">
                            {partner.totalInvested > 0 ? `${partner.quotaPercentage}% de Cota • ${formatCurrency(partner.totalInvested)}` : 'Sem aporte'}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-3 sm:gap-4">
                        {partner.totalInvested > 0 && (
                          <div className="text-right hidden md:block">
                            <p className="text-[10px] text-[#414844] dark:text-white/40 uppercase font-bold">Valuation</p>
                            <p className="text-sm font-bold text-[#7b5800] dark:text-[#ffdea6]">{formatCurrency(partnerValuation)}</p>
                          </div>
                        )}
                        <span className={cn("text-[9px] font-bold px-2.5 py-1 rounded-full uppercase", getStatusColor(partner.paymentStatus))}>
                          {partner.paymentStatus}
                        </span>
                        <ChevronDown className={cn("w-4 h-4 text-[#414844] dark:text-white/50 transition-transform", isSelected && "rotate-180")} />
                      </div>
                    </button>

                    {isSelected && (
                      <div className="border-t border-[#edeeed] dark:border-white/10 p-4 bg-[#f9f9f8] dark:bg-white/[0.02] animate-fade-in">
                        <div className="grid grid-cols-1 xs:grid-cols-2 md:grid-cols-4 gap-3">
                          <div className="bg-white dark:bg-white/5 rounded-lg p-3 min-w-0">
                            <div className="flex items-center gap-1.5 mb-1">
                              <Mail className="w-3 h-3 text-[#414844] dark:text-white/40 shrink-0" />
                              <p className="text-[9px] font-bold uppercase text-[#414844] dark:text-white/40">E-mail</p>
                            </div>
                            <p className="text-xs text-[#012d1d] dark:text-white font-medium truncate" title={canViewPrivate ? partner.email : '••••@••••.com'}>
                              {canViewPrivate ? partner.email : '••••@••••.com'}
                            </p>
                          </div>
                          <div className="bg-white dark:bg-white/5 rounded-lg p-3 min-w-0">
                            <div className="flex items-center gap-1.5 mb-1">
                              <Phone className="w-3 h-3 text-[#414844] dark:text-white/40 shrink-0" />
                              <p className="text-[9px] font-bold uppercase text-[#414844] dark:text-white/40">Telefone</p>
                            </div>
                            <p className="text-xs text-[#012d1d] dark:text-white font-medium truncate">
                              {canViewPrivate ? (partner.phone || 'Não informado') : '(••) •••••-••••'}
                            </p>
                          </div>
                          <div className="bg-white dark:bg-white/5 rounded-lg p-3 min-w-0">
                            <div className="flex items-center gap-1.5 mb-1">
                              <Calendar className="w-3 h-3 text-[#414844] dark:text-white/40 shrink-0" />
                              <p className="text-[9px] font-bold uppercase text-[#414844] dark:text-white/40">Desde</p>
                            </div>
                            <p className="text-xs text-[#012d1d] dark:text-white font-medium truncate">{formatDate(partner.joinDate)}</p>
                          </div>
                          <div className="bg-white dark:bg-white/5 rounded-lg p-3 min-w-0">
                            <div className="flex items-center gap-1.5 mb-1">
                              <DollarSign className="w-3 h-3 text-[#414844] dark:text-white/40 shrink-0" />
                              <p className="text-[9px] font-bold uppercase text-[#414844] dark:text-white/40">Investido</p>
                            </div>
                            <p className="text-xs text-[#012d1d] dark:text-white font-medium truncate">{formatCurrency(partner.totalInvested)}</p>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {equityData.length > 0 && (
            <div className="bg-white dark:bg-white/5 rounded-2xl p-5 shadow-sm sticky top-24 border border-transparent dark:border-white/5 hover:shadow-md transition-all">
              <h3 className="font-headline font-bold text-[#012d1d] dark:text-white text-sm flex items-center gap-2 mb-4">
                <PieChartIcon className="w-4 h-4" /> Distribuição de Patrimônio
              </h3>
              <div className="h-48 sm:h-52">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie data={equityData} cx="50%" cy="50%" innerRadius={40} outerRadius={80} paddingAngle={2} dataKey="value"
                      label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}>
                      {equityData.map((_, index) => (<Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />))}
                    </Pie>
                    <Tooltip formatter={(value: number) => formatCurrency(value)} contentStyle={{ borderRadius: '12px', border: 'none', fontSize: '11px', boxShadow: '0 4px 20px rgba(0,0,0,0.1)' }} />
                  </PieChart>
                </ResponsiveContainer>
              </div>
              <div className="space-y-2 mt-4">
                {equityData.map((item, i) => (
                  <div key={item.name} className="flex items-center justify-between text-xs">
                    <div className="flex items-center gap-2">
                      <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: COLORS[i % COLORS.length] }} />
                      <span className="text-[#414844] dark:text-white/50">{item.name}</span>
                    </div>
                    <span className="font-bold text-[#012d1d] dark:text-white">{formatCurrency(item.value)}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Payment Summary — Modern Redesign */}
          <div className="bg-gradient-to-br from-[#012d1d] to-[#1b4332] rounded-2xl p-5 text-white shadow-lg">
            <h3 className="text-[10px] font-bold uppercase tracking-widest text-white/60 mb-4 flex items-center gap-1.5">
              <UserCheck className="w-3.5 h-3.5" /> Resumo de Pagamentos
            </h3>
            <div className="space-y-3">
              <div className="flex justify-between items-center p-2.5 bg-white/5 rounded-xl hover:bg-white/10 transition-all">
                <div className="flex items-center gap-2.5">
                  <div className="w-7 h-7 rounded-lg bg-emerald-500/20 flex items-center justify-center">
                    <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                  </div>
                  <span className="text-white/80 text-xs font-medium">Pagos</span>
                </div>
                <span className="font-bold text-lg">{partners.filter(p => p.paymentStatus === 'PAGO').length}</span>
              </div>
              <div className="flex justify-between items-center p-2.5 bg-white/5 rounded-xl hover:bg-white/10 transition-all">
                <div className="flex items-center gap-2.5">
                  <div className="w-7 h-7 rounded-lg bg-amber-500/20 flex items-center justify-center">
                    <Clock className="w-4 h-4 text-amber-400" />
                  </div>
                  <span className="text-white/80 text-xs font-medium">Pendentes</span>
                </div>
                <span className="font-bold text-lg text-amber-300">{partners.filter(p => p.paymentStatus === 'PENDENTE').length}</span>
              </div>
              <div className="flex justify-between items-center p-2.5 bg-white/5 rounded-xl hover:bg-white/10 transition-all">
                <div className="flex items-center gap-2.5">
                  <div className="w-7 h-7 rounded-lg bg-red-500/20 flex items-center justify-center">
                    <AlertTriangle className="w-4 h-4 text-red-400" />
                  </div>
                  <span className="text-white/80 text-xs font-medium">Atrasados</span>
                </div>
                <span className="font-bold text-lg text-red-300">{partners.filter(p => p.paymentStatus === 'ATRASADO').length}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
