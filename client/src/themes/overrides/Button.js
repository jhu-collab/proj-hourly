export default function Button(theme) {
  const disabledStyle = {
    "&.Mui-disabled": {
      backgroundColor: theme.palette.grey[200],
    },
  };

  return {
    MuiButton: {
      styleOverrides: {
        root: {
          fontWeight: 500,
          textTransform: "uppercase",
          backgroundColor: theme.palette.primary.main,
          color: theme.palette.text.primary,
        },
        contained: {
          ...disabledStyle,
        },
        outlined: {
          ...disabledStyle,
        },
      },
    },
  };
}
