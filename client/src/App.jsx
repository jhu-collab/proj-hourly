import { lazy } from "react";
import { Routes, Route } from "react-router-dom";
import ThemeCustomization from "./themes";
import ScrollTop from "./components/ScrollTop";
import Loadable from "./components/Loadable";
import MainLayout from "./layouts/MainLayout";
import MinimalLayout from "./layouts/MinimalLayout";
import ProtectedRoute from "./components/ProtectedRoute";
import { useAccountStore } from "./services/store";
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
const Registrations = Loadable(lazy(() => import("./pages/registrations/Registrations")));

function App() {
  const id = useAccountStore((state) => state.id);

  return (
    <ThemeCustomization>
      <ScrollTop>
        <Routes>
          <Route path="*" element={<NotFound />} />
          <Route path="/" element={<MinimalLayout />}>
            <Route path="/" element={<AuthLogin />} />
            <Route path="register" element={<AuthRegister />} />
          </Route>
          <Route
            path="/"
            element={
              // TODO: Replace with token
              <ProtectedRoute isAllowed={!!id}>
                <MainLayout />
              </ProtectedRoute>
            }
          >
            <Route path="/courses" element={<YourCourses />} />
            <Route path="/calendar" element={<Calendar />} />
            <Route path="/registrations" element={<Registrations />} />
            <Route path="/roster" element={<Roster />} />
          </Route>
        </Routes>
      </ScrollTop>
    </ThemeCustomization>
  );
}

export default App;
