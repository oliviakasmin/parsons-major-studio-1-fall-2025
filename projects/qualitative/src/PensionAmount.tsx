import { FunctionComponent } from 'react';
import { PensionAmountForm } from './components/PensionAmountForm';
export const PensionAmount: FunctionComponent = () => {
  return (
    <div>
      <h2>Pension Amount</h2>
      <PensionAmountForm />
    </div>
  );
};
