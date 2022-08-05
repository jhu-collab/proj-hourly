import { lazy } from "react";
import { Routes, Route } from "react-router-dom";
import ThemeCustomization from "./themes";
import ScrollTop from "./components/ScrollTop";
import Loadable from "./components/Loadable";
import MainLayout from "./layouts/MainLayout";
import MinimalLayout from "./layouts/MinimalLayout";
const NotFound = Loadable(lazy(() => import("./pages/NotFound")));
const YourCourses = Loadable(
  lazy(() => import("./pages/your-courses/YourCourses"))
);
const Calendar = Loadable(lazy(() => import("./pages/calendar/Calendar")));
const AuthLogin = Loadable(lazy(() => import("./pages/authentication/Login")));
const AuthRegister = Loadable(
  lazy(() => import("./pages/authentication/Register"))
);

const Roster = Loadable(lazy(() => import("./pages/roster-page/Roster")));

const RosterTest = Loadable(
  lazy(() => import("./pages/roster-page/RosterTest"))
);

function App() {
  return (
    <ThemeCustomization>
      <ScrollTop>
        <Routes>
          <Route path="*" element={<NotFound />} />
          <Route path="/" element={<MinimalLayout />}>
            <Route path="/" element={<AuthLogin />} />
            <Route path="register" element={<AuthRegister />} />
          </Route>
          <Route path="/" element={<MainLayout />}>
            <Route path="/courses" element={<YourCourses />} />
            <Route path="/calendar" element={<Calendar />} />
            <Route path="/dashboard" element={<DashboardDefault />} />
            <Route path="/roster" element={<Roster />} />
            <Route path="/roster-test" element={<RosterTest />} />
            <Route path="sample-page" element={<SamplePage />} />
            <Route path="react-query" element={<ReactQueryDemo />} />
            <Route path="full-cal" element={<FullCalendarDemo />} />
            <Route path="toastify" element={<ReactToastifyDemo />} />
            <Route path="backend" element={<Backend />} />
          </Route>
        </Routes>
      </ScrollTop>
    </ThemeCustomization>
  );
}

export default App;
