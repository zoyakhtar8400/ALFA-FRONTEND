import React from 'react';
import { TextField } from '@mui/material';

const DatePickerField = ({ label, value, onChange, required = false, ...props }) => {
  return (
    <TextField
      label={label}
      value={value}
      onChange={onChange}
      type="date"
      required={required}
      fullWidth
      variant="outlined"
      size="small"
      slotProps={{
        inputLabel: {
          shrink: true,
          style: { fontWeight: 600, color: 'var(--dark)' }
        }
      }}
      sx={{
        '& .MuiOutlinedInput-root': {
          borderRadius: '10px',
          backgroundColor: 'var(--background)',
          fontFamily: 'var(--font-family)',
          fontSize: '0.9rem',
          '& fieldset': {
            borderColor: 'var(--border)',
          },
          '&:hover fieldset': {
            borderColor: 'var(--primary)',
          },
          '&.Mui-focused fieldset': {
            borderColor: 'var(--primary)',
          },
          '&.Mui-focused': {
            backgroundColor: '#ffffff',
          }
        }
      }}
      {...props}
    />
  );
};

export default DatePickerField;
