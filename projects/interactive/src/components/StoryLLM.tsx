import { GoogleGenAI } from '@google/genai';
import { useEffect, useState, useMemo } from 'react';
import { Box, IconButton } from '@mui/material';
import { ArrowBack, ArrowForward } from '@mui/icons-material';
import { designUtils } from '../design_utils';
import { ImageWrapper } from './ImageWrapper';
import { useCSVData } from '../contexts/useCSVData';
import type { CSVRow } from '../contexts/CSVDataContext';
import { UnderlinedHeader } from './UnderlinedHeader';
import { CurlyBraceButton } from './CurlyBraceButton';

// Extract prompt generation into a separate function
const generatePrompt = (
  ocrText: string,
  includeTheme: boolean = false,
  theme?: string,
  selectedWord?: string,
  previousStories?: Array<{ fileIndex: number; story: string }>
): string => {
  // Only include theme section if includeTheme is true (for original file only)
  const themeSection =
    includeTheme &&
    theme &&
    theme?.length > 0 &&
    selectedWord &&
    selectedWord.length > 0
      ? `
ADDITIONAL CONTEXT:
- Theme: ${theme}
- Selected word: ${selectedWord}

When writing the story, specifically comment on how ${selectedWord} (or related terms) appears in the document within the context of ${theme}. Include details about how ${selectedWord} is mentioned, its significance, or any relevant information about it in relation to the document's content.`
      : '';

  // Format previous stories for context
  const previousStoriesSection =
    previousStories && previousStories.length > 0
      ? `
IMPORTANT CONTEXT - PREVIOUS STORIES FROM THIS APPLICATION:
The following stories have already been generated from other pages of this same pension application file. DO NOT repeat information that has already been covered in these stories. Focus on NEW information, different details, or additional context that appears in the current page but was not mentioned in previous stories.

${previousStories
  .sort((a, b) => a.fileIndex - b.fileIndex)
  .map(
    (story, idx) => `Previous Story ${idx + 1} (Page ${story.fileIndex + 1}):
${story.story}`
  )
  .join('\n\n---\n\n')}

When writing the current story:
- Do NOT repeat basic biographical information already covered (name, role, service dates, residence) unless there are discrepancies or new details
- Do NOT repeat pension amounts or acts already mentioned unless there are changes or additional information
- Focus on NEW information, different evidence, additional witnesses, or unique details from this specific page
- If this page contains similar information, note it briefly but emphasize what is NEW or DIFFERENT
- If this page is a continuation or provides additional context, mention how it relates to or builds upon previous information`
      : '';

  const prompt = `
You are a careful historian-archivist. Read the OCR text of a Revolutionary War pension-related document and produce:

1) A concise, human-readable story (75-125 words) in modern English that:
   - Names the main person(s) and their role (e.g. soldier or widow); if there are multiple people, list them all.
   - States place(s) of service (state/colony), service details (unit/rank if present), and any certificate/issuance or commencement dates.
   - States place(s) of residence (state/colony).
   - The recurring pension amount and frequency (if included in the text), and notes if multiple pension amounts were awarded.
   - Mentions the relevant pension act(s) ONLY if explicitly stated (e.g., "Act of June 7, 1832").
   - Does not guess about uncertainties (e.g., "unclear," "illegible").
   - Outlines any family information included.
   - Outlines the evidence provided by each person in application for pension.
   - Uses at most two very short DIRECTLY quoted phrases (≤12 words each), if helpful.
   - Includes any information about the health of the person(s) mentioned, their lifestyle, their religion, their current occupation, their possessions, etc.
${themeSection}
${previousStoriesSection}

Rules:
- Case-insensitive; OCR may contain typos and archaic spellings—do not "fix" names.
- Do NOT infer anything not explicit in the text.
- CRITICAL: Avoid repeating information already covered in the previous stories from this application (see IMPORTANT CONTEXT section above). Focus on what is NEW or DIFFERENT in this page.

Return your answer in this exact JSON shape (minified, no extra keys):
{
  "story": "<75-125 word narrative as a single string>",
}

OCR_TEXT:
<<<BEGIN>>>
${ocrText}
<<<END>>>
  `.trim();

  return prompt;
};

