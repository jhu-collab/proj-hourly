import FormControl from "@mui/material/FormControl";
import FormHelperText from "@mui/material/FormHelperText";
import ToggleButton from "@mui/material/ToggleButton";
import ToggleButtonGroup from "@mui/material/ToggleButtonGroup";
import { Controller } from "react-hook-form";

/**
 * Modeled after the MUI ToggleButtonGroup component. Utilizes the react-hook-form
 * to ease the use of this component in a form.
 * @param {string} name: the name of the field
 * @param {*} control: control object from the react-hook-form useForm function
 * @param {string} exclusive: a boolean that decides whether selection is exclusive
 * @param {*} buttons: an array of toggle button group options
 * @returns A reusuable toggle button group component.
 */
function FormToggleButtonGroup({
  name,
  control,
  exclusive = false,
  buttons,
  ...other
}) {
  const generateButtons = () => {
    return buttons.map((button) => {
      return (
        <ToggleButton key={button.id} value={button.value}>
          {button.label}
        </ToggleButton>
      );
    });
  };

  return (
    <Controller
      name={name}
      control={control}
      render={({ field, fieldState: { error } }) => (
        <FormControl variant="outlined" {...(error && { error: true })}>
          <ToggleButtonGroup
            {...field}
            onChange={(e, newValues) => field.onChange(newValues)}
            exclusive={exclusive}
            {...other}
          >
            {generateButtons()}
          </ToggleButtonGroup>
          {error && <FormHelperText>{error.message}</FormHelperText>}
        </FormControl>
      )}
    />
  );
}

export default FormToggleButtonGroup;
