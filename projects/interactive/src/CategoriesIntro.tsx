// TODO - copied directly from quantitative project, needs to be refactored

import { FunctionComponent, useState } from 'react';
import { CategoryCard } from './components';

import categoryDefinitions from '../historical_research/category_definitions.json';

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

    const currentIndex = categoryDefinitions.findIndex(
      card => card.category === openCard
    );
    const nextIndex = (currentIndex + 1) % categoryDefinitions.length;
    setOpenCard(categoryDefinitions[nextIndex].category);
  };

  return (
    <div className="categories-intro">
      <h2 className="categories-title" style={{ marginBottom: '28px' }}>
        Application Categories
      </h2>
      <p style={{ marginBottom: '28px' }}>
        Click to learn more about each category
      </p>
      <div className="category-cards-container">
        {categoryDefinitions.map(card => {
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
          categoryInfo={
            categoryDefinitions.find(card => card.category === openCard)!
          }
          onClose={handleCloseModal}
          onNext={handleNextCard}
          isOpen={true}
        />
      )}
    </div>
  );
};
