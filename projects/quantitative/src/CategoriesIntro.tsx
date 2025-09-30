import { FunctionComponent, useState } from 'react';
import { CategoryCard } from './components';

// placeholder data for now
const categoryCards = [
  {
    category: 'soldier',
    description: 'Description of soldier category',
  },
  {
    category: 'widow',
    description: 'Description of widow category',
  },
  {
    category: 'rejected',
    description: 'Description of rejected category',
  },
  {
    category: 'bounty land warrant',
    description: 'Description of bounty land warrant category',
  },
  {
    category: 'old war',
    description: 'Description of old war category',
  },
  {
    category: 'N A Acc',
    description: 'Description of N A Acc category',
  },
  {
    category: 'unknown',
    description: 'Description of unknown category',
  },
];

export const CategoriesIntro: FunctionComponent = () => {
  const [openCard, setOpenCard] = useState<string | null>(null);

  const handleCardClick = (category: string) => {
    setOpenCard(category);
  };

  const handleCloseModal = () => {
    setOpenCard(null);
  };

  const handleNextCard = () => {
    if (!openCard) return;

    const currentIndex = categoryCards.findIndex(
      card => card.category === openCard
    );
    const nextIndex = (currentIndex + 1) % categoryCards.length;
    setOpenCard(categoryCards[nextIndex].category);
  };

  return (
    <div>
      <h2>Application Categories</h2>
      <div
        style={{
          display: 'flex',
          flexWrap: 'wrap',
          gap: '20px',
          justifyContent: 'center',
        }}
      >
        {categoryCards.map(card => {
          const isOpen = openCard === card.category;
          return (
            <div
              key={card.category}
              onClick={() => handleCardClick(card.category)}
              style={{
                padding: '15px 25px',
                border: '2px solid #4f46e5',
                borderRadius: '8px',
                backgroundColor: isOpen ? '#4f46e5' : 'white',
                color: isOpen ? 'white' : '#4f46e5',
                cursor: 'pointer',
                fontSize: '16px',
                fontWeight: '500',
                transition: 'all 0.2s ease',
              }}
              onMouseEnter={e => {
                if (!isOpen) {
                  e.currentTarget.style.backgroundColor = '#f3f4f6';
                }
              }}
              onMouseLeave={e => {
                if (!isOpen) {
                  e.currentTarget.style.backgroundColor = 'white';
                }
              }}
            >
              {card.category.charAt(0).toUpperCase() + card.category.slice(1)}
            </div>
          );
        })}
      </div>

      {openCard && (
        <CategoryCard
          categoryInfo={categoryCards.find(card => card.category === openCard)!}
          onClose={handleCloseModal}
          onNext={handleNextCard}
          isOpen={true}
        />
      )}
    </div>
  );
};
