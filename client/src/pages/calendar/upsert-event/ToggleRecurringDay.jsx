import ToggleButton from "@mui/material/ToggleButton";
import ToggleButtonGroup from "@mui/material/ToggleButtonGroup";
import useStoreEvent from "../../../hooks/useStoreEvent";

/**
 * Child component for the UpsertForm component. Represents an
 * MUI ToggleButtonGroup component that allows users to
 * select days in which they would like an event to recur.
 * @returns The recurring day selector.
 */
function ToggleRecurringDay() {
  const days = useStoreEvent((state) => state.days);
  const setDays = useStoreEvent((state) => state.setDays);

  const handleChange = (event, newDays) => {
    setDays(newDays);
  };

  return (
    <ToggleButtonGroup color={"primary"} value={days} onChange={handleChange}>
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
