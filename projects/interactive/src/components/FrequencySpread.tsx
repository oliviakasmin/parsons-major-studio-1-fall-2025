import { FunctionComponent, useState, useMemo } from 'react';
import { Modal, Box } from '@mui/material';
import { UnderlinedHeader } from './UnderlinedHeader';
// import { designUtils } from '../design_utils';
import { CurlyBraceButton } from './CurlyBraceButton';
import { StoryLLMModal } from './StoryLLM';
// display all images from the prop spread out across the vh and vw like a "lightbox" effect (some scattered, appear to be randomly dropped)
// display the images as the same size with the same hover effect as in Frequency.tsx

type FrequencySpreadProps = {
  images: any[];
  category: string;
  open: boolean;
  onClose: () => void;
  currentTheme: string;
  setSelectedImage: (any: any) => void;
  selectedImage: any;
};

export const FrequencySpread: FunctionComponent<FrequencySpreadProps> = ({
  images,
  category,
  open,
  onClose,
  currentTheme,
  setSelectedImage,
  selectedImage,
}) => {
  const [hoveredImage, setHoveredImage] = useState<string | null>(null);

  // Generate random positions for each image on mount
  const imagePositions = useMemo(() => {
    return images.map((_, index) => ({
      top: Math.random() * 80 + 10, // 10% to 90% of viewport height
      left: Math.random() * 80 + 10, // 10% to 90% of viewport width
      zIndex: index,
    }));
  }, [images.length]);

  const imageSize = 100; // Same size as in Frequency.tsx

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
          background: '#2c1810',
        }}
      >
        <Box
          sx={{
            position: 'relative',
            width: '100vw',
            height: '100vh',
            //   backgroundColor: designUtils.backgroundColor,
            overflow: 'hidden',
            padding: '40px',
            color: '#faf9f7',
            background: '#2c1810',
          }}
        >
          <Box
            sx={{
              position: 'sticky',
              top: 0,
              zIndex: 10000,
              // backgroundColor: designUtils.backgroundColor,
              paddingBottom: '20px',
              marginBottom: '20px',
            }}
          >
            <UnderlinedHeader text={category} darkTheme={true} />
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

            return (
              <img
                key={index}
                src={file.pageURL}
                alt={file.selectedWord || `Image ${index + 1}`}
                onMouseEnter={() => setHoveredImage(imageKey)}
                onMouseLeave={() => setHoveredImage(null)}
                style={{
                  position: 'absolute',
                  top: `${position.top}%`,
                  left: `${position.left}%`,
                  width: `${imageSize}px`,
                  height: 'auto',
                  objectFit: 'cover',
                  border: '1px solid #ccc',
                  zIndex: isHovered ? 1000 : position.zIndex,
                  transform: isHovered ? 'scale(3)' : 'scale(1)',
                  transition: 'transform 0.2s ease-in-out',
                  cursor: 'pointer',
                  transformOrigin: 'center center',
                }}
                onClick={() => {
                  setSelectedImage({
                    NAID: file.NAID,
                    pageURL: file.pageURL,
                    selectedWord: category,
                    transcriptionText: file.transcriptionText,
                  });
                  onClose();
                }}
              />
            );
          })}
        </Box>
      </Modal>
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
    </div>
  );
};
