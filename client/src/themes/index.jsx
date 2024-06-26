import PropTypes from "prop-types";
import { useMemo } from "react";
import CssBaseline from "@mui/material/CssBaseline";
import "react-toastify/dist/ReactToastify.min.css";
import StyledEngineProvider from "@mui/material/StyledEngineProvider";
import createTheme from "@mui/material/styles/createTheme";
import ThemeProvider from "@mui/material/styles/ThemeProvider";
import { Palette } from "./palette";
import { Typography } from "./typography";
import { CustomShadows } from "./shadows";
import componentsOverride from "./overrides";
import { ToastContainer } from "react-toastify";
import { useMediaQuery } from "@mui/material";
import NiceModal from "@ebay/nice-modal-react";
import "../utils/modals";

function ThemeCustomization({ children }) {
  const theme = Palette("light", "default");
  const themeTypography = Typography(`'Cabin', sans-serif`);
  const themeCustomShadows = useMemo(() => CustomShadows(theme), [theme]);

  const themeOptions = useMemo(
    () => ({
      breakpoints: {
        values: {
          xs: 0,
          sm: 768,
          md: 1024,
          lg: 1266,
          xl: 1536,
        },
      },
      direction: "ltr",
      mixins: {
        toolbar: {
          minHeight: 60,
          paddingTop: 8,
          paddingBottom: 8,
        },
      },
      palette: theme.palette,
      customShadows: themeCustomShadows,
      typography: themeTypography,
    }),
    [theme, themeTypography, themeCustomShadows]
  );

  const themes = createTheme(themeOptions);
  themes.components = componentsOverride(themes);
  const matchUpSm = useMediaQuery(themes.breakpoints.up("sm"));

  return (
    <StyledEngineProvider injectFirst>
      <ThemeProvider theme={themes}>
        <NiceModal.Provider>
          <CssBaseline />
          <ToastContainer
            position={matchUpSm ? "bottom-center" : "top-center"}
            hideProgressBar
            newestOnTop
            closeOnClick
            rtl={false}
            draggablePercent={60}
            draggableDirection="y"
            theme="colored"
            {...(!matchUpSm && { closeButton: false })}
          />
          {children}
        </NiceModal.Provider>
      </ThemeProvider>
    </StyledEngineProvider>
  );
}

export default ThemeCustomization;

ThemeCustomization.propTypes = {
  children: PropTypes.node,
};
