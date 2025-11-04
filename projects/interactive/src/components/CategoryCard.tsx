// TODO - copied directly from quantitative project, needs to be refactored

type CategoryInfo = {
  category: string;
  definition: string;
  source_support: string;
  notes: string;
  proof_requirements: string;
  proof_quote: string;
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
          <h2
            className="modal-heading"
            style={{ textAlign: 'center', marginBottom: '32px' }}
          >
            {categoryInfo.category.charAt(0).toUpperCase() +
              categoryInfo.category.slice(1)}
          </h2>
          <div style={{ marginTop: '20px', marginBottom: '20px' }}>
            <hr
              style={{
                border: 'none',
                height: '3px',
                backgroundColor: '#666',
                margin: '0 0 8px 0',
              }}
            />
            <hr
              style={{
                border: 'none',
                height: '2px',
                backgroundColor: '#666',
                margin: '0',
              }}
            />
          </div>
          <div
            className="modal-body"
            style={{ display: 'flex', flexDirection: 'column', gap: '18px' }}
          >
            <div className="definition-section" style={{ marginBottom: '8px' }}>
              <h3
                style={{
                  textAlign: 'left',
                  marginBottom: '12px',
                  fontSize: '16px',
                  fontWeight: '600',
                }}
              >
                Definition
              </h3>
              <p
                className="modal-body-text"
                style={{ textAlign: 'left', lineHeight: '1.5' }}
              >
                {categoryInfo.definition}
              </p>
            </div>

            {/* <div className="source-section" style={{ marginBottom: '8px' }}>
              <h3
                style={{
                  textAlign: 'left',
                  marginBottom: '12px',
                  fontSize: '16px',
                  fontWeight: '600',
                }}
              >
                Source Support
              </h3>
              <p
                className="modal-body-text"
                style={{ textAlign: 'left', lineHeight: '1.5' }}
              >
                {categoryInfo.source_support.split('||').join(' • ')}
              </p>
            </div> */}

            <div className="notes-section" style={{ marginBottom: '8px' }}>
              <h3
                style={{
                  textAlign: 'left',
                  marginBottom: '12px',
                  fontSize: '16px',
                  fontWeight: '600',
                }}
              >
                Notes
              </h3>
              <p
                className="modal-body-text"
                style={{ textAlign: 'left', lineHeight: '1.5' }}
              >
                {categoryInfo.notes}
              </p>
            </div>

            <div className="proof-section" style={{ marginBottom: '8px' }}>
              <h3
                style={{
                  textAlign: 'left',
                  marginBottom: '12px',
                  fontSize: '16px',
                  fontWeight: '600',
                }}
              >
                Proof Requirements
              </h3>
              <p
                className="modal-body-text"
                style={{ textAlign: 'left', lineHeight: '1.5' }}
              >
                {categoryInfo.proof_requirements}
              </p>
              <p
                className="modal-body-text"
                style={{
                  textAlign: 'left',
                  lineHeight: '1.5',
                  fontStyle: 'italic',
                }}
              >
                {categoryInfo.proof_quote.split('||').join(' • ')}
              </p>
            </div>
          </div>
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
