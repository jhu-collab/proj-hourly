import Popup from "../../../components/Popup";
import NiceModal, { useModal } from "@ebay/nice-modal-react";
import CreateEventForm from "./CreateEventForm";
import EditEventForm from "./EditEventForm";
import EditLocationForm from "./EditLocationForm";

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
      title={(() => {
        if (type === "edit") {
          return "Edit Event"
        } else if (type === "create") {
          return "Create Event"
        } else {
          return "Edit Event Location"
        }
      })()}
    >
      {(() => {
        if (type === "edit") {
          return <EditEventForm />;
        } else if (type === "create") {
          return <CreateEventForm />;
        } else {
          return <EditLocationForm />
        }
      })()}
    </Popup>
  );
});

export default UpsertEvent;
