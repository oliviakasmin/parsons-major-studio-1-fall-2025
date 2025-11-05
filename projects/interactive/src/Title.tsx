import { FunctionComponent } from 'react';
import { UnderlinedHeader } from './components';

export const Title: FunctionComponent = () => {
  return (
    <div className="title-wrap">
      <h2>
        <UnderlinedHeader
          text="Bureaucracy in the Revolutionary War Era"
          size="large"
        />
      </h2>
      <h4>The Very Human Burden of Applying for a Pension</h4>
    </div>
  );
};
