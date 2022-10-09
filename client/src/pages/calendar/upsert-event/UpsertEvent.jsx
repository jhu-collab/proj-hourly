import Popup from "../../../components/Popup";
import NiceModal, { useModal } from "@ebay/nice-modal-react";
import { useEffect } from "react";
import CreateEventForm from "./CreateEventForm";
import EditEventForm from "./EditEventForm";
import useStoreEvent from "../../../hooks/useStoreEvent";

/**
 * Parent component for the UpsertForm component.
 * @param {String} type String that decides when this is creating or editing
 *                      an event
 * @returns The Upsert Event popup.
 */
const UpsertEvent = NiceModal.create(({ type }) => {
  const modal = useModal();

  const setDays = useStoreEvent((state) => state.setDays);

  useEffect(() => {
    return () => {
      setDays();
    };
  });

  return (
    <Popup
      modal={modal}
      title={type === "edit" ? "Edit Event" : "Create Event"}
    >
      {type === "edit" ? <EditEventForm /> : <CreateEventForm />}
    </Popup>
  );
});

export default UpsertEvent;
