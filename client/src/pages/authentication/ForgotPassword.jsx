import Typography from "@mui/material/Typography";
import AuthWrapper from "./AuthWrapper";
import Button from "@mui/material/Button";
import Stack from "@mui/material/Stack";
import AnimateButton from "../../components/AnimateButton";
import Form from "../../components/form-ui/Form";
import { useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import { forgotPasswordSchema } from "../../utils/validators";
import FormInputText from "../../components/form-ui/FormInputText";
import { Link } from "react-router-dom";
import useAuthForgotPassword from "../../hooks/useAuthForgotPassword";
import { Navigate } from "react-router-dom";

function ForgotPassword() {
  const { isAuthenticated, forgotPassword } = useAuthForgotPassword();
  const { control, handleSubmit } = useForm({
    defaultValues: {
      username: "",
    },
    resolver: yupResolver(forgotPasswordSchema),
  });

  const onSubmit = (data) => {
    forgotPassword(data);
  };

  if (isAuthenticated()) {
    return <Navigate to="/" replace={true} />;
  }

  return (
    <AuthWrapper>
      <Stack spacing={2}>
        <Typography variant="h4" align="center" gutterBottom>
          Forgot Password
        </Typography>
        <Form onSubmit={handleSubmit(onSubmit)}>
          <Stack spacing={2}>
            <FormInputText
              name="username"
              control={control}
              variant="outlined"
              label="Username"
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

export default ForgotPassword;
