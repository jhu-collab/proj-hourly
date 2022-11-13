import Typography from "@mui/material/Typography";
import Box from "@mui/material/Box";
import StudentRegistrationsChart from "./StudentRegistrationsChart";
import Grid from "@mui/material/Grid";
import MainCard from "../../components/MainCard";
import { Button, Stack, ToggleButton, ToggleButtonGroup } from "@mui/material";
import AnalyticEcommerce from "../../components/AnalyticEcommerce";

import { useState } from "react";
import StudentRegistrationsTable from "./StudentRegistrationsTable";
import TopicRegistrationsChart from "./TopicRegistrationsChart";

function Statistics() {
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

  const handleChange = (event, newValue) => {
    if (newValue != null) {
      setStudentRegType(newValue);
    }
  };

  return (
    <Grid container rowSpacing={4.5} columnSpacing={2.75}>
      {/* row 1 */}
      <Grid item xs={12} sx={{ mb: -2.25 }}>
        <Typography variant="h4">Statistics Dashboard</Typography>
      </Grid>
      <Grid item xs={12} sm={6} md={4} lg={3}>
        <AnalyticEcommerce
          title="Total Number of Registrations This Week"
          count="20"
          percentage={59.3}
          color="tertiary"
        />
      </Grid>
      <Grid item xs={12} sm={6} md={4} lg={3}>
        <AnalyticEcommerce
          title="Total Number of Registrations This Month"
          count="300"
          percentage={27.4}
          isLoss
          color="error"
        />
      </Grid>
      <Grid item xs={12} sm={6} md={4} lg={3}>
        <AnalyticEcommerce
          title="Most Challenging Topic This Week"
          count="Recursion"
        />
      </Grid>

      <Grid item xs={12} sm={6} md={4} lg={3}>
        <AnalyticEcommerce
          title="Student with Most Registrations This Month"
          count="Tony Stark"
        />
      </Grid>

      <Grid
        item
        md={8}
        sx={{ display: { sm: "none", md: "block", lg: "none" } }}
      />

      {/* row 2 */}
      <Grid item xs={12} md={7} lg={8}>
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
              onChange={handleChange}
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
          <Box sx={{ height: { sm: 375 }, width: "100%", paddingY: 1 }}>
            {studentRegType == "graph" ? (
              <StudentRegistrationsChart />
            ) : (
              <StudentRegistrationsTable />
            )}
          </Box>
        </MainCard>
      </Grid>
      <Grid item xs={12} md={5} lg={4}>
        <Grid container alignItems="center" justifyContent="space-between">
          <Grid item>
            <Typography variant="h5">
              Number of Registrations / Topic
            </Typography>
          </Grid>
          <Grid item />
        </Grid>
        <MainCard sx={{ mt: 2 }} content={false}>
          <Box sx={{ height: { sm: 375 }, width: "100%", pt: 2 }}>
            {/* {studentRegType == "graph" ? ( */}
            <TopicRegistrationsChart />
            {/* ) : (
              <StudentRegistrationsTable />
            )} */}
          </Box>
        </MainCard>
      </Grid>
    </Grid>
  );
}

export default Statistics;
