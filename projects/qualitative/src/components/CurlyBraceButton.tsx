import { FunctionComponent } from 'react';
import { Button } from '@mui/material';

interface CurlyBraceButtonProps {
  text: string;
  onClick?: () => void;
}

export const CurlyBraceButton: FunctionComponent<CurlyBraceButtonProps> = ({
  text,
  onClick,
}) => {
  return (
    <Button
      onClick={onClick}
      sx={{
        background: 'none',
        border: 'none',
        padding: '0',
        minWidth: 'auto',
        maxWidth: '200px',
        textTransform: 'none',
        display: 'flex',
        alignItems: 'stretch',
        gap: '4px',
        '&:hover': {
          background: 'none',
        },
      }}
    >
      <span
        style={{
          fontSize: '1.2em',
          lineHeight: '1',
          color: '#333',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'stretch',
          alignSelf: 'stretch',
        }}
      >
        {'{'}
      </span>
      <span
        style={{
          flex: 1,
          lineHeight: '1.4',
          color: '#333',
          wordWrap: 'break-word',
          overflowWrap: 'break-word',
        }}
      >
        {text}
      </span>
      <span
        style={{
          fontSize: '1.2em',
          lineHeight: '1',
          color: '#333',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'stretch',
          alignSelf: 'stretch',
        }}
      >
        {'}'}
      </span>
    </Button>
  );
};
