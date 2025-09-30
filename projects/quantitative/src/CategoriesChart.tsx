import { FunctionComponent, useState } from 'react';
import { CategoriesBarChart } from './charts';

export const CategoriesChart: FunctionComponent = () => {
  const [useCountData, setUseCountData] = useState(true);

  const countsExplanation = (
    <div
      style={{
        fontSize: '24px',
      }}
    >
      <p>
        <span style={{ fontWeight: 'bold' }}>Survived (soldier)</span> 45.5%
      </p>
      <p>
        <span style={{ fontWeight: 'bold' }}>Widow</span> 31.5%
      </p>{' '}
      <p>
        <span style={{ fontWeight: 'bold' }}>Rejected</span> 16.1%
      </p>
    </div>
  );
  const averagePagesExplanation =
    'Widows’ pension applications often grew to many pages because they required substantial proof of marriage and eligibility, and this proof was not always easy to obtain. Applicants frequently included marriage certificates, family Bible records, witness affidavits, and other supporting documents, mphlet.';

  return (
    <div>
      <div style={{ textAlign: 'center', margin: '40px' }}>
        {/* <h2>Application Categories</h2> */}
        <p style={{ fontSize: '24px' }}>
          How many applications were filed by surviving soldiers and other
          family members?
        </p>
        <p style={{ fontSize: '20px' }}>
          And how difficult was it for applicants?
        </p>
      </div>
      <div className="categories-chart-container">
        <CategoriesBarChart
          useCountData={useCountData}
          setUseCountData={setUseCountData}
        />
        {/* set fixed width and center so size doesn't change on text change */}
        <div
          id="chart-explanation"
          style={{
            width: '300px',
            margin: '0 auto',
            alignItems: 'center',
            alignSelf: 'center',
          }}
        >
          {useCountData ? countsExplanation : averagePagesExplanation}
        </div>
      </div>
    </div>
  );
};
