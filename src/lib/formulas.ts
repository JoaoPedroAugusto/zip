/**
 * Calcula a Conversão Alimentar (CA).
 * CA = Quantidade total de ração consumida / Peso total ganho pelo lote
 * @param totalFeedConsumed (kg)
 * @param totalWeightGain (kg)
 * @returns CA (ratio)
 */
export function calculateFCR(totalFeedConsumed: number, totalWeightGain: number): number {
  if (totalWeightGain === 0) return 0;
  return Number((totalFeedConsumed / totalWeightGain).toFixed(2));
}

/**
 * Calcula o Ponto de Equilíbrio (Break-even) em número de aves vendidas.
 * BEP = Custos Fixos Totais / (Preço de Venda por Ave - Custo Variável por Ave)
 * @param fixedCosts (R$)
 * @param salePricePerBird (R$)
 * @param variableCostPerBird (R$)
 * @returns Número de aves para atingir o break-even
 */
export function calculateBreakEven(fixedCosts: number, salePricePerBird: number, variableCostPerBird: number): number {
  const contributionMargin = salePricePerBird - variableCostPerBird;
  if (contributionMargin <= 0) return Infinity; // Prejuízo em cada venda
  return Math.ceil(fixedCosts / contributionMargin);
}

/**
 * Calcula o Valuation da Sociedade baseada nos aportes acumulados e um múltiplo de mercado.
 * Valuation = Total Aportado * Múltiplo de Crescimento (Ex: 1.5x a 3x dependendo do ROI e ativos)
 * @param totalInvested (R$)
 * @param marketMultiplier (number)
 * @returns Valuation (R$)
 */
export function calculateValuation(totalInvested: number, marketMultiplier: number = 1.5): number {
  return totalInvested * marketMultiplier;
}
