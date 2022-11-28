import Alert from "@mui/material/Alert";
import AlertTitle from "@mui/material/AlertTitle";
import Box from "@mui/material/Box";
import useStoreLayout from "../../hooks/useStoreLayout";
import { DataGrid, GridToolbar } from "@mui/x-data-grid";
import DeleteButton from "./DeleteButton";
import ChangeRoleIcon from "./ChangeRoleIcon";
const columns = [
  {
    field: "firstName",
    headerName: "First Name",
    flex: 2.6,
  },
  {
    field: "lastName",
    headerName: "Last Name",
    flex: 2.6,
  },
  {
    field: "email",
    headerName: "Email",
    flex: 2.6,
  },
  {
    field: "actions",
    type: "actions",
    flex: 1,
    getActions: (params) => [
      <ChangeRoleIcon params={params} isStaff={false} />,
      <DeleteButton params={params} isStaff={false} />,
    ],
  },
  {
    field: "actions",
    type: "actions",
    flex: 1,
    getActions: (params) => [
      <ChangeRoleIcon params={params} isStaff={true} />,
      <DeleteButton params={params} isStaff={true} />,
    ],
  },
];

/**
 * Represents a panel of users in a course.
 * @param {Number} index the index of the panel. Helps decide
 *                    whether the panel handles students,
 *                    staff, or instructors
 * @param {*} rows list of users in the course
 * @returns a roster tab panel.
 */
function RosterTabPanel({ index, rows }) {
  const rosterTab = useStoreLayout((state) => state.rosterTab);

  const noRows = () => {
    return (
      <Alert severity="info">
        <AlertTitle>
          {index === 0
            ? "No Students"
            : index === 1
            ? "No Staff"
            : "No Instructors"}
        </AlertTitle>
      </Alert>
    );
  };

  return (
    <Box sx={{ mt: 2 }}>
      {rosterTab === index &&
        (rows.length === 0 ? (
          noRows()
        ) : (
          <DataGrid
            rows={rows}
            columns={
              index === 0
                ? columns.slice(0, 4)
                : index === 1
                ? columns.filter((_, index) => index !== 3)
                : columns.slice(0, 3)
            }
            autoHeight
            getRowHeight={() => "auto"}
            rowsPerPageOptions={[5, 10, 20]}
            checkboxSelection
            hideFooter
            disableSelectionOnClick
            components={{
              Toolbar: GridToolbar,
            }}
          />
        ))}
    </Box>
  );
}

export default RosterTabPanel;
