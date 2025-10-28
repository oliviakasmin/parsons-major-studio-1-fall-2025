import { FunctionComponent } from 'react';
import { StyledSelect } from './StyledSelect';
import { placeholderData } from '../placeholder_data';

interface PensionAmountFormProps {
  date: string;
  applicantType: string;
  placeOfResidence: string;
  setDate: (date: string) => void;
  setApplicantType: (applicantType: string) => void;
  setPlaceOfResidence: (placeOfResidence: string) => void;
}
export const PensionAmountForm: FunctionComponent<PensionAmountFormProps> = ({
  date,
  applicantType,
  placeOfResidence,
  setDate,
  setApplicantType,
  setPlaceOfResidence,
}) => {
  const {
    defaultDateOptions,
    defaultApplicantTypeOptions,
    defaultPlaceOfResidenceOptions,
    defaultDate,
    defaultApplicantType,
    defaultPlaceOfResidence,
  } = placeholderData;

  return (
    <div className="pension-amount-form-container">
      It's
      <StyledSelect
        value={date}
        onChange={value => setDate(value as string)}
        options={defaultDateOptions}
        placeholder={defaultDate}
      />
      and I am a
      <StyledSelect
        value={applicantType}
        onChange={value => setApplicantType(value as string)}
        options={defaultApplicantTypeOptions}
        placeholder={defaultApplicantType}
      />
      who lives in
      <StyledSelect
        value={placeOfResidence}
        onChange={value => setPlaceOfResidence(value as string)}
        options={defaultPlaceOfResidenceOptions}
        placeholder={defaultPlaceOfResidence}
      />
    </div>
  );
};
