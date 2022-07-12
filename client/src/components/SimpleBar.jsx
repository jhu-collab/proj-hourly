import PropTypes from "prop-types";
import { alpha } from "@mui/system/colorManipulator";
import styled from "@mui/material/styles/styled";
import Box from "@mui/material/Box";
import SimpleBar from "simplebar-react";
import { BrowserView, MobileView } from "react-device-detect";

const RootStyle = styled(BrowserView)({
  flexGrow: 1,
  height: "100%",
  overflow: "hidden",
});

const SimpleBarStyle = styled(SimpleBar)(({ theme }) => ({
  maxHeight: "100%",
  "& .simplebar-scrollbar": {
    "&:before": {
      backgroundColor: alpha(theme.palette.grey[500], 0.48),
    },
    "&.simplebar-visible:before": {
      opacity: 1,
    },
  },
  "& .simplebar-track.simplebar-vertical": {
    width: 10,
  },
  "& .simplebar-track.simplebar-horizontal .simplebar-scrollbar": {
    height: 6,
  },
  "& .simplebar-mask": {
    zIndex: "inherit",
  },
}));

function SimpleBarScroll({ children, sx, ...other }) {
  return (
    <>
      <RootStyle>
        <SimpleBarStyle timeout={500} clickOnTrack={false} sx={sx} {...other}>
          {children}
        </SimpleBarStyle>
      </RootStyle>
      <MobileView>
        <Box sx={{ overflowX: "auto", ...sx }} {...other}>
          {children}
        </Box>
      </MobileView>
    </>
  );
}

export default SimpleBarScroll;

SimpleBarScroll.propTypes = {
  children: PropTypes.node,
  sx: PropTypes.object,
};
