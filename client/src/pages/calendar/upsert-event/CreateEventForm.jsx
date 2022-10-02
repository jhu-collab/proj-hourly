import { createEventSchema } from "../../../utils/validators";
import Button from "@mui/material/Button";
import Stack from "@mui/material/Stack";
import { useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import Form from "../../../components/form-ui/Form";
import FormInputText from "../../../components/form-ui/FormInputText";
import {
  useEventStore,
  useCourseStore,
} from "../../../services/store";
import Loader from "../../../components/Loader";
import moment from "moment";
import ToggleRecurringDay from "./ToggleRecurringDay";
import FormCheckbox from "../../../components/form-ui/FormCheckbox";
import { decodeToken } from "react-jwt";
import useMutationCreateOfficeHour from "../../../hooks/useMutationCreateOfficeHour";
import useStoreToken from "../../../hooks/useStoreToken";

const DAYS = [
  "Sunday",
  "Monday",
  "Tuesday",
  "Wednesday",
  "Thursday",
  "Friday",
  "Saturday",
];

/**
 * Component that represents the form that is used to create an event.
 * @returns A component representing the Create Event form.
 */
function CreateEventForm() {
  const token = useStoreToken((state) => state.token);
  const { id } = decodeToken(token);

  const course = useCourseStore((state) => state.course);

  const start = useEventStore((state) => state.start);
  const end = useEventStore((state) => state.end);
  const location = useEventStore((state) => state.location);
  const days = useEventStore((state) => state.days);
  const timeInterval = useEventStore((state) => state.timeInterval);

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

  const recurring = watch("recurringEvent");

  const { mutate, isLoading } = useMutationCreateOfficeHour();

  const onSubmit = (data) => {
    mutate({
      courseId: course.id,
      startTime: `${data.startTime}:00`,
      endTime: `${data.endTime}:00`,
      recurringEvent: data.recurringEvent,
      startDate: moment(data.startDate).format("MM-DD-YYYY"),
      endDate: recurring
        ? moment(data.endDate).format("MM-DD-YYYY")
        : moment(data.startDate).format("MM-DD-YYYY"),
      location: data.location,
      daysOfWeek: recurring ? days : [DAYS[data.startDate.getDay()]],
      timeInterval: data.timeInterval,
      hosts: [id], // TOOD: For now, there will be no additional hosts
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
          <FormCheckbox
            name="recurringEvent"
            control={control}
            label="Recurring event"
          />
          <FormInputText
            name="startDate"
            control={control}
            label={recurring ? "Start Date" : "Date"}
            type="date"
            InputLabelProps={{ shrink: true }}
          />
          {recurring && (
            <FormInputText
              name="endDate"
              control={control}
              label="End Date"
              type="date"
              InputLabelProps={{ shrink: true }}
            />
          )}
          {recurring && <ToggleRecurringDay />}
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
            Create
          </Button>
        </Stack>
      </Form>
      {isLoading && <Loader />}
    </>
  );
}

export default CreateEventForm;
