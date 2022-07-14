import Divider from "@mui/material/Divider";
import Grid from "@mui/material/Grid";
import Typography from "@mui/material/Typography";
import Button from "@mui/material/Button";
import AnimateButton from "../../components/AnimateButton";
import OtherLogin from "./OtherLogin";
import Form from "../../components/form-ui/Form";
import { useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import { loginSchema } from "../../utils/validators";
import FormInputText from "../../components/form-ui/FormInputText";
import { login } from "../../utils/requests";
import { useNavigate } from "react-router-dom";
import { useMutation } from "react-query";
import { toast } from "react-toastify";

function AuthLogin() {
  const { control, handleSubmit } = useForm({
    defaultValues: {
      email: "",
    },
    resolver: yupResolver(loginSchema),
  });

  const navigate = useNavigate();

  const { mutate, isLoading } = useMutation(login, {
    onSuccess: (data) => {
      // TODO: Later, this will be replaced with token once that is set
      // up in the backend
      const id = data.id;
      navigate("/courses");
    },
    onError: (error) => {
      toast.error("An error has occurred: " + error.message);
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
            name="email"
            control={control}
            label="Email Address"
            type="email"
            placeholder="Enter an email address"
          />
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
              Login
            </Button>
          </AnimateButton>
        </Grid>
        <Grid item xs={12}>
          <Divider>
            <Typography variant="caption"> Login with</Typography>
          </Divider>
        </Grid>
        <Grid item xs={12}>
          <OtherLogin />
        </Grid>
      </Grid>
    </Form>
  );
}

export default AuthLogin;
