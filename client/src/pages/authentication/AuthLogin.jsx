import Divider from "@mui/material/Divider";
import Grid from "@mui/material/Grid";
import Typography from "@mui/material/Typography";
import Button from "@mui/material/Button";
import AnimateButton from "../../components/AnimateButton";
import SingleSignOn from "./SingleSignOn";
import Form from "../../components/form-ui/Form";
import { useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import { loginSchema } from "../../utils/validators";
import FormInputText from "../../components/form-ui/FormInputText";
import { login } from "../../utils/requests";
import { useNavigate } from "react-router-dom";
import { useMutation } from "react-query";
import { toast } from "react-toastify";
import useStore from "../../services/store";
import { errorToast } from "../../utils/toasts";

function AuthLogin() {
  const { control, handleSubmit } = useForm({
    defaultValues: {
      email: "",
    },
    resolver: yupResolver(loginSchema),
  });

  const { setUserId, setUserName } = useStore();

  const navigate = useNavigate();

  const { mutate, isLoading } = useMutation(login, {
    onSuccess: (data) => {
      // TODO: Later, this will be replaced with token once that is set
      // up in the backend
      setUserId(data.account.id);
      setUserName(data.account.userName);
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
          <SingleSignOn />
        </Grid>
      </Grid>
    </Form>
  );
}

export default AuthLogin;
