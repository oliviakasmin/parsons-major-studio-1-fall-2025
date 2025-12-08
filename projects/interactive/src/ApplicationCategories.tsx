import { FunctionComponent, useState } from 'react';
import { Box, List, ListItem, Link } from '@mui/material';
import { UnderlinedHeader } from './components/UnderlinedHeader';
import curatedCategoryDefinitions from '../historical_research/curated_category_definitions.json';
import { designUtils } from './design_utils';
// import { CurlyBraceButton } from './components/CurlyBraceButton';
import { FormatProofQuote } from './components/FormatProofQuote';
import { CategoryBar } from './charts/CategoryBar';
import { CategoryKeyType } from './utils';

const cardImagePath = 'images/category_card_images/';
const letterImagePath = 'images/category_letter_images/';

type CategoryImageData = {
  displayName: string;
  naraURL: string;
  cardImage: string;
  cardLetter: string;
};

type CategoryDefinitionData = {
  category: string;
  definition: string;
  proof_quote: string;
};

type CategoryData = CategoryImageData & CategoryDefinitionData;

const categoryImageData: Record<CategoryKeyType, CategoryImageData> = {
  survived: {
    displayName: 'Survived',
    naraURL: 'https://catalog.archives.gov/id/144143658',
    cardImage: 'S_card.jpg',
    cardLetter: 'S.png',
  },
  widow: {
    displayName: 'Widow',
    naraURL: 'https://catalog.archives.gov/id/54879996',
    cardImage: 'W_card.jpg',
    cardLetter: 'W.png',
  },
  rejected: {
    displayName: 'Rejected',
    naraURL: 'https://catalog.archives.gov/id/54266410',
    cardImage: 'R_card.jpg',
    cardLetter: 'R.png',
  },
  blwt: {
    displayName: 'Bounty land warrant',
    naraURL: 'https://catalog.archives.gov/id/196440138',
    cardImage: 'BLWT_card.jpg',
    cardLetter: 'B.png',
  },
  ow: {
    displayName: 'Old War',
    naraURL: 'https://catalog.archives.gov/id/196187193',
    cardImage: 'OW_card.jpg',
    cardLetter: 'O.png',
  },
  naacc: {
    displayName: 'N A Acc',
    naraURL: 'https://catalog.archives.gov/id/53972882',
    cardImage: 'NAAC_card.jpg',
    cardLetter: 'N.png',
  },
};

// Combine image data with definition data
const categoryAllData: Record<CategoryKeyType, CategoryData> =
  Object.fromEntries(
    Object.keys(categoryImageData).map(key => {
      const categoryKey = key as CategoryKeyType;
      const imageData = categoryImageData[categoryKey];
      const definitionData = curatedCategoryDefinitions.find(
        def => def.key === categoryKey
      )!;
      return [
        categoryKey,
        {
          displayName: imageData.displayName,
          category: definitionData.category,
          definition: definitionData.definition,
          proof_quote: definitionData.proof_quote,
          naraURL: imageData.naraURL,
          cardImage: imageData.cardImage,
          cardLetter: imageData.cardLetter,
        },
      ];
    })
  ) as Record<CategoryKeyType, CategoryData>;

const CATEGORIES: CategoryKeyType[] = Object.keys(
  categoryAllData
) as CategoryKeyType[];

const CategoryTitleWithLetterImage: FunctionComponent<{
  categoryKey: CategoryKeyType;
}> = ({ categoryKey }) => {
  const category = categoryAllData[categoryKey];
  return (
    <div style={{ display: 'flex', gap: 2 }}>
      <img
        src={`${letterImagePath}${category.cardLetter}`}
        alt={`${category.displayName} letter image`}
        style={{ width: '30px', height: 'auto' }}
      />
      <UnderlinedHeader
        text={category.displayName.slice(1)}
        size="small"
        noTextTransform={true}
      />
    </div>
  );
};

export const ApplicationCategories: FunctionComponent = () => {
  const [selectedCategoryKey, setSelectedCategoryKey] =
    useState<CategoryKeyType>(CATEGORIES[0]);

  const selectedCategory = categoryAllData[selectedCategoryKey];
  const selectedCategoryImageUrl = `${cardImagePath}${selectedCategory.cardImage}`;
  const selectedCategoryNaraUrl = selectedCategory.naraURL;

  return (
    <div
      style={{
        // padding: '40px',
        padding: '8rem',
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
            {CATEGORIES.map(categoryKey => {
              const category = categoryAllData[categoryKey];
              return (
                <ListItem
                  key={categoryKey}
                  onClick={() => setSelectedCategoryKey(categoryKey)}
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
                  }}
                >
                  <div
                    style={{
                      fontSize: '1.25em',
                    }}
                  >
                    {category.displayName}{' '}
                    <span
                      style={{
                        color: designUtils.iconButtonColor,
                        fontSize: '1em',
                      }}
                    >
                      {categoryKey === 'survived' ? '(soldier)' : ''}
                    </span>
                  </div>
                  <div style={{ marginTop: 4, width: '100%' }}>
                    <CategoryBar
                      categoryKey={categoryKey}
                      height={16}
                      isSelectedCategory={categoryKey === selectedCategoryKey}
                    />
                  </div>
                </ListItem>
              );
            })}
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
                alt={`${selectedCategory.displayName} application card`}
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
          </Box>

          <Box
            sx={{
              display: 'flex',
              flexDirection: 'column',
              flex: 1,
            }}
          >
            {/* <UnderlinedHeader text={selectedCategory.category} size="small" />
             */}
            <CategoryTitleWithLetterImage categoryKey={selectedCategoryKey} />
            <p style={{ fontSize: '0.9em' }}>{selectedCategory.definition}</p>

            <p
              style={{
                marginBottom: '8px',
                fontStyle: 'italic',
                fontSize: '0.9em',
              }}
            >
              {FormatProofQuote(selectedCategory.proof_quote)}
            </p>
          </Box>
        </Box>
      </Box>
    </div>
  );
};
