import Typography from "@mui/material/Typography";
import AuthWrapper from "./AuthWrapper";
import Button from "@mui/material/Button";
import Stack from "@mui/material/Stack";
import AnimateButton from "../../components/AnimateButton";
import Form from "../../components/form-ui/Form";
import { useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import { resetPasswordSchema } from "../../utils/validators";
import FormInputText from "../../components/form-ui/FormInputText";
import { Link } from "react-router-dom";
import { Navigate } from "react-router-dom";
import React from "react";
import { useLocation } from "react-router-dom";
import useAuthResetPassword from "../../hooks/useAuthResetPassword";
import { useState } from "react";

function ResetPassword() {
  const { isAuthenticated, resetPassword } = useAuthResetPassword();
  const { control, handleSubmit } = useForm({
    defaultValues: {
      password: "",
      confirmPassword: "",
    },
    resolver: yupResolver(resetPasswordSchema),
  });
  const [redirectToLogin, setRedirectToLogin] = useState(false);

  let location = useLocation();
  // Extract query parameters from location object
  let searchParams = new URLSearchParams(location.search);
  // Access individual query parameters using get method
  let id = searchParams.get("id");
  let email = searchParams.get("email");

  const onSubmit = (data) => {
    resetPassword({ password: data.password, id, email });
    setRedirectToLogin(true);
  };

  if (redirectToLogin) {
    return <Navigate to="/login" replace={true} />;
  }

  if (isAuthenticated()) {
    return <Navigate to="/" replace={true} />;
  }

  return (
    <AuthWrapper>
      <Stack spacing={2}>
        <Typography variant="h4" align="center" gutterBottom>
          Reset Password
        </Typography>
        <Form onSubmit={handleSubmit(onSubmit)}>
          <Stack spacing={2}>
            <FormInputText
              name="password"
              control={control}
              variant="outlined"
              label="Password"
              type="password"
              fullWidth
            />
            <FormInputText
              name="confirmPassword"
              control={control}
              variant="outlined"
              label="Confirm Password"
              type="password"
              fullWidth
            />
            <AnimateButton>
              <Button type="submit" variant="contained" size="large" fullWidth>
                Submit
              </Button>
            </AnimateButton>
          </Stack>
        </Form>
        <Typography variant="body1" align="center">
          Remember Your Password? <Link to="/login">Log in</Link>
        </Typography>
      </Stack>
    </AuthWrapper>
  );
}

export default ResetPassword;
