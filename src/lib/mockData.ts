export type Partner = {
  id: string;
  name: string;
  email: string;
  password: string;
  quotaPercentage: number;
  totalInvested: number;
  paymentStatus: 'PAGO' | 'PENDENTE' | 'ATRASADO';
  role: 'admin' | 'socio';
  avatar?: string;
  phone?: string;
  joinDate: string;
  monthlyContribution: number;
};

export type CashFlow = {
  id: string;
  date: string;
  type: 'ENTRADA' | 'SAIDA';
  category: 'Ração' | 'Vacina' | 'Equipamento' | 'Infra' | 'Venda' | 'Aporte' | 'Manutenção' | 'Energia' | 'Mão de Obra';
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
  type: 'payment' | 'market' | 'production' | 'system';
  targetUserId?: string;
};

// =====================
// MOCK DATA
// =====================

export const MOCK_PARTNERS: Partner[] = [
  {
    id: 'S1',
    name: 'Carlos Mendes',
    email: 'carlos@agrarian.com',
    password: 'carlos123',
    quotaPercentage: 11.11,
    totalInvested: 145000,
    paymentStatus: 'PAGO',
    role: 'admin',
    phone: '(62) 99999-0001',
    joinDate: '2025-01-15',
    monthlyContribution: 16000,
  },
  {
    id: 'S2',
    name: 'Ana Ribeiro',
    email: 'ana@agrarian.com',
    password: 'ana123',
    quotaPercentage: 11.11,
    totalInvested: 133200,
    paymentStatus: 'PENDENTE',
    role: 'socio',
    phone: '(62) 99999-0002',
    joinDate: '2025-01-15',
    monthlyContribution: 16000,
  },
  {
    id: 'S3',
    name: 'Roberto Silva',
    email: 'roberto@agrarian.com',
    password: 'roberto123',
    quotaPercentage: 11.11,
    totalInvested: 140500,
    paymentStatus: 'PAGO',
    role: 'socio',
    phone: '(62) 99999-0003',
    joinDate: '2025-02-01',
    monthlyContribution: 16000,
  },
  {
    id: 'S4',
    name: 'Fernanda Costa',
    email: 'fernanda@agrarian.com',
    password: 'fernanda123',
    quotaPercentage: 11.11,
    totalInvested: 133200,
    paymentStatus: 'PAGO',
    role: 'socio',
    phone: '(62) 99999-0004',
    joinDate: '2025-02-01',
    monthlyContribution: 16000,
  },
  {
    id: 'S5',
    name: 'Lucas Almeida',
    email: 'lucas@agrarian.com',
    password: 'lucas123',
    quotaPercentage: 11.11,
    totalInvested: 128000,
    paymentStatus: 'ATRASADO',
    role: 'socio',
    phone: '(62) 99999-0005',
    joinDate: '2025-03-01',
    monthlyContribution: 16000,
  },
  {
    id: 'S6',
    name: 'Mariana Oliveira',
    email: 'mariana@agrarian.com',
    password: 'mariana123',
    quotaPercentage: 11.11,
    totalInvested: 133200,
    paymentStatus: 'PAGO',
    role: 'socio',
    phone: '(62) 99999-0006',
    joinDate: '2025-03-01',
    monthlyContribution: 16000,
  },
  {
    id: 'S7',
    name: 'Paulo Ferreira',
    email: 'paulo@agrarian.com',
    password: 'paulo123',
    quotaPercentage: 11.11,
    totalInvested: 138000,
    paymentStatus: 'PAGO',
    role: 'socio',
    phone: '(62) 99999-0007',
    joinDate: '2025-04-01',
    monthlyContribution: 16000,
  },
  {
    id: 'S8',
    name: 'Juliana Santos',
    email: 'juliana@agrarian.com',
    password: 'juliana123',
    quotaPercentage: 11.11,
    totalInvested: 133200,
    paymentStatus: 'PAGO',
    role: 'socio',
    phone: '(62) 99999-0008',
    joinDate: '2025-04-01',
    monthlyContribution: 16000,
  },
  {
    id: 'S9',
    name: 'Diego Martins',
    email: 'diego@agrarian.com',
    password: 'diego123',
    quotaPercentage: 11.11,
    totalInvested: 130000,
    paymentStatus: 'PENDENTE',
    role: 'socio',
    phone: '(62) 99999-0009',
    joinDate: '2025-05-01',
    monthlyContribution: 16000,
  },
];

