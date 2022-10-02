import { createEventSchema } from "../../../utils/validators";
import Button from "@mui/material/Button";
import Stack from "@mui/material/Stack";
import { useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import Form from "../../../components/form-ui/Form";
import FormInputText from "../../../components/form-ui/FormInputText";
import { useEventStore } from "../../../services/store";
import Loader from "../../../components/Loader";
import moment from "moment";
import ToggleRecurringDay from "./ToggleRecurringDay";
import FormCheckbox from "../../../components/form-ui/FormCheckbox";
import useMutationEditEvent from "../../../hooks/useMutationEditEvent";

/**
 * Component that represents the form that is used to edit an event.
 * @returns A component representing the Edit Event form.
 */
function EditEventForm() {
  const start = useEventStore((state) => state.start);
  const end = useEventStore((state) => state.end);
  const location = useEventStore((state) => state.location);
  const days = useEventStore((state) => state.days);
  const timeInterval = useEventStore((state) => state.timeInterval);
  const recurring = useEventStore((state) => state.recurring);

  const { control, handleSubmit, watch } = useForm({
    defaultValues: {
      startDate: start ? moment(start).format("YYYY-MM-DD") : "",
      endDate: null,
      startTime: start ? moment(start).utc().format("HH:mm") : "",
      recurringEvent: false,
      endTime: end ? moment(end).utc().format("HH:mm") : "",
      location: location || "",
      timeInterval: timeInterval || 10,
    },
    resolver: yupResolver(createEventSchema),
  });

  const recurringEvent = watch("recurringEvent");

  const { mutate, isLoading } = useMutationEditEvent(recurringEvent);

  const onSubmit = (data) => {
    recurringEvent
      ? mutate({
          startTime: `${data.startTime}:00`,
          endTime: `${data.endTime}:00`,
          startDate: moment(data.startDate).format("MM-DD-YYYY"),
          endDate: moment(data.endDate).format("MM-DD-YYYY"),
          location: data.location,
          daysOfWeek: days,
          timePerStudent: data.timeInterval,
          endDateOldOfficeHour: moment(data.startDate).format("MM-DD-YYYY"),
        })
      : mutate({
          startTime: `${data.startTime}:00`,
          endTime: `${data.endTime}:00`,
          location: data.location,
          timePerStudent: data.timeInterval,
        });
  };

  return (
    <>
      <Form onSubmit={handleSubmit(onSubmit)}>
        <Stack
          direction="column"
          alignItems="center"
          spacing={3}
        >
          <Stack
            direction="row"
            sx={{ width: "100%" }}
            spacing={3}
          >
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
            <FormInputText
              name="startDate"
              control={control}
              label={recurringEvent ? "Start Date" : "Date"}
              type="date"
              InputLabelProps={{ shrink: true }}
            />
          )}
          {recurringEvent && (
            <FormInputText
              name="endDate"
              control={control}
              label="End Date"
              type="date"
              InputLabelProps={{ shrink: true }}
            />
          )}
          {recurringEvent && <ToggleRecurringDay />}
          <FormInputText name="location" control={control} label="Location" />
          <FormInputText
            name="timeInterval"
            label="Time Limit Per Student in Minutes"
            control={control}
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

export default EditEventForm;
