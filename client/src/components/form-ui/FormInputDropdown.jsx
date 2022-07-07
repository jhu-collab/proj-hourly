import {
  FormControl,
  FormHelperText,
  InputLabel,
  MenuItem,
  Select,
} from "@mui/material";
import React from "react";
import { Controller } from "react-hook-form";

function FormInputDropdown({ name, control, label, options, ...other }) {
  const generateSingleOptions = () => {
    return options.map((option) => {
      return (
        <MenuItem key={option.id} value={option.value}>
          {option.label}
        </MenuItem>
      );
    });
  };

  return (
    <Controller
      name={name}
      control={control}
      render={({ field, fieldState: { error } }) => (
        <FormControl
          variant="outlined"
          fullWidth
          {...(error && { error: true })}
        >
          <InputLabel>{label}</InputLabel>
          <Select {...field} label={label} {...other}>
            {generateSingleOptions()}
          </Select>
          {error && <FormHelperText>{error.message}</FormHelperText>}
        </FormControl>
      )}
    />
  );
}

export default FormInputDropdown;
