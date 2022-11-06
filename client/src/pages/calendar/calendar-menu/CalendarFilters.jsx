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
function CalendarFilters() {
  const [filter, setFilter] = useState("myEvents");

  const handleFilterChange = (event) => {
    setFilter(event.target.value);
  };

  return (
    <Stack direction="column" spacing={1}>
      <Typography variant="subtitle1" fontWeight={600} color="text.secondary">
        filters
      </Typography>
      <RadioGroup value={filter} onChange={handleFilterChange}>
        <FormControlLabel
          value="myEvents"
          control={<Radio color="tertiary" />}
          label="my events"
        />
        <FormControlLabel
          value="allEvents"
          control={<Radio />}
          label="all events"
        />
      </RadioGroup>
    </Stack>
  );
}

export default CalendarFilters;
