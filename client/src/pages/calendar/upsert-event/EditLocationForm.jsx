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
import useStoreEvent from "../../../hooks/useStoreEvent";
import useMutationEditLocation from "../../../hooks/useMutationEditLocation";

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

/**
 * Component that represents the form that is used to edit an event.
 * @returns A component representing the Edit Event form.
 */
function EditLocationForm() {
  const location = useStoreEvent((state) => state.location);
  const remote = useStoreEvent((state) => state.remote);

  const { control, handleSubmit, watch } = useForm({
    defaultValues: {
      remote: remote,
      location: location || "",
    },
    resolver: yupResolver(createEventSchema),
  });

  const { mutate, isLoading } = useMutationEditLocation();

  const onSubmit = (data) => {
    mutate({
        location: data.location,
        remote: data.remote
    });
  };

  return (
    <>
      <Form onSubmit={handleSubmit(onSubmit)}>
        <Stack direction="column" alignItems="center" spacing={3}>
          <Stack direction="row" sx={{ width: "100%" }} spacing={3}>
          </Stack>
          <FormInputText name="location" control={control} label="Location" />
          <FormCheckbox
              name="remote"
              control = {control}
              label="Remote"
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

export default EditLocationForm;
