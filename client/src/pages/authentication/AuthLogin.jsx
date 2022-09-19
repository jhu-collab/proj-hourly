import Divider from "@mui/material/Divider";
import { useState } from "react";
import Typography from "@mui/material/Typography";
import Button from "@mui/material/Button";
import Stack from "@mui/material/Stack";
import AnimateButton from "../../components/AnimateButton";
import SingleSignOn from "./SingleSignOn";
import Form from "../../components/form-ui/Form";
import { useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import { loginSchema } from "../../utils/validators";
import FormInputText from "../../components/form-ui/FormInputText";
import useAuth from "../../hooks/useAuth";
import { Navigate } from "react-router-dom";


function AuthLogin() {
  const [value] = useState(import.meta.env.VITE_RUN_MODE);
  const { isAuthenticated, signIn, signInAsUser, signInAsAdmin } =
    useAuth();
  const { control, handleSubmit } = useForm({
    defaultValues: {
      username: "",
      password: "",
    },
    resolver: yupResolver(loginSchema),
  });

  if (isAuthenticated()) {
    return <Navigate to="/" replace={true} />;
  }

  const onSubmit = (data) => {
    signIn(data);
  };

  return (
    <Stack spacing={2}>
      {value === "local" ? (
        <Stack spacing={1}>
          <AnimateButton>
            <Button
              variant="contained"
              fullWidth
              size="large"
              onClick={() => signInAsUser()}
            >
              Sign in as User
            </Button>
          </AnimateButton>
          <AnimateButton>
            <Button
              variant="contained"
              fullWidth
              size="large"
              onClick={() => signInAsAdmin()}
            >
              Sign in as Admin
            </Button>
          </AnimateButton>
        </Stack>
      ) : (
        <SingleSignOn />
      )}

      <Divider label="Or continue with">
        Or continue with
      </Divider>
      <Form onSubmit={handleSubmit(onSubmit)}>
        <Stack spacing={3}>
          <FormInputText
            name="username"
            control={control}
            label="Username"
            placeholder="Enter your username"
          />
          <FormInputText
            name="password"
            control={control}
            label="Password"
            placeholder="Enter your password"
            type="password"
          />
          <Stack direction="row" spacing={1}>
            <Typography color="error">
              Unless admin required you to use this option, you should use JHU
              SSO to sign in.
            </Typography>
            <AnimateButton>
              <Button type="submit" variant="contained" fullWidth size="large">
                Login
              </Button>
            </AnimateButton>
          </Stack>
        </Stack>
      </Form>
    </Stack>
  );
}

export default AuthLogin;
