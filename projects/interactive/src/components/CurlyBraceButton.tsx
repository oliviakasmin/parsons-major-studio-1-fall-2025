import { FunctionComponent } from 'react';
import { Button } from '@mui/material';
import { designUtils } from '../design_utils';

interface CurlyBraceButtonProps {
  line1: string | React.ReactNode;
  line2?: string;
  onClick: () => void;
  color?: boolean;
  // bold?: boolean;
  darkTheme?: boolean;
  hidden?: boolean;
}

export const CurlyBraceButton: FunctionComponent<CurlyBraceButtonProps> = ({
  line1,
  line2 = undefined,
  onClick,
  color = true,
  // bold = false,
  darkTheme = false,
  hidden = false,
}) => {
  const lineCount = 1 + (line2 ? 1 : 0);

  const braceFontSize = `${lineCount * 1.5}em`;
  const textColor = color ? designUtils.blueColor : designUtils.textColor;
  const finalTextColor = darkTheme ? designUtils.lightBlueColor : textColor;
  const braceColor = darkTheme ? designUtils.backgroundColor : 'black';
  const finalBraceColor = hidden
    ? darkTheme
      ? designUtils.textColor
      : designUtils.backgroundColor
    : braceColor;
  // const fontWeight = bold ? 'bold' : 'normal';
  return (
    <Button
      onClick={onClick}
      sx={{
        textTransform: 'none',
        fontWeight: 'bold',
        display: 'flex',
        '&:hover': {
          cursor: 'pointer',
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
          color: finalBraceColor,
          // fontWeight: '100',
          fontFamily: 'Times New Roman',
          marginTop: `-${lineCount * 2}px`,
        }}
      >
        {'{'}
      </span>
      <span
        className="text-content"
        style={{
          color: finalTextColor,
          display: 'flex',
          flexDirection: 'column',
          fontFamily: 'Georgia',
          marginLeft: '16px',
          marginRight: '16px',
          marginTop: `${lineCount * 2}px`,
          lineHeight: '1.2',
          // fontWeight: fontWeight,
          fontWeight: 'bold',
          fontSize: '16px',
        }}
      >
        <span>{line1}</span>
        {line2 && <span>{line2}</span>}
      </span>
      <span
        style={{
          fontSize: braceFontSize,
          color: finalBraceColor,
          // fontWeight: '100',
          fontFamily: 'Times New Roman',
          marginTop: `-${lineCount * 2}px`,
        }}
      >
        {'}'}
      </span>
    </Button>
  );
};
