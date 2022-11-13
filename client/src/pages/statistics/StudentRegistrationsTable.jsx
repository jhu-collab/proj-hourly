import { DataGrid } from "@mui/x-data-grid";
import React from "react";
import { getStudentRegFormattedData } from "./helper";

const columns = [
  {
    field: "x",
    headerName: "Student's Name",
    description: "Student's name",
    flex: 1,
  },

  {
    field: "y",
    headerName: "Number of Registrations",
    description: "Student's number of registrations",
    flex: 1,
  },
];

/**
 * A data grid that illustrates the number of registrations that
 * were made by each student in a course.
 * @param {*} data student-registration data
 * @returns Student-registration table
 */
function StudentRegistrationsTable({ data }) {
  return (
    <DataGrid
      rows={getStudentRegFormattedData(data)}
      columns={columns}
      density="compact"
      disableSelectionOnClick
      hideFooter
      sx={{ border: "none" }}
    />
  );
}

export default StudentRegistrationsTable;
