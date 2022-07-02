import { lazy } from "react";
import { Routes, Route } from "react-router-dom";
import ThemeCustomization from "./themes";
import ScrollTop from "./components/ScrollTop";
import Loadable from "./components/Loadable";
import MainLayout from "./layout/MainLayout";
import MinimalLayout from "./layout/MinimalLayout";
const NotFound = Loadable(lazy(() => import("./pages/NotFound")));
const DashboardDefault = Loadable(lazy(() => import("./pages/dashboard")));
const SamplePage = Loadable(lazy(() => import("./pages/demos/SamplePage")));
const ReactQueryDemo = Loadable(
  lazy(() => import("./pages/demos/ReactQueryDemo"))
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
          <Route path="/" element={<MainLayout />}>
            <Route path="/" element={<DashboardDefault />} />
            <Route path="sample-page" element={<SamplePage />} />
            <Route path="react-query" element={<ReactQueryDemo />} />
          </Route>
          <Route path="/" element={<MinimalLayout />}>
            <Route path="login" element={<AuthLogin />} />
            <Route path="register" element={<AuthRegister />} />
          </Route>
        </Routes>
      </ScrollTop>
    </ThemeCustomization>
  );
}

export default App;
