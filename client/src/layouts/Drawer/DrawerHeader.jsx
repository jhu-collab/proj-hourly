import PropTypes from "prop-types";
import useTheme from "@mui/material/styles/useTheme";
import Stack from "@mui/material/Stack";
import { DrawerHeaderStyled } from "./DrawerHeaderStyled";
import Logo from "../../components/Logo";

function DrawerHeader({ open }) {
  const theme = useTheme();

  return (
    // only available in paid version
    <DrawerHeaderStyled theme={theme} open={open}>
      <Stack direction="row" spacing={1} alignItems="center">
        <Logo />
      </Stack>
    </DrawerHeaderStyled>
  );
}

export default DrawerHeader;

DrawerHeader.propTypes = {
  open: PropTypes.bool,
};
