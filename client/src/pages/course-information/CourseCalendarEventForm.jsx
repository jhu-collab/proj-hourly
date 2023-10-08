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
import useStoreToken from "../../hooks/useStoreToken";
import useStoreCourse from "../../hooks/useStoreCourse";
import useStoreEvent from "../../hooks/useStoreEvent";
import useMutationCreateCourseCalendarEvent from "../../hooks/useMutationCreateCourseCalendarEvent";
import { createCourseEventSchema } from "../../utils/validators";
// import { createCourseEventAlternateSchema } from "../../utils/validators";
import useMutationDeleteCourseCalendarEvent from "../../hooks/useMutationDeleteCourseCalendarEvent";
import useQueryCourseEvents from "../../hooks/useQueryCourseEvents";
import { Typography } from "@mui/material";

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
  const course = useStoreCourse((state) => state.course);

  let recurring = true;

  const { control, handleSubmit, watch } = useForm({
    defaultValues: {
      recurringEvent: true,
      isRemote: false,
      startDate: "",
      endDate: "",
      location: "",
      resources: "",
      days: [],
    },
    resolver:
      yupResolver(createCourseEventSchema),
  });

  recurring = watch("recurringEvent");

  const { mutate: createMutate, isLoading: createIsLoading } =
    useMutationCreateCourseCalendarEvent("many");
  const { mutate: deleteMutate, isLoading: deleteIsLoading } =
    useMutationDeleteCourseCalendarEvent("all");
  const {
    isLoading: courseEventsIsLoading,
    error: courseEventsError,
    data: courseEventsData,
  } = useQueryCourseEvents();

  const onSubmit = (data) => {
    const start = new Date(data.startDate);
    let end = new Date(data.startDate);
    if (
      recurring &&
      (data.endDate !== null || data.endDate !== data.startDate)
    ) {
      end = new Date(data.endDate);
    }
    createMutate({
      courseId: course.id,
      begDate: start.toISOString(),
      endDate: end.toISOString(),
      location: data.location,
      daysOfWeek: recurring ? data.days : [DAYS[data.startDate.getDay()]],
      additionalInfo: data.resources,
      title: course.title + " Lecture",
      isRemote: data.isRemote,
    });
  };

  const onDelete = (event) => {
    event.preventDefault();
    deleteMutate();
  };

  const doEventsExist = () => {
    if (!courseEventsData) {
      return false;
    }

    if (!Array.isArray(courseEventsData.calendarEvents)) {
      return false;
    }

    if (courseEventsData.calendarEvents.length === 0) {
      return false;
    }

    return true;
  };

  return (
    <>
      {!doEventsExist() && (
        <Form onSubmit={handleSubmit(onSubmit)}>
          <Typography variant="h5" fontWeight={400}>
            Create course calendar events using this form:
          </Typography>
          <Stack direction="column" alignItems="center" spacing={3}>
            <Stack direction="row" spacing={3} alignItems="center">
              <FormCheckbox
                name="recurringEvent"
                control={control}
                label="Recurring event"
              />
              <FormCheckbox name="isRemote" control={control} label="Remote" />
            </Stack>
            <Stack direction="row" sx={{ width: "100%" }} spacing={3}>
              <FormInputText
                data-cy="create-start-date-text"
                name="startDate"
                control={control}
                label={recurring ? "Start Date" : "Date"}
                type="date"
                InputLabelProps={{ shrink: true }}
              />
              {recurring && (
                <FormInputText
                  data-cy="create-end-date-text"
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
            <FormInputText
              name="location"
              control={control}
              label="Location"
              data-cy="create-location-input"
            />
            <FormInputText
              name="resources"
              control={control}
              label="Additional Resources"
              multiline
              rows={4}
            />
            <Button
              data-cy="create-event-submit"
              type="submit"
              variant="contained"
              disabled={createIsLoading}
              fullWidth
            >
              Create
            </Button>
          </Stack>
        </Form>
      )}
      {doEventsExist() && (
        <Stack direction="column" spacing={3}>
          <Typography variant="h5" fontWeight={400}>
            Course calendar events already exist!
          </Typography>
          <Button
            onClick={onDelete}
            variant="contained"
            data-cy="delete-event-submit"
            disabled={deleteIsLoading}
            fullWidth
          >
            Delete
          </Button>
        </Stack>
      )}
      {(createIsLoading || deleteIsLoading || courseEventsIsLoading) && (
        <Loader />
      )}
    </>
  );
}

export default CourseCalendarEventForm;
