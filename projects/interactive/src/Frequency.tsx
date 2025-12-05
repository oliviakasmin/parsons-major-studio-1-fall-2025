import { FunctionComponent, useState, useEffect, useRef } from 'react';
import * as d3 from 'd3';
import { List, ListItem } from '@mui/material';
import { StoryLLMModal } from './components/StoryLLM';
import { UnderlinedHeader } from './components/UnderlinedHeader';
import './Frequency.css';
import { farmAnimalsLivestock } from '../public/data/frequency/counts.ts';
import { FrequencySpread } from './components/FrequencySpread.tsx';
// import { designUtils } from './design_utils.ts';
//   { word: 'horse', frequency: 9964 }, // removing because could be related to war as well
//
import { CurlyBraceButton } from './components/CurlyBraceButton';

const maxFarmAnimals = farmAnimalsLivestock[0].frequency;
const minFarmAnimals =
  farmAnimalsLivestock[farmAnimalsLivestock.length - 1].frequency;

const maxImagesToShow = 100;
const minImagesToShow = 5;

// Linear interpolation function to map frequency to number of images
const getImagesCount = (frequency: number): number => {
  const ratio =
    (frequency - minFarmAnimals) / (maxFarmAnimals - minFarmAnimals);
  return Math.round(
    minImagesToShow + ratio * (maxImagesToShow - minImagesToShow)
  );
};

const getData = async () => {
  const data = await d3.csv('/data/filtered_animals_minimal_cols_50pct.csv');
  return data;
};

// const getFarmAnimalsRows = (data: any[]) => {
//   return data.filter((row: any) => {
//     const foundAnimal = farmAnimalsLivestock.find((animal: any) =>
//       row.lemmatizedWords.includes(animal.word)
//     );

//     return foundAnimal !== undefined;
//   });
// };

// Map farmAnimalsLivestock to include matching files
const mapAnimalsToFiles = (data: any[]) => {
  return farmAnimalsLivestock.map(animal => {
    const matchingRows = data.filter((row: any) =>
      row.lemmatizedWords.includes(animal.word)
    );

    const files = matchingRows.map((row: any) => ({
      NAID: row.NAID,
      pageURL: row.pageURL,
      transcriptionText: row.transcriptionText || row.ocrText || '',
    }));

    return {
      ...animal,
      files,
    };
  });
};
const currentTheme = 'animals';
const themes = ['hopelessness', currentTheme, 'religion'];

