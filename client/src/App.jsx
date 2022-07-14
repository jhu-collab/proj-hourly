import { lazy } from "react";
import { Routes, Route } from "react-router-dom";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import ThemeCustomization from "./themes";
import ScrollTop from "./components/ScrollTop";
import Loadable from "./components/Loadable";
import MainLayout from "./layouts/MainLayout";
import MinimalLayout from "./layouts/MinimalLayout";
const NotFound = Loadable(lazy(() => import("./pages/NotFound")));
const DashboardDefault = Loadable(lazy(() => import("./pages/dashboard")));
const YourCourses = Loadable(lazy(() => import("./pages/your-courses")));
const Calendar = Loadable(lazy(() => import("./pages/calendar/Calendar")));
const SamplePage = Loadable(lazy(() => import("./pages/demos/SamplePage")));
const ReactToastifyDemo = Loadable(
  lazy(() => import("./pages/demos/ReactToastifyDemo"))
);
const Backend = Loadable(lazy(() => import("./pages/demos/Backend")));
const ReactQueryDemo = Loadable(
  lazy(() => import("./pages/demos/ReactQueryDemo"))
);
const FullCalendarDemo = Loadable(
  lazy(() => import("./pages/demos/FullCalendarDemo"))
);
const AuthLogin = Loadable(lazy(() => import("./pages/authentication/Login")));
const AuthRegister = Loadable(
  lazy(() => import("./pages/authentication/Register"))
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
            <Route path="sample-page" element={<SamplePage />} />
            <Route path="react-query" element={<ReactQueryDemo />} />
            <Route path="full-cal" element={<FullCalendarDemo />} />
            <Route path="toastify" element={<ReactToastifyDemo />} />
            <Route path="backend" element={<Backend />} />
          </Route>
        </Routes>
      </ScrollTop>
      <ToastContainer />
    </ThemeCustomization>
  );
}

export default App;
