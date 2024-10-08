// src/components/FormSelect.js
import React from 'react';
import { FormControl, InputLabel, Select, MenuItem } from '@mui/material';

const FormSelect = ({ label, name, value, onChange, options, required = false }) => {
  return (
    <FormControl fullWidth>
      <InputLabel>{label}</InputLabel>
      <Select name={name} value={value} onChange={onChange} required={required}>
        {options.map((option) => (
          <MenuItem key={option.value} value={option.value}>
            {option.label}
          </MenuItem>
        ))}
      </Select>
    </FormControl>
  );
};

export default FormSelect;
