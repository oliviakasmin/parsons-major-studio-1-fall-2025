import { FunctionComponent, useState } from 'react';
import { Box, List, ListItem, Link } from '@mui/material';
import { UnderlinedHeader } from './components/UnderlinedHeader';
import curatedCategoryDefinitions from '../historical_research/curated_category_definitions.json';
import { designUtils } from './design_utils';
export const CATEGORIES = curatedCategoryDefinitions.map(cat => cat.category);
export type CategoryType = (typeof CATEGORIES)[number];
// import { CurlyBraceButton } from './components/CurlyBraceButton';
import categorySampleImageData from '../data/WIP/category_samples_10_per_category.json';
import { FormatProofQuote } from './components/FormatProofQuote';
import { CategoryBar } from './charts/CategoryBar';

type CategoryInfo = {
  category: string;
  definition: string;
  proof_quote: string;
};

// Map display category names to JSON keys
const mapCategoryTypeToJsonKey = (categoryType: string): string => {
  const mapping: Record<string, string> = {
    'Survived (soldier)': 'soldier',
    Widow: 'widow',
    Rejected: 'rejected',
    'Bounty land warrant': 'bounty land warrant',
    'Old War': 'old war',
    'N A Acc': 'N A Acc',
  };
  return mapping[categoryType] || categoryType.toLowerCase();
};

// Get the first pageURL for a category
const getCategoryImageUrl = (categoryType: string): string | undefined => {
  const jsonKey = mapCategoryTypeToJsonKey(categoryType);
  const samples =
    categorySampleImageData.single_category_samples?.[
      jsonKey as keyof typeof categorySampleImageData.single_category_samples
    ];
  if (samples && samples.length > 0 && samples[0].pageURL) {
    return samples[0].pageURL;
  }
  return undefined;
};

// Get the first naraURL for a category
const getCategoryNaraUrl = (categoryType: string): string | undefined => {
  const jsonKey = mapCategoryTypeToJsonKey(categoryType);
  const samples =
    categorySampleImageData.single_category_samples?.[
      jsonKey as keyof typeof categorySampleImageData.single_category_samples
    ];
  if (samples && samples.length > 0 && samples[0].naraURL) {
    return samples[0].naraURL;
  }
  return undefined;
};

