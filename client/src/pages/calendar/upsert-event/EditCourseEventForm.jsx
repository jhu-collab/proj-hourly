import { createEventSchema } from "../../../utils/validators";
import Button from "@mui/material/Button";
import Stack from "@mui/material/Stack";
import { useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import Form from "../../../components/form-ui/Form";
import FormInputText from "../../../components/form-ui/FormInputText";
import Loader from "../../../components/Loader";
import { DateTime } from "luxon";
import useMutationEditEvent from "../../../hooks/useMutationEditEvent";
import useStoreEvent from "../../../hooks/useStoreEvent";
import { useState } from "react";

/**
 * Component that represents the form that is used to edit a course event.
 * @returns A component representing the Edit Course Event form.
 */
function EditCourseEventForm() {
  const title = useStoreEvent((state) => state.title);
  const date = useStoreEvent((state) => state.start);
  const location = useStoreEvent((state) => state.location);
  const resources = useStoreEvent((state) => state.location);

  const { control, handleSubmit, watch } = useForm({
    defaultValues: {
      title: title || "",
      date: date ? DateTime.fromJSDate(date).toFormat("yyyy-MM-dd") : "",
      location: location || "",
      additionalResources: resources || "",
    },
    resolver: yupResolver(createEventSchema), // TODO: UPDATE THIS
  });

  //const { mutate, isLoading } = useMutationEditEvent(recurringEvent); // TODO: UPDATE THIS

  // TODO: UPDATE THIS
  const onSubmit = (data) => {
    const start = new Date(data.startDate);
    const startTime = data.startTime.split(":");
    start.setHours(startTime[0]);
    start.setMinutes(startTime[1]);
    let end = new Date(data.startDate);
    if (data.endDate !== null) {
      end = new Date(data.endDate);
    }
    const endTime = data.endTime.split(":");
    end.setHours(endTime[0]);
    end.setMinutes(endTime[1]);

    /*recurringEvent
      ? mutate({
          startDate: start.toISOString(),
          endDate: end.toISOString(),
          location: data.location,
          daysOfWeek: data.days,
          endDateOldOfficeHour: DateTime.fromJSDate(
            editType === "all" ? oldEndDate : start,
            {
              zone: "utc",
            }
          ).toFormat("MM-dd-yyyy"),
          editAfterDate: true,
        })
      : mutate({
          startDate: start.toISOString(),
          endDate: end.toISOString(),
          location: data.location,
        });*/
  };

  return (
    <>
      <Form onSubmit={handleSubmit(onSubmit)}>
        <Stack direction="column" alignItems="center" spacing={3}>
          <FormInputText
            name="title"
            control={control}
            label="Agenda Description"
          />
          <FormInputText
            name="date"
            control={control}
            label="Date"
            type="date"
            InputLabelProps={{ shrink: true }}
          />
          <FormInputText name="location" control={control} label="Location" />
          <FormInputText
            name="resources"
            control={control}
            label="Additional Resources (optional)"
            multiline
            rows={4}
          />
          <Button
            type="submit"
            variant="contained"
            /*disabled={isLoading}*/ // TODO
            fullWidth
          >
            Update
          </Button>
        </Stack>
      </Form>
      // TODO: ADD IS LOADING & LOADER BACK IN
    </>
  );
}

export default EditCourseEventForm;
