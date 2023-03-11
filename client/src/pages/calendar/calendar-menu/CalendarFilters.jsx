import Stack from "@mui/material/Stack";
import FormControlLabel from "@mui/material/FormControlLabel";
import Radio from "@mui/material/Radio";
import RadioGroup from "@mui/material/RadioGroup";
import Typography from "@mui/material/Typography";
import { useState } from "react";

/**
 * Represents calendar filter menu.
 * @returns calendar filter menu
 */
function CalendarFilters(props) {
  const {filtered, setFiltered} = props;

  const handleFilterChange = (event) => {
    setFiltered(event.target.value);
  };

  return (
    <Stack direction="column" spacing={.25}>
      <Typography variant="subtitle1" fontWeight={600} color="text.secondary">
        filters
      </Typography>
      <RadioGroup row value={filtered} onChange={handleFilterChange}>
        <FormControlLabel
          value="mine"
          control={<Radio color="tertiary" />}
          label="my events"
        />
        <FormControlLabel
          value="all"
          control={<Radio />}
          label="all events"
          defaultChecked
        />
      </RadioGroup>
    </Stack>
  );
}




export default CalendarFilters;
