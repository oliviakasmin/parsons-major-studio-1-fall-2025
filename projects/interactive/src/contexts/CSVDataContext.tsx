import React, { createContext, useState, useEffect, ReactNode } from 'react';
import * as d3 from 'd3';

// Shared type definition
export interface CSVRow {
  NAID: string;
  naraURL: string;
  pageURL: string;
  transcriptionText: string;
  file_cat: string;
  frequency_keys: string;
  frequency_categories: string;
}

// Indexed data structures
export interface IndexedData {
  byTheme: Map<string, CSVRow[]>;
  byThemeAndWord: Map<string, Map<string, CSVRow[]>>;
}

export interface NAIDIndex {
  byNAID: Map<string, CSVRow[]>;
}

interface CSVDataContextType {
  data: CSVRow[] | null;
  indexedData: IndexedData | null;
  naidIndex: NAIDIndex | null;
  isLoading: boolean;
  error: string | null;
}

const CSVDataContext = createContext<CSVDataContextType | undefined>(undefined);

// Export the context so the hook can use it
export { CSVDataContext };

// Pre-index data by theme and word for O(1) lookups
const indexDataByTheme = (data: CSVRow[]): IndexedData => {
  const byTheme = new Map<string, CSVRow[]>();
  const byThemeAndWord = new Map<string, Map<string, CSVRow[]>>();

  data.forEach(row => {
    const categories = (row.frequency_categories || '').split('||');
    const frequencyKeys = (row.frequency_keys || '')
      .split('||')
      .map(k => k.toLowerCase());

    categories.forEach(theme => {
      if (!theme) return;

      // Index by theme
      if (!byTheme.has(theme)) {
        byTheme.set(theme, []);
      }
      byTheme.get(theme)!.push(row);

      // Index by theme and word
      if (!byThemeAndWord.has(theme)) {
        byThemeAndWord.set(theme, new Map());
      }
      const themeWordMap = byThemeAndWord.get(theme)!;

      frequencyKeys.forEach(word => {
        if (!themeWordMap.has(word)) {
          themeWordMap.set(word, []);
        }
        themeWordMap.get(word)!.push(row);
      });
    });
  });

  return { byTheme, byThemeAndWord };
};

// Index data by NAID for O(1) lookups
const indexDataByNAID = (data: CSVRow[]): NAIDIndex => {
  const byNAID = new Map<string, CSVRow[]>();
  data.forEach(row => {
    const naid = row.NAID;
    if (!byNAID.has(naid)) {
      byNAID.set(naid, []);
    }
    byNAID.get(naid)!.push(row);
  });
  return { byNAID };
};

interface CSVDataProviderProps {
  children: ReactNode;
}

export const CSVDataProvider: React.FC<CSVDataProviderProps> = ({
  children,
}) => {
  const [data, setData] = useState<CSVRow[] | null>(null);
  const [indexedData, setIndexedData] = useState<IndexedData | null>(null);
  const [naidIndex, setNaidIndex] = useState<NAIDIndex | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadData = async () => {
      try {
        setIsLoading(true);
        setError(null);

        // Load CSV data
        const csvData = await d3.csv(
          '/data/df_with_dict_categorized_multi_reduced_sorted.csv'
        );
        const typedData = csvData as unknown as CSVRow[];
        setData(typedData);

        // Index data in background using requestIdleCallback
        const indexData = () => {
          const themeIndexed = indexDataByTheme(typedData);
          const naidIndexed = indexDataByNAID(typedData);
          setIndexedData(themeIndexed);
          setNaidIndex(naidIndexed);
          setIsLoading(false);
        };

        if ('requestIdleCallback' in window) {
          requestIdleCallback(indexData, { timeout: 2000 });
        } else {
          // Fallback: use setTimeout to avoid blocking
          setTimeout(indexData, 0);
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load data');
        setIsLoading(false);
      }
    };

    loadData();
  }, []);

  return (
    <CSVDataContext.Provider
      value={{
        data,
        indexedData,
        naidIndex,
        isLoading,
        error,
      }}
    >
      {children}
    </CSVDataContext.Provider>
  );
};
