// TODO - copied directly from quantitative project, needs to be refactored

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
    <div className="modal-overlay modal-overlay-high" onClick={onClose}>
      <div
        className="modal-content modal-content-large"
        onClick={e => e.stopPropagation()}
      >
        <button className="modal-close-button" onClick={onClose}>
          ×
        </button>
        <h2 className="modal-heading">
          {new Date(timelineData.date).toLocaleDateString()}
        </h2>
        <div className="modal-section">
          <strong className="modal-section-label">Historical Context:</strong>
          <p className="modal-section-text">
            {timelineData.historical_context}
          </p>
        </div>
        <div className="modal-section">
          <strong className="modal-section-label">Main Takeaway:</strong>
          <p className="modal-section-text">{timelineData.main_takeaway}</p>
        </div>
        <div className="modal-section">
          <strong className="modal-section-label">Relevant Categories:</strong>
          <p className="modal-section-text">
            {timelineData.relevant_categories.split('||').join(' • ')}
          </p>
        </div>
        {timelineData.relevant_quotes && (
          <div className="modal-section">
            <strong className="modal-section-label">Relevant Quotes:</strong>
            <p className="modal-section-text modal-section-text-italic">
              {timelineData.relevant_quotes}
            </p>
          </div>
        )}
      </div>
    </div>
  );
};
