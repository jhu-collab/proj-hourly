import PropTypes from "prop-types";
import { Link } from "react-router-dom";
import ButtonBase from "@mui/material/ButtonBase";
import Stack from "@mui/material/Stack";
import Typography from "@mui/material/Typography";
import { config } from "../config";
// import logoDark from '../assets/images/logo-dark.svg';
import logo from "../assets/images/logo.svg";
import useTheme from "@mui/material/styles/useTheme";

function LogoSection({ sx, to }) {
  const theme = useTheme();

  return (
    <ButtonBase
      disableRipple
      component={Link}
      to={!to ? config.defaultPath : to}
      sx={sx}
    >
      <Stack direction="row" spacing={2} alignItems="center">
        <img src={logo} alt="Mantis" width="27" />
        <Typography fontWeight={500} fontSize={30}>
          Hourly
        </Typography>
      </Stack>
    </ButtonBase>
  );
}

export default LogoSection;

LogoSection.propTypes = {
  sx: PropTypes.object,
  to: PropTypes.string,
};
