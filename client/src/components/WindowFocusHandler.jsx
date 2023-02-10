import { useEffect } from "react";
import useAuth from "../hooks/useAuth";
import NiceModal, { useModal } from "@ebay/nice-modal-react";
import Button from "@mui/material/Button";
import Typography from "@mui/material/Typography";
import Popup from "./Popup";
import { isExpired } from "react-jwt";

export const SignOutPopup = NiceModal.create(({ onClose }) => {
  const modal = useModal();

  return (
    <Popup modal={modal}>
      <>
        <Typography variant="h5">Please sign in again!</Typography>
        <Button fullWidth onClick={onClose} sx={{ marginTop: 2 }}>
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
    window.addEventListener("storage", handleInvalidToken);
    return () => {
      window.removeEventListener("focus", onFocus);
      window.removeEventListener("storage", handleInvalidToken);
    };
  }, []);

  const onCloseHandler = () => {
    signOut();
    NiceModal.hide("sign-out");
  };

  const onFocus = () => {
    if (isTokenExpired()) {
      NiceModal.show("sign-out", { onClose: onCloseHandler });
    }
  };

  const handleInvalidToken = (e) => {
    if (e.key === "auth") {
      const oldToken = JSON.parse(e.oldValue).state.token;
      const newToken = !JSON.parse(e.newValue).state.token;

      if ((oldToken && !newToken) || (newToken && isExpired(newToken))) {
        NiceModal.show("sign-out", { onClose: onCloseHandler });
      }
    }
  };

  return <></>;
}

export default WindowFocusHandler;
