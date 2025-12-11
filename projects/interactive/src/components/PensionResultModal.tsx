import { FunctionComponent } from 'react';
import { Modal, Box, Paper } from '@mui/material';
import { designUtils } from '../design_utils';
import { UnderlinedHeader } from './UnderlinedHeader';
import { CurlyBraceButton } from './CurlyBraceButton';
import { AverageAmountByDate } from './average_amount_by_date';
import { formatActDate, convertDollarsToToday } from '../utils';
import { averageAmountByDateChartUtils } from '../design_utils';
import { ImageWrapper } from './ImageWrapper';

interface PensionResultModalProps {
  open: boolean;
  onClose: () => void;
  state: string;
  amount: number;
  actDate: string;
  imageUrl: string;
  naraURL: string;
}

export const PensionResultModal: FunctionComponent<PensionResultModalProps> = ({
  open,
  onClose,
  state,
  amount,
  actDate,
  imageUrl,
  naraURL,
}) => {
  return (
    <Modal open={open} onClose={onClose}>
      <Paper
        sx={{
          position: 'absolute',
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
          width: '100%',
          height: '100%',
          overflow: 'hidden',
          paddingTop: 6,
          paddingBottom: 6,
          backgroundColor: designUtils.backgroundColor,
          paddingLeft: 12,
          paddingRight: 12,
        }}
      >
        <div style={{ position: 'absolute', right: 12, top: 12 }}>
          <CurlyBraceButton onClick={onClose} line1="back" />
        </div>
        <Box
          sx={{
            display: 'flex',
            gap: 3,
            marginTop: 5,
            height: '80vh',
            overflow: 'hidden',
          }}
        >
          {/* Left side */}
          <Box
            sx={{
              display: 'flex',
              flexDirection: 'column',
              gap: 3,
              padding: '0 2%',
              width: '50%',
              overflow: 'auto',
            }}
          >
            <UnderlinedHeader text="Pension Allowance" />
            <div>Inscribed on the Roll of {state} at the rate of</div>
            <div>
              <div style={{ fontWeight: 'bold', fontSize: '1.2em' }}>
                ${amount} per annum
              </div>
              <div
                style={{
                  fontSize: '0.8em',
                }}
              >
                (approximately $
                {convertDollarsToToday(amount, actDate.split('-')[0])} today)
              </div>
            </div>
            <div>{formatActDate(actDate)}</div>
            <div style={{ marginTop: '40px' }}>
              <div
                style={{
                  fontSize: '0.7em',
                  color: designUtils.textColor,
                }}
              >
                {`Average Allowance per Year`}
              </div>
              <Box
                sx={{
                  marginLeft: `-${averageAmountByDateChartUtils.padding.left}px`,
                  display: 'flex',
                  minHeight: `${averageAmountByDateChartUtils.height}px`,
                  minWidth: `${averageAmountByDateChartUtils.width}px`,
                  marginTop: '20px',
                }}
              >
                <AverageAmountByDate
                  extraPoint={{ year: actDate.split('-')[0], amount }}
                />
              </Box>
            </div>
          </Box>

          {/* Right side */}
          <Box
            sx={{
              width: '50%',
              display: 'flex',
              flexDirection: 'column',
              gap: 1,
              height: '100%',
              minHeight: 0,
            }}
          >
            {/* Image */}
            <Box
              sx={{
                flex: 1,
                minHeight: 0,
                overflow: 'hidden',
              }}
            >
              <ImageWrapper
                img={
                  <img
                    src={imageUrl}
                    alt="Pension Application"
                    style={{
                      width: '100%',
                      height: '100%',
                      maxHeight: '100%',
                      objectFit: 'contain',
                      display: 'block',
                    }}
                  />
                }
                sourceUrl={naraURL}
              />
            </Box>
          </Box>
        </Box>
      </Paper>
    </Modal>
  );
};
