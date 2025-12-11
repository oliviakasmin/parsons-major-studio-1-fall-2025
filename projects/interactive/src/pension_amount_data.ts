import * as d3 from 'd3';

export interface PensionDataRow {
  NAID: string;
  naraURL: string;
  title: string;
  pageObjectId: string;
  pageURL: string;
  file_cat: string;
  //   llm_extracted_pension_amount: string;
  //   llm_extracted_pension_amount_dollars: string;
  //   normalized_payment_frequency: string;
  normalized_yearly_amount: string;
  known_act_date: string;
  //   extracted_place: string;
  normalized_place: string;
  extracted_applicant_type: string;
}

// capitalize first letter of each word (basic title case)
const toTitleCase = (value: string): string =>
  value
    .split(' ')
    .filter(Boolean)
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');

// Get the numeric value from normalized_yearly_amount, handling edge cases
const getNumericAmount = (row: d3.DSVRowString<string>): number | null => {
  const amountStr = (row['normalized_yearly_amount'] || '').toString().trim();
  if (!amountStr) return null;
  const num = Number(amountStr);
  return Number.isFinite(num) && !Number.isNaN(num) ? num : null;
};

// Filter out outliers based on yearly amount using IQR method
const filterOutliers = (
  data: d3.DSVRowArray<string>
): d3.DSVRowArray<string> => {
  // Extract all valid yearly amounts
  const amounts: number[] = [];
  data.forEach(row => {
    const amount = getNumericAmount(row);
    if (amount !== null) {
      amounts.push(amount);
    }
  });

  if (amounts.length === 0) return data;

  // Sort amounts to calculate quartiles
  const sorted = [...amounts].sort((a, b) => a - b);
  const q1Index = Math.floor(sorted.length * 0.25);
  const q3Index = Math.floor(sorted.length * 0.75);
  const q1 = sorted[q1Index];
  const q3 = sorted[q3Index];
  const iqr = q3 - q1;

  // Define outlier bounds (values outside Q1 - 1.5*IQR and Q3 + 1.5*IQR are outliers)
  const lowerBound = q1 - 1.5 * iqr;
  const upperBound = q3 + 1.5 * iqr;

  // Filter out rows with amounts outside the bounds
  const filteredRows = data.filter(row => {
    const amount = getNumericAmount(row);
    if (amount === null) return true; // Keep rows without amounts (they'll be filtered elsewhere)
    return amount >= lowerBound && amount <= upperBound;
  });

  // Preserve the DSVRowArray structure with columns property
  const result: d3.DSVRowArray<string> = Object.assign([], filteredRows, {
    columns: data.columns,
  });
  return result;
};

export const getPensionAmountData = async (): Promise<
  d3.DSVRowArray<string>
> => {
  const data = await d3.csv(
    '/data/extracted_amounts_sample_1000_post_normalization.csv'
  );
  // Filter out outliers before returning
  return filterOutliers(data);
};

// filter data to get rows that have act date, yearly amount, and place of residence
export const filterValidPensionRows = (
  data: d3.DSVRowArray<string>
): Array<d3.DSVRowString<string>> => {
  return data.filter(row => {
    const actDate = (row['known_act_date'] || '').trim();
    const yearlyAmountRaw = (row['normalized_yearly_amount'] || '')
      .toString()
      .trim();
    const place = (row['normalized_place'] || '').trim();

    const yearlyAmount = Number(yearlyAmountRaw);

    return (
      actDate.length > 0 &&
      place.length > 0 &&
      yearlyAmountRaw.length > 0 &&
      Number.isFinite(yearlyAmount) &&
      !Number.isNaN(yearlyAmount)
    );
  });
};

// Group rows by act year (YYYY extracted from known_act_date)
export const groupPensionByYear = (
  rows: Array<d3.DSVRowString<string>> | d3.DSVRowArray<string>
): Record<string, Array<d3.DSVRowString<string>>> => {
  const groups: Record<string, Array<d3.DSVRowString<string>>> = {};
  rows.forEach(row => {
    const dateStr = (row['known_act_date'] || '').trim();
    if (!dateStr) return;
    const year = dateStr.split('-')[0];
    if (!year) return;
    if (!groups[year]) groups[year] = [];
    groups[year].push(row);
  });
  return groups;
};

// Given a year (YYYY), return unique applicant type and place options
export const getOptionsForYear = (
  grouped: Record<string, Array<d3.DSVRowString<string>>>,
  year: string
): { applicantTypeOptions: string[]; placeOptions: string[] } => {
  const rows = grouped[year] || [];
  const applicantTypeOptions = Array.from(
    new Set(
      rows
        .map(r =>
          (r['extracted_applicant_type'] || '').toString().toLowerCase().trim()
        )
        .filter(Boolean)
    )
  ).sort();
  const placeOptions = Array.from(
    new Set(
      rows
        .map(r => (r['normalized_place'] || '').toString().toLowerCase().trim())
        .filter(Boolean)
    )
  )
    .sort()
    .map(toTitleCase);
  return { applicantTypeOptions, placeOptions };
};

