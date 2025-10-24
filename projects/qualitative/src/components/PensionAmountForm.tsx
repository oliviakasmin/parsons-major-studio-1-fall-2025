import { FunctionComponent, useState } from 'react';
import { StyledSelect } from './StyledSelect';
export const PensionAmountForm: FunctionComponent = () => {
  const dateOptions = [
    '1818',
    '1819',
    '1820',
    '1821',
    '1822',
    '1823',
    '1824',
    '1825',
    '1826',
    '1827',
    '1828',
    '1829',
    '1830',
    '1831',
    '1832',
  ];

  const applicantTypeOptions = ['soldier', 'widow'];

  const placeOfResidenceOptions = [
    'New York',
    'Boston',
    'Philadelphia',
    'Washington',
  ];

  const defaultDate = dateOptions[0];
  const defaultApplicantType = applicantTypeOptions[0];
  const defaultPlaceOfResidence = placeOfResidenceOptions[0];

  const [date, setDate] = useState<string>(defaultDate);
  const [applicantType, setApplicantType] =
    useState<string>(defaultApplicantType);
  const [placeOfResidence, setPlaceOfResidence] = useState<string>(
    defaultPlaceOfResidence
  );

  return (
    <div className="pension-amount-form-container">
      It's
      <StyledSelect
        value={date}
        onChange={setDate}
        options={dateOptions}
        placeholder="Select a date"
      />
      and I am a
      <StyledSelect
        value={applicantType}
        onChange={setApplicantType}
        options={applicantTypeOptions}
        placeholder="Select an applicant type"
      />
      who lives in
      <StyledSelect
        value={placeOfResidence}
        onChange={setPlaceOfResidence}
        options={placeOfResidenceOptions}
        placeholder="Select a place of residence"
      />
    </div>
  );
};
