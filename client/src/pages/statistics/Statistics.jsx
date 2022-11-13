import Typography from "@mui/material/Typography";
import Grid from "@mui/material/Grid";
import AnalyticEcommerce from "../../components/AnalyticEcommerce";
import StudentRegistrations from "./StudentRegistrations";
import TopicRegistrations from "./TopicRegistrations";

/**
 * Component that represents the "Statistics" page.
 * @returns A component representing the "Statistics" page.
 */
function Statistics() {
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
      <Grid item xs={12} md={7} lg={8.25}>
        <StudentRegistrations />
      </Grid>
      <Grid item xs={12} md={5} lg={3.75}>
        <TopicRegistrations />
      </Grid>
    </Grid>
  );
}

export default Statistics;
