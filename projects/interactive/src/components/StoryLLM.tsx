import { GoogleGenAI } from '@google/genai';
import { useEffect, useState } from 'react';
import { Modal, Box, Paper } from '@mui/material';
import { designUtils } from '../design_utils';
import { CurlyBraceButton } from './CurlyBraceButton';
import { ImageWrapper } from './ImageWrapper';
import { useCSVData } from '../contexts/useCSVData';
import type { CSVRow } from '../contexts/CSVDataContext';

const getStoryLLM = async (
  ocrText: string,
  theme?: string,
  selectedWord?: string
) => {
  if (!ocrText.length) {
    return;
  }
  // @ts-expect-error - Vite env types not configured
  const ai = new GoogleGenAI({ apiKey: import.meta.env.VITE_GEMINI_API_KEY });

  const themeSection =
    theme && theme?.length > 0 && selectedWord && selectedWord.length > 0
      ? `
ADDITIONAL CONTEXT:
- Theme: ${theme}
- Selected word: ${selectedWord}

When writing the story, specifically comment on how ${selectedWord} (or related terms) appears in the document within the context of ${theme}. Include details about how ${selectedWord} is mentioned, its significance, or any relevant information about it in relation to the document's content.`
      : '';

  const prompt = `
You are a careful historian-archivist. Read the OCR text of a Revolutionary War pension-related document and produce:

1) A concise, human-readable story (50-100 words) in modern English that:
   - Names the main person(s) and their role (e.g. soldier or widow); if there are multiple people, list them all.
   - States place(s) of service (state/colony), service details (unit/rank if present), and any certificate/issuance or commencement dates.
   - States place(s) of residence (state/colony).
   - Includes the recurring pension amount and frequency, and notes if multiple pension amounts were awarded.
   - Mentions the relevant pension act(s) ONLY if explicitly stated (e.g., "Act of June 7, 1832").
   - Does not guess about uncertainties (e.g., "unclear," "illegible").
   - Outlines any family information included.
   - Outlines the evidence provided by each person in application for pension.
   - Uses at most two very short quoted phrases (≤12 words each), if helpful.
   - Includes any information about the health of the person(s) mentioned, their lifestyle, their religion, their current occupation, their possessions, etc.
${themeSection}

Rules:
- Case-insensitive; OCR may contain typos and archaic spellings—do not "fix" names.
- Do NOT infer anything not explicit in the text.
- If a widow is present but the recurring pension amount clearly refers to HIS pension (phrases like "his pension," "he was allowed at the rate of…"), treat the allowance as the veteran's; do not claim it as the widow's.

Return your answer in this exact JSON shape (minified, no extra keys):
{
  "story": "<120–180 word narrative as a single string>",
}

OCR_TEXT:
<<<BEGIN>>>
${ocrText}
<<<END>>>
  `.trim();

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

interface StoryLLMModalProps {
  open: boolean;
  onClose: () => void;
  NAID: string;
  pageURL: string;
  transcriptionText: string;
  theme?: string;
  selectedWord?: string;
}

export const StoryLLMModal: React.FC<StoryLLMModalProps> = ({
  open,
  onClose,
  NAID,
  pageURL,
  transcriptionText,
  theme = '',
  selectedWord = '',
}) => {
  const { naidIndex } = useCSVData();
  const [story, setStory] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [ocrText, setOcrText] = useState<string | null>(null);
  const [loadingText, setLoadingText] = useState(false);
  const [pageCount, setPageCount] = useState<number | null>(null);

  // Check localStorage first, then fetch transcription text if needed
  useEffect(() => {
    if (open && naidIndex) {
      // Check localStorage first - if we have a cached story, skip fetching transcription text
      const storageKey = `story_${NAID}_${theme || 'no-theme'}_${selectedWord || 'no-word'}`;
      const cached = localStorage.getItem(storageKey);

      if (cached) {
        try {
          const cachedData = JSON.parse(cached);
          if (cachedData.story) {
            setStory(cachedData.story);
            setPageCount(cachedData.pageCount ?? 1);
            setLoading(false);
            setOcrText(transcriptionText);
            return;
          }
        } catch {
          setStory(cached);
          setPageCount(1);
          setLoading(false);
          setOcrText(transcriptionText);
          return;
        }
      }

      // No cached story, so we need to get transcription text
      const fetchTranscriptionText = () => {
        // O(1) lookup instead of O(n) filter!
        const matchingRows = naidIndex.byNAID.get(NAID) || [];

        if (matchingRows && matchingRows.length > 0) {
          setPageCount(matchingRows.length);

          let combinedText = transcriptionText;

          // Filter out the row that matches the provided transcriptionText
          const otherRows = matchingRows.filter((row: CSVRow) => {
            const rowText = row.transcriptionText || '';
            return rowText !== transcriptionText;
          });

          // Randomly select up to 3 additional rows
          const shuffled = otherRows.sort(() => 0.5 - Math.random());
          const selectedRows = shuffled.slice(0, 3);

          const additionalTexts = selectedRows
            .map((row: CSVRow) => row.transcriptionText || '')
            .filter((text: string) => text && text.length > 0);

          if (additionalTexts.length > 0) {
            combinedText = [transcriptionText, ...additionalTexts].join(
              '\n\n---\n\n'
            );
          }

          setOcrText(combinedText);
        } else {
          setOcrText(transcriptionText);
          setPageCount(1);
        }
      };

      // Use requestIdleCallback for non-blocking
      if ('requestIdleCallback' in window) {
        requestIdleCallback(fetchTranscriptionText, { timeout: 100 });
      } else {
        setTimeout(fetchTranscriptionText, 0);
      }
    }
  }, [open, NAID, transcriptionText, theme, selectedWord, naidIndex]);

  // Reset state when modal closes
  useEffect(() => {
    if (!open) {
      setStory(null);
      setError(null);
      setOcrText(null);
      setLoading(false);
      setLoadingText(false);
      setPageCount(null);
      // Remove setSelectedRows and setCachedStory calls
    }
  }, [open]);

  const fetchStory = async () => {
    if (!ocrText || !ocrText.length) {
      setError('No OCR text available');
      return;
    }

    // Double check localStorage before generating (defensive check)
    const storageKey = `story_${NAID}_${theme || 'no-theme'}_${selectedWord || 'no-word'}`;
    const cached = localStorage.getItem(storageKey);
    if (cached) {
      try {
        // Try to parse as JSON (new format)
        const cachedData = JSON.parse(cached);
        if (cachedData.story) {
          // Remove setCachedStory call
          setStory(cachedData.story);
          setPageCount(cachedData.pageCount ?? 1);
          setLoading(false);
          return;
        }
      } catch {
        // Old format: just a string (backward compatibility)
        // Remove setCachedStory call
        setStory(cached);
        setPageCount(1);
        setLoading(false);
        return;
      }
    }

    // No cached story found, proceed with generation
    setLoading(true);
    setError(null);
    try {
      const result = await getStoryLLM(ocrText, theme, selectedWord);
      if (result) {
        setStory(result);
        // Save to localStorage with both story and pageCount
        const dataToStore = {
          story: result,
          pageCount: pageCount ?? 1,
        };
        localStorage.setItem(storageKey, JSON.stringify(dataToStore));
        // Remove setCachedStory call
      }
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : 'Failed to generate story';
      setError(errorMessage);

      // If error includes "overload", retry with only prop transcriptionText
      if (errorMessage.toLowerCase().includes('overload')) {
        fetchStoryWithPropOnly();
      }
    } finally {
      setLoading(false);
    }
  };

  const fetchStoryWithPropOnly = async () => {
    if (!transcriptionText || !transcriptionText.length) {
      setError('No transcription text available');
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const result = await getStoryLLM(transcriptionText, theme, selectedWord);
      if (result) {
        setStory(result);
        // Save to localStorage with a different key to indicate it's prop-only
        // Include pageCount (will be 1 for prop-only)
        const storageKey = `story_${NAID}_${theme || 'no-theme'}_${selectedWord || 'no-word'}_prop-only`;
        const dataToStore = {
          story: result,
          pageCount: 1,
        };
        localStorage.setItem(storageKey, JSON.stringify(dataToStore));
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to generate story');
    } finally {
      setLoading(false);
    }
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
              backgroundColor: designUtils.textColor,
              color: designUtils.backgroundColor,
              padding: '2px 4px',
              borderRadius: '2px',
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

  return (
    <Modal open={open} onClose={onClose}>
      <Paper
        sx={{
          position: 'absolute',
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
          width: '100%',
          height: '100%',
          overflow: 'auto',
          paddingTop: 6,
          paddingBottom: 6,
          backgroundColor: designUtils.backgroundColor,
          paddingLeft: 12,
          paddingRight: 12,
        }}
      >
        <div style={{ position: 'absolute', right: 12, top: 12 }}>
          <CurlyBraceButton onClick={onClose} line1="back" color={true} />
        </div>
        <Box
          sx={{
            display: 'flex',
            gap: 3,
            marginTop: 5,
          }}
        >
          {/* Left side - Story */}
          <Box
            sx={{
              width: '50%',
              display: 'flex',
              flexDirection: 'column',
              gap: 3,
              padding: '0 2%',
            }}
          >
            <h2 style={{ margin: 0, color: designUtils.textColor }}>Story</h2>

            {loadingText && <div>Loading document...</div>}
            {loading && <div>Generating story...</div>}
            {error && (
              <div style={{ color: 'red' }}>
                Error: {error}
                {error.toLowerCase().includes('overload') && (
                  <button
                    onClick={fetchStoryWithPropOnly}
                    style={{ marginLeft: '10px' }}
                  >
                    Retry with single page
                  </button>
                )}
              </div>
            )}
            {story && (
              <div
                style={{
                  color: designUtils.textColor,
                  lineHeight: '1.6',
                  whiteSpace: 'pre-wrap',
                }}
              >
                {highlightWord(story, selectedWord)}
              </div>
            )}
            {!loading && !loadingText && !error && !story && ocrText && (
              <button onClick={fetchStory}>Generate Story</button>
            )}
            {!loading && !loadingText && !error && !story && !ocrText && (
              <div>Loading document text...</div>
            )}
            {story && (
              <p
                style={{
                  fontSize: '0.7em',
                  color: designUtils.textColor,
                  opacity: 0.7,
                  marginTop: '-10px',
                  marginBottom: '10px',
                  fontStyle: 'italic',
                }}
              >
                This story is generated by Gemini 2.5 Flash based on the
                document selected and a random sample of up to 3 other pages
                from the application (to avoid overloading the LLM model).
                {pageCount !== null && pageCount > 1 && (
                  <> The full application file is {pageCount} pages.</>
                )}
              </p>
            )}
          </Box>

          {/* Right side - Image */}
          <Box
            sx={{
              width: '50%',
              display: 'flex',
              flexDirection: 'column',
              gap: 1,
            }}
          >
            {/* Main image */}
            <Box
              sx={{
                height: '80vh',
              }}
            >
              <ImageWrapper
                img={
                  <img
                    src={pageURL}
                    alt="Pension Application"
                    style={{
                      width: '100%',
                      height: '100%',
                      objectFit: 'contain',
                    }}
                  />
                }
                sourceUrl={naraURL}
              />
            </Box>
          </Box>
        </Box>
      </Paper>
    </Modal>
  );
};
