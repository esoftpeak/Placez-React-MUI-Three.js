export const formatNumber = (number) => {
  const getNumberWithComma = (val) =>
    Number(parseFloat(val).toFixed(2)).toLocaleString('en', {
      minimumFractionDigits: 2,
    });
  if (+number < 0) {
    return number
      ? `$ -${getNumberWithComma(String(number).split('-')[1])}`
      : '$0.00';
  }
  return number && !Number.isNaN(+number)
    ? `$${getNumberWithComma(number)}`
    : '$0.00';
};
