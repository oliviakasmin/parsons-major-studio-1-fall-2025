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
    <div
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 1000,
      }}
      onClick={onClose}
    >
      <div
        style={{
          backgroundColor: 'white',
          padding: '30px',
          borderRadius: '12px',
          maxWidth: '500px',
          width: '90%',
          maxHeight: '80vh',
          overflow: 'auto',
          position: 'relative',
        }}
        onClick={e => e.stopPropagation()}
      >
        <button
          onClick={onClose}
          style={{
            position: 'absolute',
            top: '15px',
            right: '15px',
            background: 'none',
            border: 'none',
            fontSize: '24px',
            cursor: 'pointer',
            color: '#6b7280',
          }}
        >
          ×
        </button>
        <div>
          <h2 style={{ marginTop: 0, color: '#1f2937' }}>
            {categoryInfo.category.charAt(0).toUpperCase() +
              categoryInfo.category.slice(1)}
          </h2>
          <p style={{ fontSize: '16px', lineHeight: '1.6', color: '#4b5563' }}>
            {categoryInfo.description}
          </p>
          <div
            style={{
              marginTop: '20px',
              display: 'flex',
              gap: '10px',
              justifyContent: 'flex-end',
            }}
          >
            <button
              onClick={onNext}
              style={{
                padding: '10px 20px',
                backgroundColor: '#10b981',
                color: 'white',
                border: 'none',
                borderRadius: '6px',
                cursor: 'pointer',
                fontSize: '14px',
                fontWeight: '500',
              }}
            >
              Next →
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
