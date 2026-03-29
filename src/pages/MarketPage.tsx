import React, { useState } from 'react';
import {
  BrainCircuit, TrendingUp, TrendingDown, Minus, Zap,
  RefreshCw, BarChart3, Newspaper, AlertTriangle, ChevronRight,
} from 'lucide-react';
import { useStore } from '../lib/store';
import { cn, getStatusColor, getImpactIcon } from '../lib/utils';

const commodityData = [
  { name: 'Milho', price: 'R$ 68,50', unit: '/saca 60kg', change: '+2,3%', trend: 'up', source: 'CEPEA/Esalq' },
  { name: 'Farelo de Soja', price: 'R$ 1.850', unit: '/ton', change: '0,0%', trend: 'stable', source: 'CBOT/B3' },
  { name: 'Frango Vivo', price: 'R$ 6,80', unit: '/kg', change: '+1,5%', trend: 'up', source: 'CEPEA' },
  { name: 'Frango Congelado', price: 'R$ 8,20', unit: '/kg', change: '+0,8%', trend: 'up', source: 'DERAL' },
  { name: 'Ovo (cx 30 dz)', price: 'R$ 185,00', unit: '/caixa', change: '-1,2%', trend: 'down', source: 'IEA' },
  { name: 'Diesel S10', price: 'R$ 6,45', unit: '/litro', change: '+0,5%', trend: 'up', source: 'ANP' },
];

const aiAnalyses = [
  {
    title: 'Impacto do Milho no Custo de Produção',
    insight: 'Com a saca de milho a R$68,50 (+2,3%), o custo de ração por kg de frango sobe R$0,15. Recomendação: negociar contrato futuro de farelo de soja para travar preço.',
    severity: 'warning',
  },
  {
    title: 'Oportunidade de Venda',
    insight: 'O preço do frango vivo subiu 1,5% esta semana. Tendência de alta pela exportação aquecida (+8% em março). Considere adiantar negociações com frigoríficos.',
    severity: 'success',
  },
  {
    title: 'Análise de Margem',
    insight: 'Para manter margem de 15%, o grupo precisa: (a) reduzir mortalidade abaixo de 1%, (b) negociar ração com desconto de volume, ou (c) aumentar preço de venda em 3%.',
    severity: 'info',
  },
];

const marketNews = [
  { id: 'MA01', date: '2026-03-28', title: 'Milho sobe 2,3% na semana', description: 'Preço atingiu R$68,50 no CEPEA/Esalq. Impacto no custo por kg de frango.', impact: 'NEGATIVO', source: 'CEPEA' },
  { id: 'MA02', date: '2026-03-27', title: 'Farelo de Soja estável', description: 'Farelo se manteve em R$1.850/ton. Bom momento para contratos futuros.', impact: 'NEUTRO', source: 'CBOT/B3' },
  { id: 'MA03', date: '2026-03-26', title: 'Exportação de frango cresce 8%', description: 'Demanda asiática puxa exportações. Preços internos podem subir 3-5%.', impact: 'POSITIVO', source: 'ABPA' },
];

