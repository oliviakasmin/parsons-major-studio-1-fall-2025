import { FunctionComponent } from 'react';
import './UnderlinedHeader.css';
import { designUtils } from '../design_utils';

interface UnderlinedHeaderProps {
  text: string;
  size?: 'small' | 'medium' | 'large';
  underlined?: boolean;
  darkTheme?: boolean;
  noTextTransform?: boolean;
}

export const UnderlinedHeader: FunctionComponent<UnderlinedHeaderProps> = ({
  text,
  size = 'medium',
  underlined = true,
  darkTheme = false,
  noTextTransform = false,
}) => {
  const className = `underlined-header ${size} ${underlined ? 'underlined' : 'no-underline'} ${darkTheme ? 'dark-theme' : ''}`;

  return (
    <h2
      style={{
        margin: '0',
        paddingBottom: '8px',
        textTransform: noTextTransform ? 'none' : 'capitalize',
        fontWeight: '400',
        color: darkTheme ? designUtils.backgroundColor : designUtils.textColor,
      }}
    >
      <span className={className}>{text}</span>
    </h2>
  );
};
