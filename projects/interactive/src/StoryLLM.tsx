import { GoogleGenAI } from '@google/genai';
import { useEffect, useState } from 'react';
import { Button } from '@mui/material';

// @ts-expect-error - Vite env types not configured
const GEMINI_API_KEY = import.meta.env.VITE_GEMINI_API_KEY;

const ai = new GoogleGenAI({ apiKey: GEMINI_API_KEY });

const getStoryLLM = async (ocrText: string) => {
  if (!ocrText.length) {
    return;
  }
  const prompt = `
You are a careful historian-archivist. Read the OCR text of a Revolutionary War pension-related document and produce:

1) A concise, human-readable story (120–180 words) in modern English that:
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

interface StoryLLMProps {
  ocrText?: string;
}

const textTest =
  "Breif in the case of Elizabeth Perry, Widow of Adonijah , Lenoir County and State of North Carolina act 3d Feb. 1853 Claim, (original,' or 'for inerease.) Proof exhibited, (if original) Is it documentary, traditionary, or supported by rolls? If either, state the substance. [sham] Served in the North Carolina Militia & State troops 9 months & 8 days, as appears from the Certificate of the Comptroller of N.C. The Comptroller certifies herein the sum of 24 £ [pounds] & 46 shilling for his services. Recd. his pay in [ ], he also certified that but one Adonijah Perry, was in service & he [was] from Jones Co.; The claimant files an original letter which her husband wrote to his father John Perry, in 1780, which letter shows he had just been in the battle of Camden, had been defeated that, his term of service was out in some month & a half that he resided in 'Jones Co: Near the Court House,' the letter is dated Camp at Ramsey Mill on Deep river, N.C. August 29, 1780";

export const StoryLLM: React.FC<StoryLLMProps> = ({ ocrText = textTest }) => {
  const [story, setStory] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!ocrText || !ocrText.length) {
    setError('No OCR text provided');
    return;
  }

  const fetchStory = async () => {
    setLoading(true);
    setError(null);
    try {
      const result = await getStoryLLM(ocrText);
      setStory(result);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to generate story');
    } finally {
      setLoading(false);
    }
  };

  //   if (loading) {
  //     return <div>Loading story...</div>;
  //   }

  //   if (error) {
  //     return <div>Error: {error}</div>;
  //   }

  //   if (!story) {
  //     return <div>No story generated</div>;
  //   }

  return (
    <div>
      <Button onClick={fetchStory}>Generate New Story</Button>
      {loading && <div>Loading story...</div>}
      {error && <div>Error: {error}</div>}
      {story && <div>{story}</div>}
    </div>
  );
};
