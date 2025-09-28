import { FunctionComponent } from 'react';
import { CategoriesBarChart } from './charts';

const App: FunctionComponent = () => {
  return (
    <div>
      <h1>Revolutionary War Pensions Data Visualization</h1>
      <p>Exploring pension application categories and patterns</p>

      <CategoriesBarChart />
    </div>
  );
};

export default App;
