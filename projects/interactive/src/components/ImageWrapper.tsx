import {
  TransformWrapper,
  TransformComponent,
  useControls,
} from 'react-zoom-pan-pinch';
import { ReactElement, useState } from 'react';
import { IconButton } from '@mui/material';
import { ZoomIn, ZoomOut, RestartAlt } from '@mui/icons-material';
import { designUtils } from '../design_utils';
import { Link } from '@mui/material';

const ImageZoomControls = () => {
  const { zoomIn, zoomOut, resetTransform } = useControls();
  const [hasZoomed, setHasZoomed] = useState(false);

  const handleZoomIn = () => {
    zoomIn();
    setHasZoomed(true);
  };

  const handleReset = () => {
    resetTransform();
    setHasZoomed(false);
  };

  return (
    <div
      className="tools"
      style={{
        zIndex: 1000,
        display: 'flex',
        gap: 4,
        padding: 4,
        top: 0,
        right: 0,
        position: 'absolute',
        flexDirection: 'column',
      }}
    >
      <IconButton
        onClick={handleZoomIn}
        aria-label="Zoom in"
        sx={{
          color: designUtils.iconButtonColor,
          backgroundColor: designUtils.backgroundColor,
          borderRadius: 0,
          '&:hover': {
            color: designUtils.blueColor,
            backgroundColor: designUtils.backgroundColor,
          },
        }}
      >
        <ZoomIn />
      </IconButton>
      <IconButton
        onClick={() => zoomOut()}
        aria-label="Zoom out"
        sx={{
          color: designUtils.iconButtonColor,
          backgroundColor: designUtils.backgroundColor,
          borderRadius: 0,
          visibility: hasZoomed ? 'visible' : 'hidden',
          pointerEvents: hasZoomed ? 'auto' : 'none',
          '&:hover': {
            color: designUtils.blueColor,
            backgroundColor: designUtils.backgroundColor,
          },
        }}
      >
        <ZoomOut />
      </IconButton>
      <IconButton
        onClick={handleReset}
        aria-label="Reset"
        sx={{
          color: designUtils.iconButtonColor,
          backgroundColor: designUtils.backgroundColor,
          borderRadius: 0,
          visibility: hasZoomed ? 'visible' : 'hidden',
          pointerEvents: hasZoomed ? 'auto' : 'none',
          '&:hover': {
            color: designUtils.blueColor,
            backgroundColor: designUtils.backgroundColor,
          },
        }}
      >
        <RestartAlt />
      </IconButton>
    </div>
  );
};

export const ImageWrapper = ({
  img,
  sourceUrl,
}: {
  img: ReactElement;
  sourceUrl: string;
}) => {
  if (!img) {
    return null;
  }

  return (
    <div
      style={{
        width: '100%',
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        minHeight: 0,
        alignItems: 'center',
        justifyContent: 'center',
      }}
    >
      <TransformWrapper
        initialScale={1}
        initialPositionX={200}
        initialPositionY={100}
      >
        {() => (
          <>
            <div style={{ flex: 1, minHeight: 0, overflow: 'hidden' }}>
              <div
                style={{
                  position: 'relative',
                  height: '100%',
                  width: '100%',
                  overflow: 'hidden',
                }}
              >
                <ImageZoomControls />
                <TransformComponent
                  wrapperStyle={{
                    width: '100%',
                    height: '100%',
                    overflow: 'hidden',
                  }}
                  contentStyle={{
                    width: '100%',
                    height: '100%',
                  }}
                >
                  {img}
                </TransformComponent>
              </div>
            </div>
            <div
              id="image-zoom-controls-source-container"
              style={{
                display: 'flex',
                justifyContent: 'center',
                width: '100%',
                flexShrink: 0,
                paddingTop: '8px',
                gap: 12,
              }}
            >
              <Link
                href={sourceUrl}
                target="_blank"
                style={{
                  flexShrink: 0,
                }}
              >
                <div
                  style={{
                    fontSize: '0.8em',
                    textAlign: 'center',
                    color: designUtils.textColor,
                    textDecoration: 'underline',
                  }}
                >
                  source
                </div>
              </Link>
            </div>
          </>
        )}
      </TransformWrapper>
    </div>
  );
};
