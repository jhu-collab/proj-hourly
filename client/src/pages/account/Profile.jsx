import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import Form from "../../components/form-ui/Form";
import FormInputText from "../../components/form-ui/FormInputText";
import Button from "@mui/material/Button";
import Stack from "@mui/material/Stack";
import AnimateButton from "../../components/AnimateButton";
import { decodeToken } from "react-jwt";
import useStoreToken from "../../hooks/useStoreToken";
import useStoreLayout from "../../hooks/useStoreLayout";
import { profileSchema, changePasswordSchema } from "../../utils/validators";
import DeleteAccountAction from "./DeleteAccountAction";
import useAuthChangePassword from "../../hooks/useAuthChangePassword";
function Profile() {
  const [edit, setEdit] = useState(false);
  const token = useStoreToken((state) => state.token);
  const { id, userName, firstName, preferredName, lastName, email, role } =
    decodeToken(token);
  const selectSidebarItem = useStoreLayout((state) => state.selectSidebarItem);

  const { changePassword } = useAuthChangePassword();

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
      preferredName: preferredName || "",
      lastName: lastName,
      email: email,
      role: role,
    },
    resolver: yupResolver(profileSchema),
  });

  const { control: passwordControl, handleSubmit: passwordHandleSubmit } =
    useForm({
      defaultValues: {
        originalPassword: "",
        newPassword: "",
        confirmNewPassword: "",
      },
      resolver: yupResolver(changePasswordSchema),
    });

  const onSubmit = (data) => {
    setEdit(false);
  };

  const onSubmitPasswordChange = (data) => {
    changePassword({
      oldPassword: data.originalPassword,
      newPassword: data.newPassword,
    });
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
    <Stack spacing={4}>
      <Form onSubmit={handleSubmit(onSubmit)}>
        <Stack spacing={4}>
          <FormInputText
            disabled
            name="firstName"
            control={control}
            label="First Name"
            InputLabelProps={{
              style: { backgroundColor: "rgba(255,255,255,0)" },
            }}
            sx={{ backgroundColor: "background.paper" }}
          />
          <FormInputText
            disabled={!edit}
            name="preferredName"
            control={control}
            label="Preferred Name"
            InputLabelProps={{
              style: { backgroundColor: "rgba(255,255,255,0)" },
            }}
            sx={{ backgroundColor: "background.paper" }}
          />
          <FormInputText
            disabled
            name="lastName"
            control={control}
            label="Last Name"
            InputLabelProps={{
              style: { backgroundColor: "rgba(255,255,255,0)" },
            }}
            sx={{ backgroundColor: "background.paper" }}
          />
          <FormInputText
            disabled
            name="role"
            control={control}
            label="Role"
            sx={{ backgroundColor: "background.paper" }}
            InputLabelProps={{
              style: { backgroundColor: "rgba(255,255,255,0)" },
            }}
          />
        </Stack>
      </Form>
      <DeleteAccountAction userid={id} />
      <Form onSubmit={passwordHandleSubmit(onSubmitPasswordChange)}>
        <Stack spacing={4}>
          <FormInputText
            name="originalPassword"
            control={passwordControl}
            variant="outlined"
            label="Old Password"
            type="password"
            fullWidth
            sx={{ backgroundColor: "background.paper" }}
            InputLabelProps={{
              style: { backgroundColor: "rgba(255,255,255,0)" },
            }}
          />
          <FormInputText
            name="newPassword"
            control={passwordControl}
            variant="outlined"
            label="New Password"
            type="password"
            fullWidth
            sx={{ backgroundColor: "background.paper" }}
            InputLabelProps={{
              style: { backgroundColor: "rgba(255,255,255,0)" },
            }}
          />
          <FormInputText
            name="confirmNewPassword"
            control={passwordControl}
            variant="outlined"
            label="Confirm New Password"
            type="password"
            fullWidth
            sx={{ backgroundColor: "background.paper" }}
            InputLabelProps={{
              style: { backgroundColor: "rgba(255,255,255,0)" },
            }}
          />
          <Button type="submit" variant="contained" color="primary">
            Change Password
          </Button>
        </Stack>
      </Form>
    </Stack>
  );
}

export default Profile;
