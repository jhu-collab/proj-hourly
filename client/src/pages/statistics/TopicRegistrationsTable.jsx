import { DataGrid } from "@mui/x-data-grid";
import { getTopicRegTableData } from "./helper";

const columns = [
  {
    field: "topic",
    headerName: "Topic",
    description: "Topic name",
    flex: 1,
  },

  {
    field: "numRegistrations",
    headerName: "Number of Registrations",
    description: "Number of registrations",
    flex: 1,
  },
];

/**
 * A data grid that illustrates the number of registrations that
 * were made for each topic in a course.
 * @param {*} data topic-registration data
 * @returns Topic-registration table
 */
function TopicRegistrationsTable({ data }) {
  return (
    <DataGrid
      rows={getTopicRegTableData(data)}
      columns={columns}
      density="compact"
      disableSelectionOnClick
      hideFooter
      sx={{ border: "none" }}
    />
  );
}

export default TopicRegistrationsTable;
