import NiceModal from "@ebay/nice-modal-react";
import { SignOutPopup } from "../components/WindowFocusHandler";
import MobileEventPopup from "../pages/calendar/event-details/MobileEventPopup";
import Register from "../pages/calendar/register/Register";
import UpsertEvent from "../pages/calendar/upsert-event/UpsertEvent";
import CreateRegistrationType from "../pages/registrations/CreateRegistrationType";
import CreateTopic from "../pages/topics/CreateTopic";
import CreateCourse from "../pages/your-courses/create-course/CreateCourse";
import JoinCourse from "../pages/your-courses/join-course/JoinCourse";

NiceModal.register("create-course", CreateCourse);
NiceModal.register("join-course", JoinCourse);
NiceModal.register("mobile-event-popup", MobileEventPopup);
NiceModal.register("upsert-event", UpsertEvent);
NiceModal.register("register-event", Register);
NiceModal.register("sign-out", SignOutPopup);
NiceModal.register("create-registration-type", CreateRegistrationType);
NiceModal.register("create-topic", CreateTopic);
