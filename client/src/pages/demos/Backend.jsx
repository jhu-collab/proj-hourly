import axios from "axios";
import { useQuery } from "react-query";
import { BASE_URL } from "../../services/common";
import Alert from "@mui/material/Alert";
import AlertTitle from "@mui/material/AlertTitle";
import MainCard from "../../components/MainCard";
import Typography from "@mui/material/Typography";

function Backend() {
  const { isLoading, error, data } = useQuery("backend", () =>
    axios.get(BASE_URL).then((res) => res.data)
  );

  if (isLoading) return <Alert severity="warning">Loading</Alert>;

  if (error) {
    return (
      <Alert severity="error">
        <AlertTitle>Error</AlertTitle>
        {"An error has occurred: " + error.message}
      </Alert>
    );
  }

  return (
    <MainCard title={data} codeHighlight>
      <Typography variant="body2" gutterBottom>
        {BASE_URL}
      </Typography>
    </MainCard>
  );
}

export default Backend;
