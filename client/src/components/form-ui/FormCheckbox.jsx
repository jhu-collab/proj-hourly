import Checkbox from "@mui/material/Checkbox";
import FormControlLabel from "@mui/material/FormControlLabel";
import { Controller } from "react-hook-form";

/**
 * Modeled after the MUI Checkbox component. Utilizes the react-hook-form
 * to ease the use of this component in a form.
 * @param {string} name: the name of the field
 * @param {*} control: control object from the react-hook-form useForm function
 * @param {string} label: the label of the field
 * @returns A reusuable dropdown component.
 */
function FormCheckbox({ name, control, label, ...other }) {
  return (
    <Controller
      name={name}
      control={control}
      render={({ field, fieldState: { error } }) => (
        <FormControlLabel
          control={
            <Checkbox
              {...field}
              checked={field.value}
              defaultChecked
              {...other}
            />
          }
          label={label}
        />
      )}
    />
  );
}

export default FormCheckbox;
