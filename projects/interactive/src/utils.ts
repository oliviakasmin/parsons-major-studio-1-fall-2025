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

  return `Act ${day}${ord} ${months[month - 1]}, ${y}`;
};

// From ChatGPT: https://chatgpt.com/c/68ebf5ec-5ca8-8333-a3f1-83c78b28889b

// Convert historical USD to 2025 USD via CPI ratio.
// Sources (see notes below):
// - Minneapolis Fed CPI (estimate) 1800–present (yearly CPI for 1818–1855)
// - BLS CPI-U, Table 1, "All items", Sep 2025 (target CPI)

// Yearly CPI index (1982-84 = 100) for required years.
// From the Minneapolis Fed historical CPI series (see citations below).
const HIST_CPI = {
  '1818': 46,
  '1820': 42,
  '1828': 33,
  '1832': 30,
  '1836': 33,
  '1838': 32,
  '1843': 28,
  '1855': 28,
};

// Target CPI for 2025 (you can bump this when BLS updates):
// BLS CPI-U "All items" index, Sep 2025 = 324.800 (1982-84 = 100).
const CPI_2025 = 324.8;

/**
 * convertDollarsToToday
 * @param {number} amount - historical USD amount (e.g., 120)
 * @param {string} year   - one of: 1818, 1820, 1828, 1832, 1836, 1838, 1843, 1855
 * @returns {number} amount expressed in 2025 USD (rounded to cents)
 */
export function convertDollarsToToday(amount: number, year: string) {
  if (typeof amount !== 'number' || !isFinite(amount)) {
    throw new TypeError('amount must be a finite number');
  }
  if (!HIST_CPI[year as keyof typeof HIST_CPI]) {
    return 'Unsupported year';
  }
  const cpiYear = HIST_CPI[year as keyof typeof HIST_CPI];
  const factor = CPI_2025 / cpiYear;
  return Math.round(amount * factor * 100) / 100; // 2 decimals
}
