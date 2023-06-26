import { createEventSchema } from "../../../utils/validators";
import Button from "@mui/material/Button";
import Stack from "@mui/material/Stack";
import { useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import Form from "../../../components/form-ui/Form";
import FormInputText from "../../../components/form-ui/FormInputText";
import Loader from "../../../components/Loader";
import FormToggleButtonGroup from "../../../components/form-ui/FormToggleButtonGroup";
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
 * Component that represents the form that is used to edit an event.
 * @returns A component representing the Edit Event form.
 */
function EditEventForm() {
  const start = useStoreEvent((state) => state.start);
  const oldEndDate = useStoreEvent((state) => state.start);
  const end = useStoreEvent((state) => state.end);
  const location = useStoreEvent((state) => state.location);
  const recurring = useStoreEvent((state) => state.recurring);
  const [editType, setEditType] = useState("all");

  const { control, handleSubmit, watch } = useForm({
    defaultValues: {
      startDate: start ? DateTime.fromJSDate(start).toFormat("yyyy-MM-dd") : "",
      endDate: null,
      startTime: start
        ? DateTime.fromJSDate(start).toLocaleString(DateTime.TIME_24_SIMPLE)
        : "",
      recurringEvent: false,
      days: [],
      endTime: end
        ? DateTime.fromJSDate(end).toLocaleString(DateTime.TIME_24_SIMPLE)
        : "",
      location: location || "",
      registrationTypes: [0],
    },
    resolver: yupResolver(createEventSchema),
  });

  const recurringEvent = watch("recurringEvent");

  const { mutate, isLoading } = useMutationEditEvent(recurringEvent);

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
          <Stack direction="row" sx={{ width: "100%" }} spacing={3}>
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
          {recurring && (
            <FormCheckbox
              name="recurringEvent"
              control={control}
              label="Recurring event"
            />
          )}
          {recurringEvent && (
            <RadioGroup
              value={editType}
              onChange={(event) => setEditType(event.target.value)}
            >
              <Stack direction="row" sx={{ width: "100%" }} spacing={1}>
              <FormControlLabel
                value="all"
                control={<Radio />}
                label="This event and future events"
              />
              <FormControlLabel
                value="futureOnly"
                control={<Radio />}
                label="Future events only"
              />
              </Stack>
            </RadioGroup>
          )}
          <FormInputText
            name="startDate"
            control={control}
            label={recurringEvent ? "Start Date" : "Date"}
            type="date"
            InputLabelProps={{ shrink: true }}
          />
          {recurringEvent && (
            <FormInputText
              name="endDate"
              control={control}
              label="End Date"
              type="date"
              InputLabelProps={{ shrink: true }}
            />
          )}
          {recurringEvent && (
            <FormToggleButtonGroup
              name="days"
              control={control}
              buttons={BUTTONS}
              color="primary"
            />
          )}
          <FormInputText name="location" control={control} label="Location" />
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

export default EditEventForm;
