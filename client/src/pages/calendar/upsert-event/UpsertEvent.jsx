import Popup from "../../../components/Popup";
import UpsertEventForm from "./UpsertEventForm";
import NiceModal, { useModal } from "@ebay/nice-modal-react";

/**
 * Parent component for the UpsertForm component.
 * @param {String} type String that decides when this is creating or editing
 *                      an event
 * @returns The Upsert Event popup.
 */
const UpsertEvent = NiceModal.create(({ type }) => {
  const modal = useModal();
  return (
    <Popup
      modal={modal}
      title={type === "edit" ? "Edit Event" : "Create Event"}
    >
      <UpsertEventForm type={type} />
    </Popup>
  );
});

export default UpsertEvent;
