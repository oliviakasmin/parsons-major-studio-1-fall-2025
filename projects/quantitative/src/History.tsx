import { FunctionComponent, useState } from 'react';
import { HistoryTimeline } from './charts';

const introText = `The Revolutionary War pension and bounty-land warrant application files preserve claims made by veterans and their families under a series of federal acts passed between 1776 and 1855. These files include applications from soldiers, widows, and heirs seeking pensions or land, along with supporting evidence such as affidavits, property schedules, and testimony. Many veterans or widows reapplied under later, more generous laws, so the files often span decades and contain multiple layers of documentation. Together, they form one of the richest archival sources for understanding the lives and service of Revolutionary War participants.`;
const introText1 = `placeholder text`;
const introText2 = `placeholder text again again again`;

export const History: FunctionComponent = () => {
  const texts = [introText, introText1, introText2];
  const [introTextIndex, setIntroTextIndex] = useState(0);

  return (
    <div>
      <h2>Intro & Timeline</h2>
      <p>{texts[introTextIndex]}</p>
      <h5>
        Sources:
        <div>
          <a href="https://www.nps.gov/articles/000/what-might-you-find-in-the-revolutionary-war-pension-files.htm">
            NPS, “What Might You Find in the Revolutionary War Pension Files”
          </a>
        </div>
        <div>
          <a href="https://catalog.archives.gov/id/111768989">
            National Archives Microfilm Publication M804
          </a>
        </div>
      </h5>
      <button
        onClick={() => setIntroTextIndex((introTextIndex + 1) % texts.length)}
      >
        Next
      </button>
      <HistoryTimeline />
    </div>
  );
};
