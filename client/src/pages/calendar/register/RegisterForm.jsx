import { yupResolver } from "@hookform/resolvers/yup";
import Button from "@mui/material/Button";
import Stack from "@mui/material/Stack";
import Typography from "@mui/material/Typography";
import Box from "@mui/material/Box";
import Chip from "@mui/material/Chip";
import { useForm } from "react-hook-form";
import Form from "../../../components/form-ui/Form";
import FormInputDropdown from "../../../components/form-ui/FormInputDropdown";
import Loader from "../../../components/Loader";
import { registerSchema } from "../../../utils/validators";
import { DateTime } from "luxon";
import useQueryTimeSlots from "../../../hooks/useQueryTimeSlots";
import useMutationRegister from "../../../hooks/useMutationRegister";
import useStoreEvent from "../../../hooks/useStoreEvent";
import useQueryTopics from "../../../hooks/useQueryTopics";

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
      value: `${DateTime.fromISO(timeSlots[i].startTime, {
        zone: "utc",
      }).toFormat("TT")} - ${DateTime.fromISO(timeSlots[i].endTime, {
        zone: "utc",
      }).toFormat("TT")}`,
    });
  }

  return options;
};

const getTopicOptions = (topics) => {
  const options = [];

  for (let i = 0; i < topics.length; i++) {
    options.push({
      id: topics[i].id,
      label: topics[i].value,
      value: topics[i].id,
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

  const { mutate, isLoading: isLoadingRegister } = useMutationRegister();

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
      topicIds: [],
    },
    resolver: yupResolver(registerSchema),
  });

  const type = watch("type");

  const { isLoading: isLoadingTopics, data: dataTopics } = useQueryTopics();

  const topicOptions = getTopicOptions(dataTopics || []);

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
      TopicIds: data.topicIds,
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
              <FormInputDropdown
                name="topicIds"
                control={control}
                label="Topics (optional)"
                options={topicOptions}
                multiple
                renderValue={(selected) => (
                  <Box sx={{ display: "flex", flexWrap: "wrap", gap: 0.5 }}>
                    {selected.map((value) => {
                      const item = topicOptions.find(
                        ({ value: v }) => v === value
                      );
                      return <Chip key={value} label={item.label} />;
                    })}
                  </Box>
                )}
              />
              <Button
                type="submit"
                variant="contained"
                fullWidth
                disabled={isLoadingRegister}
              >
                Submit
              </Button>
            </>
          )}
        </Stack>
      </Form>
      {isLoadingRegister && <Loader />}
    </>
  );
}

export default RegisterForm;
