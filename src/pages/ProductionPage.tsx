import React, { useState } from 'react';
import { Egg, Activity, CheckCircle2, Clock, ChevronDown, ChevronUp, Wheat, HeartPulse, Scale, Plus, X } from 'lucide-react';
import { useStore } from '../lib/store';
import { useAuth } from '../lib/auth';
import { formatCurrency, formatDate, cn, getStatusColor } from '../lib/utils';
import { calculateFCR } from '../lib/formulas';

const BREEDS = ['Cobb 500', 'Ross 308', 'Hubbard Flex', 'Aviagen', 'Caipira', 'Poedeira Hy-Line', 'Outro'];

export default function ProductionPage() {
  const { flocks, addFlock, addNotification } = useStore();
  const { user } = useAuth();
  const [expandedFlock, setExpandedFlock] = useState<string | null>(null);
  const [showModal, setShowModal] = useState(false);

  // Form state
  const [fName, setFName] = useState('');
  const [fBreed, setFBreed] = useState('');
  const [fQty, setFQty] = useState('');
  const [fCost, setFCost] = useState('');
  const [fDate, setFDate] = useState(new Date().toISOString().split('T')[0]);
  const [fSaleDate, setFSaleDate] = useState('');
  const [fFeed, setFFeed] = useState('');

  const activeFlocks = flocks.filter(f => f.status === 'ATIVO');
  const totalBirds = flocks.reduce((a, f) => a + f.currentQuantity, 0);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const qty = parseInt(fQty);
    const cost = parseFloat(fCost);
    const feed = parseFloat(fFeed) || 0;
    if (!fName || !fBreed || isNaN(qty) || qty <= 0) return;

    addFlock({
      id: fName,
      startDate: fDate,
      initialQuantity: qty,
      currentQuantity: qty,
      accumulatedMortality: 0,
      averageWeight: 0.04, // pintos de 1 dia
      dailyFeedConsumption: feed,
      expectedSaleDate: fSaleDate || '',
      status: 'ATIVO',
      totalFeedConsumed: 0,
      totalWeightGain: 0,
      breed: fBreed,
      batchCost: cost || 0,
    });

    addNotification({
      id: `N-${Date.now()}`,
      date: fDate,
      title: 'Novo Lote Registrado',
      message: `${user?.name} registrou o lote "${fName}" com ${qty.toLocaleString('pt-BR')} aves da raça ${fBreed}.`,
      read: false,
      type: 'production',
    });

    // Reset form
    setFName('');
    setFBreed('');
    setFQty('');
    setFCost('');
    setFDate(new Date().toISOString().split('T')[0]);
    setFSaleDate('');
    setFFeed('');
    setShowModal(false);
  };

  const inputClass = "w-full bg-[#f3f4f3] dark:bg-white/10 border border-[#edeeed] dark:border-white/10 rounded-xl px-4 py-3 text-[#012d1d] dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-[#012d1d]/20";

  return (
    <div className="space-y-8 animate-fade-in">
      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/50" onClick={() => setShowModal(false)} />
          <div className="relative bg-white dark:bg-[#1a2332] rounded-2xl p-6 sm:p-8 w-full max-w-lg shadow-2xl animate-fade-in-up max-h-[90vh] overflow-y-auto">
            <button onClick={() => setShowModal(false)} className="absolute top-4 right-4 text-[#414844] dark:text-white/50 hover:text-red-500">
              <X className="w-5 h-5" />
            </button>
            <h3 className="font-headline font-bold text-xl text-[#012d1d] dark:text-white mb-1">🐔 Novo Lote</h3>
            <p className="text-sm text-[#414844] dark:text-white/50 mb-6">Registre um novo lote de produção</p>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-[10px] font-bold uppercase tracking-wider text-[#414844] dark:text-white/60 mb-1.5 block">Nome do Lote *</label>
                  <input type="text" value={fName} onChange={e => setFName(e.target.value)}
                    placeholder="Ex: LOTE-01" required className={inputClass} />
                </div>
                <div>
                  <label className="text-[10px] font-bold uppercase tracking-wider text-[#414844] dark:text-white/60 mb-1.5 block">Raça *</label>
                  <select value={fBreed} onChange={e => setFBreed(e.target.value)} required className={inputClass}>
                    <option value="" className="bg-white dark:bg-[#1a2332]">Selecione...</option>
                    {BREEDS.map(b => <option key={b} value={b} className="bg-white dark:bg-[#1a2332]">{b}</option>)}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-[10px] font-bold uppercase tracking-wider text-[#414844] dark:text-white/60 mb-1.5 block">Quantidade *</label>
                  <input type="number" value={fQty} onChange={e => setFQty(e.target.value)}
                    placeholder="Ex: 5000" min="1" required className={inputClass} />
                </div>
                <div>
                  <label className="text-[10px] font-bold uppercase tracking-wider text-[#414844] dark:text-white/60 mb-1.5 block">Custo do Lote (R$)</label>
                  <input type="number" value={fCost} onChange={e => setFCost(e.target.value)}
                    placeholder="0,00" min="0" step="0.01" className={inputClass} />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-[10px] font-bold uppercase tracking-wider text-[#414844] dark:text-white/60 mb-1.5 block">Data de Início *</label>
                  <input type="date" value={fDate} onChange={e => setFDate(e.target.value)} required className={inputClass} />
                </div>
                <div>
                  <label className="text-[10px] font-bold uppercase tracking-wider text-[#414844] dark:text-white/60 mb-1.5 block">Previsão de Venda</label>
                  <input type="date" value={fSaleDate} onChange={e => setFSaleDate(e.target.value)} className={inputClass} />
                </div>
              </div>

              <div>
                <label className="text-[10px] font-bold uppercase tracking-wider text-[#414844] dark:text-white/60 mb-1.5 block">Ração/Dia (kg)</label>
                <input type="number" value={fFeed} onChange={e => setFFeed(e.target.value)}
                  placeholder="Ex: 250" min="0" step="0.1" className={inputClass} />
              </div>

              <button type="submit"
                className="w-full bg-gradient-to-r from-[#012d1d] to-[#1b4332] text-white font-bold py-3.5 rounded-xl hover:opacity-90 active:scale-[0.98] transition-all text-sm uppercase tracking-wider flex items-center justify-center gap-2">
                <Plus className="w-4 h-4" /> Registrar Lote
              </button>
            </form>
          </div>
        </div>
      )}

      <div className="flex flex-col sm:flex-row justify-between items-start gap-4">
        <div>
          <h1 className="font-headline font-extrabold text-2xl sm:text-3xl text-[#012d1d] dark:text-white tracking-tight">
            Gestão de Lotes
          </h1>
          <p className="text-[#414844] dark:text-white/50 text-xs sm:text-sm font-medium mt-1">
            Controle de produção, mortalidade e desempenho
          </p>
        </div>
        <button onClick={() => setShowModal(true)}
          className="flex items-center gap-1.5 bg-gradient-to-r from-[#012d1d] to-[#1b4332] text-white px-4 py-2.5 rounded-lg text-sm font-bold hover:opacity-90 active:scale-95 transition-all shadow-sm">
          <Plus className="w-4 h-4" /> Novo Lote
        </button>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4">
        <div className="bg-white dark:bg-white/5 p-4 sm:p-5 rounded-xl shadow-sm border border-transparent dark:border-white/5">
          <div className="flex items-center gap-2 mb-3">
            <Egg className="w-4 h-4 text-[#7b5800]" />
            <p className="text-[10px] font-bold uppercase tracking-wider text-[#414844] dark:text-white/50">Lotes Ativos</p>
          </div>
          <p className="text-xl sm:text-2xl font-headline font-extrabold text-[#012d1d] dark:text-white">{activeFlocks.length}</p>
        </div>
        <div className="bg-white dark:bg-white/5 p-4 sm:p-5 rounded-xl shadow-sm border border-transparent dark:border-white/5">
          <div className="flex items-center gap-2 mb-3">
            <Scale className="w-4 h-4 text-[#7b5800]" />
            <p className="text-[10px] font-bold uppercase tracking-wider text-[#414844] dark:text-white/50">Total de Aves</p>
          </div>
          <p className="text-xl sm:text-2xl font-headline font-extrabold text-[#012d1d] dark:text-white">{totalBirds.toLocaleString('pt-BR')}</p>
        </div>
        <div className="bg-white dark:bg-white/5 p-4 sm:p-5 rounded-xl shadow-sm border border-transparent dark:border-white/5">
          <div className="flex items-center gap-2 mb-3">
            <Activity className="w-4 h-4 text-[#7b5800]" />
            <p className="text-[10px] font-bold uppercase tracking-wider text-[#414844] dark:text-white/50">Total de Lotes</p>
          </div>
          <p className="text-xl sm:text-2xl font-headline font-extrabold text-[#012d1d] dark:text-white">{flocks.length}</p>
        </div>
        <div className="bg-white dark:bg-white/5 p-4 sm:p-5 rounded-xl shadow-sm border border-transparent dark:border-white/5">
          <div className="flex items-center gap-2 mb-3">
            <Wheat className="w-4 h-4 text-[#7b5800]" />
            <p className="text-[10px] font-bold uppercase tracking-wider text-[#414844] dark:text-white/50">Ração/Dia</p>
          </div>
          <p className="text-xl sm:text-2xl font-headline font-extrabold text-[#012d1d] dark:text-white">
            {activeFlocks.reduce((a, f) => a + f.dailyFeedConsumption, 0).toLocaleString('pt-BR')} kg
          </p>
        </div>
      </div>

      {/* Flock Cards */}
      {flocks.length === 0 ? (
        <div className="text-center py-16 bg-white dark:bg-white/5 rounded-2xl border border-dashed border-[#edeeed] dark:border-white/10">
          <div className="text-5xl mb-4">🐓</div>
          <h3 className="text-[#012d1d] dark:text-white font-bold text-lg mb-1">Nenhum lote cadastrado</h3>
          <p className="text-[#414844] dark:text-white/50 text-sm">Clique em "Novo Lote" para registrar seu primeiro lote de produção.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {flocks.map((flock) => {
            const isExpanded = expandedFlock === flock.id;
            const fcr = calculateFCR(flock.totalFeedConsumed, flock.totalWeightGain);
            const statusIcon = flock.status === 'ATIVO'
              ? <Activity className="w-4 h-4 text-emerald-600" />
              : flock.status === 'VENDIDO'
              ? <CheckCircle2 className="w-4 h-4 text-blue-600" />
              : <Clock className="w-4 h-4 text-amber-600" />;

            return (
              <div key={flock.id} className="bg-white dark:bg-white/5 rounded-2xl shadow-sm overflow-hidden transition-all border border-transparent dark:border-white/5">
                <button
                  onClick={() => setExpandedFlock(isExpanded ? null : flock.id)}
                  className="w-full flex flex-col sm:flex-row items-start sm:items-center justify-between p-4 sm:p-5 hover:bg-gray-50/50 dark:hover:bg-white/5 transition-colors gap-3 sm:gap-0"
                >
                  <div className="flex items-center gap-3 sm:gap-4">
                    {statusIcon}
                    <div className="text-left">
                      <h3 className="font-headline font-bold text-[#012d1d] dark:text-white text-base sm:text-lg">{flock.id}</h3>
                      <p className="text-[#414844] dark:text-white/50 text-xs">{flock.breed} • {flock.initialQuantity.toLocaleString('pt-BR')} aves</p>
                    </div>
                    <span className={cn("text-[9px] font-bold px-2.5 py-1 rounded-full uppercase", getStatusColor(flock.status))}>
                      {flock.status}
                    </span>
                  </div>
                  <div className="flex items-center gap-3 sm:gap-6 flex-wrap">
                    <div className="text-right hidden sm:block">
                      <p className="text-[10px] text-[#414844] dark:text-white/40 uppercase font-bold">Mortalidade</p>
                      <p className={cn("font-bold text-sm", flock.accumulatedMortality < 2 ? "text-emerald-600" : "text-red-600")}>
                        {flock.accumulatedMortality}%
                      </p>
                    </div>
                    <div className="text-right hidden sm:block">
                      <p className="text-[10px] text-[#414844] dark:text-white/40 uppercase font-bold">Peso</p>
                      <p className="font-bold text-sm text-[#012d1d] dark:text-white">{flock.averageWeight} kg</p>
                    </div>
                    {isExpanded ? <ChevronUp className="w-5 h-5 text-[#414844] dark:text-white/50" /> : <ChevronDown className="w-5 h-5 text-[#414844] dark:text-white/50" />}
                  </div>
                </button>

                {isExpanded && (
                  <div className="border-t border-[#edeeed] dark:border-white/10 p-4 sm:p-5 space-y-4 animate-fade-in">
                    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
                      {[
                        { label: 'Data Início', value: formatDate(flock.startDate) },
                        { label: 'Qtd. Inicial', value: flock.initialQuantity.toLocaleString('pt-BR') },
                        { label: 'Qtd. Atual', value: flock.currentQuantity.toLocaleString('pt-BR') },
                        { label: 'CA', value: flock.totalWeightGain > 0 ? fcr.toFixed(2) : 'N/A' },
                        { label: 'Ração/Dia', value: `${flock.dailyFeedConsumption} kg` },
                        { label: 'Custo', value: formatCurrency(flock.batchCost) },
                      ].map(item => (
                        <div key={item.label} className="bg-[#f3f4f3] dark:bg-white/5 rounded-lg p-3">
                          <p className="text-[9px] font-bold uppercase tracking-wider text-[#414844] dark:text-white/40 mb-1">{item.label}</p>
                          <p className="text-sm font-bold text-[#012d1d] dark:text-white">{item.value}</p>
                        </div>
                      ))}
                    </div>
                    {flock.expectedSaleDate && (
                      <p className="text-xs text-[#414844] dark:text-white/50">
                        📅 Previsão de venda: <strong className="text-[#012d1d] dark:text-white">{formatDate(flock.expectedSaleDate)}</strong>
                      </p>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
