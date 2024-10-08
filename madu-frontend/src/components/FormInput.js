// src/components/FormInput.js
import React from 'react';
import { TextField } from '@mui/material';

const FormInput = ({ label, name, value, onChange, type = 'text', required = false }) => {
  return (
    <TextField
      label={label}
      name={name}
      value={value}
      onChange={onChange}
      required={required}
      type={type}
      fullWidth
    />
  );
};

export default FormInput;