export const Frequency: FunctionComponent = () => {
  const [data, setData] = useState<any>(null);
  const [animalsWithFiles, setAnimalsWithFiles] = useState<any[]>([]);
  const containerRef = useRef<HTMLDivElement>(null);
  const [containerWidth, setContainerWidth] = useState<number>(0);
  const [hoveredImage, setHoveredImage] = useState<string | null>(null);
  const [hoveredButtonIndex, setHoveredButtonIndex] = useState<number | null>(
    null
  );
  const [hoveredTheme, setHoveredTheme] = useState<string | null>(null);
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

  useEffect(() => {
    getData().then(data => {
      setData(data);
    });
  }, []);

  useEffect(() => {
    if (data) {
      const mapped = mapAnimalsToFiles(data);
      setAnimalsWithFiles(mapped);
    }
  }, [data]);

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
          {themes.map((theme, index) => (
            <div
              key={index}
              onMouseEnter={() => setHoveredTheme(theme)}
              onMouseLeave={() => setHoveredTheme(null)}
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

        <List
          sx={{
            padding: 0,
            width: '100%',
          }}
        >
          {animalsWithFiles.map((animal, index) => {
            const imageCount = getImagesCount(animal.frequency);
            const imagesToShow = animal.files.slice(0, imageCount);

            // Calculate image size and overlap based on container width
            // Reserve space for label (word text + margin) - estimate max 120px for longest word + 20px margin
            const labelReservedSpace = 140;
            const availableWidth =
              containerWidth > 0
                ? Math.max(containerWidth - labelReservedSpace, 300) // Ensure minimum space for images
                : 500 - labelReservedSpace;

            // Calculate overlap amount (each image overlaps by 60% of its width)
            const overlapRatio = 0.8;
            // Formula: firstImageWidth + (imageCount - 1) * firstImageWidth * (1 - overlapRatio) = availableWidth
            // Solving for firstImageWidth: availableWidth / (1 + (imageCount - 1) * (1 - overlapRatio))
            const imageWidth =
              imageCount > 0
                ? Math.min(
                    50,
                    availableWidth / (1 + (imageCount - 1) * (1 - overlapRatio))
                  )
                : 40;
            const overlapAmount = imageWidth * overlapRatio;

            const handleListItemClick = () => {
              setFrequencySpreadOpen(true);
              setSelectedWordData({
                word: animal.word,
                files: animal.files.slice(0, 50),
                frequency: animal.frequency,
              });
            };

            // Check if any image in this row is hovered
            const isRowHovered = hoveredImage?.startsWith(`${index}-`) ?? false;

            return (
              <ListItem
                key={index}
                onMouseEnter={() => setHoveredButtonIndex(index)}
                onMouseLeave={() => setHoveredButtonIndex(null)}
                onClick={handleListItemClick}
                sx={{
                  marginBottom: '20px',
                  display: 'flex',
                  alignItems: 'center',
                  width: '100%',
                  overflow: 'visible',
                  padding: 0,
                  position: 'relative',
                  zIndex: isRowHovered ? 1000 : 0, // Higher z-index when row has hovered image
                  cursor: 'pointer',
                }}
              >
                <div
                  style={{
                    position: 'relative',
                    display: 'flex',
                    alignItems: 'center',
                    overflow: 'visible',
                  }}
                  onClick={e => e.stopPropagation()}
                >
                  {imagesToShow.map((file: any, imgIndex: number) => {
                    const imageKey = `${index}-${imgIndex}`;
                    const isHovered = hoveredImage === imageKey;
                    const baseZIndex = imagesToShow.length - imgIndex;

                    return (
                      <img
                        // loading="lazy"
                        key={imgIndex}
                        src={file.pageURL}
                        alt={`${animal.word} document ${imgIndex + 1}`}
                        onMouseEnter={() => setHoveredImage(imageKey)}
                        onMouseLeave={() => setHoveredImage(null)}
                        onClick={() => {
                          setSelectedImage({
                            NAID: file.NAID,
                            pageURL: file.pageURL,
                            selectedWord: animal.word,
                            transcriptionText: file.transcriptionText,
                          });
                        }}
                        style={{
                          width: `${imageWidth}px`,
                          minHeight: `${imageWidth}px`,
                          height: 'auto',
                          objectFit: 'cover',
                          border: '1px solid #ccc',
                          marginLeft:
                            imgIndex > 0 ? `-${overlapAmount}px` : '0',
                          zIndex: isHovered ? 10000 : baseZIndex,
                          position: 'relative',
                          flexShrink: 0,
                          transform: isHovered ? 'scale(3)' : 'scale(1)',
                          transition: 'transform 0.2s ease-in-out',
                          cursor: 'pointer',
                        }}
                      />
                    );
                  })}
                </div>
                <div
                  style={{
                    marginLeft: '20px',
                  }}
                  onMouseEnter={() => setHoveredButtonIndex(index)}
                  onMouseLeave={() => setHoveredButtonIndex(null)}
                  onClick={e => {
                    e.stopPropagation();
                    handleListItemClick();
                  }}
                >
                  <CurlyBraceButton
                    darkTheme={true}
                    hidden={hoveredButtonIndex !== index}
                    line1={
                      <div
                      // style={{ display: 'flex', alignItems: 'baseline' }}
                      >
                        <UnderlinedHeader
                          text={animal.word}
                          underlined={true}
                          darkTheme={true}
                          noTextTransform={true}
                          size="small"
                          hoverUnderline={hoveredButtonIndex === index}
                        />
                        {/* <span
                          style={{
                            fontSize: '12px',
                            display: `${hoveredButtonIndex === index ? 'inline' : 'none'}`,
                            marginLeft: '24px',
                          }}
                        >
                          ({animal.frequency})
                        </span> */}
                      </div>
                    }
                    onClick={handleListItemClick}
                  />
                </div>
              </ListItem>
            );
          })}
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