const getStoryLLM = async (
  ocrText: string,
  includeTheme: boolean = false,
  theme?: string,
  selectedWord?: string,
  previousStories?: Array<{ fileIndex: number; story: string }>
) => {
  if (!ocrText.length) {
    return;
  }
  // @ts-expect-error - Vite env types not configured
  const ai = new GoogleGenAI({ apiKey: import.meta.env.VITE_GEMINI_API_KEY });

  const prompt = generatePrompt(
    ocrText,
    includeTheme,
    theme,
    selectedWord,
    previousStories
  );

  const response = await ai.models.generateContent({
    model: 'gemini-2.5-flash',
    contents: [{ role: 'user', parts: [{ text: prompt }] }],
    config: {
      responseMimeType: 'application/json',
    },
  });

  const text = response?.text?.trim();
  if (!text) {
    return;
  }
  const json = JSON.parse(text);
  return json.story;
};

interface StoryLLMProps {
  selectedImage: {
    NAID: string;
    pageURL: string;
    selectedWord?: string;
    transcriptionText?: string;
  } | null;
  NAID: string;
  pageURL: string;
  transcriptionText: string;
  theme?: string;
  selectedWord?: string;
}
export const StoryLLM: React.FC<StoryLLMProps> = ({
  selectedImage,
  NAID,
  pageURL,
  transcriptionText,
  theme = '',
  selectedWord = '',
}) => {
  const show = !!selectedImage;

  const { naidIndex } = useCSVData();
  const [stories, setStories] = useState<
    Array<{ fileIndex: number; story: string; pageURL: string }>
  >([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [currentPrompt, setCurrentPrompt] = useState<string | null>(null);
  const [showPrompt, setShowPrompt] = useState(false);
  const [, setPageCount] = useState<number | null>(null);
  const [allFiles, setAllFiles] = useState<CSVRow[]>([]);
  const [currentFileIndex, setCurrentFileIndex] = useState<number>(0);
  const [, setInitialFileIndex] = useState<number>(0); // Track the original file
  const [currentPageURL, setCurrentPageURL] = useState<string>(pageURL);
  const [currentTranscriptionText, setCurrentTranscriptionText] =
    useState<string>(transcriptionText);
  const [viewingImageIndex, setViewingImageIndex] = useState<number>(0); // Index in allFiles array

  // Get all files for this NAID and find the initial file index
  useEffect(() => {
    if (show && naidIndex) {
      const matchingRows = naidIndex.byNAID.get(NAID) || [];

      if (matchingRows && matchingRows.length > 0) {
        setPageCount(matchingRows.length);

        // Find the index of the current file
        const initialIndex = matchingRows.findIndex(
          (row: CSVRow) =>
            row.pageURL === pageURL ||
            row.transcriptionText === transcriptionText
        );

        // Reorder array so selected page is at index 0
        let reorderedFiles: CSVRow[];
        if (initialIndex !== -1 && initialIndex !== 0) {
          // Move the selected file to the front
          reorderedFiles = [
            matchingRows[initialIndex],
            ...matchingRows.slice(0, initialIndex),
            ...matchingRows.slice(initialIndex + 1),
          ];
        } else {
          reorderedFiles = matchingRows;
        }

        setAllFiles(reorderedFiles);
        setCurrentFileIndex(0); // Always 0 after reordering
        setInitialFileIndex(0); // Always 0 after reordering
        setCurrentPageURL(reorderedFiles[0].pageURL);
        setCurrentTranscriptionText(reorderedFiles[0].transcriptionText || '');
      } else {
        setPageCount(1);
        setAllFiles([]);
        setCurrentFileIndex(0);
        setInitialFileIndex(0);
        setCurrentPageURL(pageURL);
        setCurrentTranscriptionText(transcriptionText);
      }
    }
  }, [show, NAID, pageURL, transcriptionText, naidIndex]);

  // Reset state when modal closes
  useEffect(() => {
    if (!show) {
      setStories([]);
      setError(null);
      setLoading(false);
      setPageCount(null);
      setAllFiles([]);
      setCurrentFileIndex(0);
      setInitialFileIndex(0);
      setCurrentPageURL(pageURL);
      setCurrentTranscriptionText(transcriptionText);
      setCurrentPrompt(null);
    }
  }, [show, pageURL, transcriptionText]);

  // Clear stories when a new image is selected
  useEffect(() => {
    if (selectedImage && show) {
      setStories([]);
      setError(null);
      setLoading(false);
      setCurrentPrompt(null);
      setShowPrompt(false);
    }
  }, [selectedImage?.pageURL, selectedImage?.NAID, show]);

  // Generate prompt when component mounts or when relevant data changes
  useEffect(() => {
    if (
      !show ||
      !currentTranscriptionText ||
      !currentTranscriptionText.length
    ) {
      return;
    }

    // For the current file (index 0 is always the original file after reordering)
    const isOriginalFile = currentFileIndex === 0;

    // Get previous stories (excluding the current file)
    const previousStories = stories
      .filter(s => s.fileIndex !== currentFileIndex)
      .map(s => ({ fileIndex: s.fileIndex, story: s.story }));

    // Generate and store the prompt
    const prompt = generatePrompt(
      currentTranscriptionText,
      isOriginalFile,
      isOriginalFile ? theme : undefined,
      isOriginalFile ? selectedWord : undefined,
      previousStories.length > 0 ? previousStories : undefined
    );
    setCurrentPrompt(prompt);
  }, [
    show,
    currentTranscriptionText,
    currentFileIndex,
    theme,
    selectedWord,
    stories,
  ]);

  const fetchStory = async (fileIndex: number, textToUse: string) => {
    if (!textToUse || !textToUse.length) {
      setError('No transcription text available');
      return;
    }

    // Check if story already exists in our stories array
    const existingStory = stories.find(s => s.fileIndex === fileIndex);
    if (existingStory) {
      return; // Story already generated
    }

    // Determine if this is the original file (for theme/selectedWord inclusion)
    // After reordering, index 0 is always the original file
    const isOriginalFile = fileIndex === 0;

    // Get previous stories (excluding the current file)
    const previousStories = stories
      .filter(s => s.fileIndex !== fileIndex)
      .map(s => ({ fileIndex: s.fileIndex, story: s.story }));

    // Use pageURL as part of the key for stability (since fileIndex may change)
    const file = allFiles[fileIndex];
    const pageURLKey = file?.pageURL || '';

    // Check localStorage - use different keys for original vs subsequent files
    const storageKey = isOriginalFile
      ? `story_${NAID}_${pageURLKey}_${theme || 'no-theme'}_${selectedWord || 'no-word'}`
      : `story_${NAID}_${pageURLKey}_no-theme_no-word`;
    const cached = localStorage.getItem(storageKey);

    if (cached) {
      try {
        const cachedData = JSON.parse(cached);
        if (cachedData.story) {
          setStories(prev => [
            ...prev,
            {
              fileIndex,
              story: cachedData.story,
              pageURL: file?.pageURL || currentPageURL,
            },
          ]);
          return;
        }
      } catch {
        setStories(prev => [
          ...prev,
          {
            fileIndex,
            story: cached,
            pageURL: file?.pageURL || currentPageURL,
          },
        ]);
        return;
      }
    }

    // Generate new story - only include theme/selectedWord for original file
    // Include previous stories context for subsequent files
    setLoading(true);
    setError(null);

    try {
      const result = await getStoryLLM(
        textToUse,
        isOriginalFile, // Only include theme for original file
        isOriginalFile ? theme : undefined,
        isOriginalFile ? selectedWord : undefined,
        previousStories.length > 0 ? previousStories : undefined // Pass previous stories for context
      );
      if (result) {
        const newStory = {
          fileIndex,
          story: result,
          pageURL: file?.pageURL || currentPageURL,
        };
        setStories(prev => [...prev, newStory]);

        // Save to localStorage using pageURL for stability
        const dataToStore = {
          story: result,
          fileIndex,
        };
        localStorage.setItem(storageKey, JSON.stringify(dataToStore));
      }
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : 'Failed to generate story';
      setError(errorMessage);
      console.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const examineNextFile = () => {
    if (allFiles.length === 0 || currentFileIndex >= allFiles.length - 1) {
      return;
    }

    const nextIndex = currentFileIndex + 1;
    const nextFile = allFiles[nextIndex];

    setCurrentFileIndex(nextIndex);
    setCurrentPageURL(nextFile.pageURL);
    setCurrentTranscriptionText(nextFile.transcriptionText || '');
    setError(null);

    // Automatically generate story for the next file (without theme/selectedWord)
    fetchStory(nextIndex, nextFile.transcriptionText || '');
  };

  // Helper function to generate regex patterns for word variations (plural, singular, case)
  const generateWordPatterns = (word: string): string[] => {
    const escaped = word.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    const patterns: string[] = [escaped]; // Original word

    const lowerWord = word.toLowerCase();

    // Handle plural/singular variations
    if (lowerWord.endsWith('y')) {
      // Try plural form: y -> ies (e.g., "army" -> "armies")
      patterns.push(escaped.slice(0, -1) + 'ies');
    } else if (lowerWord.endsWith('ies')) {
      // Try singular form: ies -> y (e.g., "armies" -> "army")
      patterns.push(escaped.slice(0, -3) + 'y');
    }

    if (lowerWord.endsWith('s')) {
      // Try singular form: remove 's' (e.g., "soldiers" -> "soldier")
      patterns.push(escaped.slice(0, -1));
      // Also try adding 'es' for words that might pluralize that way
      if (!lowerWord.endsWith('es')) {
        patterns.push(escaped + 'es');
      }
    } else if (lowerWord.endsWith('es')) {
      // Try singular form: remove 'es' (e.g., "churches" -> "church")
      patterns.push(escaped.slice(0, -2));
    } else {
      // Try plural forms: add 's' or 'es'
      patterns.push(escaped + 's');
      // For words ending in s, x, z, ch, sh, add 'es'
      if (/[sxz]|[cs]h$/.test(lowerWord)) {
        patterns.push(escaped + 'es');
      }
    }

    return patterns;
  };

  // Helper function to highlight selectedWord in the story text
  const highlightWord = (text: string, word: string) => {
    if (!word || !word.length) {
      return text;
    }

    // Generate patterns for word variations
    const patterns = generateWordPatterns(word);
    // Create regex that matches any of the patterns (case-insensitive, whole word)
    const patternString = patterns.map(p => `\\b${p}\\b`).join('|');
    const regex = new RegExp(patternString, 'gi');

    const parts = text.split(regex);
    const matches = text.match(regex) || [];

    const result: (string | JSX.Element)[] = [];
    parts.forEach((part, index) => {
      // Add key to string parts as well
      result.push(<span key={`text-${index}`}>{part}</span>);
      if (index < matches.length) {
        result.push(
          <span
            key={`highlight-${index}`}
            style={{
              backgroundColor: designUtils.backgroundColor,
              color: designUtils.textColor,
              padding: '2px 4px',
              borderRadius: '0',
            }}
          >
            {matches[index]}
          </span>
        );
      }
    });

    return result;
  };

  const naraURL = `https://catalog.archives.gov/id/${NAID}`;

  // Check if there are more files to analyze (files that don't have stories yet)
  const hasMoreFilesToAnalyze = useMemo(() => {
    if (allFiles.length <= 1) return false;

    // Get all file indices that have stories
    const analyzedFileIndices = new Set(stories.map(s => s.fileIndex));

    // Check if there are any files that haven't been analyzed yet
    const unanalyzedFiles = allFiles.filter(
      (_, index) => !analyzedFileIndices.has(index)
    );

    return unanalyzedFiles.length > 0;
  }, [allFiles, stories]);

  const sortedStories = [...stories].sort((a, b) => a.fileIndex - b.fileIndex);

  // Get available image indices (index 0 always, plus any with stories)
  const availableImageIndices = useMemo(() => {
    const indices = new Set<number>([0]); // Always include index 0
    stories.forEach(story => {
      indices.add(story.fileIndex);
    });
    return Array.from(indices).sort((a, b) => a - b);
  }, [stories]);

  // Update viewingImageIndex when stories change
  useEffect(() => {
    if (availableImageIndices.length > 0) {
      // When a new story is added, view the latest available image
      const maxIndex = Math.max(...availableImageIndices);
      setViewingImageIndex(maxIndex);
    } else {
      setViewingImageIndex(0);
    }
  }, [availableImageIndices]);

  // Update viewingImageIndex when files are loaded
  useEffect(() => {
    if (allFiles.length > 0 && availableImageIndices.length > 0) {
      // Ensure viewingImageIndex is within available indices
      if (!availableImageIndices.includes(viewingImageIndex)) {
        setViewingImageIndex(0);
      }
    }
  }, [allFiles.length, availableImageIndices, viewingImageIndex]);

  // Get the currently viewed image URL from allFiles
  const currentViewedImage = useMemo(() => {
    if (allFiles.length === 0) {
      return currentPageURL; // Fallback to currentPageURL if no files loaded yet
    }
    // Only show images that are in availableImageIndices
    if (
      availableImageIndices.includes(viewingImageIndex) &&
      viewingImageIndex < allFiles.length
    ) {
      return allFiles[viewingImageIndex].pageURL;
    }
    // Fallback to first available image
    if (
      availableImageIndices.length > 0 &&
      availableImageIndices[0] < allFiles.length
    ) {
      return allFiles[availableImageIndices[0]].pageURL;
    }
    return currentPageURL;
  }, [allFiles, viewingImageIndex, currentPageURL, availableImageIndices]);

  const navigateImage = (direction: 'prev' | 'next') => {
    if (availableImageIndices.length <= 1) return;

    const currentIndexInAvailable =
      availableImageIndices.indexOf(viewingImageIndex);

    if (direction === 'prev') {
      const prevIndex =
        currentIndexInAvailable > 0
          ? currentIndexInAvailable - 1
          : availableImageIndices.length - 1; // Wrap around
      setViewingImageIndex(availableImageIndices[prevIndex]);
    } else {
      const nextIndex =
        currentIndexInAvailable < availableImageIndices.length - 1
          ? currentIndexInAvailable + 1
          : 0; // Wrap around
      setViewingImageIndex(availableImageIndices[nextIndex]);
    }
  };

  // Only show navigation if there are multiple images with stories
  const canNavigateImages = availableImageIndices.length > 1;

  // Scroll into view when component mounts
  useEffect(() => {
    if (show) {
      // Use requestAnimationFrame to ensure DOM is ready
      requestAnimationFrame(() => {
        const storyLLM = document.getElementById('story-llm');
        if (storyLLM) {
          storyLLM.scrollIntoView({ behavior: 'smooth' });
        }
      });
    }
  }, [show]);

  return (
    <div id="story-llm" style={{ marginTop: '42px' }}>
      <div style={{ paddingTop: '40px' }}>
        <UnderlinedHeader text="A closer read" darkTheme={true} />
      </div>
      <Box
        sx={{
          display: 'flex',
          gap: 3,
          marginTop: '60px',
        }}
      >
        {/* Left side - Image */}
        <Box
          sx={{
            width: '60%',
            display: 'flex',
            flexDirection: 'column',
            gap: 1,
            position: 'relative',
            justifyContent: 'flex-start',
            alignItems: 'flex-start',
          }}
        >
          <div>
            {/* Image counter - moved to top left */}
            {canNavigateImages && (
              <Box
                sx={{
                  position: 'absolute',
                  top: 8,
                  left: 8,
                  zIndex: 10,
                  backgroundColor: 'rgba(0, 0, 0, 0.5)',
                  color: 'white',
                  padding: '4px 8px',
                  borderRadius: '0',
                  fontSize: '0.875rem',
                }}
              >
                {availableImageIndices.indexOf(viewingImageIndex) + 1} /{' '}
                {availableImageIndices.length}
              </Box>
            )}

            <Box
              sx={{
                height: '80vh',
                position: 'relative',
              }}
            >
              {/* Navigation arrows - only shown if multiple files */}
              {canNavigateImages && (
                <>
                  <IconButton
                    onClick={() => navigateImage('prev')}
                    sx={{
                      position: 'absolute',
                      left: 8,
                      top: '50%',
                      transform: 'translateY(-50%)',
                      zIndex: 10,
                      backgroundColor: 'rgba(0, 0, 0, 0.5)',
                      color: 'white',
                      '&:hover': {
                        backgroundColor: 'rgba(0, 0, 0, 0.7)',
                      },
                      borderRadius: '0',
                    }}
                    aria-label="Previous image"
                  >
                    <ArrowBack />
                  </IconButton>
                  <IconButton
                    onClick={() => navigateImage('next')}
                    sx={{
                      position: 'absolute',
                      right: 8,
                      top: '50%',
                      transform: 'translateY(-50%)',
                      zIndex: 10,
                      backgroundColor: 'rgba(0, 0, 0, 0.5)',
                      color: 'white',
                      '&:hover': {
                        backgroundColor: 'rgba(0, 0, 0, 0.7)',
                      },
                      borderRadius: '0',
                    }}
                    aria-label="Next image"
                  >
                    <ArrowForward />
                  </IconButton>
                </>
              )}

              <ImageWrapper
                img={
                  <img
                    src={currentViewedImage}
                    alt="Pension Application"
                    style={{
                      width: '100%',
                      height: '100%',
                      objectFit: 'contain',
                    }}
                  />
                }
                sourceUrl={naraURL}
                darkTheme={true}
              />
            </Box>
          </div>
        </Box>

        {/* Right side - Story */}
        <Box
          sx={{
            width: '50%',
            display: 'flex',
            flexDirection: 'column',
            gap: 3,
            padding: '0 2%',
          }}
        >
          <div
            style={{
              color: designUtils.backgroundColor,
              fontSize: '1.2em',
            }}
          >
            Why does this application file mention the word{' '}
            <span
              style={{ color: designUtils.lightBlueColor, fontStyle: 'italic' }}
            >
              {selectedWord}
            </span>{' '}
            ?
            {currentPrompt && (
              <>
                {' '}
                <Box
                  component="span"
                  onClick={() => setShowPrompt(!showPrompt)}
                  sx={{
                    fontSize: '0.6em',
                    color: designUtils.backgroundColor,
                    cursor: 'pointer',
                    textDecoration: 'none',
                    '&:hover': {
                      textDecoration: 'underline',
                    },
                  }}
                >
                  {showPrompt ? 'hide' : 'show'} prompt
                </Box>
              </>
            )}
          </div>
          {/* Display prompt */}
          {currentPrompt && showPrompt && (
            <Box
              sx={{
                marginTop: 1,
                width: '100%',
                minWidth: 0,
                overflow: 'hidden',
                border: `1px solid rgba(250, 249, 247, 0.3)`,
                borderRadius: '0',
                padding: '12px',
              }}
            >
              <Box
                sx={{
                  fontSize: '0.8em',
                  whiteSpace: 'pre-wrap',
                  overflow: 'auto',
                  maxHeight: '400px',
                  color: designUtils.backgroundColor,
                  opacity: 0.8,
                  width: '100%',
                  wordBreak: 'break-word',
                }}
              >
                {currentPrompt}
              </Box>
            </Box>
          )}
          {/* Display all stories*/}
          {sortedStories.length > 0 && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
              {sortedStories.map(storyData => (
                <div key={storyData.fileIndex}>
                  <hr
                    style={{
                      margin: '1.5rem 0',
                      border: 'none',
                      borderTop: `1px solid ${designUtils.backgroundColor}`,
                      opacity: 0.2,
                    }}
                  />
                  {/* Page count for each story if multiple files available */}
                  {canNavigateImages && (
                    <Box
                      sx={{
                        fontSize: '0.875rem',
                        color: designUtils.backgroundColor,
                        opacity: 0.7,
                        marginBottom: '0.5rem',
                      }}
                    >
                      Page {storyData.fileIndex + 1} of {allFiles.length}
                    </Box>
                  )}
                  {sortedStories.length > 1 && (
                    <h3
                      style={{
                        fontSize: '0.9em',
                        color: designUtils.backgroundColor,
                        opacity: 0.8,
                        marginBottom: '0.5rem',
                      }}
                    ></h3>
                  )}
                  <div
                    style={{
                      color: designUtils.backgroundColor,
                      lineHeight: '1.6',
                      whiteSpace: 'pre-wrap',
                    }}
                  >
                    {highlightWord(storyData.story, selectedWord)}
                  </div>
                </div>
              ))}
            </div>
          )}
          {sortedStories.length > 0 && (
            <p
              style={{
                fontSize: '0.7em',
                color: designUtils.backgroundColor,
                opacity: 0.7,
                marginTop: '-10px',
                marginBottom: '10px',
                fontStyle: 'italic',
              }}
            >
              Stories generated by Gemini 2.5 Flash based on the selected
              document pages.
            </p>
          )}
          {loading && <div>generating story...</div>}
          {error && (
            <div>
              Unfortunately there was an error generating the story. Please try
              again later.
            </div>
          )}

          {/* Show only one button at a time */}
          {!loading && !error && (
            <>
              {sortedStories.length === 0 ? (
                // Initially: show "Generate Story" button
                <CurlyBraceButton
                  darkTheme={true}
                  line1="generate a story about this page"
                  onClick={() =>
                    fetchStory(currentFileIndex, currentTranscriptionText)
                  }
                />
              ) : hasMoreFilesToAnalyze ? (
                // After story generated: show "Examine another file" if more files exist to analyze
                <CurlyBraceButton
                  darkTheme={true}
                  line1="examine another file in the application"
                  onClick={examineNextFile}
                />
              ) : null}
            </>
          )}
        </Box>
      </Box>
    </div>
  );
};
