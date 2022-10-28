import { Button } from "@mui/material";
import React from "react";
import AnimateButton from "../../../components/AnimateButton";

function CalendarAdd() {
  return (
    <AnimateButton>
      <Button variant="contained" fullWidth>
        Add new event
      </Button>
    </AnimateButton>
  );
}

export default CalendarAdd;
