import PropTypes from "prop-types";
import Box from "@mui/material/Box";
import Chip from "@mui/material/Chip";
import Grid from "@mui/material/Grid";
import Stack from "@mui/material/Stack";
import Typography from "@mui/material/Typography";
import MainCard from "./MainCard";
import { RiseOutlined, FallOutlined } from "@ant-design/icons";

function AnalyticEcommerce({ color, title, count, percentage, isLoss, extra }) {
  return (
    <MainCard contentSX={{ p: 2.25 }}>
      <Stack spacing={0.5}>
        <Typography variant="h6" color="textSecondary">
          {title}
        </Typography>
        <Grid container alignItems="center">
          <Grid item>
            <Typography variant="h4" color="inherit">
              {count}
            </Typography>
          </Grid>
          {percentage && (
            <Grid item>
              <Chip
                variant="combined"
                color={color}
                icon={
                  <>
                    {!isLoss && (
                      <RiseOutlined
                        style={{ fontSize: "0.75rem", color: "inherit" }}
                      />
                    )}
                    {isLoss && (
                      <FallOutlined
                        style={{ fontSize: "0.75rem", color: "inherit" }}
                      />
                    )}
                  </>
                }
                label={`${percentage}%`}
                sx={{ ml: 1.25, pl: 1 }}
                size="small"
              />
            </Grid>
          )}
        </Grid>
      </Stack>
      <Box sx={{ pt: 2.25 }}>
        <Typography variant="caption" color="textSecondary">
          You made an extra{" "}
          <Typography
            component="span"
            variant="caption"
            sx={{ color: `${color || "primary"}.main` }}
          >
            {extra}
          </Typography>{" "}
          this year
        </Typography>
      </Box>
    </MainCard>
  );
}

export default AnalyticEcommerce;

AnalyticEcommerce.propTypes = {
  color: PropTypes.string,
  title: PropTypes.string,
  count: PropTypes.string,
  percentage: PropTypes.number,
  isLoss: PropTypes.bool,
  extra: PropTypes.oneOfType([PropTypes.node, PropTypes.string]),
};

AnalyticEcommerce.defaultProps = {
  color: "primary",
};