export const MOCK_CASH_FLOW: CashFlow[] = [
  { id: 'CF01', date: '2026-03-01', type: 'ENTRADA', category: 'Aporte', value: 144000, responsible: 'Tesouraria', receiptLink: '#', description: 'Aportes mensais dos sócios (9x R$16.000)' },
  { id: 'CF02', date: '2026-03-03', type: 'SAIDA', category: 'Ração', value: 42500, responsible: 'Carlos Mendes', receiptLink: '#', description: 'Compra de ração - Lote 04 (Milho + Farelo de Soja)' },
  { id: 'CF03', date: '2026-03-05', type: 'SAIDA', category: 'Vacina', value: 8200, responsible: 'Roberto Silva', receiptLink: '#', description: 'Vacinação contra Newcastle e Gumboro' },
  { id: 'CF04', date: '2026-03-07', type: 'SAIDA', category: 'Energia', value: 6800, responsible: 'Paulo Ferreira', receiptLink: '#', description: 'Conta de energia dos galpões 1 e 2' },
  { id: 'CF05', date: '2026-03-10', type: 'SAIDA', category: 'Mão de Obra', value: 18500, responsible: 'Carlos Mendes', receiptLink: '#', description: 'Folha de pagamento - Funcionários da granja' },
  { id: 'CF06', date: '2026-03-12', type: 'SAIDA', category: 'Manutenção', value: 3200, responsible: 'Fernanda Costa', receiptLink: '#', description: 'Reparo no sistema de aquecimento - Galpão 2' },
  { id: 'CF07', date: '2026-03-15', type: 'ENTRADA', category: 'Venda', value: 85000, responsible: 'Carlos Mendes', receiptLink: '#', description: 'Venda parcial Lote 03 - 4.200 aves (BRF)' },
  { id: 'CF08', date: '2026-03-18', type: 'SAIDA', category: 'Equipamento', value: 12800, responsible: 'Lucas Almeida', receiptLink: '#', description: 'Comedouro automático novo - Galpão 3' },
  { id: 'CF09', date: '2026-03-20', type: 'SAIDA', category: 'Ração', value: 38900, responsible: 'Carlos Mendes', receiptLink: '#', description: 'Reposição de ração - Lote 04 (2ª remessa)' },
  { id: 'CF10', date: '2026-03-22', type: 'SAIDA', category: 'Infra', value: 25000, responsible: 'Roberto Silva', receiptLink: '#', description: 'Construção do Galpão 4 - Fase 1' },
  { id: 'CF11', date: '2026-03-25', type: 'ENTRADA', category: 'Venda', value: 62000, responsible: 'Carlos Mendes', receiptLink: '#', description: 'Venda de ovos - produção semana 12' },
  { id: 'CF12', date: '2026-03-28', type: 'SAIDA', category: 'Vacina', value: 4500, responsible: 'Ana Ribeiro', receiptLink: '#', description: 'Booster vacinal - Lote 05 (pintainhos)' },
];

export const MOCK_FLOCKS: Flock[] = [
  {
    id: 'LOTE-03',
    startDate: '2025-12-01',
    initialQuantity: 8500,
    currentQuantity: 4200,
    accumulatedMortality: 2.1,
    averageWeight: 3.2,
    dailyFeedConsumption: 1200,
    expectedSaleDate: '2026-03-15',
    status: 'VENDIDO',
    totalFeedConsumed: 12600,
    totalWeightGain: 25200,
    breed: 'Cobb 500',
    batchCost: 95000,
  },
  {
    id: 'LOTE-04',
    startDate: '2026-02-01',
    initialQuantity: 10000,
    currentQuantity: 9880,
    accumulatedMortality: 1.2,
    averageWeight: 2.1,
    dailyFeedConsumption: 1500,
    expectedSaleDate: '2026-04-15',
    status: 'ATIVO',
    totalFeedConsumed: 8400,
    totalWeightGain: 19800,
    breed: 'Ross 308',
    batchCost: 120000,
  },
  {
    id: 'LOTE-05',
    startDate: '2026-03-20',
    initialQuantity: 12000,
    currentQuantity: 12000,
    accumulatedMortality: 0,
    averageWeight: 0.04,
    dailyFeedConsumption: 360,
    expectedSaleDate: '2026-06-01',
    status: 'EM PREPARAÇÃO',
    totalFeedConsumed: 320,
    totalWeightGain: 480,
    breed: 'Cobb 500',
    batchCost: 145000,
  },
];

