import { FunctionComponent, useState, useMemo, useEffect } from 'react';
import { Modal, Box } from '@mui/material';
import { UnderlinedHeader } from './UnderlinedHeader';
import { CurlyBraceButton } from './CurlyBraceButton';
import { useCSVData } from '../contexts/useCSVData';
import type { CSVRow } from '../contexts/CSVDataContext';

type FrequencySpreadProps = {
  selectedWord: string;
  theme: string;
  open: boolean;
  onClose: () => void;
  setSelectedImage: (any: any) => void;
  frequency: number;
};

export const FrequencySpread: FunctionComponent<FrequencySpreadProps> = ({
  selectedWord,
  theme,
  open,
  onClose,
  setSelectedImage,
  frequency,
}) => {
  const { indexedData } = useCSVData();
  const [hoveredImage, setHoveredImage] = useState<string | null>(null);
  const [windowSize, setWindowSize] = useState({
    width: typeof window !== 'undefined' ? window.innerWidth : 0,
    height: typeof window !== 'undefined' ? window.innerHeight : 0,
  });

  const imageSize = 100; // Same size as in Frequency.tsx
  const padding = 20; // Box padding
  const headerHeight = 40; // Approximate header height including margins
  const randomOffsetRange = 15; // Max random offset in pixels for overlapping images
  const spacing = 20; // Spacing between images in the grid
  const maxRotation = 2; // Max rotation in degrees (left and right)

  // Get images from indexed data
  const images = useMemo(() => {
    if (!indexedData || !selectedWord || !theme) return [];

    const themeWordMap = indexedData.byThemeAndWord.get(theme);
    if (!themeWordMap) return [];

    const wordKey = selectedWord.toLowerCase();
    const rows = themeWordMap.get(wordKey) || [];

    // Remove duplicates by NAID and map to the format needed
    const seenNAIDs = new Set<string>();
    return rows
      .filter((row: CSVRow) => {
        if (seenNAIDs.has(row.NAID)) return false;
        seenNAIDs.add(row.NAID);
        return true;
      })
      .map((row: CSVRow) => ({
        NAID: row.NAID,
        pageURL: row.pageURL,
        transcriptionText: row.transcriptionText || '',
        selectedWord: selectedWord,
      }));
  }, [indexedData, selectedWord, theme]);

  // Generate random rotations for each image (memoized so they stay consistent)
  const imageRotations = useMemo(() => {
    return images.map(() => (Math.random() - 0.5) * 2 * maxRotation);
  }, [images, maxRotation]);

  // Listen for window resize events
  useEffect(() => {
    const handleResize = () => {
      setWindowSize({
        width: window.innerWidth,
        height: window.innerHeight,
      });
    };

    window.addEventListener('resize', handleResize);

    // Also update on mount in case window size changed while component was unmounted
    handleResize();

    return () => {
      window.removeEventListener('resize', handleResize);
    };
  }, []);

  // Calculate grid positions for images
  const imagePositions = useMemo(() => {
    // Calculate available space
    const availableWidth = windowSize.width - padding * 2;
    const availableHeight = windowSize.height - padding * 2 - headerHeight;

    // Calculate how many images fit in grid (accounting for spacing)
    const cols = Math.floor(availableWidth / (imageSize + spacing));
    const rows = Math.floor(availableHeight / (imageSize + spacing));
    const imagesPerGrid = cols * rows;

    // Calculate spacing to center the grid
    const gridWidth = cols * imageSize + (cols - 1) * spacing;
    const gridHeight = rows * imageSize + (rows - 1) * spacing;
    const startX = padding + (availableWidth - gridWidth) / 2;
    const startY = padding + headerHeight + (availableHeight - gridHeight) / 2;

    return images.map((_, index) => {
      // Determine which grid batch this image belongs to
      const gridIndex = index % imagesPerGrid;

      // Calculate base grid position (accounting for spacing)
      const col = gridIndex % cols;
      const row = Math.floor(gridIndex / cols);
      const baseX = startX + col * (imageSize + spacing);
      const baseY = startY + row * (imageSize + spacing);

      // Apply random offset to all images (including first batch)
      const offsetX = (Math.random() - 0.5) * 10 * randomOffsetRange;
      const offsetY = (Math.random() - 0.5) * 4 * randomOffsetRange;

      return {
        top: baseY + offsetY,
        left: baseX + offsetX,
        zIndex: index,
      };
    });
  }, [
    images,
    imageSize,
    padding,
    headerHeight,
    randomOffsetRange,
    spacing,
    windowSize,
  ]);

  return (
    <div>
      <Modal
        open={open}
        onClose={onClose}
        sx={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          color: '#faf9f7',
          background: 'black',
        }}
      >
        <Box
          sx={{
            position: 'relative',
            width: '100vw',
            height: '100vh',
            overflow: 'hidden',
            padding: '40px',
            color: '#faf9f7',
            // background: '#2c1810',
          }}
        >
          <Box
            sx={{
              position: 'sticky',
              top: 0,
              zIndex: 10000,
              paddingBottom: '20px',
              marginBottom: '20px',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'baseline' }}>
              <UnderlinedHeader text={selectedWord} darkTheme={true} />
              <span style={{ marginLeft: '24px' }}>({frequency})</span>
            </div>
          </Box>
          <div style={{ position: 'absolute', right: 12, top: 12 }}>
            <CurlyBraceButton
              onClick={onClose}
              line1="back"
              color={true}
              darkTheme={true}
            />
          </div>
          {images.map((file, index) => {
            const imageKey = `${index}`;
            const isHovered = hoveredImage === imageKey;
            const position = imagePositions[index];
            const rotation = imageRotations[index];

            return (
              <img
                key={index}
                src={file.pageURL}
                alt={file.selectedWord || `Image ${index + 1}`}
                onMouseEnter={() => setHoveredImage(imageKey)}
                onMouseLeave={() => setHoveredImage(null)}
                style={{
                  position: 'absolute',
                  top: `${position.top}px`,
                  left: `${position.left}px`,
                  width: `${imageSize}px`,
                  height: 'auto',
                  objectFit: 'cover',
                  border: '1px solid #ccc',
                  zIndex: isHovered ? 1000 : position.zIndex,
                  transform: isHovered
                    ? `scale(3) rotate(${rotation}deg)`
                    : `scale(1) rotate(${rotation}deg)`,
                  transition: 'transform 0.2s ease-in-out',
                  cursor: 'pointer',
                  transformOrigin: 'center center',
                }}
                onClick={() => {
                  setSelectedImage({
                    NAID: file.NAID,
                    pageURL: file.pageURL,
                    selectedWord: selectedWord,
                    transcriptionText: file.transcriptionText,
                  });
                  onClose();

                  // Scroll to StoryLLM component after modal closes
                  requestAnimationFrame(() => {
                    setTimeout(() => {
                      const storyLLM = document.getElementById('story-llm');
                      if (storyLLM) {
                        storyLLM.scrollIntoView({ behavior: 'smooth' });
                      }
                    }, 100); // Small delay to ensure modal is closed
                  });
                }}
              />
            );
          })}
        </Box>
      </Modal>
    </div>
  );
};
