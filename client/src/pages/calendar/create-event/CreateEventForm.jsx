import { createEventSchema } from "../../../utils/validators";
import Button from "@mui/material/Button";
import Stack from "@mui/material/Stack";
import useTheme from "@mui/material/styles/useTheme";
import { useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import Form from "../../../components/form-ui/Form";
import FormInputText from "../../../components/form-ui/FormInputText";
import { toast } from "react-toastify";
import useStore from "../../../services/store";
import { useMutation, useQueryClient } from "react-query";
import { createOfficeHour } from "../../../utils/requests";
import Loader from "../../../components/Loader";
import { getLocaleTime } from "../../../utils/helpers";

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
 * @param {*} handlePopupToggle: function that toggles whether the popup is open
 * @returns A component representing the Create Event form.
 */
function CreateEventForm({ handlePopupToggle }) {
  const theme = useTheme();
  const queryClient = useQueryClient();

  const {
    userId,
    currentCourse,
    createEventDate,
    createEventStartTime,
    createEventEndTime,
  } = useStore();

  const { control, handleSubmit } = useForm({
    defaultValues: {
      date: createEventDate,
      startTime: createEventStartTime,
      endTime: createEventEndTime,
      location: "",
    },
    resolver: yupResolver(createEventSchema),
  });

  const { mutate, isLoading } = useMutation(createOfficeHour, {
    onSuccess: (data) => {
      const officeHour = data.officeHour;
      const date = new Date(officeHour.startDate).toDateString();

      const startTime = officeHour.startTime.substring(11, 19);
      const endTime = officeHour.endTime.substring(11, 19);

      queryClient.invalidateQueries(["officeHours"]);
      handlePopupToggle();
      // TODO: Will need to be refactored once we deal with recurring events.
      toast.success(
        `Successfully created office hour on ${date} from 
         ${getLocaleTime(startTime)} to ${getLocaleTime(endTime)}`
      );
    },
    onError: (error) => {
      toast.error("An error has occurred: " + error.message);
    },
  });

  const onSubmit = (data) => {
    mutate({
      courseId: currentCourse.id,
      startTime: `${data.startTime}:00`,
      endTime: `${data.endTime}:00`,
      recurringEvent: false, // TODO: For now, the default is false
      startDate: data.date.toISOString().split("T")[0].replace(/-/g, "/"),
      endDate: data.date.toISOString().split("T")[0].replace(/-/g, "/"),
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
            Create
          </Button>
        </Stack>
      </Form>
      {isLoading && <Loader />}
    </>
  );
}

export default CreateEventForm;
