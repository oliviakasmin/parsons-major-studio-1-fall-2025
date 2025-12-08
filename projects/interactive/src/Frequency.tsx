import {
  FunctionComponent,
  useState,
  useEffect,
  useRef,
  useMemo,
  useCallback,
} from 'react';
import * as d3 from 'd3';
import { List } from '@mui/material';
import { StoryLLMModal } from './components/StoryLLM';
import { UnderlinedHeader } from './components/UnderlinedHeader';
import './Frequency.css';
import { FrequencySpread } from './components/FrequencySpread.tsx';

import { FrequencyImageRow } from './components/FrequencyImageRow';

// Type definitions
interface CSVRow {
  NAID: string;
  naraURL: string;
  pageURL: string;
  transcriptionText: string;
  file_cat: string;
  frequency_keys: string;
  frequency_categories: string;
}

interface WordFrequencyData {
  count: number;
  words: string[];
}

interface ThemeData {
  [word: string]: WordFrequencyData;
}

interface FrequencyData {
  [theme: string]: ThemeData;
}

// Add interface for indexed data
interface IndexedData {
  byTheme: Map<string, CSVRow[]>;
  byThemeAndWord: Map<string, Map<string, CSVRow[]>>;
}

interface WordWithFiles {
  word: string;
  frequency: number;
  files: Array<{
    NAID: string;
    pageURL: string;
    transcriptionText: string;
  }>;
}

// Load JSON data for word frequencies
const getFrequencyData = async () => {
  const response = await fetch('/data/frequency_categories_combined.json');
  return response.json();
};

const getData = async (): Promise<CSVRow[]> => {
  const data = await d3.csv(
    '/data/df_with_dict_categorized_multi_reduced_sorted.csv'
  );
  return data as unknown as CSVRow[];
};

const maxImagesToShow = 75;
const minImagesToShow = 5;

// Linear interpolation function to map frequency to number of images
const getImagesCount = (
  frequency: number,
  minFrequency: number,
  maxFrequency: number
): number => {
  const ratio = (frequency - minFrequency) / (maxFrequency - minFrequency);
  return Math.round(
    minImagesToShow + ratio * (maxImagesToShow - minImagesToShow)
  );
};

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

