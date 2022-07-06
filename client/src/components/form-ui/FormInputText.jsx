import { TextField } from "@mui/material";
import React from "react";
import { Controller } from "react-hook-form";

export const FormInputText = ({ name, control, label, ...other }) => {
  return (
    <Controller
      name={name}
      control={control}
      render={({ field, fieldState: { error } }) => (
        <TextField
          {...field}
          fullWidth
          label={label}
          variant="outlined"
          helperText={error ? error.message : null}
          error={error}
          {...other}
        />
      )}
    />
  );
};
