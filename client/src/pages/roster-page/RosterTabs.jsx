import { DataGrid, GridActionsCellItem } from "@mui/x-data-grid";
import * as React from "react";
import PropTypes from "prop-types";
import Tabs from "@mui/material/Tabs";
import Tab from "@mui/material/Tab";
import Box from "@mui/material/Box";
import { ConsoleSqlOutlined } from "@ant-design/icons";

function RosterTabs(props) {
  const { check, setCheck, columns, rows, value, setValue } = props;
  function TabPanel(props) {
    const { children, value, index, ...other } = props;
    console.log(rows);
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

  TabPanel.propTypes = {
    children: PropTypes.node,
    index: PropTypes.number.isRequired,
    value: PropTypes.number.isRequired,
  };

  const handleChange = (event, newValue) => {
    setValue(newValue);
    setCheck(newValue);
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
            rows={rows.filter((row) => row.role == "Student")}
            columns={columns}
            autoPageSize
            sx={{ fontSize: "20px" }}
          />
        </div>
      </TabPanel>
      <TabPanel value={value} index={1}>
        <div style={{ height: 600, width: "100%" }}>
          <DataGrid
            rows={rows.filter((row) => row.role == "Staff")}
            columns={columns}
            autoPageSize
            sx={{ fontSize: "20px" }}
          />
        </div>
      </TabPanel>
      <TabPanel value={value} index={2}>
        <div style={{ height: 600, width: "100%" }}>
          <DataGrid
            rows={rows.filter((row) => row.role == "Instructor")}
            columns={columns}
            autoPageSize
            sx={{ fontSize: "20px" }}
          />
        </div>
      </TabPanel>
    </Box>
  );
}
export default RosterTabs;
