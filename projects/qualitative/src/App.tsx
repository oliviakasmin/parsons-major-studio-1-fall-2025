import { FunctionComponent } from 'react';
// import { CategoriesChart } from './CategoriesChart';
// import { History } from './History';
// import { Title } from './Title';
// import { Intro } from './Intro';
// import { CategoriesIntro } from './CategoriesIntro';
// import { NavDownButton } from './components';
import './App.css';
import { PensionAmount } from './PensionAmount';

const App: FunctionComponent = () => {
  // ordered list of section ids
  // const sectionIds = [
  //   'title',
  //   'intro',
  //   'history',
  //   'categories-intro',
  //   'categories-chart',
  //   'pension-amount',
  // ];

  // const scrollToNext = (currentIndex: number) => {
  //   const nextIndex = currentIndex + 1;
  //   if (nextIndex < sectionIds.length) {
  //     const nextSection = document.getElementById(sectionIds[nextIndex]);
  //     if (nextSection) {
  //       nextSection.scrollIntoView({ behavior: 'smooth' });
  //     }
  //   }
  // };

  // const scrollToPrevious = (currentIndex: number) => {
  //   const prevIndex = currentIndex - 1;
  //   if (prevIndex >= 0) {
  //     const prevSection = document.getElementById(sectionIds[prevIndex]);
  //     if (prevSection) {
  //       prevSection.scrollIntoView({ behavior: 'smooth' });
  //     }
  //   }
  // };

  return (
    <main>
      <section className="component-section" id="pension-amount">
        <PensionAmount />
        {/* <NavDownButton onClick={() => {}} /> */}
      </section>
      {/* <section className="component-section" id="title">
        <Title />
        <NavDownButton onClick={() => scrollToNext(0)} forceDown={true} />
      </section>

      <section className="component-section" id="intro">
        <Intro />
        <NavDownButton
          onClick={() => scrollToNext(1)}
          onReverseClick={() => scrollToPrevious(1)}
        />
      </section>

      <section className="component-section" id="history">
        <History />
        <NavDownButton
          onClick={() => scrollToNext(2)}
          onReverseClick={() => scrollToPrevious(2)}
        />
      </section>

      <section className="component-section" id="categories-intro">
        <CategoriesIntro />
        <NavDownButton
          onClick={() => scrollToNext(3)}
          onReverseClick={() => scrollToPrevious(3)}
        />
      </section>

      <section className="component-section" id="categories-chart">
        <CategoriesChart />
        <NavDownButton
          onClick={() => scrollToNext(4)}
          onReverseClick={() => scrollToPrevious(4)}
          forceUp={true}
        />
      </section> */}
    </main>
  );
};

export default App;
