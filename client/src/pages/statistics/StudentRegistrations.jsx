import Typography from "@mui/material/Typography";
import Box from "@mui/material/Box";
import StudentRegistrationsChart from "./StudentRegistrationsChart";
import Grid from "@mui/material/Grid";
import MainCard from "../../components/MainCard";
import ToggleButton from "@mui/material/ToggleButton";
import ToggleButtonGroup from "@mui/material/ToggleButtonGroup";
import { useState } from "react";
import StudentRegistrationsTable from "./StudentRegistrationsTable";
import useQueryStudentRegCounts from "../../hooks/useQueryStudentRegCounts";
import Alert from "@mui/material/Alert";
import AlertTitle from "@mui/material/AlertTitle";

/**
 * Wrapper component that displays data regarding the number of registrations
 * per student.
 * @returns Student Registrations wrapper component.
 */
function StudentRegistrations() {
  const [studentRegType, setStudentRegType] = useState("graph");

  const { isLoading, error, data } = useQueryStudentRegCounts();

  const sxToggleButton = {
    color: "white",
    border: 0,
    fontWeight: 600,
    "&:hover": {
      bgcolor: "secondary.main",
      color: "text.primary",
    },
    "&.Mui-selected": {
      bgcolor: "secondary.main",
      borderRadius: 1,
      color: "text.primary",
      "&:hover": {
        color: "text.primary",
        bgcolor: "secondary.main",
      },
    },
  };

  return (
    <>
      <Grid container alignItems="center" justifyContent="space-between">
        <Grid item>
          <Typography variant="h5">
            Number of Registrations / Student
          </Typography>
        </Grid>
        <Grid item>
          <ToggleButtonGroup
            value={studentRegType}
            exclusive
            size="small"
            onChange={(event, newValue) => {
              if (newValue != null) {
                setStudentRegType(newValue);
              }
            }}
            sx={{ bgcolor: "tertiary.main" }}
          >
            <ToggleButton value="table" sx={sxToggleButton}>
              TABLE
            </ToggleButton>
            <ToggleButton value="graph" sx={sxToggleButton}>
              GRAPH
            </ToggleButton>
          </ToggleButtonGroup>
        </Grid>
      </Grid>
      <MainCard content={false} sx={{ mt: 1.5 }}>
        {isLoading ? (
          <Alert severity="warning">Loading data ...</Alert>
        ) : Boolean(error) ? (
          <Alert severity="error">
            <AlertTitle>Error</AlertTitle>
            {"An error has occurred: " + error.message}
          </Alert>
        ) : (
          <Box sx={{ height: 375, width: "100%", paddingY: 1 }}>
            {studentRegType == "graph" ? (
              <StudentRegistrationsChart data={data?.countsAndAccount || []} />
            ) : (
              <StudentRegistrationsTable data={data?.countsAndAccount || []} />
            )}
          </Box>
        )}
      </MainCard>
    </>
  );
}

export default StudentRegistrations;
