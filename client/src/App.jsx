import { lazy } from "react";
import { Routes, Route } from "react-router-dom";
import ThemeCustomization from "./themes";
import ScrollTop from "./components/ScrollTop";
import Loadable from "./components/Loadable";
import MainLayout from "./layouts/MainLayout";
import MinimalLayout from "./layouts/MinimalLayout";
import CourseWrapper from "./layouts/CourseWrapper";
import AdminOnlyRoute from "./layouts/AdminOnlyRoute";
import ProtectedRoute from "./layouts/ProtectedRoute";
import StaffOnlyRoute from "./layouts/StaffOnlyRoute";
import CourseTokenEnabledRoute from "./layouts/CourseTokenEnabledRoute";

const NotFound = Loadable(lazy(() => import("./pages/NotFound")));
const MyCourses = Loadable(lazy(() => import("./pages/my-courses/MyCourses")));
const Calendar = Loadable(lazy(() => import("./pages/calendar/Calendar")));
const CourseInfoPage = Loadable(
  lazy(() => import("./pages/course-information/CourseInfoPage"))
);
const Agenda = Loadable(lazy(() => import("./pages/agenda/Agenda")));
const AuthLogin = Loadable(lazy(() => import("./pages/authentication/Login")));
const SignUp = Loadable(lazy(() => import("./pages/authentication/SignUp")));
const ForgotPassword = Loadable(
  lazy(() => import("./pages/authentication/ForgotPassword"))
);
const ResetPassword = Loadable(
  lazy(() => import("./pages/authentication/ResetPassword"))
);

const Callback = Loadable(
  lazy(() => import("./pages/authentication/Callback"))
);
const Roster = Loadable(lazy(() => import("./pages/roster/Roster")));
const Registrations = Loadable(
  lazy(() => import("./pages/registrations/Registrations"))
);
const Topics = Loadable(lazy(() => import("./pages/topics/Topics")));
const CourseTokens = Loadable(
  lazy(() => import("./pages/courseTokens/CourseTokens"))
);
const Statistics = Loadable(
  lazy(() => import("./pages/statistics/Statistics"))
);
const Users = Loadable(lazy(() => import("./pages/admin/Users")));
const Profile = Loadable(lazy(() => import("./pages/account/Profile")));

function App() {
  return (
    <ThemeCustomization>
      <ScrollTop>
        <Routes>
          <Route path="*" element={<NotFound />} />
          <Route path="/" element={<ProtectedRoute />}>
            <Route path="/" element={<MainLayout />}>
              <Route path="" element={<MyCourses />} />
              <Route path="/" element={<CourseWrapper />}>
                <Route path="/calendar" element={<Calendar />} />
                <Route path="/registrations" element={<Registrations />} />
                <Route path="" element={<CourseTokenEnabledRoute />}>
                  <Route path="/tokens" element={<CourseTokens />} />
                </Route>
                <Route path="/courseinformation" element={<CourseInfoPage />} />
                <Route path="/agenda" element={<Agenda />} />
                <Route path="" element={<StaffOnlyRoute />}>
                  <Route path="/roster" element={<Roster />} />
                  <Route path="/topics" element={<Topics />} />
                </Route>
              </Route>
              <Route path="/profile" element={<Profile />} />
              <Route path="admin/" element={<AdminOnlyRoute />}>
                <Route path="users" element={<Users />} />
              </Route>
            </Route>
          </Route>
          <Route path="/" element={<MinimalLayout />}>
            <Route path="/login" element={<AuthLogin />} />
            <Route path="login/callback" element={<Callback />} />
            <Route path="/signup" element={<SignUp />} />
            <Route path="/forgotPassword" element={<ForgotPassword />} />
            <Route path="/resetPassword" element={<ResetPassword />} />
          </Route>
        </Routes>
      </ScrollTop>
    </ThemeCustomization>
  );
}

export default App;
