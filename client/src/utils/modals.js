import NiceModal from "@ebay/nice-modal-react";
import { SignOutPopup } from "../components/WindowFocusHandler";
import MobileEventPopup from "../pages/calendar/event-details/MobileEventPopup";
import Register from "../pages/calendar/register/Register";
import UpsertEvent from "../pages/calendar/upsert-event/UpsertEvent";
import CreateRegistrationType from "../pages/registrations/CreateRegistrationType";
import CreateTopic from "../pages/topics/CreateTopic";
import CreateCourse from "../pages/my-courses/create-course/CreateCourse";
import JoinCourse from "../pages/my-courses/join-course/JoinCourse";
import ChangeRole from "../pages/roster/ChangeRole";
import CreateCourseCalendarEventForm from "../pages/agenda/CreateCourseCalendarEventForm";
import CreateToken from "../pages/courseTokens/CreateToken";
import UseToken from "../pages/roster/UseToken";
import StudentTokenUsagePopup from "../pages/roster/StudentTokenUsagePopup";
NiceModal.register("create-course", CreateCourse);
NiceModal.register("join-course", JoinCourse);
NiceModal.register("mobile-event-popup", MobileEventPopup);
NiceModal.register("upsert-event", UpsertEvent);
NiceModal.register("register-event", Register);
NiceModal.register("sign-out", SignOutPopup);
NiceModal.register("change-user-role", ChangeRole);
NiceModal.register("create-registration-type", CreateRegistrationType);
NiceModal.register("create-topic", CreateTopic);
NiceModal.register(
  "create-course-calendar-event",
  CreateCourseCalendarEventForm
);
NiceModal.register("create-token", CreateToken);
NiceModal.register("use-course-token", UseToken);
NiceModal.register("student-token-usage", StudentTokenUsagePopup);
