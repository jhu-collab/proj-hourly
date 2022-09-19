import { lazy } from "react";
import { Routes, Route } from "react-router-dom";
import ThemeCustomization from "./themes";
import ScrollTop from "./components/ScrollTop";
import Loadable from "./components/Loadable";
import MainLayout from "./layouts/MainLayout";
import MinimalLayout from "./layouts/MinimalLayout";
import ProtectedRoute from "./components/ProtectedRoute";
import AdminOnlyRoute from "./layouts/AdminOnlyRoute";
import { useAccountStore } from "./services/store";
const NotFound = Loadable(lazy(() => import("./pages/NotFound")));
const YourCourses = Loadable(
  lazy(() => import("./pages/your-courses/YourCourses"))
);
const Calendar = Loadable(lazy(() => import("./pages/calendar/Calendar")));
const CourseInfoPage = Loadable(
  lazy(() => import("./pages/course-information/CourseInfoPage"))
);
const AuthLogin = Loadable(lazy(() => import("./pages/authentication/Login")));
const Callback = Loadable(lazy(() => import("./pages/authentication/Callback")));
const Roster = Loadable(lazy(() => import("./pages/roster-page/Roster")));
const Registrations = Loadable(
  lazy(() => import("./pages/registrations/Registrations"))
);

function App() {
  const id = useAccountStore((state) => state.id);

  return (
    <ThemeCustomization>
      <ScrollTop>
        <Routes>
          <Route path="/" element={<MinimalLayout />}>
            <Route path="/login" element={<AuthLogin />} />
            <Route path="login/callback" element={<Callback />} />
          </Route>
          <Route path="*" element={<NotFound />} />
          <Route path="/" element={<ProtectedRoute />}>
            <Route path="/" element={<MainLayout />}>
              <Route path="" element={<YourCourses />} />
              <Route path="/calendar" element={<Calendar />} />
              <Route path="/registrations" element={<Registrations />} />
              <Route path="/roster" element={<Roster />} />
              <Route path="/courseinformation" element={<CourseInfoPage />} />
              <Route path="admin/" element={<AdminOnlyRoute />}>
                {/* <Route path="users" element={<Users />} /> */}
              </Route>
            </Route>
          </Route>
        </Routes>
      </ScrollTop>
    </ThemeCustomization>
  );
}

export default App;
