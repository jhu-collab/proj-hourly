import { yupResolver } from "@hookform/resolvers/yup";
import { Button, Stack, Typography } from "@mui/material";
import React from "react";
import { useForm } from "react-hook-form";
import { useMutation, useQuery } from "react-query";
import { toast } from "react-toastify";
import Form from "../../../components/form-ui/Form";
import FormInputDropdown from "../../../components/form-ui/FormInputDropdown";
import Loader from "../../../components/Loader";
import { useEventStore } from "../../../services/store";
import { getIsoDate, getLocaleTime } from "../../../utils/helpers";
import { getTimeSlots, register } from "../../../utils/requests";
import { registerSchema } from "../../../utils/validators";

const getOptions = (timeSlots) => {
  const options = [];

  for (let i = 0; i < timeSlots.length; i++) {
    const localeStartTime = getLocaleTime(timeSlots[i].start);
    const localeEndTime = getLocaleTime(timeSlots[i].end);
    options.push({
      id: i,
      label: `${localeStartTime} - ${localeEndTime}`,
      value: `${timeSlots[i].start} - ${timeSlots[i].end}`,
    });
  }

  return options;
};

function RegisterForm({ handlePopupToggle, handlePopoverClose }) {
  const { isLoading, data } = useQuery(["timeSlots"], getTimeSlots, {
    onError: (error) => {
      toast.error("An error has occurred: " + error.message);
    },
  });

  const { mutate, isLoading: isLoadingMutate } = useMutation(register, {
    onSuccess: (data) => {
      const registration = data.registration;
      const date = new Date(registration.date).toLocaleDateString();

      const startTime = registration.startTime.substring(11, 19);
      const endTime = registration.endTime.substring(11, 19);

      handlePopupToggle();
      handlePopoverClose();
      toast.success(
        `Successfully registered for session on ${date} from 
         ${getLocaleTime(startTime)} to ${getLocaleTime(endTime)}`
      );
    },
    onError: (error) => {
      toast.error("An error has occurred: " + error.message);
    },
  });

  const { title, start, end, description } = useEventStore();

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
    const [startTime, endTime] = data.times.split(" - ");
    mutate({
      officeHourId: description.id,
      startTime: startTime,
      endTime: endTime,
      date: getIsoDate(start),
    });
  };

  if (isLoading) {
    return <Loader />;
  }

  return (
    <>
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
            options={getOptions(data.timeSlots)}
          />
          <Button
            type="submit"
            variant="contained"
            fullWidth
            disabled={isLoadingMutate}
          >
            Submit
          </Button>
        </Stack>
      </Form>
      {isLoadingMutate && <Loader />}
    </>
  );
}

export default RegisterForm;