export const ApplicationCategories: FunctionComponent = () => {
  const [selectedCategory, setSelectedCategory] = useState<CategoryType | null>(
    curatedCategoryDefinitions[0]?.category || null
  );

  const selectedCategoryInfo = curatedCategoryDefinitions.find(
    cat => cat.category === selectedCategory
  ) as CategoryInfo | undefined;

  const selectedCategoryImageUrl = selectedCategory
    ? getCategoryImageUrl(selectedCategory)
    : undefined;

  const selectedCategoryNaraUrl = selectedCategory
    ? getCategoryNaraUrl(selectedCategory)
    : undefined;

  // const handleNextCategory = () => {
  //   if (!selectedCategory) return;
  //   const currentIndex = curatedCategoryDefinitions.findIndex(
  //     cat => cat.category === selectedCategory
  //   );
  //   const nextIndex =
  //     currentIndex < curatedCategoryDefinitions.length - 1
  //       ? currentIndex + 1
  //       : 0;
  //   setSelectedCategory(curatedCategoryDefinitions[nextIndex].category);
  // };

  return (
    <div
      style={{
        padding: '40px',
        height: '100vh',
        display: 'flex',
        flexDirection: 'column',
        overflow: 'hidden',
        marginTop: '32px',
        marginBottom: '32px',
      }}
    >
      <Box sx={{ textAlign: 'center', marginBottom: 2, flexShrink: 0 }}>
        <UnderlinedHeader text="Application Categories" />
      </Box>

      <Box
        sx={{
          display: 'flex',
          // alignItems: 'stretch',
          // flex: 1,
          minHeight: 0,
          gap: 4,
        }}
      >
        {/* Left side - Category list */}
        <Box
          sx={{
            display: 'flex',
            flexDirection: 'column',
            minHeight: '100%',
            borderRight: `1px solid ${designUtils.iconButtonColor}`,
            width: '50%',
          }}
        >
          <List
            sx={{
              display: 'flex',
              flexDirection: 'column',
              height: '100%',
              paddingLeft: 0,
            }}
          >
            {curatedCategoryDefinitions.map((cat: CategoryInfo) => (
              <ListItem
                key={cat.category}
                onClick={() => setSelectedCategory(cat.category)}
                sx={{
                  cursor: 'pointer',
                  paddingY: 1.5,
                  paddingLeft: 0,
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'flex-start',

                  '&:hover': {
                    backgroundColor: 'rgba(0, 0, 0, 0.04)',
                    color: designUtils.blueColor,
                  },
                  fontFamily: 'inherit',
                  fontSize: 'inherit',
                  fontWeight: 'inherit',
                  lineHeight: 'inherit',
                  textTransform: 'capitalize',
                }}
              >
                {/* <UnderlinedHeader
                  text={
                    cat.category.charAt(0).toUpperCase() + cat.category.slice(1)
                  }
                  underlined={cat.category === selectedCategory}
                  size="small"
                /> */}
                <div
                  style={{
                    fontSize: '1.25em',
                    // fontWeight: `${cat.category === selectedCategory ? 'bold' : 'normal'}`,
                  }}
                >
                  {cat.category}
                </div>
                <div style={{ marginTop: 4, width: '100%' }}>
                  <CategoryBar
                    category={cat.category}
                    height={16}
                    isSelectedCategory={cat.category === selectedCategory}
                  />
                </div>
              </ListItem>
            ))}
            {/* <ListItem
              sx={{
                marginTop: '10%',
                display: 'flex',
                justifyContent: 'flex-end',
              }}
            >
              <CurlyBraceButton onClick={handleNextCategory} line1="next" />
            </ListItem> */}
          </List>
        </Box>

        {/* Right side - Category information */}
        <Box
          sx={{
            // flex: 1,
            width: '50%',
            display: 'flex',
            flexDirection: 'column',
            minHeight: '100%',
            paddingTop: '20px', // the list has 8px top and each list item has 8px top
          }}
        >
          {selectedCategoryImageUrl && (
            <Box
              sx={{
                width: '100%',
                marginBottom: 3,
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
              }}
            >
              <div style={{ position: 'relative', display: 'inline-block' }}>
                <img
                  src={selectedCategoryImageUrl}
                  alt={`${selectedCategory} application card`}
                  style={{
                    height: '40vh',
                    display: 'block',
                  }}
                />
                {/* Neon green annotation rectangle in upper right corner */}
                <div
                  style={{
                    position: 'absolute',
                    top: '5%',
                    right: '2%',
                    width: '30%',
                    height: '20%',
                    border: `1px solid ${designUtils.blueColor}`,
                    backgroundColor: 'transparent',
                  }}
                />
              </div>
              {/* Caption */}
              {selectedCategoryNaraUrl && (
                <div
                  style={{
                    display: 'flex',
                    gap: 10,
                    justifyContent: 'center',
                    marginTop: 8,
                    fontSize: '0.8em',
                    textAlign: 'center',
                  }}
                >
                  <Link href={selectedCategoryNaraUrl} target="_blank">
                    <div
                      style={{
                        textDecoration: 'underline',
                        color: designUtils.textColor,
                      }}
                    >
                      source
                    </div>
                  </Link>
                </div>
              )}
            </Box>
          )}

          {selectedCategoryInfo && (
            <Box
              sx={{
                display: 'flex',
                flexDirection: 'column',
                flex: 1,
              }}
            >
              <UnderlinedHeader
                text={selectedCategoryInfo.category}
                size="small"
              />

              <p style={{ fontSize: '0.9em' }}>
                {selectedCategoryInfo.definition}
              </p>

              <p
                style={{
                  marginBottom: '8px',
                  fontStyle: 'italic',
                  fontSize: '0.9em',
                }}
              >
                {FormatProofQuote(selectedCategoryInfo.proof_quote)}
              </p>
            </Box>
          )}
        </Box>
      </Box>
    </div>
  );
};
