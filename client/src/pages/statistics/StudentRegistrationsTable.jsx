import { DataGrid } from "@mui/x-data-grid";
import React from "react";
import { sampleStudentRegistration } from "./sample-data/student-registrations";

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

function StudentRegistrationsTable() {
  return (
    <DataGrid
      rows={sampleStudentRegistration}
      columns={columns}
      density="compact"
      disableSelectionOnClick
      hideFooter
      sx={{ border: "none" }}
    />
  );
}

export default StudentRegistrationsTable;
