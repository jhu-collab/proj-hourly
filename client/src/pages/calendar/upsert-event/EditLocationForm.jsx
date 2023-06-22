import { editLocationSchema } from "../../../utils/validators";
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

import IconButton from "@mui/material/IconButton";
import FormControlLabel from "@mui/material/FormControlLabel";
import Radio from "@mui/material/Radio";
import RadioGroup from "@mui/material/RadioGroup";
import ConfirmPopup, { confirmDialog } from "../../../components/ConfirmPopup";
import { useState } from "react";
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
  const start = useStoreEvent((state) => state.start);
  const recurring = useStoreEvent((state) => state.recurring);
  const location = useStoreEvent((state) => state.location);
  const isRemote = useStoreEvent((state) => state.isRemote);
  const [editType, setEditType] = useState("this");

  const { control, handleSubmit, watch } = useForm({
    defaultValues: {
      isRemote: isRemote,
      location: location || "",
    },
    resolver: yupResolver(editLocationSchema),
  });

  const recurringEvent = watch("recurringEvent");
  const { mutate, isLoading } = useMutationEditLocation(editType);

  const onSubmit = (data) => {
    recurring ?
    mutate({
        date: start.toISOString(),
        location: data.location,
        isRemote: data.isRemote
    })
    : mutate({
        location: data.location,
        isRemote: data.isRemote
    })
  };

  return (
    <>
      <Form onSubmit={handleSubmit(onSubmit)}>
        <Stack direction="column" alignItems="center" spacing={3}>
          <Stack direction="row" sx={{ width: "100%" }} spacing={3}>
          </Stack>
          {recurring && (
            <RadioGroup
              value={editType}
              onChange={(event) => setEditType(event.target.value)}
            >
              <Stack direction="row" sx={{ width: "100%" }} spacing={1}>
              <FormControlLabel
                value="this"
                control={<Radio />}
                label="This event only"
              />
              <FormControlLabel
                value="all"
                control={<Radio />}
                label="All events"
              />
              </Stack>
            </RadioGroup>
          )}
          <FormInputText name="location" control={control} label="Location" />
          
          <FormCheckbox
              name="isRemote"
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
      <Loader />
    </>
  );
}

export default EditLocationForm;
