export const formatActDate = (dateString: string) => {
  const [y, m, d] = dateString.trim().split('-');
  if (!y || !m || !d) return '';
  const day = +d;
  const month = +m;
  const months = [
    'January',
    'February',
    'March',
    'April',
    'May',
    'June',
    'July',
    'August',
    'September',
    'October',
    'November',
    'December',
  ];
  if (month < 1 || month > 12 || day < 1 || day > 31) return '';

  const teen = day % 100;
  const ord =
    teen >= 11 && teen <= 13
      ? 'th'
      : day % 10 === 1
        ? 'st'
        : day % 10 === 2
          ? 'nd'
          : day % 10 === 3
            ? 'rd'
            : 'th';

  return `${day}${ord} ${months[month - 1]}, ${y}`;
};

// TODO: convert dollars to today
export const convertDollarsToToday = (dollars: number) => {
  // input ex: 100
  // output ex: 200
  return `TODO: convert amount ${dollars}`;
};
