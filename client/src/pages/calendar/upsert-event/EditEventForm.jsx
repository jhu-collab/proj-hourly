import { createEventSchema } from "../../../utils/validators";
import Button from "@mui/material/Button";
import Stack from "@mui/material/Stack";
import { useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import Form from "../../../components/form-ui/Form";
import FormInputText from "../../../components/form-ui/FormInputText";
import Loader from "../../../components/Loader";
import FormToggleButtonGroup from "../../../components/form-ui/FormToggleButtonGroup";
import { DateTime } from "luxon";
import FormCheckbox from "../../../components/form-ui/FormCheckbox";
import useMutationEditEvent from "../../../hooks/useMutationEditEvent";
import useStoreEvent from "../../../hooks/useStoreEvent";
import FormInputDropdown from "../../../components/form-ui/FormInputDropdown";
import Box from "@mui/material/Box";
import Chip from "@mui/material/Chip";

const BUTTONS = [
  {
    id: "0",
    label: "Mon",
    value: "Monday",
  },
  {
    id: "1",
    label: "Tue",
    value: "Tuesday",
  },
  {
    id: "2",
    label: "Wed",
    value: "Wednesday",
  },
  {
    id: "3",
    label: "Thu",
    value: "Thursday",
  },
  {
    id: "4",
    label: "Fri",
    value: "Friday",
  },
  {
    id: "5",
    label: "Sat",
    value: "Saturday",
  },
  {
    id: "6",
    label: "Sun",
    value: "Sunday",
  },
];

// TODO: Need a route that retrieves registration types.
const registrationTypes = [
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

/**
 * Component that represents the form that is used to edit an event.
 * @returns A component representing the Edit Event form.
 */
function EditEventForm() {
  const start = useStoreEvent((state) => state.start);
  const end = useStoreEvent((state) => state.end);
  const location = useStoreEvent((state) => state.location);
  const timeInterval = useStoreEvent((state) => state.timeInterval);
  const recurring = useStoreEvent((state) => state.recurring);

  const { control, handleSubmit, watch } = useForm({
    defaultValues: {
      startDate: start
        ? DateTime.fromJSDate(start, { zone: "utc" }).toFormat("yyyy-MM-dd")
        : "",
      endDate: null,
      startTime: start
        ? DateTime.fromJSDate(start, { zone: "utc" }).toLocaleString(
            DateTime.TIME_24_SIMPLE
          )
        : "",
      recurringEvent: false,
      days: [],
      endTime: end
        ? DateTime.fromJSDate(end, { zone: "utc" }).toLocaleString(
            DateTime.TIME_24_SIMPLE
          )
        : "",
      location: location || "",
      timeInterval: timeInterval || 10,
      registrationTypes: [0],
    },
    resolver: yupResolver(createEventSchema),
  });

  const recurringEvent = watch("recurringEvent");

  const { mutate, isLoading } = useMutationEditEvent(recurringEvent);

  const onSubmit = (data) => {
    recurringEvent
      ? mutate({
          startTime: `${data.startTime}:00`,
          endTime: `${data.endTime}:00`,
          startDate: DateTime.fromJSDate(data.startDate).toFormat("MM-dd-yyyy"),
          endDate: DateTime.fromJSDate(data.endDate).toFormat("MM-dd-yyyy"),
          location: data.location,
          daysOfWeek: data.days,
          timePerStudent: data.timeInterval,
          endDateOldOfficeHour: DateTime.fromJSDate(data.startDate).toFormat(
            "MM-dd-yyyy"
          ),
        })
      : mutate({
          startTime: `${data.startTime}:00`,
          endTime: `${data.endTime}:00`,
          location: data.location,
          timePerStudent: data.timeInterval,
        });
  };

  return (
    <>
      <Form onSubmit={handleSubmit(onSubmit)}>
        <Stack direction="column" alignItems="center" spacing={3}>
          <Stack direction="row" sx={{ width: "100%" }} spacing={3}>
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
          {recurring && (
            <FormCheckbox
              name="recurringEvent"
              control={control}
              label="Recurring event"
            />
          )}
          {recurringEvent && (
            <FormInputText
              name="startDate"
              control={control}
              label={recurringEvent ? "Start Date" : "Date"}
              type="date"
              InputLabelProps={{ shrink: true }}
            />
          )}
          {recurringEvent && (
            <FormInputText
              name="endDate"
              control={control}
              label="End Date"
              type="date"
              InputLabelProps={{ shrink: true }}
            />
          )}
          {recurringEvent && (
            <FormToggleButtonGroup
              name="days"
              control={control}
              buttons={BUTTONS}
              color="primary"
            />
          )}
          <FormInputText name="location" control={control} label="Location" />
          <FormInputText
            name="timeInterval"
            label="Time Limit Per Student in Minutes"
            control={control}
          />
          <FormInputDropdown
            name="registrationTypes"
            control={control}
            label="Registration Type(s)"
            options={registrationTypes}
            multiple
            renderValue={(selected) => (
              <Box sx={{ display: "flex", flexWrap: "wrap", gap: 0.5 }}>
                {selected.map((value) => {
                  const item = registrationTypes.find(
                    ({ value: v }) => v === value
                  );
                  return (
                    <Chip
                      key={value}
                      label={item.label}
                      sx={{
                        color: "text.primary",
                        backgroundColor: "secondary.main",
                        borderColor: "secondary.main",
                      }}
                    />
                  );
                })}
              </Box>
            )}
          />
          <Button
            type="submit"
            variant="contained"
            disabled={isLoading}
            fullWidth
          >
            Update
          </Button>
        </Stack>
      </Form>
      {isLoading && <Loader />}
    </>
  );
}

export default EditEventForm;
