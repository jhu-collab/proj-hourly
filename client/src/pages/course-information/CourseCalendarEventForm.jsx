import Button from "@mui/material/Button";
import Stack from "@mui/material/Stack";
import { useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import Form from "../../components/form-ui/Form";
import FormInputText from "../../components/form-ui/FormInputText";
import Loader from "../../components/Loader";
import FormToggleButtonGroup from "../../components/form-ui/FormToggleButtonGroup";
import { DateTime } from "luxon";
import FormCheckbox from "../../components/form-ui/FormCheckbox";
import { decodeToken } from "react-jwt";
import useMutationCreateOfficeHour from "../../hooks/useMutationCreateOfficeHour";
import useStoreToken from "../../hooks/useStoreToken";
import useStoreCourse from "../../hooks/useStoreCourse";
import useStoreEvent from "../../hooks/useStoreEvent";
import useMutationCreateCourseCalendarEvent from "../../hooks/useMutationCreateCourseCalendarEvent";
import { createEventSchema } from "../../utils/validators";
import { createCourseEventSchema } from "../../utils/validators";

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

/**
 * Component that represents the form that is used to create a lecture.
 * @returns A component representing the LectureEvent form.
 */

function CourseCalendarEventForm() {
  const token = useStoreToken((state) => state.token);
  const { id } = decodeToken(token);

  const course = useStoreCourse((state) => state.course);
  const start = useStoreEvent((state) => state.start);
  const location = useStoreEvent((state) => state.location);
  const resources = useStoreEvent((state) => state.resources);

  const { control, handleSubmit, watch } = useForm({
    defaultValues: {
      recurringEvent: true,
      startDate: start ? DateTime.fromJSDate(start).toFormat("yyyy-MM-dd") : "",
      endDate: "",
      location: location || "",
      resources: resources || "",
    },
    resolver: yupResolver(createCourseEventSchema),
  });

  const recurring = watch("recurringEvent");

  const { mutate, isLoading } = useMutationCreateCourseCalendarEvent();

  const onSubmit = (data) => {
    console.log(data);
    const start = new Date(data.startDate);
    console.log(start);
    const end = new Date(data.endDate);
    console.log(end);
    mutate({
      courseId: course.id,
      /*recurringEvent: data.recurringEvent,*/
      begDate: start.toISOString(),
      endDate: end.toISOString(),
      location: data.location,
      daysOfWeek: recurring ? data.days : [DAYS[data.startDate.getDay()]],
      additionalInfo: data.resources,
      title: "Lecture Event- Change This", // TODO: CHANGE THIS
      isRemote: false, // TODO: CHANGE THIS
    });
  };

  return (
    <>
      <Form onSubmit={handleSubmit(onSubmit)}>
        <Stack direction="column" alignItems="center" spacing={3}>
          <Stack direction="row" spacing={3} alignItems="center">
            <FormCheckbox
              name="recurringEvent"
              control={control}
              label="Recurring event"
            />
          </Stack>
          <Stack direction="row" sx={{ width: "100%" }} spacing={3}>
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
          </Stack>
          {recurring && (
            <FormToggleButtonGroup
              name="days"
              control={control}
              buttons={BUTTONS}
            />
          )}
          <FormInputText name="location" control={control} label="Location" /> 
          <FormInputText
            name="resources"
            control={control}
            label="Additional Resources"
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

export default CourseCalendarEventForm;