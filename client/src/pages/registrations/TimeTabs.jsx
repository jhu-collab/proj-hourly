import Tab from "@mui/material/Tab";
import Tabs from "@mui/material/Tabs";

/**
 * Represents a MUI Tabs component that allows users to
 * select between upcoming, ongoing, or past registrations.
 * @returns Returns a tabs component to filter registrations.
 */
function TimeTabs() {
  const timeTab = useStoreLayout((state) => state.timeTab);
  const setTimeTab = useStoreLayout((state) => state.setTimeTab);

  const handleChange = (event, newValue) => {
    setTimeTab(newValue);
  };
  return (
    <Tabs value={timeTab} onChange={handleChange}>
      <Tab label="Upcoming" />
      <Tab label="Ongoing" />
      <Tab label="Past" />
    </Tabs>
  );
}

export default TimeTabs;
