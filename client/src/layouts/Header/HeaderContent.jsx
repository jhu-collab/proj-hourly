import Box from "@mui/material/Box";
import useMediaQuery from "@mui/material/useMediaQuery";
import Profile from "./Profile";
import Notification from "./Notification";
import MobileSection from "./MobileSection";

function HeaderContent() {
  const matchesXs = useMediaQuery((theme) => theme.breakpoints.down("md"));
  return (
    <>
      <Notification />
      {!matchesXs && <Profile />}
      {matchesXs && <MobileSection />}
    </>
  );
}

export default HeaderContent;
