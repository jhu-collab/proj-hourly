import Button from "@mui/material/Button";
import AnimateButton from "../../../components/AnimateButton";
import { useEffect } from "react";
import { useModal } from "@ebay/nice-modal-react";
import useStoreEvent from "../../../hooks/useStoreEvent";

/**
 * Button that is used to create a new calendar
 * event.
 * @param calendarRef reference to the FullCalendar component in
 *                    Calendar.jsx
 * @returns Add New Event button.
 */
function CalendarAdd({ calendarRef }) {
  const modal = useModal("upsert-event");

  const setEvent = useStoreEvent((state) => state.setEvent);

  const handleClick = () => {
    modal.show("upsert-event", { type: "create" });
    setEvent({});
  };

  useEffect(() => {
    if (modal.visible === false) {
      let calendarApi = calendarRef.current.getApi();
      calendarApi.unselect();
    }
  }, [modal.visible]);

  return (
    <AnimateButton>
      <Button variant="contained" fullWidth onClick={handleClick}>
        Add new event
      </Button>
    </AnimateButton>
  );
}

export default CalendarAdd;
