import { createEventSchema } from "../../../utils/validators";
import Button from "@mui/material/Button";
import Stack from "@mui/material/Stack";
import useTheme from "@mui/material/styles/useTheme";
import { useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import Form from "../../../components/form-ui/Form";
import FormInputText from "../../../components/form-ui/FormInputText";
import { toast } from "react-toastify";
import {
  useEventStore,
  useAccountStore,
  useCourseStore,
  useLayoutStore,
} from "../../../services/store";
import { useMutation, useQueryClient } from "react-query";
import { createOfficeHour } from "../../../utils/requests";
import Loader from "../../../components/Loader";
import { errorToast } from "../../../utils/toasts";
import moment from "moment";
import { useMediaQuery } from "@mui/material";
import NiceModal from "@ebay/nice-modal-react";
import ToggleRecurringDay from "./ToggleRecurringDay";
import FormCheckbox from "../../../components/form-ui/FormCheckbox";

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
  const theme = useTheme();
  const queryClient = useQueryClient();
  const matchUpSm = useMediaQuery(theme.breakpoints.up("sm"));

  const id = useAccountStore((state) => state.id);
  const course = useCourseStore((state) => state.course);

  const setAnchorEl = useLayoutStore((state) => state.setEventAnchorEl);

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

  const { mutate, isLoading } = useMutation(createOfficeHour, {
    onSuccess: (data) => {
      const officeHour = data.officeHour;
      const date = moment(officeHour.startDate).utc().format("MM/DD/YYYY");
      const startTime = moment(officeHour.startTime).utc().format("LT");
      const endTime = moment(officeHour.endTime).utc().format("LT");

      queryClient.invalidateQueries(["officeHours"]);
      NiceModal.hide("upsert-event");
      matchUpSm ? setAnchorEl() : NiceModal.hide("mobile-event-popup");

      // TODO: Will need to be refactored once we deal with recurring events.
      toast.success(
        `Successfully created office hour on ${date} from 
           ${startTime} to ${endTime}`
      );
    },
    onError: (error) => {
      errorToast(error);
    },
  });

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
        <Stack
          direction="column"
          alignItems="center"
          spacing={theme.spacing(3)}
        >
          <Stack
            direction="row"
            sx={{ width: "100%" }}
            spacing={theme.spacing(3)}
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