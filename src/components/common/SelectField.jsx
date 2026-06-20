import React from 'react';
import { FormControl, InputLabel, Select, MenuItem } from '@mui/material';

const SelectField = ({ label, value, onChange, options = [], required = false, ...props }) => {
  return (
    <FormControl fullWidth size="small" required={required}>
      <InputLabel shrink style={{ fontWeight: 600, color: 'var(--dark)' }}>{label}</InputLabel>
      <Select
        value={value}
        onChange={onChange}
        label={label}
        notched
        sx={{
          borderRadius: '10px',
          backgroundColor: 'var(--background)',
          fontFamily: 'var(--font-family)',
          fontSize: '0.9rem',
          '& .MuiOutlinedInput-notchedOutline': {
            borderColor: 'var(--border)',
          },
          '&:hover .MuiOutlinedInput-notchedOutline': {
            borderColor: 'var(--primary)',
          },
          '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
            borderColor: 'var(--primary)',
          },
          '&.Mui-focused': {
            backgroundColor: '#ffffff',
          }
        }}
        {...props}
      >
        {options.map((opt, idx) => {
          const val = typeof opt === 'object' ? opt.value : opt;
          const labelText = typeof opt === 'object' ? opt.label : opt;
          return (
            <MenuItem key={idx} value={val} sx={{ fontSize: '0.9rem', fontFamily: 'var(--font-family)' }}>
              {labelText}
            </MenuItem>
          );
        })}
      </Select>
    </FormControl>
  );
};

export default SelectField;
