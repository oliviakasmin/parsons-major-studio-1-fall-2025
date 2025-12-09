import { CurlyBraceButton } from './CurlyBraceButton';
import React, { FunctionComponent, useMemo, useCallback } from 'react';
import { ListItem } from '@mui/material';
import { UnderlinedHeader } from './UnderlinedHeader';

// Extract as a proper React component
interface FrequencyImageRowProps {
  wordData: any;
  index: number;
  containerWidth: number;
  minFrequency: number;
  maxFrequency: number;
  hoveredImage: string | null;
  hoveredButtonIndex: number | null;
  setHoveredImage: (key: string | null) => void;
  setHoveredButtonIndex: (index: number | null) => void;
  setFrequencySpreadOpen: (open: boolean) => void;
  setSelectedWordData: (
    data: {
      word: string;
      files: any[];
      frequency: number;
    } | null
  ) => void;
  setSelectedImage: (
    image: {
      NAID: string;
      pageURL: string;
      selectedWord?: string;
      transcriptionText?: string;
    } | null
  ) => void;
  getImagesCount: (
    frequency: number,
    minFrequency: number,
    maxFrequency: number
  ) => number;
}

// Memoize FrequencyImageRow to prevent unnecessary re-renders
export const FrequencyImageRow: FunctionComponent<FrequencyImageRowProps> =
  React.memo(
    ({
      wordData,
      index,
      containerWidth,
      minFrequency,
      maxFrequency,
      hoveredImage,
      hoveredButtonIndex,
      setHoveredImage,
      setHoveredButtonIndex,
      setFrequencySpreadOpen,
      setSelectedWordData,
      setSelectedImage,
      getImagesCount,
    }) => {
      // Memoize layout calculations
      const { imagesToShow, imageWidth, overlapAmount } = useMemo(() => {
        const count = getImagesCount(
          wordData.frequency,
          minFrequency,
          maxFrequency
        );
        const toShow = wordData.files.slice(0, count);

        const labelReservedSpace = 140;
        const availableWidth =
          containerWidth > 0
            ? Math.max(containerWidth - labelReservedSpace, 300)
            : 500 - labelReservedSpace;

        const overlapRatio = 0.8;
        const width =
          count > 0
            ? Math.min(
                50,
                availableWidth / (1 + (count - 1) * (1 - overlapRatio))
              )
            : 40;
        const overlap = width * overlapRatio;

        return {
          imagesToShow: toShow,
          imageWidth: width,
          overlapAmount: overlap,
        };
      }, [
        wordData.frequency,
        wordData.files,
        minFrequency,
        maxFrequency,
        containerWidth,
        getImagesCount,
      ]);

      const handleListItemClick = useCallback(() => {
        setFrequencySpreadOpen(true);
        setSelectedWordData({
          word: wordData.word,
          files: wordData.files.slice(0, 50),
          frequency: wordData.frequency,
        });
      }, [
        wordData.word,
        wordData.files,
        wordData.frequency,
        setFrequencySpreadOpen,
        setSelectedWordData,
      ]);

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
            zIndex: isRowHovered ? 1000 + index : index,
            cursor: 'pointer',
            opacity: 0,
            animation: 'fadeIn 0.3s ease-in forwards',
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
              // Ensure images in later rows have higher z-index
              const baseZIndex = index * 100 + (imagesToShow.length - imgIndex);

              return (
                <img
                  key={file.NAID}
                  src={file.pageURL}
                  alt={`${wordData.word} document ${imgIndex + 1}`}
                  onMouseEnter={() => setHoveredImage(imageKey)}
                  onMouseLeave={() => setHoveredImage(null)}
                  onLoad={e => {
                    // Fade in when image loads
                    (e.target as HTMLImageElement).style.opacity = '1';
                  }}
                  onClick={() => {
                    setSelectedImage({
                      NAID: file.NAID,
                      pageURL: file.pageURL,
                      selectedWord: wordData.word,
                      transcriptionText: file.transcriptionText,
                    });

                    requestAnimationFrame(() => {
                      const storyLLM = document.getElementById('story-llm');
                      if (storyLLM) {
                        storyLLM.scrollIntoView({ behavior: 'smooth' });
                      }
                    });
                  }}
                  style={{
                    width: `${imageWidth}px`,
                    minHeight: `${imageWidth}px`,
                    height: 'auto',
                    objectFit: 'cover',
                    border: '1px solid #ccc',
                    marginLeft: imgIndex > 0 ? `-${overlapAmount}px` : '0',
                    zIndex: isHovered ? 100000 : baseZIndex,
                    position: 'relative',
                    flexShrink: 0,
                    transform: isHovered ? 'scale(3)' : 'scale(1)',
                    transition:
                      'transform 0.2s ease-in-out, opacity 0.3s ease-in',
                    cursor: 'pointer',
                    opacity: 0, // Start hidden, fade in on load
                    backgroundColor: '#2c1810', // Match background to prevent white flash
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
                <div>
                  <UnderlinedHeader
                    text={wordData.word}
                    underlined={true}
                    darkTheme={true}
                    noTextTransform={true}
                    size="small"
                    hoverUnderline={hoveredButtonIndex === index}
                  />
                </div>
              }
              onClick={handleListItemClick}
            />
          </div>
        </ListItem>
      );
    },
    (prevProps, nextProps) => {
      // Custom comparison function for React.memo
      return (
        prevProps.wordData.word === nextProps.wordData.word &&
        prevProps.wordData.frequency === nextProps.wordData.frequency &&
        prevProps.wordData.files.length === nextProps.wordData.files.length &&
        prevProps.index === nextProps.index &&
        prevProps.containerWidth === nextProps.containerWidth &&
        prevProps.minFrequency === nextProps.minFrequency &&
        prevProps.maxFrequency === nextProps.maxFrequency &&
        prevProps.hoveredImage === nextProps.hoveredImage &&
        prevProps.hoveredButtonIndex === nextProps.hoveredButtonIndex
      );
    }
  );
