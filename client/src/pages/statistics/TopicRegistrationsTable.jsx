import { DataGrid } from "@mui/x-data-grid";
import { sampleTopicRegistration } from "./sample-data/topic-registration";

const columns = [
  {
    field: "x",
    headerName: "Topic",
    description: "Topic name",
    flex: 1,
  },

  {
    field: "y",
    headerName: "Number of Registrations",
    description: "Number of registrations",
    flex: 1,
  },
];

function TopicRegistrationsTable() {
  return (
    <DataGrid
      rows={sampleTopicRegistration}
      columns={columns}
      density="compact"
      disableSelectionOnClick
      hideFooter
      sx={{ border: "none" }}
    />
  );
}

export default TopicRegistrationsTable;
