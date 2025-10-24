import { FunctionComponent } from 'react';
import { Select, MenuItem } from '@mui/material';

interface StyledSelectProps {
  value: string;
  onChange: React.Dispatch<React.SetStateAction<string>>;
  options: string[];
  placeholder?: string;
}

const iconButtonColor = '#737271';

export const StyledSelect: FunctionComponent<StyledSelectProps> = ({
  value,
  onChange,
  options,
  placeholder,
}) => {
  return (
    <Select
      value={value}
      displayEmpty
      variant="standard"
      onChange={e => onChange(e.target.value)}
      sx={{
        marginLeft: '8px',
        marginRight: '0px',
        fontFamily: 'inherit',
        fontSize: 'inherit',
        fontWeight: 'bold',
        lineHeight: 'inherit',
        '&:hover': {
          textDecoration: 'underline',
          textDecorationColor: iconButtonColor,
        },
        '& .MuiSelect-select': {
          fontFamily: 'inherit',
          fontSize: 'inherit',
          fontWeight: 'inherit',
          lineHeight: 'inherit',
        },
        '& .MuiSelect-icon': {
          bottom: '0px',
          top: 'auto',
          right: '0px',
        },
        '&:after': {
          borderBottom: 'none',
        },
        '&:before': {
          borderBottom: 'none',
        },
        '&:hover:not(.Mui-disabled):before': {
          borderBottom: 'none',
        },
        '&.Mui-focused:after': {
          borderBottom: 'none',
        },
      }}
      renderValue={selected => {
        if (!selected) {
          return placeholder || options[0]?.toString() || '';
        }
        return selected;
      }}
    >
      {options.map(option => (
        <MenuItem
          sx={{
            fontFamily: 'inherit',
            fontSize: 'inherit',
            fontWeight: 'inherit',
            lineHeight: 'inherit',
            '&:hover': {
              backgroundColor: 'rgba(0, 0, 0, 0.04) !important',
            },
            '&.Mui-selected': {
              backgroundColor: 'rgba(0, 0, 0, 0.08) !important',
            },
            '&.Mui-selected:hover': {
              backgroundColor: 'rgba(0, 0, 0, 0.12) !important',
            },
            '& .MuiSelect-select': {
              fontFamily: 'inherit',
              fontSize: 'inherit',
              fontWeight: 'inherit',
              lineHeight: 'inherit',
            },
            '& .MuiMenuItem-root': {
              fontFamily: 'inherit',
              fontSize: 'inherit',
              fontWeight: 'inherit',
              lineHeight: 'inherit',
            },
          }}
          key={option}
          value={option}
        >
          {option}
        </MenuItem>
      ))}
    </Select>
  );
};
