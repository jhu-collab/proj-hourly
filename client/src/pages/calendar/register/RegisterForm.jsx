import { yupResolver } from "@hookform/resolvers/yup";
import { Button, Stack, Typography } from "@mui/material";
import React from "react";
import { useForm } from "react-hook-form";
import Form from "../../../components/form-ui/Form";
import FormInputDropdown from "../../../components/form-ui/FormInputDropdown";
import { useEventStore } from "../../../services/store";
import { getLocaleTime } from "../../../utils/helpers";
import { registerSchema } from "../../../utils/validators";

const options = [
  {
    id: "1",
    label: "10:30 AM - 10:40 AM",
    value: "10:30 AM - 10:40 AM",
  },
  {
    id: "2",
    label: "10:40 AM - 10:50 AM",
    value: "10:40 AM - 10:50 AM",
  },
  {
    id: "3",
    label: "10:50 AM - 11:00 AM",
    value: "10:50 AM - 11:00 AM",
  },
  {
    id: "4",
    label: "11:00 AM - 11:10 AM",
    value: "11:00 AM - 11:10 AM",
  },
];

function RegisterForm({ handlePopupToggle }) {
  const { title, start, end } = useEventStore();

  const date = start.toLocaleDateString();

  const startTimeStr = start.toUTCString().substring(17, 22);
  const startTime = getLocaleTime(startTimeStr);

  const endTimeStr = end.toUTCString().substring(17, 22);
  const endTime = getLocaleTime(endTimeStr);

  const { control, handleSubmit } = useForm({
    defaultValues: {
      times: "",
    },
    resolver: yupResolver(registerSchema),
  });

  const onSubmit = (data) => {
    handlePopupToggle();
  };

  return (
    <Form onSubmit={handleSubmit(onSubmit)}>
      <Stack alignItems="center" mt={2} direction="column" spacing={3}>
        <Typography textAlign="center" variant="h4">
          You are about to register for <br /> <u> {title} </u> <br /> on{" "}
          <u> {date} </u> from{" "}
          <u>
            {" "}
            {startTime} to {endTime}{" "}
          </u>
        </Typography>
        <FormInputDropdown
          name="times"
          control={control}
          label="Available Time Slots"
          options={options}
        />
        <Button
          type="submit"
          variant="contained"
          fullWidth
          // disabled={isLoading}
        >
          Submit
        </Button>
      </Stack>
    </Form>
  );
}

export default RegisterForm;
