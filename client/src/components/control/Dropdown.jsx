import React from "react";
import {
  FormControl,
  FormHelperText,
  InputLabel,
  MenuItem,
  Select,
} from "@mui/material";

/**
 * Represents a reusable component that is inspired by the Material UI Select component.
 * @param {*} props - Properties include name, label, value, error, onChange, and options.
 * @returns A reusable dropdown component.
 */
function Dropdown(props) {
  const {
    name,
    label,
    value,
    idOrTitle = "title",
    error = null,
    onChange,
    options,
    width,
    height,
    margin,
    fontSize,
    ...other
  } = props;

  const styles = {
    dropdown: {
      margin: margin || "20px",
      width: width || "50vw",
    },
  };

  return (
    <FormControl
      variant="outlined"
      sx={styles.dropdown}
      {...(error && { error: true })}
    >
      <InputLabel sx={{ fontSize: fontSize || "1.3rem" }}>{label}</InputLabel>
      <Select
        label={label}
        name={name}
        value={value}
        onChange={onChange}
        sx={{
          fontSize: fontSize || "1.3rem",
          paddingTop: "0.2vh",
          height: height,
        }}
        {...other}
      >
        {options.map((item) => (
          <MenuItem
            key={item.id}
            value={idOrTitle === "id" ? item.id : item.title}
            sx={{ fontSize: fontSize || "1.3rem" }}
          >
            {item.title}
          </MenuItem>
        ))}
      </Select>
      {error && <FormHelperText>{error}</FormHelperText>}
    </FormControl>
  );
}

export default Dropdown;
