import { DataGrid, GridToolbar } from "@mui/x-data-grid";
import Stack from "@mui/material/Stack";
import Typography from "@mui/material/Typography";

const columns = [
  { field: "id", headerName: "ID", description: "User's id", flex: 0.5 },
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

const rows = [
  {
    id: 1,
    lastName: "Snow",
    firstName: "Jon",
    email: "jonsnow@jhu.edu",
    role: "User",
  },
  {
    id: 2,
    lastName: "Lannister",
    firstName: "Cersei",
    email: "cerseilannister@jhu.edu",
  },
  {
    id: 3,
    lastName: "Lannister",
    firstName: "Jaime",
    emal: "jaimelanniser@jhu.edu",
  },
  { id: 4, lastName: "Stark", firstName: "Arya", email: "aryastark@jhu.edu" },
  {
    id: 5,
    lastName: "Targaryen",
    firstName: "Daenerys",
    email: "aryastark@jhu.edu",
  },
  {
    id: 6,
    lastName: "Melisandre",
    firstName: null,
    email: "melisandre@jhu.edu",
  },
  {
    id: 7,
    lastName: "Clifford",
    firstName: "Ferrara",
    email: "ferraraclifford@jhu.edu",
  },
  {
    id: 8,
    lastName: "Frances",
    firstName: "Rossini",
    email: "rossinifrances@jhu.edu",
  },
  {
    id: 9,
    lastName: "Roxie",
    firstName: "Harvey",
    email: "harveyroxie@jhu.edu",
  },
];

/**
 * Admin view of all users of the app.
 * @returns A grid of all the users of the app
 */
function Users() {
  return (
    <Stack spacing={1} sx={{ height: "90vh", width: "100%" }}>
      <Typography variant="h4" sx={{ ml: 1 }}>
        Users
      </Typography>
      <DataGrid
        rows={rows}
        columns={columns}
        autoPageSize
        getRowHeight={() => "auto"}
        rowsPerPageOptions={[5, 10, 20]}
        checkboxSelection
        disableSelectionOnClick
        components={{
          Toolbar: GridToolbar,
        }}
        sx={{
          fontSize: "1rem",
        }}
      />
    </Stack>
  );
}

export default Users;
