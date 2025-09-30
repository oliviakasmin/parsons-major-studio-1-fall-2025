import { FunctionComponent, useState } from 'react';
import { CategoriesBarChart } from './charts';

export const CategoriesChart: FunctionComponent = () => {
  const [useCountData, setUseCountData] = useState(true);

  const countsExplanation = `counts placeholder`;
  const averagePagesExplanation = `average pages placeholder`;

  return (
    <div className="categories-chart-container">
      <CategoriesBarChart
        useCountData={useCountData}
        setUseCountData={setUseCountData}
      />
      <div id="chart-explanation">
        {useCountData ? countsExplanation : averagePagesExplanation}
      </div>
    </div>
  );
};
