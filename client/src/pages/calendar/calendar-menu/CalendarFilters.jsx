import Stack from "@mui/material/Stack";
import ToggleButton from "@mui/material/ToggleButton";
import ToggleButtonGroup from "@mui/material/ToggleButtonGroup";
import Typography from "@mui/material/Typography";
import FormControl from "@mui/material/FormControl";
import InputLabel from "@mui/material/InputLabel";
import NativeSelect from "@mui/material/NativeSelect";
import Select from "@mui/material/Select";
import MenuItem from "@mui/material/MenuItem";

/**
 * Represents calendar filter menu.
 * @returns calendar filter menu
 */
function CalendarFilters(props) {
  const {setFiltered} = props;

  const handleFilterChange = (event) => {
    setFiltered(event.target.value);
  };


  return (
    <Stack direction="column" spacing={.25}>
        <Typography variant="subtile1" fontWeight={600} color="text.secondary">
          filter
        </Typography>
      <FormControl fullWidth>
        <Select
          labelId="demo-simple-select-label"
          id="demo-simple-select"
          defaultValue={'all'}
          onChange={handleFilterChange}
        >
        <MenuItem value={'all'}>All Events</MenuItem>
        <MenuItem value={'mine'}>My Events Only</MenuItem>
      </Select>
    </FormControl>
    </Stack>
  );
}


export default CalendarFilters;