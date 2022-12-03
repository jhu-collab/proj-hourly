import { DataGrid, GridToolbar } from "@mui/x-data-grid";
import Stack from "@mui/material/Stack";
import Typography from "@mui/material/Typography";
import Alert from "@mui/material/Alert";
import AlertTitle from "@mui/material/AlertTitle";
import useQueryUsers from "../../hooks/useQueryUsers";
import { useState } from "react";

const columns = [
  {
    field: "id",
    headerName: "ID",
    description: "User's id",
    sort: "asc",
    flex: 0.5,
  },
  {
    field: "firstName",
    headerName: "First name",
    description: "User's first name",
    flex: 1,
  },
  {
    field: "lastName",
    headerName: "Last name",
    description: "User's last name",
    flex: 1,
  },
  {
    field: "email",
    headerName: "Email",
    description: "User's email",
    flex: 1,
  },
  {
    field: "preferredName",
    headerName: "Preferred Name",
    description: "User's preferred name",
    flex: 1,
  },
  {
    field: "role",
    headerName: "Role",
    description: "User's role",
    type: "singleSelect",
    valueOptions: ["User", "Admin"],
    flex: 1,
  },
];

/**
 * Admin view of all users of the app.
 * @returns A grid of all the users of the app
 */
function Users() {
  const [sortModel, setSortModel] = useState([
    {
      field: "id",
      sort: "asc",
    },
  ]);

  const { isLoading, error, data } = useQueryUsers();

  if (isLoading) {
    return (
      <Alert severity="warning" sx={{ mt: 2 }}>
        <AlertTitle>Loading roster ...</AlertTitle>
      </Alert>
    );
  }

  if (error) {
    return (
      <Alert severity="error" sx={{ mt: 2 }}>
        <AlertTitle>Error</AlertTitle>
        {"An error has occurred: " + error.message}
      </Alert>
    );
  }

  return (
    <Stack spacing={1} sx={{ width: "100%" }}>
      <Typography variant="h4" sx={{ ml: 1 }}>
        Users
      </Typography>
      <DataGrid
        rows={data?.accounts || []}
        columns={columns}
        autoHeight
        getRowHeight={() => "auto"}
        checkboxSelection
        disableSelectionOnClick
        hideFooter
        sx={{ backgroundColor: "background.paper" }}
        sortModel={sortModel}
        onSortModelChange={(model) => setSortModel(model)}
        hideFooter
        components={{
          Toolbar: GridToolbar,
        }}
      />
    </Stack>
  );
}

export default Users;
