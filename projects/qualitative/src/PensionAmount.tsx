import { FunctionComponent } from 'react';
import {
  PensionAmountForm,
  UnderlinedHeader,
  CurlyBraceButton,
} from './components';
export const PensionAmount: FunctionComponent = () => {
  return (
    <div>
      <UnderlinedHeader text="Seeking a Pension" />
      <PensionAmountForm />
      <CurlyBraceButton text="Seeking a Pension Seeking a Pension Seeking a Pension" />
    </div>
  );
};
