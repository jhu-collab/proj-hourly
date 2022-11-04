import Tabs from "@mui/material/Tabs";
import Tab from "@mui/material/Tab";
import Box from "@mui/material/Box";
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
      <Box sx={{ borderBottom: 1, borderColor: "divider" }}>
        <Tabs value={rosterTab} onChange={handleChange}>
          <Tab label="Students" />
          <Tab label="Staff" />
          <Tab label="Instructors" />
        </Tabs>
      </Box>
      <RosterTabPanel index={0} rows={rows.students} />
      <RosterTabPanel index={1} rows={rows.staff} />
      <RosterTabPanel index={2} rows={rows.instructors} />
    </Box>
  );
}
export default RosterTabs;
