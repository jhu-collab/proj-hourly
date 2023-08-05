import { editLocationSchema } from "../../../utils/validators";
import Button from "@mui/material/Button";
import Stack from "@mui/material/Stack";
import { useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import Form from "../../../components/form-ui/Form";
import FormInputText from "../../../components/form-ui/FormInputText";
import Loader from "../../../components/Loader";
import FormCheckbox from "../../../components/form-ui/FormCheckbox";
import useStoreEvent from "../../../hooks/useStoreEvent";
import useMutationEditLocation from "../../../hooks/useMutationEditLocation";

/**
 * Component that represents the form that is used to edit a course event's location.
 * @returns A component representing the Edit Course Event Location form.
 */
function EditCourseEventLocationForm() {
  const location = useStoreEvent((state) => state.location);
  const isRemote = useStoreEvent((state) => state.isRemote);

  const { control, handleSubmit, watch } = useForm({
    defaultValues: {
      isRemote: isRemote,
      location: location || "",
    },
    resolver: yupResolver(editLocationSchema), // TODO: CHANGE THIS?
  });

  const { mutate, isLoading } = useMutationEditLocation(); // TODO: CHANGE THIS

  const onSubmit = (data) => {
    mutate({
        location: data.location,
        isRemote: data.isRemote
    });
  };

  return (
    <>
      <Form onSubmit={handleSubmit(onSubmit)}>
        <Stack direction="column" alignItems="center" spacing={3}>
          <Stack direction="row" sx={{ width: "100%" }} spacing={3}>
          </Stack>
          <FormInputText 
            name="location" 
            control={control} 
            label="Location" 
          />
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
      {isLoading && <Loader />}
    </>
  );
}

export default EditCourseEventLocationForm;