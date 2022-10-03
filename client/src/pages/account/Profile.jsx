import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import Form from "../../components/form-ui/Form";
import FormInputText from "../../components/form-ui/FormInputText";
import Button from "@mui/material/Button";
import Stack from "@mui/material/Stack";
import AnimateButton from "../../components/AnimateButton";
import useStoreLayout from "../../hooks/useStoreLayout";
import useQueryUser from "../../hooks/useQueryUser";
import { profileSchema } from "../../utils/validators";

function Profile() {
  const [edit, setEdit] = useState(false);

  const selectSidebarItem = useStoreLayout((state) => state.selectSidebarItem);

  const { isLoading, error, data } = useQueryUser();

  // TODO: We need backend routes that can retrieve information
  // that allows a user to modify their account details
  // const { userMutation } = useMutationUser();
  useEffect(() => {
    selectSidebarItem("");
  });

  const { control, handleSubmit, setValue } = useForm({
    defaultValues: {
      id: "0",
      username: "",
      firstName: "",
      preferredName: "",
      lastName: "",
      email: "",
      role: "",
    },
    resolver: yupResolver(profileSchema),
  });

  useEffect(() => {
    if (!isLoading && !error) {
      setValue(data);
    }
  }, [isLoading, error, data]);

  const onSubmit = (data) => {
    setEdit(false);
  };

  const handleOnClickCancelBtn = (e) => {
    e.preventDefault();
    setEdit(false);
  };

  const handleOnClickEditBtn = (e) => {
    e.preventDefault();
    setEdit(true);
  };

  return (
    <Form onSubmit={handleSubmit(onSubmit)}>
      <Stack spacing={4}>
        <FormInputText
          disabled
          name="username"
          control={control}
          label="Username"
        />
        <FormInputText
          disabled
          name="firstName"
          control={control}
          label="First Name"
        />
        <FormInputText
          disabled={!edit}
          name="preferredName"
          control={control}
          label="Preferred Name"
        />
        <FormInputText
          disabled
          name="lastName"
          control={control}
          label="Last Name"
        />
        <FormInputText disabled name="role" control={control} label="Role" />
        <Stack direction="row" justifyContent="flex-end">
          {edit ? (
            <Stack direction="row" spacing={1}>
              <AnimateButton>
                <Button
                  variant="contained"
                  size="large"
                  color="error"
                  onClick={handleOnClickCancelBtn}
                >
                  Cancel
                </Button>
              </AnimateButton>
              <AnimateButton>
                <Button variant="contained" size="large" type="submit">
                  Submit
                </Button>
              </AnimateButton>
            </Stack>
          ) : (
            <AnimateButton>
              <Button
                variant="contained"
                size="large"
                onClick={handleOnClickEditBtn}
              >
                Edit
              </Button>
            </AnimateButton>
          )}
        </Stack>
      </Stack>
    </Form>
  );
}

export default Profile;