export default function MarketPage() {
  const { marketAlerts } = useStore();
  const [isRefreshing, setIsRefreshing] = useState(false);

  const handleRefresh = () => {
    setIsRefreshing(true);
    setTimeout(() => setIsRefreshing(false), 2000);
  };

  const allAlerts = [...marketAlerts, ...marketNews];

  return (
    <div className="space-y-8 animate-fade-in">
      <div className="flex flex-col sm:flex-row justify-between items-start gap-4">
        <div>
          <h1 className="font-headline font-extrabold text-2xl sm:text-3xl text-[#012d1d] dark:text-white tracking-tight flex items-center gap-2">
            Mercado AI <Zap className="w-5 h-5 sm:w-6 sm:h-6 text-[#ffdea6]" />
          </h1>
          <p className="text-[#414844] dark:text-white/50 text-xs sm:text-sm font-medium mt-1">
            Inteligência de mercado com análise automatizada
          </p>
        </div>
        <button
          onClick={handleRefresh}
          className="flex items-center gap-2 bg-[#012d1d] text-white px-4 py-2.5 rounded-lg text-sm font-bold hover:opacity-90 transition-all active:scale-95"
        >
          <RefreshCw className={cn("w-4 h-4", isRefreshing && "animate-spin")} />
          Atualizar
        </button>
      </div>

      {/* Commodity Prices */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
        {commodityData.map((commodity, i) => {
          const TrendIcon = commodity.trend === 'up' ? TrendingUp : commodity.trend === 'down' ? TrendingDown : Minus;
          const trendColor = commodity.trend === 'up' ? 'text-red-600' : commodity.trend === 'down' ? 'text-emerald-600' : 'text-gray-500';
          const bgTrend = commodity.trend === 'up' ? 'bg-red-50 dark:bg-red-900/20' : commodity.trend === 'down' ? 'bg-emerald-50 dark:bg-emerald-900/20' : 'bg-gray-50 dark:bg-white/5';

          return (
            <div key={commodity.name} className="bg-white dark:bg-white/5 p-4 rounded-xl shadow-sm hover:shadow-md transition-all animate-fade-in-up border border-transparent dark:border-white/5" style={{ animationDelay: `${i * 60}ms` }}>
              <p className="text-[9px] font-bold uppercase tracking-wider text-[#414844] dark:text-white/50 mb-2">{commodity.name}</p>
              <p className="text-lg font-headline font-extrabold text-[#012d1d] dark:text-white tracking-tight">{commodity.price}</p>
              <p className="text-[9px] text-[#414844] dark:text-white/40 mb-2">{commodity.unit}</p>
              <div className={cn("flex items-center gap-1 text-[10px] font-bold px-2 py-1 rounded-full w-fit", trendColor, bgTrend)}>
                <TrendIcon className="w-3 h-3" /> {commodity.change}
              </div>
              <p className="text-[8px] text-[#414844]/50 dark:text-white/20 mt-2">{commodity.source}</p>
            </div>
          );
        })}
      </div>

      {/* AI Analyses */}
      <div className="space-y-4">
        <h2 className="font-headline font-bold text-[#012d1d] dark:text-white flex items-center gap-2">
          <BrainCircuit className="w-5 h-5" /> Análises Inteligentes
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {aiAnalyses.map((analysis, i) => (
            <div
              key={analysis.title}
              className={cn(
                "rounded-2xl p-5 space-y-3 animate-fade-in-up",
                analysis.severity === 'warning' && "bg-amber-50 dark:bg-amber-900/10 border border-amber-200 dark:border-amber-800/30",
                analysis.severity === 'success' && "bg-emerald-50 dark:bg-emerald-900/10 border border-emerald-200 dark:border-emerald-800/30",
                analysis.severity === 'info' && "bg-blue-50 dark:bg-blue-900/10 border border-blue-200 dark:border-blue-800/30",
              )}
              style={{ animationDelay: `${i * 100}ms` }}
            >
              <div className="flex items-center gap-2">
                {analysis.severity === 'warning' && <AlertTriangle className="w-4 h-4 text-amber-600" />}
                {analysis.severity === 'success' && <TrendingUp className="w-4 h-4 text-emerald-600" />}
                {analysis.severity === 'info' && <BarChart3 className="w-4 h-4 text-blue-600" />}
                <h3 className="font-headline font-bold text-sm text-[#012d1d] dark:text-white">{analysis.title}</h3>
              </div>
              <p className="text-sm leading-relaxed text-[#414844] dark:text-white/60">{analysis.insight}</p>
            </div>
          ))}
        </div>
      </div>

      {/* News */}
      <div className="space-y-4">
        <h2 className="font-headline font-bold text-[#012d1d] dark:text-white flex items-center gap-2">
          <Newspaper className="w-5 h-5" /> Notícias do Mercado
        </h2>
        <div className="space-y-3">
          {marketNews.map((alert, i) => (
            <div key={alert.id} className="bg-white dark:bg-white/5 rounded-xl p-5 shadow-sm hover:shadow-md transition-all flex items-start gap-4 group cursor-pointer border border-transparent dark:border-white/5 animate-fade-in-up" style={{ animationDelay: `${i * 80}ms` }}>
              <div className="text-2xl shrink-0 mt-1">{getImpactIcon(alert.impact)}</div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <h3 className="font-headline font-bold text-[#012d1d] dark:text-white">{alert.title}</h3>
                  <span className={cn("text-[8px] font-bold px-2 py-0.5 rounded-full uppercase", getStatusColor(alert.impact))}>
                    {alert.impact}
                  </span>
                </div>
                <p className="text-sm text-[#414844] dark:text-white/60 leading-relaxed">{alert.description}</p>
                <div className="flex items-center gap-3 mt-2 text-[10px] text-[#414844]/60 dark:text-white/30">
                  <span>{alert.date}</span><span>•</span><span>{alert.source}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* n8n Automations */}
      <div className="bg-gradient-to-br from-[#012d1d] to-[#1b4332] rounded-2xl p-5 sm:p-6 text-white">
        <h3 className="font-headline font-bold text-lg mb-3 flex items-center gap-2">
          <Zap className="w-5 h-5 text-[#ffdea6]" /> Automações n8n Ativas
        </h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3 sm:gap-4">
          {[
            { name: 'Busca de Preços CEPEA', desc: 'Web scraping do milho e soja no CEPEA/Esalq. Atualização às 18h.', status: '🟢 Ativo' },
            { name: 'Alertas de Aporte', desc: 'Verifica pagamentos pendentes no dia 5 de cada mês. Lembrete via WhatsApp.', status: '🟢 Ativo' },
            { name: 'Relatório Semanal IA', desc: 'Analisa gastos da semana e sugere otimizações de custo.', status: '🟢 Ativo' },
          ].map(item => (
            <div key={item.name} className="bg-white/10 rounded-xl p-4 backdrop-blur-sm">
              <div className="flex items-center justify-between mb-2">
                <h4 className="font-bold text-sm text-white">{item.name}</h4>
                <span className="text-[10px]">{item.status}</span>
              </div>
              <p className="text-white/60 text-xs leading-relaxed">{item.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
