import useMediaQuery from "@mui/material/useMediaQuery";
import Profile from "./Profile";
import Notification from "./Notification";
import MobileSection from "./MobileSection";
import Settings from "./Settings";

function HeaderContent() {
  const matchesXs = useMediaQuery((theme) => theme.breakpoints.down("md"));
  return (
    <>
      {!matchesXs && <Profile />}
      {matchesXs && <MobileSection />}
    </>
  );
}

export default HeaderContent;
