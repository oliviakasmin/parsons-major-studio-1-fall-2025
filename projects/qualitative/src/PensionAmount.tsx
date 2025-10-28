/**
 * data needed:
 * act date
 * pension amount dollars
 * place of residence
 * type of applicant
 */

/**
 * mapping function needed:
 * input: act date, applicant type, place of residence
 * output: pension amount dollars
 */

// import { getPensionAmountData } from './pension_amount_data';
import { FunctionComponent, useState } from 'react';
import { PensionResultModal } from './components/PensionResultModal';
import {
  PensionAmountForm,
  UnderlinedHeader,
  CurlyBraceButton,
} from './components';
import './PensionAmount.css';
import { placeholderData } from './placeholder_data';

export const PensionAmount: FunctionComponent = () => {
  const [open, setOpen] = useState(false);
  // const [data, setData] = useState<d3.DSVRowArray<string> | null>(null);

  const handleOpen = () => {
    setOpen(true);
  };
  const handleClose = () => {
    setOpen(false);
  };

  const { defaultDate, defaultApplicantType, defaultPlaceOfResidence } =
    placeholderData;

  const [date, setDate] = useState<string>(defaultDate);
  const [applicantType, setApplicantType] =
    useState<string>(defaultApplicantType);
  const [placeOfResidence, setPlaceOfResidence] = useState<string>(
    defaultPlaceOfResidence
  );

  // TODO: get this from form submission / real data
  const amount = 100;
  const actDate = '1818-01-01';
  const imageUrl =
    'https://s3.amazonaws.com/NARAprodstorage/lz/microfilm-publications/M804-RevolutionaryWarPensionAppFiles/0001/25/M804_2633/images/4177212_00471.jpg';

  return (
    <>
      <div>
        <div className="pension-amount-header">
          <UnderlinedHeader text="Seeking a Pension" />
        </div>
        <div className="pension-amount-form">
          <PensionAmountForm
            date={date}
            applicantType={applicantType}
            placeOfResidence={placeOfResidence}
            setDate={setDate}
            setApplicantType={setApplicantType}
            setPlaceOfResidence={setPlaceOfResidence}
          />
        </div>
        <div className="pension-amount-button">
          <CurlyBraceButton
            line1="petition to be placed"
            line2="on the pension roll"
            onClick={handleOpen}
          />
        </div>
      </div>
      <PensionResultModal
        open={open}
        onClose={handleClose}
        state={placeOfResidence}
        amount={amount}
        actDate={actDate}
        imageUrl={imageUrl}
      />
    </>
  );
};
