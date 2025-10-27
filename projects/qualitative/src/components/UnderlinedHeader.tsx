import { FunctionComponent } from 'react';
import './UnderlinedHeader.css';
import { designUtils } from '../design_utils';

interface UnderlinedHeaderProps {
  text: string;
}

export const UnderlinedHeader: FunctionComponent<UnderlinedHeaderProps> = ({
  text,
}) => {
  return (
    <h2
      style={{
        margin: '0',
        paddingBottom: '8px',
        textTransform: 'capitalize',
        fontWeight: '400',
        color: designUtils.textColor,
      }}
    >
      <span className="underlined-header">{text}</span>
    </h2>
  );
};