// Given a year and current selections, recompute valid applicantType and place options
export const getOptionsForFilters = (
  grouped: Record<string, Array<d3.DSVRowString<string>>>,
  year: string,
  selectedApplicantType?: string,
  selectedPlace?: string
): { applicantTypeOptions: string[]; placeOptions: string[] } => {
  const rows = grouped[year] || [];

  const norm = (s?: string) => (s ?? '').toString().toLowerCase().trim();
  const selType = norm(selectedApplicantType);
  const selPlace = norm(selectedPlace);

  // For applicant type options, if a place is selected, limit to types present at that place; otherwise, all types for the year
  const rowsForTypeOptions = selPlace
    ? rows.filter(r => norm(r['normalized_place']) === selPlace)
    : rows;
  const applicantTypeOptions = Array.from(
    new Set(
      rowsForTypeOptions
        .map(r => norm(r['extracted_applicant_type']))
        .filter(Boolean)
    )
  ).sort();

  // For place options, if an applicant type is selected, limit to places present for that type; otherwise, all places for the year
  const rowsForPlaceOptions = selType
    ? rows.filter(r => norm(r['extracted_applicant_type']) === selType)
    : rows;
  const placeOptions = Array.from(
    new Set(
      rowsForPlaceOptions.map(r => norm(r['normalized_place'])).filter(Boolean)
    )
  )
    .sort()
    .map(toTitleCase);

  return { applicantTypeOptions, placeOptions };
};

export const getValidPensionRows = async () => {
  const pensionData = await getPensionAmountData();
  const valid = filterValidPensionRows(pensionData);
  return valid;
};

export const getPensionAmountFormData = async () => {
  const valid = await getValidPensionRows();
  const grouped = groupPensionByYear(valid);
  const dateOptions = Object.keys(grouped);
  // console.log('dateOptions:', dateOptions);
  const defaultDate = dateOptions[0];
  const { applicantTypeOptions, placeOptions } = getOptionsForYear(
    grouped,
    defaultDate
  );
  const defaultApplicantType = applicantTypeOptions[0];
  const defaultPlace = placeOptions[0];

  return {
    dateOptions,
    applicantTypeOptions,
    placeOptions,
    defaultDate,
    defaultApplicantType,
    defaultPlace,
  };
};

// Find all matching pension records based on year, applicant type, and place
export const findMatchingPensionRows = (
  rows: Array<d3.DSVRowString<string>> | d3.DSVRowArray<string>,
  year: string,
  applicantType: string,
  place: string
): Array<d3.DSVRowString<string>> => {
  const normalizedYear = year.toLowerCase().trim();
  const normalizedApplicantType = applicantType.toLowerCase().trim();
  const normalizedPlace = place.toLowerCase().trim();

  return rows.filter(row => {
    const rowYear = (row['known_act_date'] || '').toString().split('-')[0];
    const rowApplicantType = (row['extracted_applicant_type'] || '')
      .toString()
      .toLowerCase()
      .trim();
    const rowPlace = (row['normalized_place'] || '')
      .toString()
      .toLowerCase()
      .trim();

    return (
      rowYear === normalizedYear &&
      rowApplicantType === normalizedApplicantType &&
      rowPlace === normalizedPlace
    );
  });
};

// Calculate average by known_act_date
export const getAverageByActDate = (
  data: d3.DSVRowArray<string>
): Record<string, number> => {
  const grouped: Record<string, { sum: number; count: number }> = {};

  data.forEach(row => {
    const actDate = (row['known_act_date'] || '').trim();
    const amount = getNumericAmount(row);

    if (!actDate || amount === null) return;

    if (!grouped[actDate]) {
      grouped[actDate] = { sum: 0, count: 0 };
    }
    grouped[actDate].sum += amount;
    grouped[actDate].count += 1;
  });

  const averages: Record<string, number> = {};
  Object.keys(grouped).forEach(date => {
    averages[date] = grouped[date].sum / grouped[date].count;
  });

  return averages;
};

// Calculate average by extracted_applicant_type
export const getAverageByApplicantType = (
  data: d3.DSVRowArray<string>
): Record<string, number> => {
  const grouped: Record<string, { sum: number; count: number }> = {};

  data.forEach(row => {
    const applicantType = (row['extracted_applicant_type'] || '')
      .trim()
      .toLowerCase();
    const amount = getNumericAmount(row);

    if (!applicantType || amount === null) return;

    if (!grouped[applicantType]) {
      grouped[applicantType] = { sum: 0, count: 0 };
    }
    grouped[applicantType].sum += amount;
    grouped[applicantType].count += 1;
  });

  const averages: Record<string, number> = {};
  Object.keys(grouped).forEach(type => {
    averages[type] = grouped[type].sum / grouped[type].count;
  });

  return averages;
};

// Calculate overall average across all records with valid amounts
export const getOverallAverage = (data: d3.DSVRowArray<string>): number => {
  const amounts: number[] = [];

  data.forEach(row => {
    const amount = getNumericAmount(row);
    if (amount !== null) {
      amounts.push(amount);
    }
  });

  if (amounts.length === 0) return 0;
  return amounts.reduce((sum, val) => sum + val, 0) / amounts.length;
};

// Get all three averages at once
export const getAllAverages = async (): Promise<{
  overall: number;
  byActDate: Record<string, number>;
  byApplicantType: Record<string, number>;
}> => {
  const data = await getPensionAmountData();
  return {
    overall: getOverallAverage(data),
    byActDate: getAverageByActDate(data),
    byApplicantType: getAverageByApplicantType(data),
  };
};
