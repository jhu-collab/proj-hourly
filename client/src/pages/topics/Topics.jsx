import Fab from "@mui/material/Fab";
import SpeedDialIcon from "@mui/material/SpeedDialIcon";
import React from "react";

function Topics() {
  return (
    <>
      <Fab
        color="primary"
        onClick={() => NiceModal.show("create-registration-type")}
        sx={{
          position: "fixed",
          bottom: (theme) => theme.spacing(3),
          right: (theme) => theme.spacing(3),
        }}
      >
        <SpeedDialIcon />
      </Fab>
    </>
  );
}

export default Topics;
