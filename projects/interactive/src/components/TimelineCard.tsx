import React from 'react';
import { Popover, Box } from '@mui/material';
import { UnderlinedHeader } from './UnderlinedHeader';
import { formatActDate } from '../utils';
import { FormatProofQuote } from './FormatProofQuote';
import { designUtils } from '../design_utils';
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
  timelineData: TimelineData | null;
  anchorEl: HTMLElement | null;
  onClose: () => void;
  open: boolean;
};

export const TimelineCard: React.FC<TimelineCardProps> = ({
  timelineData,
  anchorEl,
  onClose,
  open,
}) => {
  if (!timelineData) return null;

  return (
    <Popover
      open={open}
      anchorEl={anchorEl}
      onClose={onClose}
      anchorOrigin={{
        vertical: 'top',
        horizontal: 'center',
      }}
      transformOrigin={{
        vertical: 'bottom',
        horizontal: 'center',
      }}
      disableRestoreFocus
      sx={{
        '& .MuiPopover-paper': {
          pointerEvents: 'auto',
          maxWidth: 500,
          maxHeight: 500,
          overflow: 'auto',
          mt: 1,
          backgroundColor: designUtils.backgroundColor,
        },
      }}
    >
      <Box sx={{ p: 2 }}>
        <div style={{ textAlign: 'center' }}>
          <UnderlinedHeader
            size="small"
            text={formatActDate(timelineData.date)}
          />
        </div>
        <div style={{ marginBottom: '16px' }}>
          <strong style={{ display: 'block', marginBottom: '4px' }}>
            Historical Context:
          </strong>
          <p style={{ margin: '8px 0' }}>{timelineData.historical_context}</p>
        </div>

        <div style={{ marginBottom: '16px' }}>
          <strong style={{ display: 'block', marginBottom: '4px' }}>
            Main Takeaway:
          </strong>
          <p style={{ margin: '8px 0' }}>{timelineData.main_takeaway}</p>
        </div>

        {timelineData.relevant_quotes && (
          <div style={{ marginBottom: '16px' }}>
            <strong style={{ display: 'block', marginBottom: '4px' }}>
              Relevant Quotes:
            </strong>
            <p style={{ margin: '8px 0', fontStyle: 'italic' }}>
              {FormatProofQuote(timelineData.relevant_quotes)}
            </p>
          </div>
        )}
      </Box>
    </Popover>
  );
};
