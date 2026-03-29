import React, { useState } from 'react';
import { ArrowUpCircle, ArrowDownCircle, Search, Receipt, Plus, X } from 'lucide-react';
import { useStore } from '../lib/store';
import { useAuth } from '../lib/auth';
import { formatCurrency, formatDate, cn } from '../lib/utils';

type FilterType = 'TODOS' | 'ENTRADA' | 'SAIDA';

const CATEGORIES_ENTRADA = ['Aporte', 'Venda de Aves', 'Venda de Ovos', 'Outros'];
const CATEGORIES_SAIDA = ['Ração', 'Vacina', 'Equipamento', 'Infraestrutura', 'Transporte', 'Mão de Obra', 'Energia', 'Outros'];

export default function CashFlowPage() {
  const { cashFlow, addCashFlow, addNotification } = useStore();
  const { user } = useAuth();
  const [typeFilter, setTypeFilter] = useState<FilterType>('TODOS');
  const [categoryFilter, setCategoryFilter] = useState('TODOS');
  const [search, setSearch] = useState('');
  const [showModal, setShowModal] = useState(false);

  // Form state
  const [formType, setFormType] = useState<'ENTRADA' | 'SAIDA'>('ENTRADA');
  const [formCategory, setFormCategory] = useState('');
  const [formValue, setFormValue] = useState('');
  const [formDescription, setFormDescription] = useState('');
  const [formDate, setFormDate] = useState(new Date().toISOString().split('T')[0]);

  const categories = ['TODOS', ...new Set(cashFlow.map(c => c.category))];

  const filtered = cashFlow.filter(item => {
    const matchType = typeFilter === 'TODOS' || item.type === typeFilter;
    const matchCategory = categoryFilter === 'TODOS' || item.category === categoryFilter;
    const matchSearch =
      item.description.toLowerCase().includes(search.toLowerCase()) ||
      item.responsible.toLowerCase().includes(search.toLowerCase());
    return matchType && matchCategory && matchSearch;
  });

  const totalEntries = cashFlow.filter(c => c.type === 'ENTRADA').reduce((a, c) => a + c.value, 0);
  const totalExits = cashFlow.filter(c => c.type === 'SAIDA').reduce((a, c) => a + c.value, 0);
  const balance = totalEntries - totalExits;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const value = parseFloat(formValue);
    if (!formCategory || isNaN(value) || value <= 0 || !formDescription) return;

    const id = `CF-${Date.now()}`;
    addCashFlow({
      id,
      date: formDate,
      type: formType,
      category: formCategory,
      value,
      responsible: user?.name || 'Sistema',
      receiptLink: '',
      description: formDescription,
    });

    // Notify all users
    addNotification({
      id: `N-${Date.now()}`,
      date: formDate,
      title: formType === 'ENTRADA' ? 'Nova Entrada Registrada' : 'Nova Saída Registrada',
      message: `${user?.name} registrou ${formType === 'ENTRADA' ? 'uma entrada' : 'uma saída'} de ${formatCurrency(value)} na categoria "${formCategory}".`,
      read: false,
      type: 'payment',
    });

    // Reset
    setFormCategory('');
    setFormValue('');
    setFormDescription('');
    setShowModal(false);
  };

  const openModal = (type: 'ENTRADA' | 'SAIDA') => {
    setFormType(type);
    setFormCategory('');
    setFormValue('');
    setFormDescription('');
    setFormDate(new Date().toISOString().split('T')[0]);
    setShowModal(true);
  };

  const currentCategories = formType === 'ENTRADA' ? CATEGORIES_ENTRADA : CATEGORIES_SAIDA;
  const inputClass = "w-full bg-[#f3f4f3] dark:bg-white/10 border border-[#edeeed] dark:border-white/10 rounded-xl px-4 py-3 text-[#012d1d] dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-[#012d1d]/20";

  return (
    <div className="space-y-8 animate-fade-in">
      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/50" onClick={() => setShowModal(false)} />
          <div className="relative bg-white dark:bg-[#1a2332] rounded-2xl p-6 sm:p-8 w-full max-w-lg shadow-2xl animate-fade-in-up">
            <button onClick={() => setShowModal(false)} className="absolute top-4 right-4 text-[#414844] dark:text-white/50 hover:text-red-500">
              <X className="w-5 h-5" />
            </button>
            <h3 className="font-headline font-bold text-xl text-[#012d1d] dark:text-white mb-1">
              {formType === 'ENTRADA' ? '➕ Nova Entrada' : '➖ Nova Saída'}
            </h3>
            <p className="text-sm text-[#414844] dark:text-white/50 mb-6">Registrar movimentação financeira</p>

            {/* Type Toggle */}
            <div className="flex bg-[#f3f4f3] dark:bg-white/5 rounded-xl p-1 mb-5">
              <button onClick={() => { setFormType('ENTRADA'); setFormCategory(''); }}
                className={cn("flex-1 py-2.5 rounded-lg text-sm font-bold transition-all flex items-center justify-center gap-1.5",
                  formType === 'ENTRADA' ? "bg-emerald-500 text-white shadow-sm" : "text-[#414844] dark:text-white/50"
                )}>
                <ArrowUpCircle className="w-4 h-4" /> Entrada
              </button>
              <button onClick={() => { setFormType('SAIDA'); setFormCategory(''); }}
                className={cn("flex-1 py-2.5 rounded-lg text-sm font-bold transition-all flex items-center justify-center gap-1.5",
                  formType === 'SAIDA' ? "bg-red-500 text-white shadow-sm" : "text-[#414844] dark:text-white/50"
                )}>
                <ArrowDownCircle className="w-4 h-4" /> Saída
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="text-[10px] font-bold uppercase tracking-wider text-[#414844] dark:text-white/60 mb-1.5 block">Categoria *</label>
                <select value={formCategory} onChange={e => setFormCategory(e.target.value)} required className={inputClass}>
                  <option value="" className="bg-white dark:bg-[#1a2332]">Selecione...</option>
                  {currentCategories.map(c => <option key={c} value={c} className="bg-white dark:bg-[#1a2332]">{c}</option>)}
                </select>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-[10px] font-bold uppercase tracking-wider text-[#414844] dark:text-white/60 mb-1.5 block">Valor (R$) *</label>
                  <input type="number" value={formValue} onChange={e => setFormValue(e.target.value)}
                    placeholder="0,00" min="0.01" step="0.01" required className={inputClass} />
                </div>
                <div>
                  <label className="text-[10px] font-bold uppercase tracking-wider text-[#414844] dark:text-white/60 mb-1.5 block">Data *</label>
                  <input type="date" value={formDate} onChange={e => setFormDate(e.target.value)} required className={inputClass} />
                </div>
              </div>
              <div>
                <label className="text-[10px] font-bold uppercase tracking-wider text-[#414844] dark:text-white/60 mb-1.5 block">Descrição *</label>
                <input type="text" value={formDescription} onChange={e => setFormDescription(e.target.value)}
                  placeholder="Descreva a movimentação" required className={inputClass} />
              </div>
              <button type="submit"
                className={cn("w-full font-bold py-3.5 rounded-xl transition-all text-sm uppercase tracking-wider flex items-center justify-center gap-2 active:scale-[0.98]",
                  formType === 'ENTRADA'
                    ? "bg-emerald-500 text-white hover:bg-emerald-600"
                    : "bg-red-500 text-white hover:bg-red-600"
                )}>
                <Plus className="w-4 h-4" /> Registrar {formType === 'ENTRADA' ? 'Entrada' : 'Saída'}
              </button>
            </form>
          </div>
        </div>
      )}

      <div className="flex flex-col sm:flex-row justify-between items-start gap-4">
        <div>
          <h1 className="font-headline font-extrabold text-2xl sm:text-3xl text-[#012d1d] dark:text-white tracking-tight">
            Fluxo de Caixa
          </h1>
          <p className="text-[#414844] dark:text-white/50 text-xs sm:text-sm font-medium mt-1">
            Todas as movimentações financeiras do grupo
          </p>
        </div>
        <div className="flex gap-2">
          <button onClick={() => openModal('ENTRADA')}
            className="flex items-center gap-1.5 bg-emerald-500 text-white px-4 py-2.5 rounded-lg text-sm font-bold hover:bg-emerald-600 active:scale-95 transition-all shadow-sm">
            <ArrowUpCircle className="w-4 h-4" /> Entrada
          </button>
          <button onClick={() => openModal('SAIDA')}
            className="flex items-center gap-1.5 bg-red-500 text-white px-4 py-2.5 rounded-lg text-sm font-bold hover:bg-red-600 active:scale-95 transition-all shadow-sm">
            <ArrowDownCircle className="w-4 h-4" /> Saída
          </button>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4">
        <div className="bg-emerald-50 dark:bg-emerald-900/20 border border-emerald-200 dark:border-emerald-800/30 p-4 sm:p-5 rounded-xl">
          <div className="flex items-center gap-2 mb-2">
            <ArrowUpCircle className="w-5 h-5 text-emerald-600" />
            <p className="text-[10px] font-bold uppercase tracking-wider text-emerald-700 dark:text-emerald-400">Entradas</p>
          </div>
          <p className="text-xl sm:text-2xl font-headline font-extrabold text-emerald-700 dark:text-emerald-400">{formatCurrency(totalEntries)}</p>
        </div>
        <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800/30 p-4 sm:p-5 rounded-xl">
          <div className="flex items-center gap-2 mb-2">
            <ArrowDownCircle className="w-5 h-5 text-red-600 dark:text-red-400" />
            <p className="text-[10px] font-bold uppercase tracking-wider text-red-700 dark:text-red-400">Saídas</p>
          </div>
          <p className="text-xl sm:text-2xl font-headline font-extrabold text-red-700 dark:text-red-400">{formatCurrency(totalExits)}</p>
        </div>
        <div className={cn("p-4 sm:p-5 rounded-xl border", balance >= 0 ? "bg-[#012d1d]/5 dark:bg-[#012d1d]/20 border-[#012d1d]/20" : "bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800/30")}>
          <div className="flex items-center gap-2 mb-2">
            <Receipt className="w-5 h-5 text-[#012d1d] dark:text-white" />
            <p className="text-[10px] font-bold uppercase tracking-wider text-[#012d1d] dark:text-white">Saldo</p>
          </div>
          <p className={cn("text-xl sm:text-2xl font-headline font-extrabold", balance >= 0 ? "text-[#012d1d] dark:text-white" : "text-red-700")}>
            {balance >= 0 ? '+' : ''}{formatCurrency(balance)}
          </p>
        </div>
      </div>

      {/* Filters */}
      <div className="flex items-center gap-2 sm:gap-3 flex-wrap">
        <div className="relative flex-1 min-w-[180px]">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#414844]/40" />
          <input type="text" placeholder="Buscar movimentação..."
            value={search} onChange={e => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 bg-white dark:bg-white/10 border border-[#edeeed] dark:border-white/10 rounded-lg text-sm text-[#012d1d] dark:text-white focus:outline-none focus:ring-2 focus:ring-[#012d1d]/20" />
        </div>
        <div className="flex gap-1.5 flex-wrap">
          {(['TODOS', 'ENTRADA', 'SAIDA'] as FilterType[]).map(f => (
            <button key={f} onClick={() => setTypeFilter(f)}
              className={cn("px-3 py-2 text-[10px] font-bold uppercase tracking-wider rounded-lg transition-all",
                typeFilter === f ? "bg-[#012d1d] text-white" : "bg-white dark:bg-white/10 text-[#414844] dark:text-white/60 border border-[#edeeed] dark:border-white/10 hover:bg-gray-50 dark:hover:bg-white/15"
              )}>
              {f === 'SAIDA' ? 'SAÍDA' : f}
            </button>
          ))}
        </div>
        {categories.length > 1 && (
          <select value={categoryFilter} onChange={e => setCategoryFilter(e.target.value)}
            className="bg-white dark:bg-white/10 border border-[#edeeed] dark:border-white/10 rounded-lg px-3 py-2 text-xs font-bold text-[#414844] dark:text-white focus:outline-none">
            {categories.map(c => <option key={c} value={c} className="bg-white dark:bg-[#1a2332]">{c === 'TODOS' ? 'Categorias' : c}</option>)}
          </select>
        )}
      </div>

      {/* Table */}
      {cashFlow.length === 0 ? (
        <div className="text-center py-16 bg-white dark:bg-white/5 rounded-2xl border border-dashed border-[#edeeed] dark:border-white/10">
          <div className="text-4xl mb-3">📊</div>
          <h3 className="text-[#012d1d] dark:text-white font-bold text-lg mb-1">Nenhuma movimentação</h3>
          <p className="text-[#414844] dark:text-white/50 text-sm">Clique em "Entrada" ou "Saída" para registrar.</p>
        </div>
      ) : (
        <div className="bg-white dark:bg-white/5 rounded-2xl shadow-sm overflow-hidden border border-transparent dark:border-white/5">
          <div className="overflow-x-auto">
            <table className="w-full min-w-[600px]">
              <thead>
                <tr className="bg-[#f3f4f3] dark:bg-white/5">
                  <th className="text-left px-4 py-3 text-[9px] font-bold uppercase tracking-widest text-[#414844] dark:text-white/50">Data</th>
                  <th className="text-left px-4 py-3 text-[9px] font-bold uppercase tracking-widest text-[#414844] dark:text-white/50">Tipo</th>
                  <th className="text-left px-4 py-3 text-[9px] font-bold uppercase tracking-widest text-[#414844] dark:text-white/50">Categoria</th>
                  <th className="text-left px-4 py-3 text-[9px] font-bold uppercase tracking-widest text-[#414844] dark:text-white/50">Descrição</th>
                  <th className="text-right px-4 py-3 text-[9px] font-bold uppercase tracking-widest text-[#414844] dark:text-white/50">Valor</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#f3f4f3] dark:divide-white/5">
                {filtered.map((item, i) => (
                  <tr key={item.id} className="hover:bg-gray-50/50 dark:hover:bg-white/5 transition-colors animate-fade-in-up" style={{ animationDelay: `${i * 30}ms` }}>
                    <td className="px-4 py-3 text-xs text-[#414844] dark:text-white/60 font-medium whitespace-nowrap">{formatDate(item.date)}</td>
                    <td className="px-4 py-3">
                      <span className={cn("text-[9px] font-bold px-2 py-0.5 rounded-full uppercase flex items-center gap-1 w-fit",
                        item.type === 'ENTRADA' ? "bg-emerald-100 text-emerald-700" : "bg-red-100 text-red-700"
                      )}>
                        {item.type === 'ENTRADA' ? <ArrowUpCircle className="w-3 h-3" /> : <ArrowDownCircle className="w-3 h-3" />}
                        {item.type === 'SAIDA' ? 'SAÍDA' : item.type}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <span className="text-[10px] font-bold bg-[#f3f4f3] dark:bg-white/10 text-[#012d1d] dark:text-white/70 px-2 py-1 rounded-lg">{item.category}</span>
                    </td>
                    <td className="px-4 py-3 text-xs text-[#414844] dark:text-white/60 max-w-xs truncate">{item.description}</td>
                    <td className={cn("px-4 py-3 text-sm font-headline font-bold text-right whitespace-nowrap",
                      item.type === 'ENTRADA' ? "text-emerald-600" : "text-red-600"
                    )}>
                      {item.type === 'ENTRADA' ? '+' : '-'}{formatCurrency(item.value)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          {filtered.length === 0 && (
            <div className="text-center py-12">
              <p className="text-[#414844] dark:text-white/50 text-sm">Nenhuma movimentação encontrada com esses filtros.</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
