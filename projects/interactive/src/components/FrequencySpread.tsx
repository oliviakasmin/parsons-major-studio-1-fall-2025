import { FunctionComponent, useState, useMemo } from 'react';
import { Modal, Box } from '@mui/material';
import { UnderlinedHeader } from './UnderlinedHeader';
import { CurlyBraceButton } from './CurlyBraceButton';

type FrequencySpreadProps = {
  images: any[];
  category: string;
  open: boolean;
  onClose: () => void;
  setSelectedImage: (any: any) => void;
  frequency: number;
};

export const FrequencySpread: FunctionComponent<FrequencySpreadProps> = ({
  images,
  category,
  open,
  onClose,
  setSelectedImage,
  frequency,
}) => {
  const [hoveredImage, setHoveredImage] = useState<string | null>(null);

  // Generate random positions for each image on mount
  const imagePositions = useMemo(() => {
    return images.map((_, index) => ({
      top: Math.random() * 80 + 10, // 10% to 90% of viewport height
      left: Math.random() * 80 + 10, // 10% to 90% of viewport width
      zIndex: index,
    }));
  }, [images]);

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
            <div style={{ display: 'flex', alignItems: 'baseline' }}>
              <UnderlinedHeader text={category} darkTheme={true} />
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
    </div>
  );
};
