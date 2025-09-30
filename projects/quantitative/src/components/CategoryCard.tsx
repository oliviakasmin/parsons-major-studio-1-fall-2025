type CategoryInfo = {
  category: string;
  description: string;
};

type CategoryCardProps = {
  categoryInfo: CategoryInfo;
  onClose: () => void;
  onNext: () => void;
  isOpen: boolean;
};

export const CategoryCard = ({
  categoryInfo,
  onClose,
  onNext,
  isOpen,
}: CategoryCardProps) => {
  if (!isOpen) return null;

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={e => e.stopPropagation()}>
        <button className="modal-close-button" onClick={onClose}>
          ×
        </button>
        <div>
          <h2 className="modal-heading">
            {categoryInfo.category.charAt(0).toUpperCase() +
              categoryInfo.category.slice(1)}
          </h2>
          <p className="modal-body-text">{categoryInfo.description}</p>
          <div className="modal-actions">
            <button className="button-primary" onClick={onNext}>
              Next →
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