// Optimized version using pre-indexed data
const mapWordsToFilesOptimized = (
  indexedData: IndexedData,
  frequencyData: FrequencyData,
  theme: string
): WordWithFiles[] => {
  const themeData = frequencyData[theme];
  if (!themeData) return [];

  const themeWordMap = indexedData.byThemeAndWord.get(theme);
  if (!themeWordMap) return [];

  // Get all words for this theme, sorted by count (descending)
  const words = Object.entries(themeData)
    .map(([word, data]: [string, WordFrequencyData]) => ({
      word,
      count: data.count,
      words: data.words || [word],
    }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 10);

  // Get min and max frequencies for this theme
  const frequencies = words.map(w => w.count);
  const maxFrequency = Math.max(...frequencies);
  const minFrequency = Math.min(...frequencies);

  return words.map(wordData => {
    // Find matching rows - check each word variant
    const matchingRows: CSVRow[] = [];
    const seenNAIDs = new Set<string>();

    wordData.words.forEach(word => {
      const wordKey = word.toLowerCase();
      const rows = themeWordMap.get(wordKey);
      if (rows) {
        rows.forEach(row => {
          if (!seenNAIDs.has(row.NAID)) {
            matchingRows.push(row);
            seenNAIDs.add(row.NAID);
          }
        });
      }
    });

    // Since CSV is sorted, just slice to get the appropriate number
    const imageCount = getImagesCount(
      wordData.count,
      minFrequency,
      maxFrequency
    );
    const files = matchingRows.slice(0, imageCount).map((row: CSVRow) => ({
      NAID: row.NAID,
      pageURL: row.pageURL,
      transcriptionText: row.transcriptionText || '',
    }));

    return {
      word: wordData.word,
      frequency: wordData.count,
      files,
    };
  });
};

export const Frequency: FunctionComponent = () => {
  const [data, setData] = useState<CSVRow[] | null>(null);
  const [frequencyData, setFrequencyData] = useState<FrequencyData | null>(
    null
  );
  const [indexedData, setIndexedData] = useState<IndexedData | null>(null);
  const [wordsWithFiles, setWordsWithFiles] = useState<WordWithFiles[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const [containerWidth, setContainerWidth] = useState<number>(0);
  const [hoveredImage, setHoveredImage] = useState<string | null>(null);
  const [hoveredButtonIndex, setHoveredButtonIndex] = useState<number | null>(
    null
  );
  const [hoveredTheme, setHoveredTheme] = useState<string | null>(null);
  const [currentTheme, setCurrentTheme] = useState<string>('animals');
  const [selectedImage, setSelectedImage] = useState<{
    NAID: string;
    pageURL: string;
    selectedWord?: string;
    transcriptionText?: string;
  } | null>(null);
  const [frequencySpreadOpen, setFrequencySpreadOpen] =
    useState<boolean>(false);
  const [selectedWordData, setSelectedWordData] = useState<{
    word: string;
    files: any[];
    frequency: number;
  } | null>(null);

  // Memoize themes to avoid recalculation
  const themes = useMemo(() => {
    return frequencyData
      ? Object.keys(frequencyData)
      : ['animals', 'hopelessness', 'religion'];
  }, [frequencyData]);

  // Memoize min/max frequencies
  const { minFrequency, maxFrequency } = useMemo(() => {
    if (wordsWithFiles.length === 0) {
      return { minFrequency: 0, maxFrequency: 0 };
    }
    const frequencies = wordsWithFiles.map(w => w.frequency);
    return {
      minFrequency: Math.min(...frequencies),
      maxFrequency: Math.max(...frequencies),
    };
  }, [wordsWithFiles]);

  // Load data
  useEffect(() => {
    Promise.all([getData(), getFrequencyData()]).then(([csvData, jsonData]) => {
      setData(csvData as unknown as CSVRow[]);
      setFrequencyData(jsonData);
    });
  }, []);

  // Index data once when it loads
  useEffect(() => {
    if (data) {
      // Use requestIdleCallback to avoid blocking UI
      const indexData = () => {
        const indexed = indexDataByTheme(data);
        setIndexedData(indexed);
      };

      if ('requestIdleCallback' in window) {
        requestIdleCallback(indexData, { timeout: 2000 });
      } else {
        // Fallback: use setTimeout to avoid blocking
        setTimeout(indexData, 0);
      }
    }
  }, [data]);

  // Update words when theme changes - now much faster with indexed data
  useEffect(() => {
    if (indexedData && frequencyData && currentTheme) {
      setIsLoading(true);

      // Use requestIdleCallback or setTimeout to keep UI responsive
      const updateData = () => {
        const mapped = mapWordsToFilesOptimized(
          indexedData,
          frequencyData,
          currentTheme
        );
        setWordsWithFiles(mapped);
        setIsLoading(false);
      };

      if ('requestIdleCallback' in window) {
        requestIdleCallback(updateData, { timeout: 100 });
      } else {
        setTimeout(updateData, 0);
      }
    }
  }, [indexedData, frequencyData, currentTheme]);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    // Set initial dimensions immediately
    const updateWidth = () => {
      if (container) {
        const containerWidth =
          container.offsetWidth || container.clientWidth || window.innerWidth;
        setContainerWidth(containerWidth);
      }
    };

    // Set initial dimensions
    updateWidth();

    const observer = new ResizeObserver(entries => {
      for (const entry of entries) {
        const newWidth =
          entry.contentRect?.width ||
          entry.target.clientWidth ||
          (entry.target as HTMLElement).offsetWidth ||
          window.innerWidth;
        setContainerWidth(newWidth);
      }
    });
    observer.observe(container);

    // Also listen to window resize as fallback
    window.addEventListener('resize', updateWidth);

    // Cleanup
    return () => {
      observer.disconnect();
      window.removeEventListener('resize', updateWidth);
    };
  }, []);

  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setHoveredImage(null);
      }
    };

    window.addEventListener('keydown', handleEscape);
    return () => window.removeEventListener('keydown', handleEscape);
  }, []);

  const handleThemeClick = useCallback((theme: string) => {
    setCurrentTheme(theme);
  }, []);

  return (
    <>
      <div
        className="frequency-container"
        style={{ padding: '40px', minHeight: '100vh' }}
        ref={containerRef}
      >
        {/* Header row with themes */}
        <div
          style={{
            display: 'flex',
            gap: '24px',
            marginBottom: '32px',
            flexWrap: 'wrap',
          }}
        >
          <UnderlinedHeader text="Top 10" darkTheme={true} underlined={false} />
          {themes.map(theme => (
            <div
              key={theme}
              onMouseEnter={() => setHoveredTheme(theme)}
              onMouseLeave={() => setHoveredTheme(null)}
              onClick={() => handleThemeClick(theme)}
              style={{ cursor: 'pointer' }}
            >
              <UnderlinedHeader
                text={theme}
                underlined={theme === currentTheme || theme === hoveredTheme}
                hoverUnderline={
                  theme === hoveredTheme && theme !== currentTheme
                }
                darkTheme={true}
              />
            </div>
          ))}
        </div>

        {isLoading && (
          <div style={{ padding: '20px', textAlign: 'center' }}>Loading...</div>
        )}

        <List
          sx={{
            padding: 0,
            width: '100%',
          }}
        >
          {wordsWithFiles.map((wordData, index) => (
            <FrequencyImageRow
              key={wordData.word}
              wordData={wordData}
              index={index}
              containerWidth={containerWidth}
              minFrequency={minFrequency}
              maxFrequency={maxFrequency}
              hoveredImage={hoveredImage}
              hoveredButtonIndex={hoveredButtonIndex}
              setHoveredImage={setHoveredImage}
              setHoveredButtonIndex={setHoveredButtonIndex}
              setFrequencySpreadOpen={setFrequencySpreadOpen}
              setSelectedWordData={setSelectedWordData}
              setSelectedImage={setSelectedImage}
              getImagesCount={getImagesCount}
            />
          ))}
        </List>
      </div>
      {selectedImage && selectedImage.transcriptionText && (
        <StoryLLMModal
          open={!!selectedImage}
          onClose={() => setSelectedImage(null)}
          NAID={selectedImage.NAID}
          pageURL={selectedImage.pageURL}
          transcriptionText={selectedImage.transcriptionText}
          theme={currentTheme}
          selectedWord={selectedImage.selectedWord}
        />
      )}
      {selectedWordData && frequencySpreadOpen && (
        <FrequencySpread
          images={selectedWordData.files}
          category={selectedWordData.word}
          open={true}
          onClose={() => setSelectedWordData(null)}
          currentTheme={currentTheme}
          setSelectedImage={setSelectedImage}
          selectedImage={selectedImage}
          frequency={selectedWordData.frequency}
        />
      )}
    </>
  );
};
