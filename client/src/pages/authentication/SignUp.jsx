import Typography from "@mui/material/Typography";
import AuthWrapper from "./AuthWrapper";
import Button from "@mui/material/Button";
import Stack from "@mui/material/Stack";
import AnimateButton from "../../components/AnimateButton";
import Form from "../../components/form-ui/Form";
import { useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import { signupSchema } from "../../utils/validators";
import FormInputText from "../../components/form-ui/FormInputText";
import { Link } from "react-router-dom";
import InputAdornment from "@mui/material/InputAdornment";
import IconButton from "@mui/material/IconButton";
import VisibilityIcon from "@mui/icons-material/Visibility";
import VisibilityOffIcon from "@mui/icons-material/VisibilityOff";
import useAuthSignUp from "../../hooks/useAuthSignUp";
import { Navigate } from "react-router-dom";

function SignUp() {
  const { signUp, isAuthenticated } = useAuthSignUp();
  const { control, handleSubmit } = useForm({
    defaultValues: {
      username: "",
      firstName: "",
      lastName: "",
      email: "",
      password: "",
      confirmPassword: "", // TODO update resolver to compare passwords
    },
    resolver: yupResolver(signupSchema),
  });

  const onSubmit = (data) => {
    signUp(data);
  };

  if (isAuthenticated()) {
    return <Navigate to="/" replace={true} />;
  }

  return (
    <AuthWrapper>
      <Stack spacing={2}>
        <Typography variant="h4" align="center" gutterBottom>
          Sign Up
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
            <Stack direction="row" spacing={2}>
              <FormInputText
                name="firstName"
                control={control}
                variant="outlined"
                label="First Name"
                fullWidth
              />
              <FormInputText
                name="lastName"
                control={control}
                variant="outlined"
                label="Last Name"
                fullWidth
              />
            </Stack>
            <FormInputText
              name="email"
              control={control}
              variant="outlined"
              label="Email"
              fullWidth
            />
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
                Sign Up
              </Button>
            </AnimateButton>
          </Stack>
        </Form>
        <Typography variant="body1" align="center">
          Already have an account? <Link to="/login">Log in</Link>
        </Typography>
      </Stack>
    </AuthWrapper>
  );
}

export default SignUp;
