import axios from "axios";
import { useQuery } from "react-query";
import Typography from "@mui/material/Typography";
import MainCard from "../../components/MainCard";
import Alert from "@mui/material/Alert";
import AlertTitle from "@mui/material/AlertTitle";

function ReactQueryDemo() {
  const { isLoading, error, data } = useQuery("repoData", () =>
    axios.get("https://api.github.com/orgs/jhu-collab").then((res) => res.data)
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
    <MainCard title={data.name} codeHighlight>
      <Typography variant="body2" gutterBottom>
        {data.description}
      </Typography>
    </MainCard>
  );
}

export default ReactQueryDemo;
