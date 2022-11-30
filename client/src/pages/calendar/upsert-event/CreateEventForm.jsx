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
import { decodeToken } from "react-jwt";
import useMutationCreateOfficeHour from "../../../hooks/useMutationCreateOfficeHour";
import useStoreToken from "../../../hooks/useStoreToken";
import useStoreEvent from "../../../hooks/useStoreEvent";
import useStoreCourse from "../../../hooks/useStoreCourse";

const DAYS = [
  "Sunday",
  "Monday",
  "Tuesday",
  "Wednesday",
  "Thursday",
  "Friday",
  "Saturday",
];

const BUTTONS = [
  {
    id: 0,
    label: "Mon",
    value: "Monday",
  },
  {
    id: 1,
    label: "Tue",
    value: "Tuesday",
  },
  {
    id: 2,
    label: "Wed",
    value: "Wednesday",
  },
  {
    id: 3,
    label: "Thu",
    value: "Thursday",
  },
  {
    id: 4,
    label: "Fri",
    value: "Friday",
  },
  {
    id: 5,
    label: "Sat",
    value: "Saturday",
  },
  {
    id: 6,
    label: "Sun",
    value: "Sunday",
  },
];

// TODO: Need a route that retrieves registration types.
const registrationTypes = [
  {
    id: 0,
    label: "Regular",
    value: 0,
  },
  {
    id: 1,
    label: "Debugging",
    value: 1,
  },
];

/**
 * Component that represents the form that is used to create an event.
 * @returns A component representing the Create Event form.
 */
function CreateEventForm() {
  const token = useStoreToken((state) => state.token);
  const { id } = decodeToken(token);

  const course = useStoreCourse((state) => state.course);

  const start = useStoreEvent((state) => state.start);
  const end = useStoreEvent((state) => state.end);
  const location = useStoreEvent((state) => state.location);

  const { control, handleSubmit, watch } = useForm({
    defaultValues: {
      startDate: start ? DateTime.fromJSDate(start).toFormat("yyyy-MM-dd") : "",
      endDate: null,
      startTime: start
        ? DateTime.fromJSDate(start, { zone: "UTC" }).toLocaleString(
            DateTime.TIME_24_SIMPLE
          )
        : "",
      recurringEvent: false,
      endTime: end
        ? DateTime.fromJSDate(end, { zone: "UTC" }).toLocaleString(
            DateTime.TIME_24_SIMPLE
          )
        : "",
      location: location || "",
      days: [],
<<<<<<< HEAD
      //timeInterval: timeInterval || 10,
=======
>>>>>>> b255bfa196fcaf39d243b064efeb8ab1368da784
      feedback: true,
      registrationTypes: [0], // TODO: create event route should be altered
    },
    resolver: yupResolver(createEventSchema),
  });

  const recurring = watch("recurringEvent");

  const { mutate, isLoading } = useMutationCreateOfficeHour();

  const onSubmit = (data) => {
    const start = new Date(data.startDate);
    const startTime = data.startTime.split(":");
    start.setUTCHours(startTime[0]);
    start.setUTCMinutes(startTime[1]);
    let end = new Date(data.startDate);
    if (data.endDate !== null) {
      end = new Date(data.endDate);
    }
    const endTime = data.endTime.split(":");
    end.setUTCHours(endTime[0]);
    end.setUTCMinutes(endTime[1]);
    mutate({
      courseId: course.id,
      startTime: `${data.startTime}:00`,
      endTime: `${data.endTime}:00`,
      recurringEvent: data.recurringEvent,
      startDate: start,
      endDate: end,
      location: data.location,
      daysOfWeek: recurring ? data.days : [DAYS[data.startDate.getDay()]],
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
          <Stack direction="row" sx={{ width: "100%" }} spacing={3}>
            <FormCheckbox
              name="recurringEvent"
              control={control}
              label="Recurring event"
            />
            <FormCheckbox
              name="feedback"
              control={control}
              label="Would you like feedback?" //TODO need to update backend so we can have optional feedback
            />
          </Stack>
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
          {recurring && (
            <FormToggleButtonGroup
              name="days"
              control={control}
              buttons={BUTTONS}
            />
          )}
          <FormInputText name="location" control={control} label="Location" />
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
