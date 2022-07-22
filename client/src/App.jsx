import { lazy } from "react";
import { Routes, Route } from "react-router-dom";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.min.css";
import ThemeCustomization from "./themes";
import ScrollTop from "./components/ScrollTop";
import Loadable from "./components/Loadable";
import MainLayout from "./layouts/MainLayout";
import MinimalLayout from "./layouts/MinimalLayout";
const NotFound = Loadable(lazy(() => import("./pages/NotFound")));
const YourCourses = Loadable(lazy(() => import("./pages/your-courses/YourCourses")));
const Calendar = Loadable(lazy(() => import("./pages/calendar/Calendar")));
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
          </Route>
        </Routes>
      </ScrollTop>
      <ToastContainer />
    </ThemeCustomization>
  );
}

export default App;
