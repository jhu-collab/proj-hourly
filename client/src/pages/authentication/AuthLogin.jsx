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
  const { isAuthenticated, signIn, signInAsUser, signInAsAdmin } = useAuth();
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
          {/* TODO: UNFINISHED FEATURE */}
          {/* <AnimateButton>
            <Button
              variant="contained"
              fullWidth
              size="large"
              onClick={() => signInAsAdmin()}
            >
              Sign in as Admin
            </Button>
          </AnimateButton> */}
        </Stack>
      ) : (
        <SingleSignOn />
      )}
      <Divider
        sx={{
          fontSize: "17px",
          "::before": { borderTop: "1px dashed rgba(30, 62, 102, 0.42)" },
          "::after": { borderTop: "1px dashed rgba(30, 62, 102, 0.42)" },
        }}
      >
        OR
      </Divider>
      <Form onSubmit={handleSubmit(onSubmit)}>
        <Stack spacing={2} marginTop={-0.5} alignItems="center">
          <FormInputText
            name="username"
            control={control}
            variant="standard"
            label="Username"
            InputLabelProps={{ shrink: true }}
          />
          <FormInputText
            name="password"
            control={control}
            variant="standard"
            label="Password"
            type="password"
            InputLabelProps={{ shrink: true }}
          />
          <AnimateButton>
            <Button
              type="submit"
              variant="contained"
              size="large"
              sx={{ fontSize: "17px", width: "107px" }}
            >
              Login
            </Button>
          </AnimateButton>
        </Stack>
      </Form>
    </Stack>
  );
}

export default AuthLogin;
