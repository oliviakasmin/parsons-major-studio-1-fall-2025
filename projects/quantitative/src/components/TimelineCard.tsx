import React from 'react';

type TimelineData = {
  date: string;
  historical_context: string;
  relevant_quotes: string;
  relevant_categories: string;
  main_takeaway: string;
  category_applicability_note: string;
  highlight: boolean;
};

type TimelineCardProps = {
  timelineData: TimelineData;
  onClose: () => void;
  isOpen: boolean;
};

export const TimelineCard: React.FC<TimelineCardProps> = ({
  timelineData,
  onClose,
  isOpen,
}) => {
  if (!isOpen) return null;

  return (
    <div // Modal overlay
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
        zIndex: 2000,
      }}
      onClick={onClose} // Close modal when clicking outside
    >
      <div // Modal content
        style={{
          background: 'white',
          padding: '30px',
          borderRadius: '12px',
          maxWidth: '600px',
          width: '90%',
          maxHeight: '80vh',
          overflow: 'auto',
          position: 'relative',
        }}
        onClick={e => e.stopPropagation()} // Prevent closing when clicking inside modal
      >
        <button // Close button (X)
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
        <h2 style={{ marginTop: 0, color: '#1f2937' }}>
          {new Date(timelineData.date).toLocaleDateString()}
        </h2>
        <div style={{ marginBottom: '15px' }}>
          <strong>Historical Context:</strong>
          <p style={{ margin: '5px 0', lineHeight: '1.6' }}>
            {timelineData.historical_context}
          </p>
        </div>
        <div style={{ marginBottom: '15px' }}>
          <strong>Main Takeaway:</strong>
          <p style={{ margin: '5px 0', lineHeight: '1.6' }}>
            {timelineData.main_takeaway}
          </p>
        </div>
        <div style={{ marginBottom: '15px' }}>
          <strong>Relevant Categories:</strong>
          <p style={{ margin: '5px 0', lineHeight: '1.6' }}>
            {timelineData.relevant_categories}
          </p>
        </div>
        {timelineData.relevant_quotes && (
          <div style={{ marginBottom: '15px' }}>
            <strong>Relevant Quotes:</strong>
            <p
              style={{
                margin: '5px 0',
                lineHeight: '1.6',
                fontStyle: 'italic',
              }}
            >
              {timelineData.relevant_quotes}
            </p>
          </div>
        )}
      </div>
    </div>
  );
};
