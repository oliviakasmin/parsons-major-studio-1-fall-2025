import { StoryLLM } from './components/StoryLLM';
import { Frequency } from './Frequency';
// import { StoryLLMModal } from './components/StoryLLM';
import { useState } from 'react';
import { CurlyBraceButton } from './components/CurlyBraceButton';

export const FrequencyAndStory = () => {
  const [selectedImage, setSelectedImage] = useState<{
    NAID: string;
    pageURL: string;
    selectedWord?: string;
    transcriptionText?: string;
  } | null>(null);
  const [currentTheme, setCurrentTheme] = useState<string>('animals');

  return (
    <div className="frequency-container" style={{ padding: '40px' }}>
      <Frequency
        setSelectedImage={setSelectedImage}
        selectedImage={selectedImage}
        setCurrentTheme={setCurrentTheme}
        currentTheme={currentTheme}
      />

      {selectedImage && selectedImage.transcriptionText && (
        <div style={{ width: '80vw', margin: '0 auto' }}>
          <div className="section-underline-bottom-dark"></div>

          <StoryLLM
            selectedImage={selectedImage}
            NAID={selectedImage.NAID}
            pageURL={selectedImage.pageURL}
            transcriptionText={selectedImage.transcriptionText}
            theme={currentTheme}
            selectedWord={selectedImage.selectedWord}
          />
          <div
            style={{
              display: 'flex',
              justifyContent: 'center',
              width: '100%',
              marginTop: '40px',
            }}
          >
            <CurlyBraceButton
              darkTheme={true}
              onClick={() => {
                setSelectedImage(null);

                const frequencyContainer = document.getElementById(
                  'frequency-container'
                );
                if (frequencyContainer) {
                  frequencyContainer.scrollIntoView({ behavior: 'smooth' });
                }
              }}
              line1="reset"
              color={false}
            />
          </div>
        </div>
      )}
    </div>
  );
};
