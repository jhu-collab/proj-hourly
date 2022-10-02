import { yupResolver } from "@hookform/resolvers/yup";
import Button from "@mui/material/Button";
import Stack from "@mui/material/Stack";
import Typography from "@mui/material/Typography";
import moment from "moment";
import { useForm } from "react-hook-form";
import Form from "../../../components/form-ui/Form";
import FormInputDropdown from "../../../components/form-ui/FormInputDropdown";
import Loader from "../../../components/Loader";
import { useEventStore } from "../../../services/store";
import { registerSchema } from "../../../utils/validators";
import useQueryTimeSlots from "../../../hooks/useQueryTimeSlots";
import useMutationRegister from "../../../hooks/useMutationRegister";

const getOptions = (timeSlots) => {
  const options = [];

  for (let i = 0; i < timeSlots.length; i++) {
    const localeStartTime = moment(timeSlots[i].startTime, "hh:mm")
      .utc()
      .format("LT");
    const localeEndTime = moment(timeSlots[i].endTime, "hh:mm")
      .utc()
      .format("LT");
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
  const { isLoading, data } = useQueryTimeSlots();

  const { mutate, isLoading: isLoadingMutate } = useMutationRegister();

  const title = useEventStore((state) => state.title);
  const start = useEventStore((state) => state.start);
  const end = useEventStore((state) => state.end);
  const id = useEventStore((state) => state.id);

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
      officeHourId: id,
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
