// Formato de moneda Soles (S/)
export const formatCurrency = (amount: number | string | null | undefined): string => {
  const num = parseFloat(String(amount)) || 0;
  return `S/ ${num.toLocaleString('es-PE', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
};

// Formato de moneda sin decimales
export const formatCurrencyShort = (amount: number | string | null | undefined): string => {
  const num = parseFloat(String(amount)) || 0;
  return `S/ ${num.toLocaleString('es-PE', { minimumFractionDigits: 0 })}`;
};

// Formato de número con comas
export const formatNumber = (num: number | string | null | undefined): string => {
  return parseFloat(String(num)) || 0;
};

// Formato de porcentaje
export const formatPercent = (value: number | string | null | undefined): string => {
  const num = parseFloat(String(value)) || 0;
  return `${num.toFixed(1)}%`;
};
