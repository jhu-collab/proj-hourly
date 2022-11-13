import Typography from "@mui/material/Typography";
import Box from "@mui/material/Box";
import StudentRegistrations from "./StudentRegistrationsChart";
import Grid from "@mui/material/Grid";
import MainCard from "../../components/MainCard";
import IncomeAreaChart from "./MonthlyBarChart";
import { Stack } from "@mui/material";
import MonthlyBarChart from "./MonthlyBarChart";

function Statistics() {
  return (
    <Grid container rowSpacing={4.5} columnSpacing={2.75}>
      {/* row 1 */}
      <Grid item xs={12} sx={{ mb: -2.25 }}>
        <Typography variant="h4">Statistics</Typography>
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
            <Typography variant="h5">Number of Registrations / Student</Typography>
          </Grid>
          </Grid>
          <MainCard content={false} sx={{ mt: 1.5 }}>
            <Box sx={{ pt: 1, pr: 2 }}>
              <StudentRegistrations />
            </Box>
          </MainCard>
      </Grid>
    </Grid>
  );
}

export default Statistics;
