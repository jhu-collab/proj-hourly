import Alert from "@mui/material/Alert";
import Box from "@mui/material/Box";
import useStoreLayout from "../../hooks/useStoreLayout";
import {
  DataGrid,
  GridToolbarContainer,
  GridToolbarColumnsButton,
  GridToolbarFilterButton,
  GridToolbarDensitySelector,
  GridToolbarExport,
} from "@mui/x-data-grid";
import DeleteButton from "./DeleteButton";
import ChangeRoleIcon from "./ChangeRoleIcon";
import UseTokenIcon from "./UseTokenIcon";
import useStoreCourse from "../../hooks/useStoreCourse";
import { useState } from "react";
import StudentTokenUsageIcon from "./StudentTokenUsageIcon";

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
  const course = useStoreCourse((state) => state.course);
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
      flex: 2,
      getActions: (params) => [
        <UseTokenIcon params={params} isStaff={false} index={index} />,
        <StudentTokenUsageIcon params={params} isStaff={false} index={index} />,
        <ChangeRoleIcon params={params} isStaff={false} />,
        <DeleteButton params={params} isStaff={false} />,
      ],
    },
    {
      field: "actions",
      type: "actions",
      flex: 2,
      getActions: (params) => [
        <UseTokenIcon params={params} isStaff={false} index={index} />,
        <StudentTokenUsageIcon params={params} isStaff={true} index={index} />,
        <ChangeRoleIcon params={params} isStaff={true} />,
        <DeleteButton params={params} isStaff={true} />,
      ],
    },
  ];

  const noRows = () => {
    return (
      <Alert data-cy="no-roster-alert" severity="info">
        {index === 0
          ? "No Students"
          : index === 1
          ? "No Staff"
          : "No Instructors"}
      </Alert>
    );
  };

  const [openPopup, setOpenPopup] = useState(false);
  const [selectedRow, setSelectedRow] = useState(null);

  const handleOpenPopup = () => {
    setOpenPopup(true);
  };

  const handleClosePopup = () => {
    setOpenPopup(false);
  };

  const handleRowSelection = (selectionModel) => {
    const selectedRowCount = selectionModel.length;

    if (selectedRowCount === 1) {
      // When exactly one row is selected, store the selected row's data
      // setSelectedRow(data[selectionModel[0]]);
      setSelectedRow(rows.filter((data) => data.id == selectionModel[0])[0]);
    } else {
      // If no row or more than one row is selected, clear the selectedRow
      setSelectedRow(null);
    }
  };

  return (
    <div>
      <Box sx={{ mt: 2, backgroundColor: "background.paper" }}>
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
              // autoPageSize
              // rowsPerPageOptions={[5, 10, 20]}
              checkboxSelection
              // hideFooter
              disableSelectionOnClick
              onSelectionModelChange={handleRowSelection}
              components={{
                Toolbar: () => (
                  <div>
                    <GridToolbarContainer>
                      <GridToolbarColumnsButton />
                      <GridToolbarFilterButton />
                      <GridToolbarDensitySelector />
                      <GridToolbarExport />
                    </GridToolbarContainer>
                  </div>
                ),
              }}
            />
          ))}
      </Box>
    </div>
  );
}

export default RosterTabPanel;
