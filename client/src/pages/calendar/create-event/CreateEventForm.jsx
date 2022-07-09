import React from "react";
import { createEventSchema } from "../../../utils/validators";
import { Button, Stack, useTheme } from "@mui/material";
import { useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import Form from "../../../components/form-ui/Form";
import FormInputText from "../../../components/form-ui/FormInputText";
import { toast } from "react-toastify";
import { getLocaleTime } from "../../../utils/helpers";
import useStore from "../../../services/store";
import ical from "ical-generator";

function CreateEventForm({ handlePopupToggle }) {
  const theme = useTheme();

  const {
    currentCourse,
    updateCurrentCourse,
    createEventDate,
    createEventStartTime,
    createEventEndTime,
  } = useStore();

  const { control, handleSubmit } = useForm({
    defaultValues: {
      date: createEventDate,
      startTime: createEventStartTime,
      endTime: createEventEndTime,
      location: "",
    },
    resolver: yupResolver(createEventSchema),
  });

  const onSubmit = (data) => {
    const calendar = ical(JSON.parse(currentCourse.calendar));
    const start = new Date(data.date.getTime());
    const end = new Date(data.date.getTime());

    const [startHours, startMin] = data.startTime.split(":");
    const [endHours, endMin] = data.endTime.split(":");

    start.setHours(startHours);
    start.setMinutes(startMin);
    end.setHours(endHours);
    end.setMinutes(endMin);

    calendar.createEvent({
      summary: "Bob's Office Hours",
      start: start,
      end: end,
      location: data.location,
    });

    const updatedCourse = currentCourse;
    updatedCourse.calendar = JSON.stringify(calendar);
    // Update course with new ics URL (TODO: This will be altered once backend is connected)
    updateCurrentCourse(updatedCourse);

    handlePopupToggle(); // Close popup
    toast.success(
      `Successfully created an event on ${data.date.toLocaleDateString()} from ${getLocaleTime(
        data.startTime
      )} to ${getLocaleTime(data.endTime)}`
    );
  };

  return (
    <Form onSubmit={handleSubmit(onSubmit)}>
      <Stack direction="column" spacing={theme.spacing(3)}>
        <FormInputText
          name="date"
          control={control}
          label="Date"
          type="date"
          InputLabelProps={{ shrink: true }}
        />
        <Stack direction="row" spacing={theme.spacing(3)}>
          <FormInputText
            name="startTime"
            control={control}
            label="Start Time"
            type="time"
            InputLabelProps={{ shrink: true }}
          />
          <FormInputText
            name="endTime"
            control={control}
            label="End Time"
            type="time"
            InputLabelProps={{ shrink: true }}
          />
        </Stack>
        <FormInputText name="location" control={control} label="Location" />
        <Button type="submit" variant="contained" fullWidth>
          Create
        </Button>
      </Stack>
    </Form>
  );
}

export default CreateEventForm;
