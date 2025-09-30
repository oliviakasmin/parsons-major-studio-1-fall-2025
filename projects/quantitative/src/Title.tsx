import { FunctionComponent } from 'react';

// placeholder text for now

export const Title: FunctionComponent = () => {
  return (
    <div className="title-wrap">
      <h1>Revolutionary War Pension Application Files</h1>
      <h4>Exploring pension application categories and patterns</h4>
      <div style={{ marginTop: '40px' }}>
        <hr
          style={{
            border: 'none',
            height: '3px',
            // backgroundColor: '#333',
            backgroundColor: '#666',
            margin: '0 0 8px 0',
          }}
        />
        <hr
          style={{
            border: 'none',
            height: '2px',
            backgroundColor: '#666',
            // backgroundColor: '#333',
            margin: '0',
          }}
        />
      </div>
    </div>
  );
};
