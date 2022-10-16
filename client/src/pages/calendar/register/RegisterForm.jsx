import { yupResolver } from "@hookform/resolvers/yup";
import Button from "@mui/material/Button";
import Stack from "@mui/material/Stack";
import Typography from "@mui/material/Typography";
import { useForm } from "react-hook-form";
import Form from "../../../components/form-ui/Form";
import FormInputDropdown from "../../../components/form-ui/FormInputDropdown";
import Loader from "../../../components/Loader";
import { registerSchema } from "../../../utils/validators";
import { DateTime } from "luxon";
import useQueryTimeSlots from "../../../hooks/useQueryTimeSlots";
import useMutationRegister from "../../../hooks/useMutationRegister";
import useStoreEvent from "../../../hooks/useStoreEvent";
import { useEffect } from "react";

// TODO: Need route to retrieve registration types
const types = [
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
  const { isLoading, data } = useQueryTimeSlots();

  const { mutate, isLoading: isLoadingMutate } = useMutationRegister();

  const title = useStoreEvent((state) => state.title);
  const start = useStoreEvent((state) => state.start);
  const end = useStoreEvent((state) => state.end);
  const id = useStoreEvent((state) => state.id);

  const date = start.toDateString();
  const startTime = DateTime.fromJSDate(start, { zone: "utc" }).toLocaleString(
    DateTime.TIME_SIMPLE
  );
  const endTime = DateTime.fromJSDate(end, { zone: "utc" }).toLocaleString(
    DateTime.TIME_SIMPLE
  );

  const { control, handleSubmit, watch } = useForm({
    defaultValues: {
      type: "",
      times: "",
    },
    resolver: yupResolver(registerSchema),
  });

  const type = watch("type");

  // TODO: Time slots should be altered when registration type changes
  // useEffect(() => {
  //   console.log("Registration type changed!")
  // }, [type])

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
            name="type"
            control={control}
            label="Registration Type"
            options={types}
          />
          {type !== "" && (
            <>
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
            </>
          )}
        </Stack>
      </Form>
      {isLoadingMutate && <Loader />}
    </>
  );
}

export default RegisterForm;
