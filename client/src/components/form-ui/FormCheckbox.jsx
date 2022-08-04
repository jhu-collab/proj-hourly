import { Checkbox, FormControlLabel, TextField } from "@mui/material";
import { Controller } from "react-hook-form";

function FormCheckbox({ name, control, label, ...other }) {
  return (
    <Controller
      name={name}
      control={control}
      render={({ field, fieldState: { error } }) => (
        <FormControlLabel
          control={<Checkbox {...field} defaultChecked />}
          label={label}
        />
      )}
    />
  );
}

export default FormCheckbox;
