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
import useQueryRegistrationTypes from "../../../hooks/useQueryRegistrationTypes";
import { useEffect, useState } from "react";
import FormInputText from "../../../components/form-ui/FormInputText";

const getTimeSlotOptions = (timeSlotsPerType, type) => {
  const found = timeSlotsPerType.find((element) => element.type === type);

  if (!found) {
    return [];
  } else {
    const options = [];

    for (let i = 0; i < found.times.length; i++) {
      const localeStartTime = DateTime.fromISO(
        found.times[i].startTime
      ).toLocaleString(DateTime.TIME_SIMPLE);
      const localeEndTime = DateTime.fromISO(
        found.times[i].endTime
      ).toLocaleString(DateTime.TIME_SIMPLE);
      options.push({
        id: i,
        label: `${localeStartTime} - ${localeEndTime}`,
        value: `${DateTime.fromISO(found.times[i].startTime, {
          zone: "utc",
        }).toFormat("TT")} - ${DateTime.fromISO(found.times[i].endTime, {
          zone: "utc",
        }).toFormat("TT")}`,
      });
    }

    return options;
  }
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

const getRegTypeOptions = (registrationTypes) => {
  const options = [];

  for (let i = 0; i < registrationTypes.length; i++) {
    options.push({
      id: registrationTypes[i].id,
      label: registrationTypes[i].title,
      value: registrationTypes[i].title,
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
  const [timeSlots, setTimeSlots] = useState([]);

  const title = useStoreEvent((state) => state.title);
  const start = useStoreEvent((state) => state.start);
  const end = useStoreEvent((state) => state.end);
  const id = useStoreEvent((state) => state.id);

  const date = start.toDateString();
  const startTime = DateTime.fromJSDate(start).toLocaleString(
    DateTime.TIME_SIMPLE
  );
  const endTime = DateTime.fromJSDate(end).toLocaleString(DateTime.TIME_SIMPLE);

  const { control, handleSubmit, watch } = useForm({
    defaultValues: {
      type: "",
      times: "",
      question: "",
      topicIds: [],
    },
    resolver: yupResolver(registerSchema),
  });

  const type = watch("type");

  const { isLoading: isLoadingTopics, data: dataTopics } = useQueryTopics();
  const { isLoading: isLoadingRegTypes, data: dataRegTypes } =
    useQueryRegistrationTypes();

  const topicOptions = getTopicOptions(dataTopics || []);
  const registrationTypeOptions = getRegTypeOptions(dataRegTypes?.times || []);

  useEffect(() => {
    if (data?.timeSlotsPerType) {
      setTimeSlots(getTimeSlotOptions(data.timeSlotsPerType, type));
    }
  }, [type]);

  const onSubmit = (data) => {
    const [startTime, endTime] = data.times.split(" - ");
    let timeOptionId = -1;
    registrationTypeOptions.forEach((option) => {
      if (option.label === data.type) timeOptionId = option.id;
    });
    mutate({
      officeHourId: id,
      startTime: startTime,
      endTime: endTime,
      date: DateTime.fromJSDate(start, { zone: "utc" }).toFormat("MM-dd-yyyy"),
      question: data.question,
      TopicIds: data.topicIds,
      timeOptionId: timeOptionId,
    });
  };

  if (isLoading || isLoadingRegTypes || isLoadingTopics) {
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
            options={registrationTypeOptions}
          />
          {type !== "" && (
            <>
              <FormInputDropdown
                name="times"
                control={control}
                label="Available Time Slots"
                options={timeSlots}
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
                      if (Boolean(item))
                        return <Chip key={value} label={item.label} />;
                    })}
                  </Box>
                )}
              />
              <FormInputText
                name="question"
                control={control}
                label="Additional Notes (optional)"
                multiline
                rows={4}
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
