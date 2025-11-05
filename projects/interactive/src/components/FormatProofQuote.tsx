import { Link } from '@mui/material';
import { designUtils } from '../design_utils';
import { sources } from '../source_utils';

export const FormatProofQuote = (proofQuote: string): React.ReactNode => {
  return proofQuote.split('||').map((quote, index) => {
    const text = quote.trim();
    const parenIndex = text.indexOf('(');

    if (parenIndex === -1) return <span key={index}>{text}</span>;

    const afterParen = text.substring(parenIndex + 1);
    let replaceStart = -1;
    let replaceLength = 0;
    let type: 'nps' | 'm804';

    if (afterParen.startsWith('NPS')) {
      replaceStart = parenIndex + 1;
      replaceLength = 3;
      type = 'nps';
    } else if (afterParen.startsWith('M804 pamphlet')) {
      replaceStart = parenIndex + 1;
      replaceLength = 13;
      type = 'm804';
    } else {
      return <span key={index}>{text}</span>;
    }

    return (
      <span key={index}>
        {text.substring(0, replaceStart)}
        <Link
          href={type === 'nps' ? sources.NPS.url : sources.M804.url}
          target="_blank"
          style={{ color: designUtils.textColor, textDecoration: 'underline' }}
        >
          {type === 'nps' ? sources.NPS.simpleName : sources.M804.simpleName}
        </Link>
        {text.substring(replaceStart + replaceLength)}
        {index < proofQuote.split('||').length - 1 && ' • '}
      </span>
    );
  });
};
