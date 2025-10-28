const data = [
  {
    actDate: '1818',
    applicantType: 'soldier',
    placeOfResidence: 'Washington',
    pensionAmount: 150,
  },
  {
    actDate: '1819',
    applicantType: 'widow',
    placeOfResidence: 'New York',
    pensionAmount: 200,
  },
  {
    actDate: '1820',
    applicantType: 'soldier',
    placeOfResidence: 'New York',
    pensionAmount: 100,
  },
  {
    actDate: '1820',
    applicantType: 'widow',
    placeOfResidence: 'Boston',
    pensionAmount: 150,
  },
];

const defaultDateOptions = Array.from(new Set(data.map(item => item.actDate)));
const defaultApplicantTypeOptions = Array.from(
  new Set(data.map(item => item.applicantType))
);
const defaultPlaceOfResidenceOptions = Array.from(
  new Set(data.map(item => item.placeOfResidence))
);

export const placeholderData = {
  defaultDateOptions,
  defaultApplicantTypeOptions,
  defaultPlaceOfResidenceOptions,
  // applicantTypeOptions,
  // placeOfResidenceOptions,
  defaultDate: data[0].actDate,
  defaultApplicantType: data[0].applicantType,
  defaultPlaceOfResidence: data[0].placeOfResidence,
};
