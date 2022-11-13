import Typography from "@mui/material/Typography";
import Box from "@mui/material/Box";
import StudentRegistrationsChart from "./StudentRegistrationsChart";
import Grid from "@mui/material/Grid";
import MainCard from "../../components/MainCard";
import ToggleButton from "@mui/material/ToggleButton";
import ToggleButtonGroup from "@mui/material/ToggleButtonGroup";
import { useState } from "react";
import StudentRegistrationsTable from "./StudentRegistrationsTable";

function StudentRegistrations() {
  const [studentRegType, setStudentRegType] = useState("graph");

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
        <Box sx={{ height: 375, width: "100%", paddingY: 1 }}>
          {studentRegType == "graph" ? (
            <StudentRegistrationsChart />
          ) : (
            <StudentRegistrationsTable />
          )}
        </Box>
      </MainCard>
    </>
  );
}

export default StudentRegistrations;
