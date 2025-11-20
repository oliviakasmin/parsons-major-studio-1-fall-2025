import { FunctionComponent, useState, useEffect, useRef } from 'react';
import * as d3 from 'd3';
import { StoryLLMModal } from './StoryLLM';
import { UnderlinedHeader } from './components/UnderlinedHeader';

//   { word: 'horse', frequency: 9964 }, // removing because could be related to war as well
//
const farmAnimalsLivestock = [
  { word: 'cow', frequency: 5126 },
  { word: 'mare', frequency: 2136 },
  { word: 'bull', frequency: 3123 },
  { word: 'sheep', frequency: 1945 },
  { word: 'cattle', frequency: 1945 },
  { word: 'calf', frequency: 1653 },
  { word: 'hen', frequency: 1587 },
  { word: 'hog', frequency: 1533 },
  { word: 'pig', frequency: 1030 },
  { word: 'ox', frequency: 995 },
  { word: 'colt', frequency: 916 },
  { word: 'swine', frequency: 827 },
  { word: 'goose', frequency: 391 },
  { word: 'duck', frequency: 336 },
  { word: 'turkey', frequency: 182 },
  { word: 'mule', frequency: 139 },
  { word: 'chicken', frequency: 91 },
  { word: 'goat', frequency: 65 },
  { word: 'poultry', frequency: 61 },
  { word: 'donkey', frequency: 6 },
  { word: 'rooster', frequency: 3 },
  { word: 'livestock', frequency: 1 },
]
  .slice(0, 10)
  .sort((a, b) => b.frequency - a.frequency);

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
  const data = await d3.csv('/data/widow_ungrouped_with_lemmatizedWords.csv');
  return data;
};

const getFarmAnimalsRows = (data: any[]) => {
  return data.filter((row: any) => {
    const foundAnimal = farmAnimalsLivestock.find((animal: any) =>
      row.lemmatizedWords.includes(animal.word)
    );

    return foundAnimal !== undefined;
  });
};

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
const currentTheme = 'animal livestock';
const themes = [
  'top 20',
  currentTheme,
  'civilian occupations',
  'religion',
  'hopeless',
];

export const Frequency: FunctionComponent = () => {
  const [data, setData] = useState<any>(null);
  const [farmAnimalsRows, setFarmAnimalsRows] = useState<any>([]);
  const [animalsWithFiles, setAnimalsWithFiles] = useState<any[]>([]);
  const containerRef = useRef<HTMLDivElement>(null);
  const [containerWidth, setContainerWidth] = useState<number>(0);
  const [hoveredImage, setHoveredImage] = useState<string | null>(null);
  const [selectedImage, setSelectedImage] = useState<{
    NAID: string;
    pageURL: string;
    selectedWord?: string;
    transcriptionText?: string;
  } | null>(null);

  useEffect(() => {
    getData().then(data => {
      setData(data);
    });
  }, []);

  useEffect(() => {
    if (data) {
      const rows = getFarmAnimalsRows(data);
      setFarmAnimalsRows(rows);
      const mapped = mapAnimalsToFiles(data);
      setAnimalsWithFiles(mapped);
    }
  }, [data]);

  useEffect(() => {
    const updateWidth = () => {
      if (containerRef.current) {
        setContainerWidth(containerRef.current.offsetWidth);
      }
    };

    updateWidth();
    window.addEventListener('resize', updateWidth);
    return () => window.removeEventListener('resize', updateWidth);
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
        style={{ padding: '40px' }}
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
          {themes.map((theme, index) => (
            <UnderlinedHeader
              key={index}
              text={theme}
              underlined={theme === currentTheme}
              darkTheme={true}
            />
          ))}
        </div>

        {animalsWithFiles.map((animal, index) => {
          const imageCount = getImagesCount(animal.frequency);
          const imagesToShow = animal.files.slice(0, imageCount);

          // Calculate image size and overlap based on container width
          // No need to reserve space for label since it flows after images
          const availableWidth = containerWidth > 0 ? containerWidth : 500;

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

          return (
            <div
              key={index}
              style={{
                marginBottom: '20px',
                display: 'flex',
                alignItems: 'center',
                width: '100%',
                overflow: 'visible',
              }}
            >
              <div
                style={{
                  position: 'relative',
                  display: 'flex',
                  alignItems: 'center',
                  overflow: 'visible',
                }}
              >
                {imagesToShow.map((file: any, imgIndex: number) => {
                  const imageKey = `${index}-${imgIndex}`;
                  const isHovered = hoveredImage === imageKey;
                  const baseZIndex = imagesToShow.length - imgIndex;

                  return (
                    <img
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
                        height: 'auto',
                        objectFit: 'cover',
                        border: '1px solid #ccc',
                        marginLeft: imgIndex > 0 ? `-${overlapAmount}px` : '0',
                        zIndex: isHovered ? 1000 : baseZIndex,
                        position: 'relative',
                        flexShrink: 0,
                        transform: isHovered ? 'scale(5)' : 'scale(1)',
                        transition: 'transform 0.2s ease-in-out',
                        cursor: 'pointer',
                      }}
                    />
                  );
                })}
              </div>
              <strong style={{ marginLeft: '20px', flexShrink: 0 }}>
                {animal.word}
              </strong>
            </div>
          );
        })}
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
    </>
  );
};
