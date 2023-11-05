import Tabs from "@mui/material/Tabs";
import Tab from "@mui/material/Tab";
import Box from "@mui/material/Box";
import AppBar from "@mui/material/AppBar";
import Toolbar from "@mui/material/Toolbar";
import RosterTabPanel from "./RosterTabPanel";
import useStoreLayout from "../../hooks/useStoreLayout";

/**
 * Represents a MUI Tabs component that allows users to
 * select between students, staff, or instructors.
 * @param {*} rows list of users
 * @returns Returns a tabs component to manage roster.
 */
function RosterTabs({ rows }) {
  const rosterTab = useStoreLayout((state) => state.rosterTab);
  const setRosterTab = useStoreLayout((state) => state.setRosterTab);

  const handleChange = (event, newValue) => {
    setRosterTab(newValue);
  };

  return (
    <Box sx={{ width: "100%" }}>
      <AppBar
        position="static"
        elevation={1}
        sx={{ borderRadius: 1, backgroundColor: "background.paper" }}
      >
        <Toolbar data-cy="roster-toolbar-roles">
          <Tabs value={rosterTab} onChange={handleChange}>
            <Tab label="Students" data-cy="roster-toolbar-students"/>
            <Tab label="Staff" data-cy="roster-toolbar-staff"/>
            <Tab label="Instructors" data-cy="roster-toolbar-instructors"/>
          </Tabs>
        </Toolbar>
      </AppBar>
      <RosterTabPanel index={0} rows={rows.students} data-cy="roster-student-rows"/>
      <RosterTabPanel index={1} rows={rows.staff} data-cy="roster-staff-rows"/>
      <RosterTabPanel index={2} rows={rows.instructors} data-cy="roster-instructor-rows"/>
    </Box>
  );
}
export default RosterTabs;
