import { DateTime } from "luxon";
import FormCheckbox from "../../../components/form-ui/FormCheckbox";
import useMutationEditEvent from "../../../hooks/useMutationEditEvent";
import useStoreEvent from "../../../hooks/useStoreEvent";
import { useState } from "react";
import Radio from "@mui/material/Radio";
import RadioGroup from "@mui/material/RadioGroup";
import FormControlLabel from "@mui/material/FormControlLabel";

const BUTTONS = [
  {
    id: "0",
    label: "Mon",
    value: "Monday",
  },
  {
    id: "1",
    label: "Tue",
    value: "Tuesday",
  },
  {
    id: "2",
    label: "Wed",
    value: "Wednesday",
  },
  {
    id: "3",
    label: "Thu",
    value: "Thursday",
  },
  {
    id: "4",
    label: "Fri",
    value: "Friday",
  },
  {
    id: "5",
    label: "Sat",
    value: "Saturday",
  },
  {
    id: "6",
    label: "Sun",
    value: "Sunday",
  },
];

/**
 * Component that represents the form that is used to edit a course event.
 * @returns A component representing the Edit Course Event form.
 */
function EditCourseEventForm() {
  const title = useStoreEvent((state) => state.title); 
  const date = useStoreEvent((state) => state.start);
  const location = useStoreEvent((state) => state.location);
  const additionalResources = useStoreEvent((state) => state.location);

  const { control, handleSubmit, watch } = useForm({
    defaultValues: {
      title: title || "",
      date: date ? DateTime.fromJSDate(date).toFormat("yyyy-MM-dd") : "",
      location: location || "",
      additionalResources: resources || "",
    },
    resolver: yupResolver(createEventSchema), // TODO: UPDATE THIS
  });

  const { mutate, isLoading } = useMutationEditEvent(recurringEvent); // TODO: UPDATE THIS

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

    recurringEvent
      ? mutate({
          startDate: start.toISOString(),
          endDate: end.toISOString(),
          location: data.location,
          daysOfWeek: data.days,
          endDateOldOfficeHour: DateTime.fromJSDate((editType === "all" ? oldEndDate : start), {
            zone: "utc",
          }).toFormat("MM-dd-yyyy"),
          editAfterDate: true,
        })
      : mutate({
          startDate: start.toISOString(),
          endDate: end.toISOString(),
          location: data.location,
        });
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
          <FormInputText 
            name="location" 
            control={control} 
            label="Location" 
          />
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
            disabled={isLoading}
            fullWidth
          >
            Update
          </Button>
        </Stack>
      </Form>
      {isLoading && <Loader />}
    </>
  );
}

export default EditCourseEventForm;