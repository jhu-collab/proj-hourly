import { Stack, Typography } from "@mui/material";
import React from "react";
import Form from "../../../components/form-ui/Form";
import { useEventStore } from "../../../services/store";
import { getLocaleTime } from "../../../utils/helpers";

function RegisterForm({ handlePopupToggle }) {
  const { title, start, end } = useEventStore();

  const date = start.toLocaleDateString();

  const startTimeStr = start.toUTCString().substring(17, 22);
  const startTime = getLocaleTime(startTimeStr);

  const endTimeStr = end.toUTCString().substring(17, 22);
  const endTime = getLocaleTime(endTimeStr);

  return (
    <Form>
      <Stack alignItems="center" mt={2}>
        <Typography textAlign="center" variant="h4">
          You are about to register for <br /> <u> {title} </u> <br /> on{" "}
          <u> {date} </u> from{" "}
          <u>
            {" "}
            {startTime} to {endTime}{" "}
          </u>
        </Typography>
      </Stack>
    </Form>
  );
}

export default RegisterForm;
