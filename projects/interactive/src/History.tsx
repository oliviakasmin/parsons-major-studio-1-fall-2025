// TODO - copied directly from quantitative project, needs to be refactored

import { FunctionComponent } from 'react';
import { HistoryTimeline } from './charts';
import { UnderlinedHeader } from './components/UnderlinedHeader';

export const History: FunctionComponent = () => {
  return (
    <div>
      <div style={{ textAlign: 'center', margin: '12vh 0' }}>
        <UnderlinedHeader text="Timeline & Historical Context" />
      </div>
      <div style={{ margin: '0 auto' }}>
        <HistoryTimeline />
      </div>
    </div>
  );
};
