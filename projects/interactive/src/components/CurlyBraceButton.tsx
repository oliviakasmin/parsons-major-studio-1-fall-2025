import { FunctionComponent } from 'react';
import { Button } from '@mui/material';
import { designUtils } from '../design_utils';

interface CurlyBraceButtonProps {
  line1: string;
  line2?: string;
  onClick: () => void;
  color?: boolean;
  bold?: boolean;
}

export const CurlyBraceButton: FunctionComponent<CurlyBraceButtonProps> = ({
  line1,
  line2 = undefined,
  onClick,
  color = true,
  bold = false,
}) => {
  const lineCount = 1 + (line2 ? 1 : 0);

  const braceFontSize = `${lineCount * 1.5}em`;
  const textColor = color ? designUtils.blueColor : designUtils.textColor;
  const fontWeight = bold ? 'bold' : 'normal';
  return (
    <Button
      onClick={onClick}
      sx={{
        textTransform: 'none',
        display: 'flex',
        '&:hover': {
          background: 'none',
          '& span[class*="text-content"]': {
            textDecoration: 'underline',
            textDecorationColor: designUtils.iconButtonColor,
          },
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
        className="text-content"
        style={{
          color: textColor,
          display: 'flex',
          flexDirection: 'column',
          fontFamily: 'Georgia',
          marginLeft: '16px',
          marginRight: '16px',
          marginTop: `${lineCount * 2}px`,
          lineHeight: '1.2',
          fontWeight: fontWeight,
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
