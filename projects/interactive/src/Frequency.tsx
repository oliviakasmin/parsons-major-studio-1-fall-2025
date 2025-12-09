import {
  FunctionComponent,
  useState,
  useEffect,
  useRef,
  useMemo,
  useCallback,
} from 'react';
import { List } from '@mui/material';
import { UnderlinedHeader } from './components/UnderlinedHeader';
import './Frequency.css';
import { FrequencySpread } from './components/FrequencySpread.tsx';

import { FrequencyImageRow } from './components/FrequencyImageRow';
import { useCSVData } from './contexts/useCSVData';
import type { IndexedData, CSVRow } from './contexts/CSVDataContext';

// Type definitions
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

export const Frequency: FunctionComponent<{
  setSelectedImage: (
    image: {
      NAID: string;
      pageURL: string;
      selectedWord?: string;
      transcriptionText?: string;
    } | null
  ) => void;
  selectedImage: {
    NAID: string;
    pageURL: string;
    selectedWord?: string;
    transcriptionText?: string;
  } | null;
  setCurrentTheme: (theme: string) => void;
  currentTheme: string;
}> = ({ setSelectedImage, setCurrentTheme, currentTheme }) => {
  const { indexedData } = useCSVData();
  const [frequencyData, setFrequencyData] = useState<FrequencyData | null>(
    null
  );
  const [wordsWithFiles, setWordsWithFiles] = useState<WordWithFiles[]>([]);
  const containerRef = useRef<HTMLDivElement>(null);
  const [containerWidth, setContainerWidth] = useState<number>(0);
  const [hoveredImage, setHoveredImage] = useState<string | null>(null);
  const [hoveredButtonIndex, setHoveredButtonIndex] = useState<number | null>(
    null
  );
  const [hoveredTheme, setHoveredTheme] = useState<string | null>(null);

  const [frequencySpreadOpen, setFrequencySpreadOpen] =
    useState<boolean>(false);
  const [selectedWordData, setSelectedWordData] = useState<{
    word: string;
    files: any[];
    frequency: number;
  } | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);

  // Get themes from JSON keys
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

  // Load frequency JSON data
  useEffect(() => {
    getFrequencyData().then(jsonData => {
      setFrequencyData(jsonData);
    });
  }, []);

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
        style={{ padding: '40px', minHeight: '100vh' }}
        ref={containerRef}
        id="frequency-container"
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

      {selectedWordData && frequencySpreadOpen && (
        <FrequencySpread
          images={selectedWordData.files}
          category={selectedWordData.word}
          open={true}
          onClose={() => setSelectedWordData(null)}
          setSelectedImage={setSelectedImage}
          frequency={selectedWordData.frequency}
        />
      )}
    </>
  );
};
