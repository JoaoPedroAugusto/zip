import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatCurrency(value: number): string {
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(value);
}

export function formatCurrencyCompact(value: number): string {
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
    notation: 'compact',
    maximumFractionDigits: 1,
  }).format(value);
}

export function formatDate(dateStr: string): string {
  const date = new Date(dateStr + 'T00:00:00');
  return date.toLocaleDateString('pt-BR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  });
}

export function formatDateShort(dateStr: string): string {
  const date = new Date(dateStr + 'T00:00:00');
  return date.toLocaleDateString('pt-BR', {
    day: '2-digit',
    month: 'short',
  });
}

export function getInitials(name: string): string {
  return name
    .split(' ')
    .map(n => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);
}

export function getStatusColor(status: string): string {
  switch (status) {
    case 'PAGO': return 'bg-emerald-100 text-emerald-700';
    case 'PENDENTE': return 'bg-amber-100 text-amber-700';
    case 'ATRASADO': return 'bg-red-100 text-red-700';
    case 'ATIVO': return 'bg-emerald-100 text-emerald-700';
    case 'VENDIDO': return 'bg-blue-100 text-blue-700';
    case 'EM PREPARAÇÃO': return 'bg-amber-100 text-amber-700';
    case 'POSITIVO': return 'bg-emerald-100 text-emerald-700';
    case 'NEGATIVO': return 'bg-red-100 text-red-700';
    case 'NEUTRO': return 'bg-gray-100 text-gray-700';
    default: return 'bg-gray-100 text-gray-600';
  }
}

export function getImpactIcon(impact: string): string {
  switch (impact) {
    case 'POSITIVO': return '📈';
    case 'NEGATIVO': return '📉';
    case 'NEUTRO': return '➡️';
    default: return '📊';
  }
}
