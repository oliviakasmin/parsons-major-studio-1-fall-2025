import { FunctionComponent } from 'react';
import { Title } from './Title';
import { Frequency } from './Frequency';
import './App.css';
import { PensionAmount } from './PensionAmount';
import { Intro, History, ApplicationCategories } from './';
import { CSVDataProvider } from './contexts/CSVDataContext';

const App: FunctionComponent = () => {
  return (
    <CSVDataProvider>
      <main>
        <section
          className="component-section component-section-centered"
          id="title"
        >
          <Title />
        </section>

        <section
          className="component-section component-section-centered component-section-margins"
          id="intro"
        >
          <Intro />
        </section>

        <section
          className="component-section component-section-centered component-section-margins"
          id="history"
        >
          <History />
        </section>
        <div className="section-underline-bottom"></div>
        <section
          className="component-section-centered "
          id="application-categories"
        >
          <ApplicationCategories />
        </section>
        <div className="section-underline-bottom"></div>

        <section
          id="pension-amount"
          className="component-section component-section-margins"
          style={{
            height: '100vh',
          }}
        >
          <PensionAmount />
        </section>

        <section
          id="frequency"
          className="component-section frequency-container"
        >
          <Frequency />
        </section>

        <div
          style={{ height: '5vh', margin: '0.5rem auto', textAlign: 'center' }}
        >
          Olivia Kasmin, Parsons School of Design, 2025
        </div>
      </main>
    </CSVDataProvider>
  );
};

export default App;
