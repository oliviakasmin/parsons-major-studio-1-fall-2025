// TODO - copied directly from quantitative project, needs to be refactored

import { FunctionComponent } from 'react';
import { UnderlinedHeader } from './components';

const dividerLineImage = 'Divider_line.png';

const introText = [
  'The Revolutionary War pension and bounty-land warrant application files preserve claims made by veterans and their families under a series of federal acts passed between 1776 and 1855.',
  'These files include applications from soldiers, widows, and heirs seeking pensions or land, along with supporting evidence such as affidavits, property schedules, and testimony.',
  'Many veterans or widows reapplied under later, more generous laws, so the files often span decades and contain multiple layers of documentation.',
  'Together, they form one of the richest archival sources for understanding the lives and service of Revolutionary War participants.',
  'The archive contains the records for nearly 80 thousand applications.',
];

// map through introText and split by period then set each section to a new paragraph
const introTextSections = introText.map((section, index) => (
  <p
    style={{
      fontSize: '20px',
      lineHeight: '1.5',
      marginBottom: '28px',
    }}
    key={index}
  >
    {section}
  </p>
));

export const Intro: FunctionComponent = () => {
  return (
    <div
      className="section-underline-bottom section-underline-top"
      style={
        {
          // width: '80vw',
          // borderTop: '1px solid black',
          // borderBottom: '1px solid black',
          // margin: '0 auto',
        }
      }
    >
      <div
        style={{
          maxWidth: '60vw',
          margin: '0 auto',
          marginBottom: '20px',
          marginTop: '40px',
          padding: '32px 0px',
        }}
      >
        <UnderlinedHeader text="About" />
        <div>
          <div>{introTextSections}</div>
        </div>
      </div>
      <img
        src={`/${dividerLineImage}`}
        alt={dividerLineImage}
        style={{ width: '20%', margin: '0 auto', display: 'block' }}
      />
      <div
        style={{
          maxWidth: '60vw',
          margin: '0 auto',
          marginBottom: '20px',
          marginTop: '20px',
          padding: '32px 0px',
        }}
      >
        {/* <h5> */}
        Sources:
        <div>
          <a
            target="_blank"
            href="https://www.nps.gov/articles/000/what-might-you-find-in-the-revolutionary-war-pension-files.htm"
          >
            NPS, "What Might You Find in the Revolutionary War Pension Files"
          </a>
        </div>
        <div>
          <a
            target="_blank"
            href="https://www.archives.gov/files/research/microfilm/m804.pdf"
          >
            National Archives Microfilm Publication M804
          </a>
        </div>
        <div>
          <a
            target="_blank"
            href="https://huggingface.co/datasets/RevolutionCrossroads/nara_revolutionary_war_pension_files"
          >
            Data
          </a>
        </div>
        {/* </h5> */}
      </div>
    </div>
  );
};
