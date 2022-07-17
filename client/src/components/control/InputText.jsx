import { TextField } from '@mui/material';
import React from 'react';

/**
 * Represents a reusable component that is inspired by the Material UI TextField component.
 * @param {*} props - Properties include name, label, value, onChange, and error.
 * @returns A reusable text field component.
 */
function InputText(props) {
  const {
    name,
    label,
    value,
    onChange,
    error = null,
    width,
    fontSize,
    fontColor,
    margin,
    ...other
  } = props;

  const styles = {
    input: {
      width: width || '700px',
      margin: margin || '20px',
    },
  };

  return (
    <TextField
      variant="outlined"
      label={label}
      name={name}
      value={value}
      style={styles.input}
      onChange={onChange}
      InputProps={{
        style: {
          fontSize: fontSize || '1.3vw',
          color: fontColor || 'black',
          paddingTop: '0.2vh',
        },
      }}
      InputLabelProps={{
        style: { fontSize: fontSize || '1.3vw' },
      }}
      {...(error && { error: true, helperText: error })}
      {...other}
    />
  );
}

export default InputText;