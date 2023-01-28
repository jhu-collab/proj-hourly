import FormControl from "@mui/material/FormControl";
import FormHelperText from "@mui/material/FormHelperText";
import InputLabel from "@mui/material/InputLabel";
import MenuItem from "@mui/material/MenuItem";
import Select from "@mui/material/Select";
import { Controller } from "react-hook-form";

/**
 * Modeled after the MUI Select component. Utilizes the react-hook-form
 * to ease the use of this component in a form.
 * @param {string} name: the name of the field
 * @param {*} control: control object from the react-hook-form useForm function
 * @param {string} label: the label of the field
 * @param {*} options: an array of menu item options
 * @returns A reusuable dropdown component.
 */
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
            <MenuItem value="" disabled>
              <em>None</em>
            </MenuItem>
            {generateSingleOptions()}
          </Select>
          {error && <FormHelperText>{error.message}</FormHelperText>}
        </FormControl>
      )}
    />
  );
}

export default FormInputDropdown;
