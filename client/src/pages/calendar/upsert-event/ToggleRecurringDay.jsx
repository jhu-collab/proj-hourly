import { ToggleButton, ToggleButtonGroup } from "@mui/material";
import { useEventStore } from "../../../services/store";

function ToggleRecurringDay() {
  const days = useEventStore((state) => state.days);
  const setDays = useEventStore((state) => state.setDays);

  const handleChange = (event, newDays) => {
    setDays(newDays);
  };

  return (
    <ToggleButtonGroup value={days} onChange={handleChange}>
      <ToggleButton value="Monday">Mon</ToggleButton>
      <ToggleButton value="Tuesday">Tue</ToggleButton>
      <ToggleButton value="Wednesday">Wed</ToggleButton>
      <ToggleButton value="Thursday">Thu</ToggleButton>
      <ToggleButton value="Friday">Fri</ToggleButton>
      <ToggleButton value="Saturday">Sat</ToggleButton>
      <ToggleButton value="Sunday">Sun</ToggleButton>
    </ToggleButtonGroup>
  );
}

export default ToggleRecurringDay;
