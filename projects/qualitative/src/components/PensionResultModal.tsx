import { FunctionComponent } from 'react';
import { Modal, Box, Paper, Link } from '@mui/material';
import { designUtils } from '../design_utils';
import { UnderlinedHeader } from './UnderlinedHeader';
import { CurlyBraceButton } from './CurlyBraceButton';
import { AverageAmountByDate } from './average_amount_by_date';
import { formatActDate, convertDollarsToToday } from '../utils';
import { averageAmountByDateChartUtils } from '../design_utils';
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
  // console.log('state:', state);
  // console.log('amount:', amount);
  // console.log('actDate:', actDate);
  // console.log('imageUrl:', imageUrl);
  return (
    <Modal open={open} onClose={onClose}>
      <Paper
        sx={{
          position: 'absolute',
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
          width: '90%',
          // maxWidth: '1200px',
          height: '90%',
          overflow: 'auto',
          padding: 8,
          backgroundColor: designUtils.backgroundColor,
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
          }}
        >
          {/* Left side */}
          <Box
            sx={{
              flex: 1,
              display: 'flex',
              flexDirection: 'column',
              gap: 3,
              maxWidth: '40%',
              minWidth: `${averageAmountByDateChartUtils.width + averageAmountByDateChartUtils.padding.left + averageAmountByDateChartUtils.padding.right}px`,
              paddingRight: '10%',
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
            <div>Act {formatActDate(actDate)}</div>
            <Box
              sx={{
                marginLeft: `-${averageAmountByDateChartUtils.padding.left}px`,
                display: 'flex',
                minHeight: `${averageAmountByDateChartUtils.height}px`,
                minWidth: `${averageAmountByDateChartUtils.width}px`,
                marginTop: '40px',
              }}
            >
              <AverageAmountByDate
                extraPoint={{ year: actDate.split('-')[0], amount }}
              />
            </Box>
            <div
              style={{
                fontSize: '0.7em',
                // textAlign: 'center',
                color: designUtils.textColor,
                // textDecoration: 'underline',
              }}
            >
              {`{ average allowance per year with your allowance highlighted }`}
            </div>
          </Box>

          {/* Right side */}
          <Box
            sx={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 1 }}
          >
            {/* Image */}
            <Box
              sx={{
                width: '100%',
                height: 'auto',
                maxHeight: '800px',
                overflow: 'hidden',
                borderRadius: 1,
              }}
            >
              <img
                src={imageUrl}
                alt="Pension Application"
                style={{
                  width: '100%',
                  height: '100%',
                  objectFit: 'contain',
                }}
              />
            </Box>

            {/* Caption */}
            <div style={{ display: 'flex', gap: 10, justifyContent: 'center' }}>
              <Link href={imageUrl} target="_blank">
                <div
                  style={{
                    fontSize: '0.8em',
                    textAlign: 'center',
                    color: designUtils.textColor,
                    textDecoration: 'underline',
                  }}
                >
                  source
                </div>
              </Link>
              <Link href={naraURL} target="_blank">
                <div
                  style={{
                    fontSize: '0.8em',
                    textAlign: 'center',
                    color: designUtils.textColor,
                    textDecoration: 'underline',
                  }}
                >
                  full NAID file
                </div>
              </Link>
            </div>
          </Box>
        </Box>
      </Paper>
    </Modal>
  );
};
