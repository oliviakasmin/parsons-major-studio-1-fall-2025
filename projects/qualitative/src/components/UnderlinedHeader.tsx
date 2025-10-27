import { FunctionComponent } from 'react';
import './UnderlinedHeader.css';

interface UnderlinedHeaderProps {
  text: string;
}

export const UnderlinedHeader: FunctionComponent<UnderlinedHeaderProps> = ({
  text,
}) => {
  return (
    <h2
      style={{
        position: 'relative',
        display: 'inline-block',
        margin: '0',
        paddingBottom: '8px',
      }}
      className="underlined-header"
    >
      {text}
    </h2>
  );
};
