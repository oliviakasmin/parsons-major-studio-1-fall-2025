import { useContext } from 'react';
import { CSVDataContext } from './CSVDataContext';

// Custom hook to use the context
export const useCSVData = () => {
  const context = useContext(CSVDataContext);
  if (context === undefined) {
    throw new Error('useCSVData must be used within a CSVDataProvider');
  }
  return context;
};
