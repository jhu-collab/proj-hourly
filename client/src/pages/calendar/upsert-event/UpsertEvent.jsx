import Popup from "../../../components/Popup";
import NiceModal, { useModal } from "@ebay/nice-modal-react";
import CreateEventForm from "./CreateEventForm";
import EditEventForm from "./EditEventForm";
import EditLocationForm from "./EditLocationForm";
import EditCourseEventForm from "./EditCourseEventForm";
import EditCourseEventLocationForm from "./EditCourseEventLocationForm"
import EditCourseEventTitleForm from "./EditCourseEventTitleForm";

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
        } else if (type === "location") {
          return "Edit Event Location"
        } else if (type === "courseEdit") {
          return "Edit Lecture Event" 
        } else if (type === "courseLocation") {
          return "Edit Lecture Event Location"
        } else if (type === "courseTitle") {
          return "Edit Lecture Event Title"
        }
      })()}
    >
      {(() => {
        if (type === "edit") {
          return <EditEventForm />;
        } else if (type === "create") {
          return <CreateEventForm />;
        } else if (type === "location") {
          return <EditLocationForm />
        } else if (type === "courseEdit") {
          return <EditCourseEventForm />
        } else if (type === "courseLocation") {
          return <EditCourseEventLocationForm />
        } else if (type === "courseTitle") {
          return <EditCourseEventTitleForm />
        }
      })()}
    </Popup>
  );
});

export default UpsertEvent;
