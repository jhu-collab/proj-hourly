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
import { InputAdornment, TextField, useMediaQuery } from "@mui/material";
import NiceModal from "@ebay/nice-modal-react";
import { AccountCircle } from "@material-ui/icons";

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
 * Component that represents the form that is used to upsert an event.
 * @param {String} type String that decides when this is creating or editing an
 *                      event
 * @returns A component representing the Upsert Event form.
 */
function UpsertEventForm({ type }) {
  const theme = useTheme();
  const queryClient = useQueryClient();
  const matchUpSm = useMediaQuery(theme.breakpoints.up("sm"));

  const id = useAccountStore((state) => state.id);
  const course = useCourseStore((state) => state.course);

  const setAnchorEl = useLayoutStore((state) => state.setEventAnchorEl);

  const start = useEventStore((state) => state.start);
  const end = useEventStore((state) => state.end);
  const location = useEventStore((state) => state.location);

  const { control, handleSubmit } = useForm({
    defaultValues: {
      date: start ? moment(start).format("YYYY-MM-DD") : "",
      startTime: start ? moment(start).utc().format("HH:mm") : "",
      endTime: end ? moment(end).utc().format("HH:mm") : "",
      location: location || "",
    },
    resolver: yupResolver(createEventSchema),
  });

  // TODO: THis will need to be refactored once the route to
  // edit an existing office hour is created
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
      recurringEvent: false, // TODO: For now, the default is false
      startDate: moment(data.date).format("MM-DD-YYYY"),
      endDate: moment(data.date).format("MM-DD-YYYY"),
      location: data.location,
      daysOfWeek: [DAYS[data.date.getDay()]], // TODO: Will need to be altered later
      timeInterval: 10, // TODO: For now, the default is 10,
      hosts: [id], // TOOD: For now, there will be no additional hosts
    });
  };

  return (
    <>
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
          <TextField
            label="Max Participants"
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <AccountCircle />
                </InputAdornment>
              ),
            }}
            variant="standard"
          />
          <Button
            type="submit"
            variant="contained"
            disabled={isLoading}
            fullWidth
          >
            {type === "edit" ? "Update" : "Create"}
          </Button>
        </Stack>
      </Form>
      {isLoading && <Loader />}
    </>
  );
}

export default UpsertEventForm;
