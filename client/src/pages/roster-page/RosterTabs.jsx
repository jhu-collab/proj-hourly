import { DataGrid } from "@mui/x-data-grid";
import PropTypes from "prop-types";
import Tabs from "@mui/material/Tabs";
import Tab from "@mui/material/Tab";
import Box from "@mui/material/Box";
import { useMemo } from "react";
import DeleteButton from "./DeleteButton";

function RosterTabs(props) {
  const isInstructor = true;
  const { rows, value, setValue, deleteUser } = props;
  function TabPanel(props) {
    const { children, value, index, ...other } = props;
    return (
      <div
        role="tabpanel"
        hidden={value !== index}
        id={`simple-tabpanel-${index}`}
        aria-labelledby={`simple-tab-${index}`}
        {...other}
      >
        {value === index && <Box sx={{ p: 3 }}>{children}</Box>}
      </div>
    );
  }

  const columns = useMemo(() => {
    return [
      {
        field: "userName",
        headerName: "Username",
        flex: 4,
      },
      {
        field: "email",
        headerName: "Email",
        flex: 4,
      },
      {
        field: "actions",
        type: "actions",
        flex: 1,
        getActions: (params) => [
          <DeleteButton
            //setRows={setRows}
            // courseId={courseId}
            // token={token}
            params={params}
            rows={rows}
          />,
        ],
      },
    ];
  }, [deleteUser, isInstructor]);

  TabPanel.propTypes = {
    children: PropTypes.node,
    index: PropTypes.number.isRequired,
    value: PropTypes.number.isRequired,
  };

  const handleChange = (event, newValue) => {
    setValue(newValue);
  };

  function a11yProps(index) {
    return {
      id: `simple-tab-${index}`,
      "aria-controls": `simple-tabpanel-${index}`,
    };
  }

  return (
    <Box sx={{ width: "100%" }}>
      <Box sx={{ borderBottom: 1, borderColor: "divider" }}>
        <Tabs
          value={value}
          onChange={handleChange}
          aria-label="basic tabs example"
        >
          <Tab label="Students" {...a11yProps(0)} />
          <Tab label="Staff" {...a11yProps(1)} />
          <Tab label="Instructors" {...a11yProps(2)} />
        </Tabs>
      </Box>
      <TabPanel value={value} index={0}>
        <div style={{ height: 600, width: "100%" }}>
          <DataGrid
            //rows={rows.filter((row) => row.role == "Student")}
            rows={rows.students}
            columns={columns}
            autoPageSize
            sx={{ fontSize: "20px" }}
          />
        </div>
      </TabPanel>
      <TabPanel value={value} index={1}>
        <div style={{ height: 600, width: "100%" }}>
          <DataGrid
            //rows={rows.filter((row) => row.role == "Staff")}
            rows={rows.staff}
            columns={columns}
            autoPageSize
            sx={{ fontSize: "20px" }}
          />
        </div>
      </TabPanel>
      <TabPanel value={value} index={2}>
        <div style={{ height: 600, width: "100%" }}>
          <DataGrid
            //rows={rows.filter((row) => row.role == "Instructor")}
            rows={rows.instructors}
            columns={columns.slice(0, 2)}
            autoPageSize
            sx={{ fontSize: "20px" }}
          />
        </div>
      </TabPanel>
    </Box>
  );
}
export default RosterTabs;
