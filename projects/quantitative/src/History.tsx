import { FunctionComponent } from 'react';
import { HistoryTimeline2 } from './charts';

export const History: FunctionComponent = () => {
  return (
    <div>
      {/* <h2>Intro & Timeline</h2>
      <p>{texts[introTextIndex]}</p>
      <h5>
        Sources:
        <div>
          <a
            target="_blank"
            href="https://www.nps.gov/articles/000/what-might-you-find-in-the-revolutionary-war-pension-files.htm"
          >
            NPS, “What Might You Find in the Revolutionary War Pension Files”
          </a>
        </div>
        <div>
          <a target="_blank" href="https://catalog.archives.gov/id/111768989">
            National Archives Microfilm Publication M804
          </a>
        </div>
      </h5>
      <button
        onClick={() => setIntroTextIndex((introTextIndex + 1) % texts.length)}
      >
        Next
      </button> */}
      <h3 style={{ textAlign: 'center', marginBottom: '60px' }}>
        Timeline & Historical Context
      </h3>
      <HistoryTimeline2 />
    </div>
  );
};
