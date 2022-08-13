import { Tab, Tabs } from "@mui/material";
import { useLayoutStore } from "../../services/store";

function TimeTabs() {
  const timeTab = useLayoutStore((state) => state.timeTab);
  const setTimeTab = useLayoutStore((state) => state.setTimeTab);

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
