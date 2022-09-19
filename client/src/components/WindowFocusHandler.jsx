import { useEffect } from "react";
import useAuth from "../hooks/useAuth";
import NiceModal, { useModal } from "@ebay/nice-modal-react";
import Button from "@mui/material/Button";
import Typography from "@mui/material/Typography";
import Popup from "./Popup";

export const SignOutPopup = NiceModal.create(({ onClose }) => {
  const modal = useModal();

  return (
    <Popup modal={modal}>
      <>
        <Typography>Please sign in again!</Typography>
        <Button fullWidth onClick={onClose} mt="md">
          Okay!
        </Button>
      </>
    </Popup>
  );
});

function WindowFocusHandler() {
  const { isTokenExpired, signOut } = useAuth();

  useEffect(() => {
    window.addEventListener("focus", onFocus);
    return () => {
      window.removeEventListener("focus", onFocus);
    };
  }, []);

  const onCloseHandler = () => {
    signOut();
  };

  const onFocus = () => {
    if (isTokenExpired()) {
      NiceModal.show("sign-out", { onClose: onCloseHandler });
    }
  };

  return <></>;
}

export default WindowFocusHandler;
