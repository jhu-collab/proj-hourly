import Button from "@mui/material/Button";
import AnimateButton from "../../components/AnimateButton";
import useAuth from "../../hooks/useAuth";

function SingleSignOn() {
  const { ssoSignIn } = useAuth();

  return (
    <AnimateButton>
      <Button
        variant="contained"
        color="primary"
        fullWidth={true}
        onClick={() => ssoSignIn()}
      >
        Sign in with JHU SSO
      </Button>
    </AnimateButton>
  );
}

export default SingleSignOn;
