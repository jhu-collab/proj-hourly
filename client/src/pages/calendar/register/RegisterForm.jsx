import { yupResolver } from "@hookform/resolvers/yup";
import Button from "@mui/material/Button";
import Stack from "@mui/material/Stack";
import Typography from "@mui/material/Typography";
import { useForm } from "react-hook-form";
import { useMutation, useQuery } from "react-query";
import { toast } from "react-toastify";
import Form from "../../../components/form-ui/Form";
import FormInputDropdown from "../../../components/form-ui/FormInputDropdown";
import Loader from "../../../components/Loader";
import { useEventStore, useLayoutStore } from "../../../services/store";
import { getTimeSlots, register } from "../../../utils/requests";
import { errorToast } from "../../../utils/toasts";
import { registerSchema } from "../../../utils/validators";
import useTheme from "@mui/material/styles/useTheme";
import { useMediaQuery } from "@mui/material";
import NiceModal from "@ebay/nice-modal-react";
import { DateTime } from "luxon";

const getOptions = (timeSlots) => {
  const options = [];

  for (let i = 0; i < timeSlots.length; i++) {
    const localeStartTime = DateTime.fromISO(timeSlots[i].startTime, {
      zone: "utc",
    }).toLocaleString(DateTime.TIME_SIMPLE);
    const localeEndTime = DateTime.fromISO(timeSlots[i].endTime, {
      zone: "utc",
    }).toLocaleString(DateTime.TIME_SIMPLE);
    options.push({
      id: i,
      label: `${localeStartTime} - ${localeEndTime}`,
      value: `${timeSlots[i].startTime} - ${timeSlots[i].endTime}`,
    });
  }

  return options;
};

/**
 * Component that represents the form that is used to register for a session.
 * @returns A component representing the Register form.
 */
function RegisterForm() {
  const theme = useTheme();
  const matchUpSm = useMediaQuery(theme.breakpoints.up("sm"));

  const setAnchorEl = useLayoutStore((state) => state.setEventAnchorEl);

  const { isLoading, data } = useQuery(["timeSlots"], getTimeSlots, {
    onError: (error) => {
      errorToast(error);
    },
  });

  const { mutate, isLoading: isLoadingMutate } = useMutation(register, {
    onSuccess: (data) => {
      const registration = data.registration;

      const date = DateTime.fromISO(registration.date, {
        zone: "utc",
      }).toLocaleString();
      const startTime = DateTime.fromISO(registration.startTime, {
        zone: "utc",
      }).toLocaleString(DateTime.TIME_SIMPLE);
      const endTime = DateTime.fromISO(registration.endTime, {
        zone: "utc",
      }).toLocaleString(DateTime.TIME_SIMPLE);

      NiceModal.hide("register-event");
      matchUpSm ? setAnchorEl() : NiceModal.hide("mobile-event-popup");
      toast.success(
        `Successfully registered for session on ${date} from 
         ${startTime} to ${endTime}`
      );
    },
    onError: (error) => {
      errorToast(error);
    },
  });

  const title = useEventStore((state) => state.title);
  const start = useEventStore((state) => state.start);
  const end = useEventStore((state) => state.end);
  const id = useEventStore((state) => state.id);

  const date = start.toDateString();
  const startTime = DateTime.fromJSDate(start, { zone: "utc" }).toLocaleString(
    DateTime.TIME_SIMPLE
  );
  const endTime = DateTime.fromJSDate(end, { zone: "utc" }).toLocaleString(
    DateTime.TIME_SIMPLE
  );

  const { control, handleSubmit } = useForm({
    defaultValues: {
      times: "",
    },
    resolver: yupResolver(registerSchema),
  });

  const onSubmit = (data) => {
    const [startTime, endTime] = data.times.split(" - ");
    mutate({
      officeHourId: id,
      startTime: startTime,
      endTime: endTime,
      date: DateTime.fromJSDate(start, { zone: "utc" }).toFormat("MM-dd-yyyy"),
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
