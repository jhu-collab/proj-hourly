import NiceModal from "@ebay/nice-modal-react";
import MobileEventPopup from "../pages/calendar/event-details/MobileEventPopup";
import UpsertEvent from "../pages/calendar/upsert-event/UpsertEvent";
import CreateCourse from "../pages/your-courses/create-course/CreateCourse";
import JoinCourse from "../pages/your-courses/join-course/JoinCourse";

NiceModal.register("create-course", CreateCourse);
NiceModal.register("join-course", JoinCourse);
NiceModal.register("mobile-event-popup", MobileEventPopup);
NiceModal.register("upsert-event", UpsertEvent);
