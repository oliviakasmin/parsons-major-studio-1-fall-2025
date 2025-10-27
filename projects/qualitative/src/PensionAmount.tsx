import { FunctionComponent, useState } from 'react';
import { PensionResultModal } from './components/PensionResultModal';
import {
  PensionAmountForm,
  UnderlinedHeader,
  CurlyBraceButton,
} from './components';
import './PensionAmount.css';
export const PensionAmount: FunctionComponent = () => {
  const [open, setOpen] = useState(false);
  const handleOpen = () => {
    setOpen(true);
    // open modal and submit form data
  };
  const handleClose = () => {
    setOpen(false);
  };

  // TODO: get this from form submission
  const state = 'New York';
  const amount = 100;
  const actDate = '1818-01-01';
  const imageUrl =
    'https://s3.amazonaws.com/NARAprodstorage/lz/microfilm-publications/M804-RevolutionaryWarPensionAppFiles/0001/25/M804_2633/images/4177212_00471.jpg';

  return (
    <>
      <div>
        <div className="pension-amount-header">
          <UnderlinedHeader text="Seeking a Pension" />{' '}
        </div>
        <div className="pension-amount-form">
          <PensionAmountForm />
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
        state={state}
        amount={amount}
        actDate={actDate}
        imageUrl={imageUrl}
      />
    </>
  );
};
