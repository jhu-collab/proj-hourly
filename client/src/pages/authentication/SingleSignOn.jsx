import Button from "@mui/material/Button";
import AnimateButton from "../../components/AnimateButton";

function SingleSignOn() {
  return (
    <AnimateButton>
      <Button
        variant="outlined"
        color="primary"
        fullWidth={true}
        onClick={() => console.log("JHU SSO")}
      >
        JHU SSO
      </Button>
    </AnimateButton>
  );
}

export default SingleSignOn;
