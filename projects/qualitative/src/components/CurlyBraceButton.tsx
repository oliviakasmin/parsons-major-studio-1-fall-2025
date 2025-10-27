import { FunctionComponent } from 'react';
import { Button } from '@mui/material';

interface CurlyBraceButtonProps {
  line1: string;
  line2?: string;
  onClick: () => void;
}

export const CurlyBraceButton: FunctionComponent<CurlyBraceButtonProps> = ({
  line1,
  line2 = undefined,
  onClick,
}) => {
  const lineCount = 1 + (line2 ? 1 : 0);

  const braceFontSize = `${lineCount * 1.5}em`;
  return (
    <Button
      onClick={onClick}
      sx={{
        textTransform: 'none',
        display: 'flex',
        '&:hover': {
          background: 'lightgray',
        },
      }}
    >
      <span
        style={{
          fontSize: braceFontSize,
          color: 'black',
          fontWeight: '100',
          fontFamily: 'Times New Roman',
          marginTop: `-${lineCount * 2}px`,
        }}
      >
        {'{'}
      </span>
      <span
        style={{
          color: 'black',
          display: 'flex',
          flexDirection: 'column',
          fontFamily: 'Georgia',
          marginLeft: '16px',
          marginRight: '16px',
          marginTop: `${lineCount * 2}px`,
          lineHeight: '1.2',
        }}
      >
        <span>{line1}</span>
        {line2 && <span>{line2}</span>}
      </span>
      <span
        style={{
          fontSize: braceFontSize,
          color: 'black',
          fontWeight: '100',
          fontFamily: 'Times New Roman',
          marginTop: `-${lineCount * 2}px`,
        }}
      >
        {'}'}
      </span>
    </Button>
  );
};
