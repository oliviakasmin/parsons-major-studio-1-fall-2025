import { FunctionComponent } from 'react';
import { StyledSelect } from './StyledSelect';

interface PensionAmountFormProps {
  date: string;
  applicantType: string;
  placeOfResidence: string;
  setDate: (date: string) => void;
  setApplicantType: (applicantType: string) => void;
  setPlaceOfResidence: (placeOfResidence: string) => void;
  dateOptions: string[];
  applicantTypeOptions: string[];
  placeOptions: string[];
}
export const PensionAmountForm: FunctionComponent<PensionAmountFormProps> = ({
  date,
  applicantType,
  placeOfResidence,
  setDate,
  setApplicantType,
  setPlaceOfResidence,
  dateOptions,
  applicantTypeOptions,
  placeOptions,
}) => {
  return (
    <div className="pension-amount-form-container">
      It's
      <StyledSelect
        value={date}
        onChange={value => setDate(value as string)}
        options={dateOptions}
        placeholder="Select year"
      />
      and I am a
      <StyledSelect
        value={applicantType}
        onChange={value => setApplicantType(value as string)}
        options={applicantTypeOptions}
        placeholder="Select type"
      />
      who lives in
      <StyledSelect
        value={placeOfResidence}
        onChange={value => setPlaceOfResidence(value as string)}
        options={placeOptions}
        placeholder="Select place"
      />
    </div>
  );
};
