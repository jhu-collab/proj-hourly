export default function ToggleButton(theme) {
  return {
    MuiToggleButton: {
      styleOverrides: {
        root: {
          "&.Mui-selected": {
            color: theme.palette.text.primary,
            backgroundColor: theme.palette.primary.main,
            "&:hover": {
              backgroundColor: theme.palette.secondary.main,
              color: theme.palette.text.primary,
            },
          },
          fontWeight: 600,
          "&:hover": {
            backgroundColor: theme.palette.secondary.main,
            color: theme.palette.text.primary,
          },
        },
      },
    },
  };
}
