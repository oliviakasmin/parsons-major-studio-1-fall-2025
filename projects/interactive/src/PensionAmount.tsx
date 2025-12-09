import {
  getPensionAmountFormData,
  findMatchingPensionRows,
  getValidPensionRows,
  groupPensionByYear,
  getOptionsForFilters,
} from './pension_amount_data';
import { FunctionComponent, useState, useEffect } from 'react';
import { PensionResultModal } from './components/PensionResultModal';
import {
  PensionAmountForm,
  UnderlinedHeader,
  CurlyBraceButton,
} from './components';
import './PensionAmount.css';
import * as d3 from 'd3';

export const PensionAmount: FunctionComponent = () => {
  // form result modal
  const [open, setOpen] = useState(false);

  // valid pension rows
  const [validPensionRows, setValidPensionRows] = useState<
    Array<d3.DSVRowString<string>>
  >([]);
  // form state
  const [date, setDate] = useState<string>('');
  const [applicantType, setApplicantType] = useState<string>('');
  const [placeOfResidence, setPlaceOfResidence] = useState<string>('');

  // form options
  const [dateOptions, setDateOptions] = useState<string[]>([]);
  const [applicantTypeOptions, setApplicantTypeOptions] = useState<string[]>(
    []
  );
  const [placeOptions, setPlaceOptions] = useState<string[]>([]);

  // modal data
  const [modalData, setModalData] = useState<{
    amount: number;
    actDate: string;
    pageURL: string;
    naraURL: string;
  }>({
    amount: 0,
    actDate: '',
    pageURL: '',
    naraURL: '',
  });

  // grouped rows by year for dynamic option filtering
  const [grouped, setGrouped] = useState<
    Record<string, Array<d3.DSVRowString<string>>>
  >({});

  // load data on component mount
  useEffect(() => {
    const loadData = async () => {
      try {
        const validPensionRows = await getValidPensionRows();
        setValidPensionRows(validPensionRows);
        setGrouped(groupPensionByYear(validPensionRows));
        const {
          dateOptions,
          applicantTypeOptions,
          placeOptions,
          defaultDate,
          defaultApplicantType,
          defaultPlace,
        } = await getPensionAmountFormData();
        setDateOptions(dateOptions);
        setApplicantTypeOptions(applicantTypeOptions);
        setPlaceOptions(placeOptions);
        setDate(defaultDate);
        setApplicantType(defaultApplicantType);
        setPlaceOfResidence(defaultPlace);
      } catch (error) {
        console.error('Error loading pension data:', error);
      }
    };

    loadData();
  }, []);

  // change handlers to keep options valid and selections consistent
  const handleDateChange = (newDate: string) => {
    setDate(newDate);
    const { applicantTypeOptions: typeOpts, placeOptions: placeOpts } =
      getOptionsForFilters(grouped, newDate, applicantType, placeOfResidence);
    setApplicantTypeOptions(typeOpts);
    setPlaceOptions(placeOpts);
    if (typeOpts.length && !typeOpts.includes(applicantType)) {
      setApplicantType(typeOpts[0]);
    }
    if (placeOpts.length && !placeOpts.includes(placeOfResidence)) {
      setPlaceOfResidence(placeOpts[0]);
    }
  };

  const handleApplicantTypeChange = (newType: string) => {
    setApplicantType(newType);
    const { applicantTypeOptions: typeOpts, placeOptions: placeOpts } =
      getOptionsForFilters(grouped, date, newType, placeOfResidence);
    setApplicantTypeOptions(typeOpts);
    setPlaceOptions(placeOpts);
    if (placeOpts.length && !placeOpts.includes(placeOfResidence)) {
      setPlaceOfResidence(placeOpts[0]);
    }
  };

  const handlePlaceChange = (newPlace: string) => {
    setPlaceOfResidence(newPlace);
    const { applicantTypeOptions: typeOpts, placeOptions: placeOpts } =
      getOptionsForFilters(grouped, date, applicantType, newPlace);
    setApplicantTypeOptions(typeOpts);
    setPlaceOptions(placeOpts);
    if (typeOpts.length && !typeOpts.includes(applicantType)) {
      setApplicantType(typeOpts[0]);
    }
  };

  // Ensure current selections always exist in their respective option lists
  useEffect(() => {
    if (dateOptions.length > 0 && !dateOptions.includes(date)) {
      setDate(dateOptions[0]);
    }
  }, [dateOptions, date]);

  useEffect(() => {
    if (
      applicantTypeOptions.length > 0 &&
      !applicantTypeOptions.includes(applicantType)
    ) {
      setApplicantType(applicantTypeOptions[0]);
    }
  }, [applicantTypeOptions, applicantType]);

  useEffect(() => {
    if (placeOptions.length > 0 && !placeOptions.includes(placeOfResidence)) {
      setPlaceOfResidence(placeOptions[0]);
    }
  }, [placeOptions, placeOfResidence]);

  const handleOpen = () => {
    // block if selections are incomplete or invalid
    if (!date || !applicantType || !placeOfResidence) {
      console.warn('Form is incomplete.');
      return;
    }
    const matchingRows = findMatchingPensionRows(
      validPensionRows,
      date,
      applicantType,
      placeOfResidence
    );

    if (matchingRows.length > 0) {
      // console.log('Matching rows:', matchingRows[0]);
      setModalData({
        amount: parseFloat(matchingRows[0]['normalized_yearly_amount']) || 0,
        actDate: matchingRows[0]['known_act_date'],
        pageURL: matchingRows[0]['pageURL'],
        naraURL: matchingRows[0]['naraURL'],
      });
      setOpen(true);
    } else {
      // console.log('No matching rows found');
    }
  };
  const handleClose = () => {
    setOpen(false);
  };

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
            setDate={handleDateChange}
            setApplicantType={handleApplicantTypeChange}
            setPlaceOfResidence={handlePlaceChange}
            dateOptions={dateOptions}
            applicantTypeOptions={applicantTypeOptions}
            placeOptions={placeOptions}
          />
        </div>
        <div className="pension-amount-button">
          <CurlyBraceButton
            line1="submit petition"
            onClick={handleOpen}
            color={true}
          />
        </div>
      </div>
      <PensionResultModal
        open={open}
        onClose={handleClose}
        state={placeOfResidence}
        amount={modalData.amount}
        actDate={modalData.actDate}
        imageUrl={modalData.pageURL}
        naraURL={modalData.naraURL}
      />
    </>
  );
};
