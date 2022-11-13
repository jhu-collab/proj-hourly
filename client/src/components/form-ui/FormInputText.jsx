import TextField from "@mui/material/TextField";
import { Controller } from "react-hook-form";

/**
 * Modeled after the MUI TextField component. Utilizes the react-hook-form
 * to ease the use of this component in a form.
 * @param {string} name: the name of the field
 * @param {*} control: control object from the react-hook-form useForm function
 * @param {string} label: the label of the field
 * @returns A reusuable text field component.
 */
function FormInputText({ name, control, label, ...other }) {
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
          helperText={Boolean(error) ? error.message : null}
          error={Boolean(error)}
          {...other}
        />
      )}
    />
  );
}

export default FormInputText;