export const MOCK_GOALS: Goal = {
  monthlyGoal: 150000,
  collectedValue: 127500,
  projectedROI: 15,
  realizedROI: 14.2,
};

export const MOCK_MARKET_ALERTS: MarketAlert[] = [
  {
    id: 'MA01',
    date: '2026-03-28',
    title: 'Milho sobe 2,3% na semana',
    description: 'O preço da saca de milho atingiu R$68,50 no indicador CEPEA/Esalq. Impacto estimado de R$0,15 no custo por kg de frango produzido. Considere adiantar a compra de ração para o Lote 05.',
    impact: 'NEGATIVO',
    source: 'CEPEA/Esalq',
  },
  {
    id: 'MA02',
    date: '2026-03-27',
    title: 'Farelo de Soja estável',
    description: 'O farelo de soja se manteve em R$1.850/ton, indicando estabilidade no curto prazo. Bom momento para negociar contratos futuros com travas de preço.',
    impact: 'NEUTRO',
    source: 'CBOT/B3',
  },
  {
    id: 'MA03',
    date: '2026-03-26',
    title: 'Exportação de frango cresce 8%',
    description: 'As exportações brasileiras de carne de frango cresceram 8% em março, puxadas pela demanda asiática. Isso pode elevar os preços no mercado interno em 3-5% nas próximas semanas.',
    impact: 'POSITIVO',
    source: 'ABPA',
  },
  {
    id: 'MA04',
    date: '2026-03-25',
    title: 'Alerta sanitário: Influenza Aviária',
    description: 'Novo foco de gripe aviária registrado no RS. Zona de vigilância ampliada. Reforçar biossegurança nos galpões e monitorar protocolo do MAPA.',
    impact: 'NEGATIVO',
    source: 'MAPA',
  },
];

export const MOCK_NOTIFICATIONS: Notification[] = [
  { id: 'N01', date: '2026-03-29', title: 'Aporte Pendente', message: 'Ana Ribeiro ainda não realizou o aporte de março. Lembrete enviado.', read: false, type: 'payment', targetUserId: 'S2' },
  { id: 'N02', date: '2026-03-29', title: 'Aporte Atrasado', message: 'Lucas Almeida está com aporte atrasado há 5 dias.', read: false, type: 'payment', targetUserId: 'S5' },
  { id: 'N03', date: '2026-03-28', title: 'Milho +2,3%', message: 'Preço do milho subiu. Impacto estimado no custo de produção.', read: true, type: 'market' },
  { id: 'N04', date: '2026-03-27', title: 'Lote 04: Peso OK', message: 'O Lote 04 atingiu o peso médio de 2.1kg, dentro da curva padrão.', read: true, type: 'production' },
  { id: 'N05', date: '2026-03-26', title: 'Venda Lote 03', message: 'Venda parcial do Lote 03 concluída: 4.200 aves para BRF.', read: true, type: 'production' },
  { id: 'N06', date: '2026-03-25', title: 'Alerta Sanitário', message: 'Foco de gripe aviária no RS. Reforçar biossegurança.', read: false, type: 'system' },
];

export const CHART_DATA = [
  { week: 'Sem 1', realized: 0.1, standard: 0.15 },
  { week: 'Sem 2', realized: 0.4, standard: 0.45 },
  { week: 'Sem 3', realized: 0.8, standard: 0.9 },
  { week: 'Sem 4', realized: 1.3, standard: 1.4 },
  { week: 'Sem 5', realized: 1.8, standard: 1.9 },
  { week: 'Sem 6', realized: 2.3, standard: 2.4 },
  { week: 'Sem 7', realized: 2.7, standard: 2.8 },
  { week: 'Sem 8', realized: 3.1, standard: 3.2 },
];

export const MONTHLY_REVENUE_DATA = [
  { month: 'Out', receita: 95000, despesa: 72000 },
  { month: 'Nov', receita: 110000, despesa: 78000 },
  { month: 'Dez', receita: 125000, despesa: 85000 },
  { month: 'Jan', receita: 105000, despesa: 80000 },
  { month: 'Fev', receita: 130000, despesa: 88000 },
  { month: 'Mar', receita: 147000, despesa: 92000 },
];

export const EQUITY_HISTORY = [
  { month: 'Out', valor: 850000 },
  { month: 'Nov', valor: 920000 },
  { month: 'Dez', valor: 1010000 },
  { month: 'Jan', valor: 1080000 },
  { month: 'Fev', valor: 1160000 },
  { month: 'Mar', valor: 1214300 },
];
