import { FunctionComponent } from 'react';
import { Modal, Box, Paper, Link } from '@mui/material';
import { designUtils } from '../design_utils';
import { UnderlinedHeader } from './UnderlinedHeader';
import { CurlyBraceButton } from './CurlyBraceButton';
import { formatActDate, convertDollarsToToday } from '../utils';
interface PensionResultModalProps {
  open: boolean;
  onClose: () => void;
  state: string;
  amount: number;
  actDate: string;
  imageUrl: string;
}

export const PensionResultModal: FunctionComponent<PensionResultModalProps> = ({
  open,
  onClose,
  state,
  amount,
  actDate,
  imageUrl,
}) => {
  return (
    <Modal open={open} onClose={onClose}>
      <Paper
        sx={{
          position: 'absolute',
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
          width: '90%',
          maxWidth: '1200px',
          height: '90%',
          overflow: 'auto',
          padding: 5,
          backgroundColor: designUtils.backgroundColor,
        }}
      >
        <div style={{ position: 'absolute', right: 8, top: 8 }}>
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
            sx={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 3 }}
          >
            <UnderlinedHeader text="Pension Allowance" />
            <div>Inscribed on the roll of {state} at the rate of</div>
            <div>
              <div style={{ fontWeight: 'bold', fontSize: '1.2em' }}>
                ${amount} per annum
              </div>
              <div
                style={{
                  fontSize: '0.8em',
                }}
              >
                (approximately ${convertDollarsToToday(amount)} today)
              </div>
            </div>
            <div>Per the Act of {formatActDate(actDate)}</div>
            <Box
              sx={{
                border: '2px dashed #ccc',
                borderRadius: 1,
                padding: 3,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                minHeight: '300px',
                backgroundColor: '#f5f5f5',
              }}
            >
              <div style={{ fontSize: '1.2em', fontWeight: 'bold' }}>chart</div>
            </Box>
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
                maxHeight: '600px',
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
          </Box>
        </Box>
      </Paper>
    </Modal>
  );
};
