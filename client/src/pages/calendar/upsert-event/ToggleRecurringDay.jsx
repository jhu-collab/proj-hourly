import { ToggleButton, ToggleButtonGroup } from "@mui/material";
import { useEventStore } from "../../../services/store";

function ToggleRecurringDay() {
  const days = useEventStore((state) => state.days);
  const setDays = useEventStore((state) => state.setDays);

  const handleChange = (event, newDays) => {
    setDays(newDays);
    console.log(newDays);
  };

  return (
    <ToggleButtonGroup value={days} onChange={handleChange}>
      <ToggleButton value="monday">Mon</ToggleButton>
      <ToggleButton value="tuesday">Tue</ToggleButton>
      <ToggleButton value="wednesday">Wed</ToggleButton>
      <ToggleButton value="thursday">Thu</ToggleButton>
      <ToggleButton value="friday">Fri</ToggleButton>
      <ToggleButton value="saturday">Sat</ToggleButton>
      <ToggleButton value="sunday">Sun</ToggleButton>
    </ToggleButtonGroup>
  );
}

export default ToggleRecurringDay;
