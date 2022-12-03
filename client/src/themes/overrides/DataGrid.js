export default function DataGrid(theme) {
  return {
    MuiDataGrid: {
      styleOverrides: {
        root: {
          fontSize: "1rem",
          border: `1px solid ${theme.palette.grey[300]}`,
        },
        toolbarContainer: {
          backgroundColor: theme.palette.primary.main,
        },
        columnHeaders: {
          borderBottom: `1px solid ${theme.palette.grey[300]}`,
        },
        iconSeparator: {
          color: theme.palette.grey[300],
        },
        footerContainer: {
          borderTop: `1px solid ${theme.palette.grey[300]}`,
        },
        cell: {
          borderBottom: `1px solid ${theme.palette.grey[300]}`,
        },
      },
    },
  };
}
