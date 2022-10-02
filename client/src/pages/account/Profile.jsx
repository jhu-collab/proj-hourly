import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import * as yup from "yup";
import Form from "../../components/form-ui/Form";
import FormInputText from "../../components/form-ui/FormInputText";
import Button from "@mui/material/Button";
import Stack from "@mui/material/Stack";
import AnimateButton from "../../components/AnimateButton";
import { useLayoutStore } from "../../services/store";
import { decodeToken } from "react-jwt";
import useStoreToken from "../../hooks/useStoreToken";

const schema = yup.object({
  id: yup.number().transform((val) => Number(val)),
  username: yup.string().min(1, "Username cannot be empty"),
  firstName: yup.string().min(1, "First name cannot be empty"),
  preferredName: yup.string(),
  lastName: yup.string().min(1, "Last name cannot be empty"),
  email: yup.string().email("Invalid email"),
  role: yup.string(),
});

yup;

function Profile() {
  const [edit, setEdit] = useState(false);
  const token = useStoreToken((state) => state.token);
  //TODO: This will later be added as query using the react-query package
  const { id, userName, firstName, preferredName, lastName, email, role } =
    decodeToken(token);

  const selectSidebarItem = useLayoutStore((state) => state.selectSidebarItem);

  // TODO: We need backend routes that can retrieve information about
  // a user and one that allows a user to modify their account details
  // const { isLoading, error, data } = useQueryUser();
  // const { userMutation } = useMutationUser();
  useEffect(() => {
    selectSidebarItem("");
  });

  const { control, handleSubmit } = useForm({
    defaultValues: {
      id: id,
      username: userName,
      firstName: firstName,
      preferredName: preferredName,
      lastName: lastName,
      email: email,
      role: role,
    },
    resolver: yupResolver(schema),
  });

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
