import { yupResolver } from "@hookform/resolvers/yup";
import Button from "@mui/material/Button";
import Stack from "@mui/material/Stack";
import Typography from "@mui/material/Typography";
import moment from "moment";
import { useForm } from "react-hook-form";
import { useMutation, useQuery } from "react-query";
import { toast } from "react-toastify";
import Form from "../../../components/form-ui/Form";
import FormInputDropdown from "../../../components/form-ui/FormInputDropdown";
import Loader from "../../../components/Loader";
import { useEventStore } from "../../../services/store";
import { getTimeSlots, register } from "../../../utils/requests";
import { errorToast } from "../../../utils/toasts";
import { registerSchema } from "../../../utils/validators";

const getOptions = (timeSlots) => {
  const options = [];

  for (let i = 0; i < timeSlots.length; i++) {
    const localeStartTime = moment(timeSlots[i].start, "hh:mm").format("LT");
    const localeEndTime = moment(timeSlots[i].end, "hh:mm").format("LT");
    options.push({
      id: i,
      label: `${localeStartTime} - ${localeEndTime}`,
      value: `${timeSlots[i].start} - ${timeSlots[i].end}`,
    });
  }

  return options;
};

/**
 * Component that represents the form that is used to register for a session.
 * @param {*} handlePopupToggle function that toggles whether the popup is open
 * @param {*} handlePopoverClose function that closes the EventPopover
 * @returns A component representing the Register form.
 */
function RegisterForm({ handlePopupToggle, handlePopoverClose }) {
  const { isLoading, data } = useQuery(["timeSlots"], getTimeSlots, {
    onError: (error) => {
      errorToast(error);
    },
  });

  const { mutate, isLoading: isLoadingMutate } = useMutation(register, {
    onSuccess: (data) => {
      const registration = data.registration;

      const date = moment(registration.date).utc().format("L");
      const startTime = moment(registration.startTime).utc().format("LT");
      const endTime = moment(registration.endTime).utc().format("LT");

      handlePopupToggle();
      handlePopoverClose();
      toast.success(
        `Successfully registered for session on ${date} from 
         ${startTime} to ${endTime}`
      );
    },
    onError: (error) => {
      errorToast(error);
    },
  });

  const { title, start, end, description } = useEventStore();

  const date = start.toDateString();
  const startTime = moment(start).utc().format("LT");
  const endTime = moment(end).utc().format("LT");

  const { control, handleSubmit } = useForm({
    defaultValues: {
      times: "",
    },
    resolver: yupResolver(registerSchema),
  });

  const onSubmit = (data) => {
    const [startTime, endTime] = data.times.split(" - ");
    mutate({
      officeHourId: description.id,
      startTime: startTime,
      endTime: endTime,
      date: moment(start).format("MM-DD-YYYY"),
    });
  };

  if (isLoading) {
    return <Loader />;
  }

  return (
    <>
      <Form onSubmit={handleSubmit(onSubmit)}>
        <Stack alignItems="center" mt={2} direction="column" spacing={3}>
          <Typography textAlign="center" variant="h4">
            You are about to register for <br /> <u> {title} </u> <br /> on{" "}
            <u> {date} </u> from{" "}
            <u>
              {" "}
              {startTime} to {endTime}{" "}
            </u>
          </Typography>
          <FormInputDropdown
            name="times"
            control={control}
            label="Available Time Slots"
            options={getOptions(data.timeSlots)}
          />
          <Button
            type="submit"
            variant="contained"
            fullWidth
            disabled={isLoadingMutate}
          >
            Submit
          </Button>
        </Stack>
      </Form>
      {isLoadingMutate && <Loader />}
    </>
  );
}

export default RegisterForm;
