import { createEventSchema } from "../../../utils/validators";
import Button from "@mui/material/Button";
import Stack from "@mui/material/Stack";
import useTheme from "@mui/material/styles/useTheme";
import { useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import Form from "../../../components/form-ui/Form";
import FormInputText from "../../../components/form-ui/FormInputText";
import { toast } from "react-toastify";
import useStore, { useEventStore } from "../../../services/store";
import { useMutation, useQueryClient } from "react-query";
import { createOfficeHour } from "../../../utils/requests";
import Loader from "../../../components/Loader";
import { errorToast } from "../../../utils/toasts";
import moment from "moment";

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
 * @param {*} handlePopupToggle function that toggles whether the popup is open
 * @param {String} type String that decides when this is creating or editing an
 *                      event
 * @returns A component representing the Upsert Event form.
 */
function UpsertEventForm({ handlePopupToggle, type }) {
  const theme = useTheme();
  const queryClient = useQueryClient();

  const { userId, currentCourse } = useStore();

  const { start, end, location } = useEventStore();

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
      handlePopupToggle();
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
      courseId: currentCourse.id,
      startTime: `${data.startTime}:00`,
      endTime: `${data.endTime}:00`,
      recurringEvent: false, // TODO: For now, the default is false
      startDate: moment(data.date).format("MM-DD-YYYY"),
      endDate: moment(data.date).format("MM-DD-YYYY"),
      location: data.location,
      daysOfWeek: [DAYS[data.date.getDay()]], // TODO: Will need to be altered later
      timeInterval: 10, // TODO: For now, the default is 10,
      hosts: [userId], // TOOD: For now, there will be no additional hosts
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
