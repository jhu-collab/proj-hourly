import Popup from "../../../components/Popup";
import NiceModal, { useModal } from "@ebay/nice-modal-react";
import CreateEventForm from "./CreateEventForm";
import EditEventForm from "./EditEventForm";
import EditLocationForm from "./EditLocationForm";
import EditCourseEventForm from "./EditCourseEventForm";
import EditCourseEventLocationForm from "./EditCourseEventLocationForm"
import EditCourseEventTitleForm from "./EditCourseEventTitleForm";
import CreateAllDayEventForm from "./CreateAllDayEventForm"; // form for all-day event

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
          return "Edit Course Calendar Event"
        } else if (type === "courseLocation") {
          return "Edit Course Calendar Event Location"
        } else if (type === "courseTitle") {
          return "Edit Course Calendar Event Agenda Description"
        } else if (type === "createAllDay") {
          return "Create Course Calendar Event"
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
        } else if (type === "createAllDay") {
          return <CreateAllDayEventForm />
        }
      })()}
    </Popup>
  );
});

export default UpsertEvent;
