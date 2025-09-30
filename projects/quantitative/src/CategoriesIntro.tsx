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
    <div className="categories-intro">
      <h2 className="categories-title">Application Categories</h2>
      <div className="category-cards-container">
        {categoryCards.map(card => {
          const isOpen = openCard === card.category;
          return (
            <p
              key={card.category}
              onClick={() => handleCardClick(card.category)}
              className={`category-card ${isOpen ? 'active' : ''}`}
            >
              {card.category.charAt(0).toUpperCase() + card.category.slice(1)}
            </p>
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
