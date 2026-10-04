export const formatCurrency = (amount) => {
  if (amount === undefined || amount === null || isNaN(amount)) {
    return '₹0';
  }
  const numeric = Math.round(Number(amount));
  return `₹${numeric.toLocaleString('en-IN')}`;
};

export default formatCurrency;
