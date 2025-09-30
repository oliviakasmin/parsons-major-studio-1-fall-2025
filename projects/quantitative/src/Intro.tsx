const introText = `The Revolutionary War pension and bounty-land warrant application files preserve claims made by veterans and their families under a series of federal acts passed between 1776 and 1855. These files include applications from soldiers, widows, and heirs seeking pensions or land, along with supporting evidence such as affidavits, property schedules, and testimony. Many veterans or widows reapplied under later, more generous laws, so the files often span decades and contain multiple layers of documentation. Together, they form one of the richest archival sources for understanding the lives and service of Revolutionary War participants.`;

// map through introText and split by period then set each section to a new paragraph
const introTextSections = introText.split('.').map((section, index) => (
  <p
    style={{
      fontSize: '20px',
      lineHeight: '1.5',
      marginBottom: '20px',
      color: 'white',
    }}
    key={index}
  >
    {section}
  </p>
));

export const Intro = () => {
  return (
    <div>
      <h2>About</h2>
      <div
        style={{
          maxWidth: '800px',
          margin: '0 auto',
          backgroundColor: 'black',
          color: 'white',
          padding: '40px',
          borderRadius: '10px',
          marginBottom: '28px',
          marginTop: '28px',
        }}
      >
        <div style={{ padding: '20px' }}>{introTextSections}</div>
      </div>

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
          <a
            target="_blank"
            href="https://www.archives.gov/files/research/microfilm/m804.pdf"
          >
            National Archives Microfilm Publication M804
          </a>
        </div>
      </h5>
    </div>
  );
};
