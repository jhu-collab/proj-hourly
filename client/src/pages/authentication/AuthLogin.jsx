import Divider from "@mui/material/Divider";
import { useState } from "react";
import Button from "@mui/material/Button";
import Stack from "@mui/material/Stack";
import AnimateButton from "../../components/AnimateButton";
import Form from "../../components/form-ui/Form";
import { useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import { loginSchema } from "../../utils/validators";
import FormInputText from "../../components/form-ui/FormInputText";
import useAuth from "../../hooks/useAuth";
import { Navigate } from "react-router-dom";
import InputAdornment from "@mui/material/InputAdornment";
import IconButton from "@mui/material/IconButton";
import VisibilityIcon from "@mui/icons-material/Visibility";
import VisibilityOffIcon from "@mui/icons-material/VisibilityOff";
import { useNavigate, Link } from "react-router-dom";
import Typography from "@mui/material/Typography";

function AuthLogin() {
  const [value] = useState(import.meta.env.VITE_RUN_MODE);
  const { isAuthenticated, signIn, signInAsUser, signInAsAdmin, singInAsTa } =
    useAuth();
  const { control, handleSubmit } = useForm({
    defaultValues: {
      username: "",
      password: "",
    },
    resolver: yupResolver(loginSchema),
  });

  const [showPassword, setShowPassword] = useState(false);

  const navigate = useNavigate();

  if (isAuthenticated()) {
    return <Navigate to="/" replace={true} />;
  }

  const onSubmit = (data) => {
    signIn(data);
  };

  const handleClickShowPassword = () =>
    setShowPassword((showPassword) => !showPassword);

  const handleMouseDownPassword = (event) => {
    event.preventDefault();
  };

  const onSignUpClick = () => {
    navigate("/signup");
  };

  return (
    <Stack spacing={2}>
      {value === "local" && (
        <>
          <Stack direction="row" spacing={1} justifyContent="center">
            <AnimateButton>
              <Button
                data-cy="sign-in-as-user-button"
                variant="contained"
                size="large"
                onClick={() => signInAsUser()}
              >
                Sign in as User (LOCAL)
              </Button>
            </AnimateButton>
            <AnimateButton>
              <Button
                data-cy="sign-in-as-ta-button"
                variant="contained"
                size="large"
                onClick={() => singInAsTa()}
              >
                Sign in as TA (LOCAL)
              </Button>
            </AnimateButton>
            <AnimateButton>
              <Button
                data-cy="sign-in-as-professor-button"
                variant="contained"
                size="large"
                onClick={() => signInAsAdmin()}
              >
                Sign in as Professor (LOCAL)
              </Button>
            </AnimateButton>
          </Stack>
          <Divider
            data-cy="login-divider-or"
            sx={{
              fontSize: "17px",
              "::before": { borderTop: "1px dashed rgba(30, 62, 102, 0.42)" },
              "::after": { borderTop: "1px dashed rgba(30, 62, 102, 0.42)" },
            }}
          >
            OR
          </Divider>
        </>
      )}

      <Form onSubmit={handleSubmit(onSubmit)}>
        <Stack spacing={2} marginTop={-0.5} alignItems="center">
          <FormInputText
            data-cy="username-input-text"
            name="username"
            control={control}
            variant="standard"
            label="Username"
            InputLabelProps={{ shrink: true }}
          />
          <FormInputText
            data-cy="password-input-text"
            name="password"
            control={control}
            variant="standard"
            label="Password"
            type={showPassword ? "text" : "password"}
            InputLabelProps={{ shrink: true }}
            InputProps={{
              endAdornment: (
                <InputAdornment position="end">
                  <IconButton
                    data-cy="login-password-eye"
                    aria-label="toggle password visibility"
                    onClick={handleClickShowPassword}
                    onMouseDown={handleMouseDownPassword}
                  >
                    {showPassword ? <VisibilityOffIcon /> : <VisibilityIcon />}
                  </IconButton>
                </InputAdornment>
              ),
            }}
          />
          <AnimateButton>
            <Button
              data-cy="login-button"
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
      <Divider
        data-cy="login-divider-or"
        sx={{
          fontSize: "17px",
          "::before": { borderTop: "1px dashed rgba(30, 62, 102, 0.42)" },
          "::after": { borderTop: "1px dashed rgba(30, 62, 102, 0.42)" },
        }}
      >
        OR
      </Divider>
      <Stack spacing={2} marginTop={-0.5} alignItems="center">
        <AnimateButton>
          <Button
            data-cy="signup-button"
            type="submit"
            variant="contained"
            size="large"
            sx={{ fontSize: "17px", width: "120px" }}
            onClick={onSignUpClick}
          >
            Sign Up
          </Button>
        </AnimateButton>
      </Stack>
      <Typography variant="body1" align="center">
        Forgot Your Password? <Link to="/forgotPassword">Forgot Password</Link>
      </Typography>
    </Stack>
  );
}

export default AuthLogin;
