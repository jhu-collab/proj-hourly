import { Link as RouterLink, useNavigate } from "react-router-dom";
import Button from "@mui/material/Button";
import Divider from "@mui/material/Divider";
import Grid from "@mui/material/Grid";
import Link from "@mui/material/Link";
import Typography from "@mui/material/Typography";
import AnimateButton from "../../components/AnimateButton";
import SingleSignOn from "./SingleSignOn";
import Form from "../../components/form-ui/Form";
import { useMutation } from "react-query";
import { yupResolver } from "@hookform/resolvers/yup";
import { signUpSchema } from "../../utils/validators";
import { useForm } from "react-hook-form";
import { signUp } from "../../utils/requests";
import FormInputText from "../../components/form-ui/FormInputText";
import { useAccountStore } from "../../services/store";
import { errorToast } from "../../utils/toasts";

function AuthRegister() {
  const { control, handleSubmit } = useForm({
    defaultValues: {
      name: "",
      email: "",
      phoneNumber: "",
    },
    resolver: yupResolver(signUpSchema),
  });

  const navigate = useNavigate();
  const setId = useAccountStore((state) => state.setId);
  const setName = useAccountStore((state) => state.setName);

  const { mutate, isLoading } = useMutation(signUp, {
    onSuccess: (data) => {
      // TODO: Later, this will be replaced with token once that is set
      // up in the backend
      setId(data.account.id);
      setName(data.account.userName);
      navigate("/courses");
    },
    onError: (error) => {
      errorToast(error);
    },
  });

  const onSubmit = (data) => {
    mutate(data);
  };

  return (
    <Form onSubmit={handleSubmit(onSubmit)}>
      <Grid container spacing={3}>
        <Grid item xs={12}>
          <FormInputText
            name="name"
            control={control}
            label="Name"
          ></FormInputText>
        </Grid>
        <Grid item xs={12}>
          <FormInputText
            name="email"
            control={control}
            label="Email Address"
            type="email"
          />
        </Grid>
        <Grid item xs={12}>
          <FormInputText
            name="phoneNumber"
            control={control}
            label="Phone Number"
            placeholder="e.g. 999-999-9999"
          />
        </Grid>
        <Grid item xs={12}>
          <Typography variant="body2">
            By Signing up, you agree to our &nbsp;
            <Link variant="subtitle2" component={RouterLink} to="#">
              Terms of Service
            </Link>
            &nbsp; and &nbsp;
            <Link variant="subtitle2" component={RouterLink} to="#">
              Privacy Policy
            </Link>
          </Typography>
        </Grid>
        <Grid item xs={12}>
          <AnimateButton>
            <Button
              disableElevation
              disabled={isLoading}
              fullWidth
              size="large"
              type="submit"
              variant="contained"
              color="primary"
            >
              Create Account
            </Button>
          </AnimateButton>
        </Grid>
        <Grid item xs={12}>
          <Divider>
            <Typography variant="caption">Sign up with</Typography>
          </Divider>
        </Grid>
        <Grid item xs={12}>
          <SingleSignOn />
        </Grid>
      </Grid>
    </Form>
  );
}

export default AuthRegister;
