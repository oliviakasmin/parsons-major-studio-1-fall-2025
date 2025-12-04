import {
  FunctionComponent,
  // useState,
  // useEffect,
  // useRef
} from 'react';
import { Title } from './Title';
import { Frequency } from './Frequency';
import './App.css';
import { PensionAmount } from './PensionAmount';
import {
  Intro,
  History,
  ApplicationCategories,
  // NavDownButton
} from './';
// import { StoryLLM } from './StoryLLM';

// const dividerLineImage = 'Divider_line.png';

const App: FunctionComponent = () => {
  // const [showNavButtons, setShowNavButtons] = useState(false);
  // const mouseTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // ordered list of section ids
  // const sectionIds = [
  //   'title',
  //   'intro',
  //   'history',
  //   'application-categories',
  //   'pension-amount',
  //   'frequency',
  // ];

  // useEffect(() => {
  //   const handleMouseMove = () => {
  //     setShowNavButtons(true);

  //     // Clear existing timeout
  //     if (mouseTimeoutRef.current) {
  //       clearTimeout(mouseTimeoutRef.current);
  //     }

  //     // Hide buttons after 2 seconds of no mouse movement
  //     mouseTimeoutRef.current = setTimeout(() => {
  //       setShowNavButtons(false);
  //     }, 500);
  //   };

  //   window.addEventListener('mousemove', handleMouseMove);

  //   return () => {
  //     window.removeEventListener('mousemove', handleMouseMove);
  //     if (mouseTimeoutRef.current) {
  //       clearTimeout(mouseTimeoutRef.current);
  //     }
  //   };
  // }, []);

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
      <section
        className="component-section component-section-centered"
        id="title"
      >
        <Title />
        {/* {showNavButtons && (
          <NavDownButton onClick={() => scrollToNext(0)} forceDown={true} />
        )} */}
      </section>

      <section
        className="component-section component-section-centered component-section-margins"
        id="intro"
      >
        <Intro />
        {/* {showNavButtons && (
          <NavDownButton
            onClick={() => scrollToNext(1)}
            onReverseClick={() => scrollToPrevious(1)}
          />
        )} */}
      </section>

      <section
        className="component-section component-section-centered component-section-margins"
        id="history"
      >
        <History />
        {/* {showNavButtons && (
          <NavDownButton
            onClick={() => scrollToNext(2)}
            onReverseClick={() => scrollToPrevious(2)}
          />
        )} */}
      </section>
      <div className="section-underline-bottom"></div>
      <section
        className="component-section component-section-centered component-section-margins"
        id="application-categories"
      >
        <ApplicationCategories />
        {/* {showNavButtons && (
          <NavDownButton
            onClick={() => scrollToNext(3)}
            onReverseClick={() => scrollToPrevious(3)}
          />
        )} */}
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
        {/* {showNavButtons && (
          <NavDownButton
            onClick={() => scrollToNext(4)}
            onReverseClick={() => scrollToPrevious(4)}
          />
        )} */}
      </section>

      <section id="frequency" className="component-section frequency-container">
        <Frequency />
        {/* {showNavButtons && (
          <NavDownButton
            onClick={() => scrollToNext(5)}
            onReverseClick={() => scrollToPrevious(5)}
            forceUp={true}
          />
        )} */}
      </section>

      {/* <section id="story" className="component-section story-container">
        <StoryLLM />
      </section> */}

      <div
        style={{ height: '5vh', margin: '0.5rem auto', textAlign: 'center' }}
      >
        footer info here
      </div>
    </main>
  );
};

export default App;
